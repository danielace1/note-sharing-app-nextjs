"use client";

import { getSharedNote, unlockSharedNote } from "@/lib/api/share";
import { useMutation, useQuery } from "@tanstack/react-query";

export const shareQueryKeys = {
  byToken: (token: string) => ["shared-note", token] as const,
};

export function useSharedNote(token: string) {
  return useQuery({
    queryKey: shareQueryKeys.byToken(token),
    queryFn: () => getSharedNote(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useUnlockSharedNote() {
  return useMutation({
    mutationFn: ({ token, accessKey }: { token: string; accessKey: string }) =>
      unlockSharedNote(token, accessKey),
  });
}
