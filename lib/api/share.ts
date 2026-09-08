import { api } from "./client";

export type SharedNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type ShareAccessResponse = {
  success: boolean;
  requiresAccessKey?: boolean;
  note?: SharedNote;
  viewCount?: number;
  message?: string;
};

export async function getSharedNote(
  token: string,
): Promise<ShareAccessResponse> {
  const response = await api.get<ShareAccessResponse>(
    `/share/${encodeURIComponent(token)}`,
  );

  return response.data;
}

export async function unlockSharedNote(
  token: string,
  accessKey: string,
): Promise<ShareAccessResponse> {
  const response = await api.post<ShareAccessResponse>(
    `/share/${encodeURIComponent(token)}/unlock`,
    {
      accessKey,
    },
  );

  return response.data;
}
