import {
  createShareLink,
  getShareLinks,
  revokeShareLink,
  type CreateShareLinkInput,
} from "@/lib/api/share-links";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const shareLinksQueryKeys = {
  all: ["share-links"] as const,
  byNote: (noteId: string) => ["share-links", noteId] as const,
};

export function useShareLinks(noteId: string) {
  return useQuery({
    queryKey: shareLinksQueryKeys.byNote(noteId),
    queryFn: () => getShareLinks(noteId),
    enabled: Boolean(noteId),
  });
}

export function useCreateShareLink(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShareLinkInput) => createShareLink(noteId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shareLinksQueryKeys.byNote(noteId),
      });
    },
  });
}

export function useRevokeShareLink(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shareId: string) => revokeShareLink(noteId, shareId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shareLinksQueryKeys.byNote(noteId),
      });
    },
  });
}
