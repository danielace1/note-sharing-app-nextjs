"use client";

import Link from "next/link";
import { FileText, Plus, Loader2 } from "lucide-react";

import { useNotes } from "@/hooks/use-notes";

export default function NotesPage() {
  const { data: notes, isLoading, isError } = useNotes();

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <FileText className="h-5 w-5" />
              </div>

              <span className="text-sm font-semibold text-primary">
                Note Sharing
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your notes
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Create, manage, and securely share your notes.
            </p>
          </div>

          <Link
            href="/notes/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New note
          </Link>
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border bg-card/60">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your notes...
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <h2 className="font-semibold text-destructive">
              Unable to load notes
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Something went wrong while loading your notes.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && notes?.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-semibold">No notes yet</h2>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Create your first note and start securely sharing it.
            </p>

            <Link
              href="/notes/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first note
            </Link>
          </div>
        )}

        {/* Notes */}
        {!isLoading && !isError && notes && notes.length > 0 && (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="group rounded-2xl border bg-card/80 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>

                <h2 className="line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                  {note.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {note.content}
                </p>

                <p className="mt-5 text-xs text-muted-foreground">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
