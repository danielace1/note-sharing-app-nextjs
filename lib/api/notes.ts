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

type GetNoteResponse = {
  success: boolean;
  note: Note;
};

type CreateNoteResponse = {
  success: boolean;
  note: Note;
};

type UpdateNoteResponse = {
  success: boolean;
  note: Note;
};

type DeleteNoteResponse = {
  success: boolean;
  message: string;
};

export type UpdateNoteInput = {
  title: string;
  content: string;
};

export type CreateNoteInput = {
  title: string;
  content: string;
};

export async function getNotes(): Promise<Note[]> {
  const response = await api.get<GetNotesResponse>("/notes");

  return response.data.notes;
}

export async function createNote(data: CreateNoteInput): Promise<Note> {
  const response = await api.post<CreateNoteResponse>("/notes", data);

  return response.data.note;
}

export async function getNote(noteId: string): Promise<Note> {
  const response = await api.get<GetNoteResponse>(`/notes/${noteId}`);

  return response.data.note;
}

export async function updateNote(
  noteId: string,
  data: UpdateNoteInput,
): Promise<Note> {
  const response = await api.patch<UpdateNoteResponse>(
    `/notes/${noteId}`,
    data,
  );

  return response.data.note;
}

export async function deleteNote(noteId: string): Promise<void> {
  await api.delete<DeleteNoteResponse>(`/notes/${noteId}`);
}
