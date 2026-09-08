"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
  UpdateNoteInput,
  type CreateNoteInput,
} from "@/lib/api/notes";

export function useNotes(enabled = true) {
  return useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
    enabled,
  });
}

export function useNote(noteId: string) {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: () => getNote(noteId),
    enabled: Boolean(noteId), // Only fetch if noteId is provided
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteInput) => createNote(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: UpdateNoteInput }) =>
      updateNote(noteId, data),

    onSuccess: (updatedNote) => {
      queryClient.setQueryData(["notes", updatedNote.id], updatedNote);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),

    onSuccess: (_, noteId) => {
      queryClient.removeQueries({ queryKey: ["notes", noteId] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
