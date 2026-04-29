"use client";

import { useEffect } from "react";
import { useWecartStore } from "@/stores/useWecartStore";

export function useGroupData(groupId: string) {
  const { group, isLoading, setGroup, setLoading } = useWecartStore();

  useEffect(() => {
    async function loadGroup() {
      if (group?.id === groupId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}`);
      if (response.ok) {
        setGroup(await response.json());
      } else {
        setLoading(false);
      }
    }

    loadGroup();
  }, [group?.id, groupId, setGroup, setLoading]);

  return { group, isLoading };
}
