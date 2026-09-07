import { api } from "./client";

export type ShareType = "ONE_TIME" | "TIME_BASED";
export type AccessType = "PUBLIC" | "PASSWORD";

export type ShareLink = {
  id: string;
  noteId: string;
  shareType: ShareType;
  accessType: AccessType;
  expiresAt: string | null;
  usedAt: string | null;
  revokedAt: string | null;
  viewCount: number;
  createdAt: string;
};

export type CreateShareLinkInput = {
  shareType: ShareType;
  accessType: AccessType;
  expiresAt?: string;
  accessKey?: string;
};

export type CreateShareLinkResponse = {
  success: boolean;
  message: string;
  shareLink: ShareLink;
  token: string;
  accessKey?: string;
};

export type GetShareLinksResponse = {
  success: boolean;
  shareLinks: ShareLink[];
};

export type RevokeShareLinkResponse = {
  success: boolean;
  message: string;
  shareLink: ShareLink;
};

export async function getShareLinks(
  noteId: string,
): Promise<GetShareLinksResponse> {
  const response = await api.get<GetShareLinksResponse>(
    `/notes/${noteId}/share`,
  );

  return response.data;
}

export async function createShareLink(
  noteId: string,
  data: CreateShareLinkInput,
): Promise<CreateShareLinkResponse> {
  const response = await api.post<CreateShareLinkResponse>(
    `/notes/${noteId}/share`,
    data,
  );

  return response.data;
}

export async function revokeShareLink(
  noteId: string,
  shareId: string,
): Promise<RevokeShareLinkResponse> {
  const response = await api.patch<RevokeShareLinkResponse>(
    `/notes/${noteId}/share/${shareId}/revoke`,
  );

  return response.data;
}
