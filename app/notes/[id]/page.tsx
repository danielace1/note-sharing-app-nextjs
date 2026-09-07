"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  FileText,
  KeyRound,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Share2,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { useNote, useUpdateNote, useDeleteNote } from "@/hooks/use-notes";
import {
  useCreateShareLink,
  useRevokeShareLink,
  useShareLinks,
} from "@/hooks/use-share-links";

import { generateAccessKey } from "@/lib/security/access-key";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 100_000;

export default function NotePage() {
  const params = useParams<{ id: string }>();
  const noteId = params.id;
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Notes
  // ---------------------------------------------------------------------------

  const { data: note, isLoading, isError } = useNote(noteId);

  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  // ---------------------------------------------------------------------------
  // Share links
  // ---------------------------------------------------------------------------

  const { data: shareLinksData, isLoading: isShareLinksLoading } =
    useShareLinks(noteId);

  const createShareLinkMutation = useCreateShareLink(noteId);
  const revokeShareLinkMutation = useRevokeShareLink(noteId);

  // ---------------------------------------------------------------------------
  // Delete dialog
  // ---------------------------------------------------------------------------

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ---------------------------------------------------------------------------
  // Edit state
  // ---------------------------------------------------------------------------

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

  // ---------------------------------------------------------------------------
  // Share dialog state
  // ---------------------------------------------------------------------------

  const [showShareDialog, setShowShareDialog] = useState(false);

  const [shareType, setShareType] = useState<"ONE_TIME" | "TIME_BASED">(
    "ONE_TIME",
  );

  const [accessType, setAccessType] = useState<"PUBLIC" | "PASSWORD">("PUBLIC");

  const [expiresAt, setExpiresAt] = useState("");
  const [accessKey, setAccessKey] = useState("");

  const [createdShareUrl, setCreatedShareUrl] = useState("");
  const [createdAccessKey, setCreatedAccessKey] = useState("");

  // ---------------------------------------------------------------------------
  // Edit handlers
  // ---------------------------------------------------------------------------

  const startEditing = () => {
    if (!note) return;

    setTitle(note.title);
    setContent(note.content);

    setTitleError("");
    setContentError("");

    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (!note) return;

    setTitle(note.title);
    setContent(note.content);

    setTitleError("");
    setContentError("");

    setIsEditing(false);
  };

  const handleUpdate = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    let isValid = true;

    setTitleError("");
    setContentError("");

    if (!trimmedTitle) {
      setTitleError("Title is required");
      isValid = false;
    } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
      isValid = false;
    }

    if (!trimmedContent) {
      setContentError("Content is required");
      isValid = false;
    } else if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      setContentError(
        `Content must be ${MAX_CONTENT_LENGTH.toLocaleString()} characters or less`,
      );
      isValid = false;
    }

    if (!isValid || !note) return;

    updateNoteMutation.mutate(
      {
        noteId: note.id,
        data: {
          title: trimmedTitle,
          content: trimmedContent,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  // ---------------------------------------------------------------------------
  // Delete handler
  // ---------------------------------------------------------------------------

  const handleDelete = () => {
    if (!note) return;

    deleteNoteMutation.mutate(note.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        router.push("/notes");
      },
    });
  };

  // ---------------------------------------------------------------------------
  // Share handlers
  // ---------------------------------------------------------------------------

  const handleGenerateAccessKey = () => {
    setAccessKey(generateAccessKey());
  };

  const handleSelectPassword = () => {
    setAccessType("PASSWORD");

    if (!accessKey) {
      setAccessKey(generateAccessKey());
    }
  };

  const resetShareDialog = () => {
    setCreatedShareUrl("");
    setCreatedAccessKey("");

    setExpiresAt("");
    setAccessKey("");

    setShareType("ONE_TIME");
    setAccessType("PUBLIC");
  };

  const closeShareDialog = () => {
    if (createShareLinkMutation.isPending) {
      return;
    }

    setShowShareDialog(false);
    resetShareDialog();
  };

  const handleCreateShareLink = () => {
    if (shareType === "TIME_BASED" && !expiresAt) {
      return;
    }

    if (shareType === "TIME_BASED" && new Date(expiresAt) <= new Date()) {
      return;
    }

    if (accessType === "PASSWORD" && !accessKey.trim()) {
      return;
    }

    createShareLinkMutation.mutate(
      {
        shareType,
        accessType,

        ...(shareType === "TIME_BASED"
          ? {
              expiresAt: new Date(expiresAt).toISOString(),
            }
          : {}),

        ...(accessType === "PASSWORD"
          ? {
              accessKey: accessKey.trim(),
            }
          : {}),
      },
      {
        onSuccess: (data) => {
          const shareUrl = `${window.location.origin}/share/${data.token}`;

          setCreatedShareUrl(shareUrl);
          setCreatedAccessKey(data.accessKey ?? "");
        },
      },
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/notes"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Link>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-96 items-center justify-center rounded-2xl border bg-card/80 shadow-xl shadow-black/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading note...
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <FileText className="h-6 w-6" />
            </div>

            <h1 className="mt-4 text-xl font-semibold">Note not found</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This note may not exist or you may not have access to it.
            </p>

            <Link
              href="/notes"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to notes
            </Link>
          </div>
        )}

        {/* Note */}
        {!isLoading && !isError && note && (
          <article className="overflow-hidden rounded-2xl border bg-card/80 shadow-xl shadow-black/5 backdrop-blur-sm">
            {/* Header */}
            <div className="border-b p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>

                        <Input
                          id="title"
                          value={title}
                          maxLength={MAX_TITLE_LENGTH}
                          onChange={(event) => {
                            setTitle(event.target.value);
                            setTitleError("");
                          }}
                          placeholder="Enter note title"
                          className="h-11 rounded-xl text-lg font-semibold"
                          autoFocus
                        />

                        <div className="flex items-center justify-between">
                          {titleError ? (
                            <p className="text-xs text-destructive">
                              {titleError}
                            </p>
                          ) : (
                            <span />
                          )}

                          <p className="text-xs text-muted-foreground">
                            {title.length}/{MAX_TITLE_LENGTH}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                          {note.title}
                        </h1>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Created {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isEditing ? (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startEditing}
                      className="flex-1 rounded-xl sm:flex-none"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowShareDialog(true)}
                      className="flex-1 rounded-xl sm:flex-none"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex-1 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                ) : (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={updateNoteMutation.isPending}
                      className="flex-1 rounded-xl sm:flex-none"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={handleUpdate}
                      disabled={updateNoteMutation.isPending}
                      className="flex-1 rounded-xl sm:flex-none"
                    >
                      {updateNoteMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Save changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>

                  <Textarea
                    id="content"
                    value={content}
                    maxLength={MAX_CONTENT_LENGTH}
                    onChange={(event) => {
                      setContent(event.target.value);
                      setContentError("");
                    }}
                    placeholder="Write your note..."
                    className="min-h-[350px] resize-y rounded-xl text-sm leading-7"
                  />

                  <div className="flex items-center justify-between">
                    {contentError ? (
                      <p className="text-xs text-destructive">{contentError}</p>
                    ) : (
                      <span />
                    )}

                    <p className="text-xs text-muted-foreground">
                      {content.length.toLocaleString()}/
                      {MAX_CONTENT_LENGTH.toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90">
                  {note.content}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 sm:px-8">
              <p className="text-xs text-muted-foreground">
                Last updated {new Date(note.updatedAt).toLocaleString()}
              </p>
            </div>
          </article>
        )}

        {/* Share Links */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Share Links</CardTitle>

                <CardDescription>
                  Manage links that give others access to this note.
                </CardDescription>
              </div>

              <Button
                type="button"
                onClick={() => setShowShareDialog(true)}
                className="shrink-0 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Create link
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isShareLinksLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading share links...
              </div>
            ) : !shareLinksData?.shareLinks?.length ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <Link2 className="mx-auto h-6 w-6 text-muted-foreground" />

                <p className="mt-2 text-sm font-medium">No share links yet</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Create a secure link to share this note.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {shareLinksData.shareLinks.map((shareLink) => {
                  const isRevoked = Boolean(shareLink.revokedAt);

                  const isUsed =
                    shareLink.shareType === "ONE_TIME" &&
                    Boolean(shareLink.usedAt);

                  const isExpired =
                    shareLink.shareType === "TIME_BASED" &&
                    shareLink.expiresAt !== null &&
                    new Date(shareLink.expiresAt) <= new Date();

                  const isActive = !isRevoked && !isExpired && !isUsed;

                  return (
                    <div
                      key={shareLink.id}
                      className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {shareLink.shareType === "ONE_TIME"
                              ? "One-time"
                              : "Time-based"}
                          </span>

                          <span className="text-muted-foreground">•</span>

                          <span className="text-sm text-muted-foreground">
                            {shareLink.accessType === "PUBLIC"
                              ? "Public"
                              : "Password protected"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>Views: {shareLink.viewCount}</span>

                          {shareLink.expiresAt && (
                            <span>
                              Expires:{" "}
                              {new Date(shareLink.expiresAt).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="text-sm">
                          Status:{" "}
                          <span
                            className={
                              isActive
                                ? "font-medium text-green-600"
                                : "font-medium text-muted-foreground"
                            }
                          >
                            {isRevoked
                              ? "Revoked"
                              : isExpired
                                ? "Expired"
                                : isUsed
                                  ? "Used"
                                  : "Active"}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={revokeShareLinkMutation.isPending}
                          onClick={() =>
                            revokeShareLinkMutation.mutate(shareLink.id)
                          }
                          className="shrink-0"
                        >
                          {revokeShareLinkMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Revoking...
                            </>
                          ) : (
                            "Revoke"
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
          >
            {/* Dialog Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Share2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 id="share-dialog-title" className="text-lg font-semibold">
                  Share this note
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create a secure link to share this note.
                </p>
              </div>

              <button
                type="button"
                onClick={closeShareDialog}
                disabled={createShareLinkMutation.isPending}
                className="ml-auto rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!createdShareUrl ? (
              <div className="mt-6 space-y-6">
                {/* Share Type */}
                <div className="space-y-3">
                  <Label>Share type</Label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShareType("ONE_TIME");
                        setExpiresAt("");
                      }}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        shareType === "ONE_TIME"
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="font-medium">One-time</div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        The link expires after the first successful view.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareType("TIME_BASED")}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        shareType === "TIME_BASED"
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="font-medium">Time-based</div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        The link remains available until the selected expiry
                        time.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Expiry */}
                {shareType === "TIME_BASED" && (
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiry date and time</Label>

                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={expiresAt}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(event) => setExpiresAt(event.target.value)}
                    />

                    <p className="text-xs text-muted-foreground">
                      The link will stop working after this time.
                    </p>
                  </div>
                )}

                {/* Access Type */}
                <div className="space-y-3">
                  <Label>Access</Label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAccessType("PUBLIC");
                        setAccessKey("");
                      }}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        accessType === "PUBLIC"
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <Link2 className="h-4 w-4" />
                        Public
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Anyone with the link can access the note.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={handleSelectPassword}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        accessType === "PASSWORD"
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <Shield className="h-4 w-4" />
                        Password
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Require an access key before showing the note.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Access Key */}
                {accessType === "PASSWORD" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="accessKey">Access key</Label>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateAccessKey}
                        className="h-8 rounded-lg text-xs"
                      >
                        Generate new key
                      </Button>
                    </div>

                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="accessKey"
                        type="text"
                        value={accessKey}
                        onChange={(event) => setAccessKey(event.target.value)}
                        placeholder="Enter or generate an access key"
                        className="pl-9 font-mono tracking-wider"
                        maxLength={64}
                      />
                    </div>

                    <p className="text-xs leading-5 text-muted-foreground">
                      A secure key is generated automatically. You can generate
                      a new one or enter your own.
                    </p>
                  </div>
                )}

                {/* Error */}
                {createShareLinkMutation.isError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">
                      {createShareLinkMutation.error?.message ||
                        "Failed to create share link. Please try again."}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeShareDialog}
                    disabled={createShareLinkMutation.isPending}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleCreateShareLink}
                    disabled={
                      createShareLinkMutation.isPending ||
                      (shareType === "TIME_BASED" && !expiresAt) ||
                      (accessType === "PASSWORD" && !accessKey.trim())
                    }
                    className="rounded-xl"
                  >
                    {createShareLinkMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Success */
              <div className="mt-6 space-y-5">
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                      <Check className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="font-medium">Share link created</p>

                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        Copy the link and send it to the recipient. For
                        password-protected links, share the access key
                        separately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share URL */}
                <div className="space-y-2">
                  <Label>Share URL</Label>

                  <div className="flex gap-2">
                    <Input
                      value={createdShareUrl}
                      readOnly
                      className="min-w-0"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard.writeText(createdShareUrl)
                      }
                      className="shrink-0"
                      aria-label="Copy share URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Access Key */}
                {createdAccessKey && (
                  <div className="space-y-2">
                    <Label>Access key</Label>

                    <div className="flex gap-2">
                      <Input
                        value={createdAccessKey}
                        readOnly
                        className="min-w-0 font-mono tracking-wider"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          navigator.clipboard.writeText(createdAccessKey)
                        }
                        className="shrink-0"
                        aria-label="Copy access key"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs leading-5 text-muted-foreground">
                      Keep this key separate from the share URL.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs leading-5 text-muted-foreground">
                    The raw share token and access key are shown only now. Make
                    sure you copy everything you need before closing this
                    window.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowShareDialog(false);
                      resetShareDialog();
                    }}
                    className="rounded-xl"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h2 id="delete-dialog-title" className="text-lg font-semibold">
                  Delete this note?
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This action cannot be undone. The note and its associated
                  share links will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteNoteMutation.isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteNoteMutation.isPending}
                className="rounded-xl"
              >
                {deleteNoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete note
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
