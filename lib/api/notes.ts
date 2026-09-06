import { api } from "./client";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type GetNotesResponse = {
  success: boolean;
  notes: Note[];
};

export async function getNotes(): Promise<Note[]> {
  const response = await api.get<GetNotesResponse>("/notes");

  return response.data.notes;
}
