"use client";

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

type CompressedImage = {
  file: File;
  previewUrl: string;
};

function isHeicFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

async function normalizeImageFile(file: File) {
  if (!isHeicFile(file)) {
    return file;
  }

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const originalBaseName = file.name.replace(/\.[^.]+$/, "") || "shopping-image";

  return new File([blob], `${originalBaseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now()
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽을 수 없어요. 다른 사진을 선택하거나 잠시 후 다시 시도해 주세요."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("이미지 압축에 실패했어요."));
        }
      },
      "image/jpeg",
      quality
    );
  });
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith("image/") && !isHeicFile(file)) {
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  }

  const normalizedFile = await normalizeImageFile(file);
  const image = await loadImage(normalizedFile);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("이 브라우저에서 이미지 압축을 사용할 수 없어요.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, JPEG_QUALITY);
  const originalBaseName = normalizedFile.name.replace(/\.[^.]+$/, "") || "shopping-image";
  const compressedFile = new File([blob], `${originalBaseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now()
  });

  return {
    file: compressedFile,
    previewUrl: URL.createObjectURL(blob)
  };
}
