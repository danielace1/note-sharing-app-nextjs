"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { useCreateNote } from "@/hooks/use-notes";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 100_000;

export default function NewNotePage() {
  const router = useRouter();

  const createNoteMutation = useCreateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      return;
    }

    createNoteMutation.mutate(
      {
        title: trimmedTitle,
        content: trimmedContent,
      },
      {
        onSuccess: () => {
          router.push("/notes");
        },
      },
    );
  }

  const errorMessage = createNoteMutation.error
    ? "Unable to create the note. Please try again."
    : "";

  const isSaving = createNoteMutation.isPending;

  return (
    <main className="min-h-screen bg-background">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-muted/70 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/notes"
            className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to notes
          </Link>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private workspace
          </div>
        </div>

        {/* Page heading */}
        <div className="mb-7">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-5 w-5" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create a new note
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Write your note now. You can share it securely with others after
            saving.
          </p>
        </div>

        {/* Editor */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit}>
            {/* Editor header */}
            <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-foreground/40" />

                <span className="text-xs font-medium text-muted-foreground">
                  New note
                </span>
              </div>

              <span className="text-xs text-muted-foreground">
                {content.length.toLocaleString()} characters
              </span>
            </div>

            {/* Title */}
            <div className="border-b px-5 pt-6 sm:px-8 sm:pt-8">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="title" className="sr-only">
                  Note title
                </label>

                <span className="text-xs text-muted-foreground">
                  {title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Untitled note"
                maxLength={MAX_TITLE_LENGTH}
                required
                disabled={isSaving}
                autoFocus
                className="h-14 w-full border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40 focus:ring-0 sm:text-3xl"
              />
            </div>

            {/* Content */}
            <div className="px-5 py-5 sm:px-8 sm:py-7">
              <label htmlFor="content" className="sr-only">
                Note content
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing your note..."
                maxLength={MAX_CONTENT_LENGTH}
                required
                disabled={isSaving}
                className="min-h-[420px] w-full resize-y border-0 bg-transparent px-0 text-[15px] leading-7 outline-none placeholder:text-muted-foreground/50 focus:ring-0 sm:min-h-[500px]"
              />
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="mx-5 mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:mx-8">
                {errorMessage}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex flex-col gap-4 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />

                <span>Your note is saved privately.</span>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Link
                  href="/notes"
                  className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSaving || !title.trim() || !content.trim()}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save note
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Bottom information */}
        <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground sm:flex-row">
          <ShieldCheck className="h-3.5 w-3.5" />

          <span>
            This note belongs to your account and is only available to
            authenticated users.
          </span>
        </div>
      </div>
    </main>
  );
}
