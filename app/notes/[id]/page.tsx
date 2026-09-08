"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  KeyRound,
  Link2,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

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

const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

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

  const [copiedField, setCopiedField] = useState<"url" | "key" | null>(null);

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
    setCopiedField(null);
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

  const copyToClipboard = async (value: string, field: "url" | "key") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 1800);
    } catch {
      // Clipboard may be unavailable in some browser contexts.
    }
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const getShareLinkStatus = (shareLink: {
    revokedAt?: string | null;
    usedAt?: string | null;
    shareType: string;
    expiresAt?: string | null;
  }) => {
    const isRevoked = Boolean(shareLink.revokedAt);

    const isUsed =
      shareLink.shareType === "ONE_TIME" && Boolean(shareLink.usedAt);

    const isExpired =
      shareLink.shareType === "TIME_BASED" &&
      shareLink.expiresAt !== null &&
      shareLink.expiresAt !== undefined &&
      new Date(shareLink.expiresAt) <= new Date();

    if (isRevoked) {
      return {
        label: "Revoked",
        active: false,
      };
    }

    if (isExpired) {
      return {
        label: "Expired",
        active: false,
      };
    }

    if (isUsed) {
      return {
        label: "Used",
        active: false,
      };
    }

    return {
      label: "Active",
      active: true,
    };
  };

  const activeShareLinks =
    shareLinksData?.shareLinks?.filter(
      (shareLink) => getShareLinkStatus(shareLink).active,
    ).length ?? 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-background">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-muted/70 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top navigation */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <Link
              href="/notes"
              className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to notes
            </Link>

            <Link href="/" className="hidden items-center gap-2 sm:inline-flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>

              <span className="text-sm font-bold tracking-tight">
                Share Note
              </span>
            </Link>
          </div>
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border bg-card shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-semibold">Loading note</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Just a moment...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>

            <h1 className="mt-5 text-xl font-bold tracking-tight">
              Note not found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              This note may no longer exist, or you may not have permission to
              access it.
            </p>

            <Link
              href="/notes"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to notes
            </Link>
          </div>
        )}

        {/* Main note */}
        {!isLoading && !isError && note && (
          <>
            <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              {/* Note header */}
              <div className="border-b px-5 py-6 sm:px-8 sm:py-7">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="title">Note title</Label>

                              <span className="text-xs text-muted-foreground">
                                {title.length}/{MAX_TITLE_LENGTH}
                              </span>
                            </div>

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

                            {titleError && (
                              <p className="text-xs text-destructive">
                                {titleError}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <span>Note</span>
                              <span className="text-border">/</span>
                              <span>
                                {new Date(note.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>

                            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                              {note.title}
                            </h1>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isEditing ? (
                      <div className="grid grid-cols-3 gap-2 sm:flex">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startEditing}
                          className="rounded-xl"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowShareDialog(true)}
                          className="rounded-xl"
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowDeleteDialog(true)}
                          className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
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

                  {/* Edit mode hint */}
                  {isEditing && (
                    <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3.5 py-3 text-xs text-muted-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                      You are editing this note. Changes will be saved to your
                      account.
                    </div>
                  )}
                </div>
              </div>

              {/* Note content */}
              <div className="px-5 py-7 sm:px-8 sm:py-9">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Note content</Label>

                      <span className="text-xs text-muted-foreground">
                        {content.length.toLocaleString()}/
                        {MAX_CONTENT_LENGTH.toLocaleString()}
                      </span>
                    </div>

                    <Textarea
                      id="content"
                      value={content}
                      maxLength={MAX_CONTENT_LENGTH}
                      onChange={(event) => {
                        setContent(event.target.value);
                        setContentError("");
                      }}
                      placeholder="Write your note..."
                      className="min-h-[420px] resize-y rounded-xl text-sm leading-7"
                    />

                    {contentError && (
                      <p className="text-xs text-destructive">{contentError}</p>
                    )}
                  </div>
                ) : (
                  <div className="min-h-[220px] whitespace-pre-wrap break-words text-[15px] leading-8 text-foreground/90">
                    {note.content}
                  </div>
                )}
              </div>

              {/* Note footer */}
              <div className="flex flex-col gap-2 border-t bg-muted/20 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <span> Created {formatDateTime(note.createdAt)}</span>

                <span>Last updated {formatDateTime(note.updatedAt)}</span>
              </div>
            </article>

            {/* Share links */}
            <section className="mt-6">
              <Card className="overflow-hidden rounded-2xl shadow-sm">
                <CardHeader className="border-b bg-card px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <Link2 className="h-4 w-4" />
                        </div>

                        <CardTitle className="text-base">Share links</CardTitle>
                      </div>

                      <CardDescription className="mt-2">
                        Manage links that give others access to this note.
                      </CardDescription>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setShowShareDialog(true)}
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                      Create link
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 sm:p-6">
                  {isShareLinksLoading ? (
                    <div className="flex min-h-[120px] items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading share links...
                      </div>
                    </div>
                  ) : !shareLinksData?.shareLinks?.length ? (
                    <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <Link2 className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <p className="mt-4 text-sm font-semibold">
                        No share links yet
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                        Create a secure link when you are ready to share this
                        note with someone.
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowShareDialog(true)}
                        className="mt-5 rounded-xl"
                      >
                        <Plus className="h-4 w-4" />
                        Create your first link
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Summary */}
                      <div className="mb-5 flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {shareLinksData.shareLinks.length}{" "}
                            {shareLinksData.shareLinks.length === 1
                              ? "link"
                              : "links"}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {activeShareLinks} active
                          </span>
                        </div>
                      </div>

                      {shareLinksData.shareLinks.map((shareLink) => {
                        const status = getShareLinkStatus(shareLink);

                        return (
                          <div
                            key={shareLink.id}
                            className="group rounded-2xl border bg-background p-4 transition-colors hover:bg-muted/20 sm:p-5"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 flex-1">
                                {/* Type + status */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                                    {shareLink.shareType === "ONE_TIME" ? (
                                      <>
                                        <RotateCcw className="h-3 w-3" />
                                        One-time
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="h-3 w-3" />
                                        Time-based
                                      </>
                                    )}
                                  </span>

                                  <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium">
                                    {shareLink.accessType === "PUBLIC" ? (
                                      <>
                                        <Link2 className="h-3 w-3" />
                                        Public
                                      </>
                                    ) : (
                                      <>
                                        <KeyRound className="h-3 w-3" />
                                        Password protected
                                      </>
                                    )}
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${
                                      status.active
                                        ? "border-foreground/20 bg-foreground text-background"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        status.active
                                          ? "bg-background"
                                          : "bg-muted-foreground"
                                      }`}
                                    />
                                    {status.label}
                                  </span>
                                </div>

                                {/* Metadata */}
                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                                  <span>
                                    Views:{" "}
                                    <span className="font-medium text-foreground">
                                      {shareLink.viewCount}
                                    </span>
                                  </span>

                                  {shareLink.expiresAt && (
                                    <span>
                                      Expires:{" "}
                                      <span className="font-medium text-foreground">
                                        {formatDateTime(shareLink.expiresAt)}
                                      </span>
                                    </span>
                                  )}

                                  {shareLink.usedAt && (
                                    <span>
                                      Used: {formatDateTime(shareLink.usedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {status.active && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={revokeShareLinkMutation.isPending}
                                  onClick={() =>
                                    revokeShareLinkMutation.mutate(shareLink.id)
                                  }
                                  className="shrink-0 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  {revokeShareLinkMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Revoking...
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-4 w-4" />
                                      Revoke
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* Share Dialog */}
      {/* --------------------------------------------------------------------- */}

      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border bg-background shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
          >
            {/* Dialog header */}
            <div className="border-b px-5 py-5 sm:px-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Share2 className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    id="share-dialog-title"
                    className="text-lg font-semibold tracking-tight"
                  >
                    Share this note
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Choose how the shared link should work.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeShareDialog}
                  disabled={createShareLinkMutation.isPending}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Close share dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Dialog body */}
            <div className="max-h-[75vh] overflow-y-auto px-5 py-6 sm:px-6">
              {!createdShareUrl ? (
                <div className="space-y-7">
                  {/* Share type */}
                  <div className="space-y-3">
                    <div>
                      <Label>Link lifetime</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Decide how long this share link remains available.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShareType("ONE_TIME");
                          setExpiresAt("");
                        }}
                        className={`group rounded-xl border p-4 text-left transition-all ${
                          shareType === "ONE_TIME"
                            ? "border-foreground bg-muted/50 shadow-sm"
                            : "hover:border-foreground/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              shareType === "ONE_TIME"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </div>

                          <div className="font-semibold">One-time</div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          The link expires after the first successful view.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShareType("TIME_BASED")}
                        className={`group rounded-xl border p-4 text-left transition-all ${
                          shareType === "TIME_BASED"
                            ? "border-foreground bg-muted/50 shadow-sm"
                            : "hover:border-foreground/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              shareType === "TIME_BASED"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </div>

                          <div className="font-semibold">Time-based</div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
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
                        className="rounded-xl"
                      />

                      <p className="text-xs leading-5 text-muted-foreground">
                        The link will stop working after this time.
                      </p>
                    </div>
                  )}

                  {/* Access type */}
                  <div className="space-y-3">
                    <div>
                      <Label>Access control</Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Choose whether the recipient needs an access key.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAccessType("PUBLIC");
                          setAccessKey("");
                        }}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          accessType === "PUBLIC"
                            ? "border-foreground bg-muted/50 shadow-sm"
                            : "hover:border-foreground/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              accessType === "PUBLIC"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <Link2 className="h-4 w-4" />
                          </div>

                          <div className="font-semibold">Public</div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          Anyone with the link can access the note.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectPassword}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          accessType === "PASSWORD"
                            ? "border-foreground bg-muted/50 shadow-sm"
                            : "hover:border-foreground/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              accessType === "PASSWORD"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <KeyRound className="h-4 w-4" />
                          </div>

                          <div className="font-semibold">Password</div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          Require an access key before showing the note.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Access key */}
                  {accessType === "PASSWORD" && (
                    <div className="rounded-xl border bg-muted/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <Label htmlFor="accessKey">Access key</Label>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Generate a strong key or enter your own.
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateAccessKey}
                          className="shrink-0 rounded-lg"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Generate
                        </Button>
                      </div>

                      <div className="relative mt-4">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          id="accessKey"
                          type="text"
                          value={accessKey}
                          onChange={(event) => setAccessKey(event.target.value)}
                          placeholder="Enter or generate an access key"
                          className="rounded-xl pl-9 font-mono tracking-wider"
                          maxLength={64}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {createShareLinkMutation.isError && (
                    <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Failed to create share link
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {createShareLinkMutation.error?.message ||
                            "Please check your settings and try again."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
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
                          Create share link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Success */
                <div className="space-y-6">
                  <div className="rounded-2xl border bg-muted/20 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-semibold">Share link created</p>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Copy the link below and send it to the recipient. If
                          you enabled password protection, share the access key
                          separately.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Share URL */}
                  <div className="space-y-2">
                    <Label htmlFor="createdShareUrl">Share URL</Label>

                    <div className="flex gap-2">
                      <Input
                        id="createdShareUrl"
                        value={createdShareUrl}
                        readOnly
                        className="min-w-0 rounded-xl"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => copyToClipboard(createdShareUrl, "url")}
                        className="shrink-0 rounded-xl"
                        aria-label="Copy share URL"
                      >
                        {copiedField === "url" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {copiedField === "url" && (
                      <p className="text-xs text-muted-foreground">
                        Share URL copied.
                      </p>
                    )}
                  </div>

                  {/* Access key */}
                  {createdAccessKey && (
                    <div className="space-y-2">
                      <Label htmlFor="createdAccessKey">Access key</Label>

                      <div className="flex gap-2">
                        <Input
                          id="createdAccessKey"
                          value={createdAccessKey}
                          readOnly
                          className="min-w-0 rounded-xl font-mono tracking-wider"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(createdAccessKey, "key")
                          }
                          className="shrink-0 rounded-xl"
                          aria-label="Copy access key"
                        >
                          {copiedField === "key" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {copiedField === "key" ? (
                        <p className="text-xs text-muted-foreground">
                          Access key copied.
                        </p>
                      ) : (
                        <p className="text-xs leading-5 text-muted-foreground">
                          Keep the access key separate from the share URL.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Security note */}
                  <div className="flex gap-3 rounded-xl border bg-muted/20 p-4">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <p className="text-xs leading-5 text-muted-foreground">
                      The raw share token and access key are shown only now.
                      Copy everything you need before closing this window.
                    </p>
                  </div>

                  <div className="flex justify-end border-t pt-5">
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
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* Delete Dialog */}
      {/* --------------------------------------------------------------------- */}

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border bg-background shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <h2
                    id="delete-dialog-title"
                    className="text-lg font-semibold tracking-tight"
                  >
                    Delete this note?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    This action cannot be undone. The note and all of its
                    associated share links will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                  Permanent deletion
                </div>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Make sure you no longer need this note before continuing.
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
        </div>
      )}
    </main>
  );
}
