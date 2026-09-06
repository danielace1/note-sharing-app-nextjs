"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotes } from "@/lib/api/notes";

export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });
}
