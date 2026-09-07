"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Save } from "lucide-react";
import { useState } from "react";

import { useCreateNote } from "@/hooks/use-notes";

export default function NewNotePage() {
  const router = useRouter();

  const createNoteMutation = useCreateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createNoteMutation.mutate(
      {
        title: title.trim(),
        content: content.trim(),
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/notes"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to notes
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create a new note
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Write something and save it securely.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="text-sm font-semibold">
                  Title
                </label>

                <span className="text-xs text-muted-foreground">
                  {title.length}/200
                </span>
              </div>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give your note a title..."
                maxLength={200}
                required
                disabled={createNoteMutation.isPending}
                className="border-input bg-background/80 placeholder:text-muted-foreground focus-visible:ring-ring h-12 w-full rounded-xl border px-4 text-base outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="text-sm font-semibold">
                  Content
                </label>

                <span className="text-xs text-muted-foreground">
                  {content.length.toLocaleString()}/100,000
                </span>
              </div>

              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing your note..."
                maxLength={100_000}
                required
                disabled={createNoteMutation.isPending}
                className="border-input bg-background/80 placeholder:text-muted-foreground focus-visible:ring-ring min-h-80 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/notes"
                className="inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  createNoteMutation.isPending ||
                  !title.trim() ||
                  !content.trim()
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {createNoteMutation.isPending ? (
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
          </form>
        </div>

        {/* Security note */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Your note is saved to your account and can only be accessed through
          your authenticated session.
        </p>
      </div>
    </main>
  );
}
