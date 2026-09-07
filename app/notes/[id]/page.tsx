"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";

import { useNote, useUpdateNote, useDeleteNote } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 100_000;

export default function NotePage() {
  const params = useParams<{ id: string }>();
  const noteId = params.id;

  const { data: note, isLoading, isError } = useNote(noteId);
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

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

  const handleDelete = () => {
    if (!note) return;

    deleteNoteMutation.mutate(note.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        window.location.href = "/notes";
      },
    });
  };

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
      </div>

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
