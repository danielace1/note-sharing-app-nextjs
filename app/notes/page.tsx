"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Loader2, Plus, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useNotes } from "@/hooks/use-notes";

export default function NotesPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const {
    data: notes,
    isLoading,
    isError,
  } = useNotes(!isPending && Boolean(session));

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  return (
    <main className="min-h-screen bg-background">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-muted/70 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {/* Brand */}
              <Link href="/" className="mb-5 inline-flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <FileText className="h-4.5 w-4.5" />
                </div>

                <span className="text-sm font-bold tracking-tight">
                  Share Note
                </span>
              </Link>

              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>Workspace</span>
                <span className="text-border">/</span>
                <span className="text-foreground">My Notes</span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Your notes
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Create, manage, and securely share your notes from one simple
                workspace.
              </p>
            </div>

            <Link
              href="/notes/new"
              className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              New note
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Stats */}
          {!isLoading && !isError && notes && (
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 shadow-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm font-medium">
                  {notes.length} {notes.length === 1 ? "note" : "notes"}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm font-medium">Secure sharing</span>
              </div>
            </div>
          )}
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border bg-card shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">Loading your notes</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Just a moment...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <FileText className="h-5 w-5 text-destructive" />
            </div>

            <h2 className="mt-4 font-semibold">Unable to load your notes</h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Something went wrong while loading your notes. Please try again in
              a moment.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && notes?.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center shadow-sm sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-muted blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <FileText className="h-7 w-7" />
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-tight">
                Create your first note
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Your notes will appear here. Create something useful, then share
                it securely with a simple link.
              </p>

              <Link
                href="/notes/new"
                className="group mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Create your first note
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Notes */}
        {!isLoading && !isError && notes && notes.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">All notes</h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your recently created notes
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="group relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <FileText className="h-5 w-5" />
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>

                  {/* Content */}
                  <div className="mt-5 flex-1">
                    <h2 className="line-clamp-2 text-lg font-semibold leading-6 tracking-tight">
                      {note.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {note.content}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <span className="text-xs text-muted-foreground">
                      Updated{" "}
                      {new Date(note.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    <span className="text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      Open note
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
