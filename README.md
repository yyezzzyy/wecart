# WECART

친구들과 여행 쇼핑 리스트를 함께 관리하는 모바일 전용 웹앱입니다.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zustand
- Supabase PostgreSQL
- Prisma
- Supabase Storage
- Vercel

## Setup

1. Supabase 프로젝트를 만들고 PostgreSQL 연결 문자열을 확인합니다.
2. Supabase Storage에 `shopping-images` 버킷을 만듭니다.
3. `.env.example`을 참고해서 `.env.local`을 생성합니다.
4. Prisma CLI 실행용으로 같은 값을 `.env`에도 둡니다.

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Required Environment Variables

```bash
DATABASE_URL="postgresql://postgres.mxmmwopcfyousgsuozzr:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.mxmmwopcfyousgsuozzr:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="shopping-images"
```

## MVP Features

- Supabase에 미리 등록된 멤버 사용
- 멤버가 연결된 첫 그룹으로 자동 진입
- 기본 카테고리 생성
- 카테고리 생성, 수정, 삭제
- 아이템 추가
- Supabase Storage 이미지 업로드
- 멤버별/카테고리별 필터
- 구매 완료 체크
- 모바일 중심 UI와 데스크톱 중앙 정렬 레이아웃
