"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  FileText,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { useSharedNote, useUnlockSharedNote } from "@/hooks/use-share";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-muted/70 blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_72%)]" />
    </div>
  );
}

export default function SharedNotePage() {
  const params = useParams();

  const token = typeof params.token === "string" ? params.token : "";

  const [accessKey, setAccessKey] = useState("");
  const [unlockedNote, setUnlockedNote] = useState<
    NonNullable<ReturnType<typeof useSharedNote>["data"]>["note"] | null
  >(null);

  const { data, isLoading, isError, error } = useSharedNote(token);

  const unlockMutation = useUnlockSharedNote();

  const note = unlockedNote ?? data?.note;

  const requiresAccessKey = data?.requiresAccessKey === true && !unlockedNote;

  async function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessKey.trim()) {
      return;
    }

    try {
      const response = await unlockMutation.mutateAsync({
        token,
        accessKey: accessKey.trim(),
      });

      if (response.note) {
        setUnlockedNote(response.note);
      }
    } catch {
      // Error is displayed through unlockMutation.error.
    }
  }

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
        <PageBackground />

        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <FileText className="h-6 w-6" />
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            Checking shared note
          </div>

          <p className="mt-1.5 text-xs text-muted-foreground">
            Please wait a moment...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Error / unavailable link
   */
  if (isError) {
    const message = getErrorMessage(error);

    return (
      <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <PageBackground />

        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <FileText className="h-4 w-4" />
              </div>

              <span className="text-sm font-bold tracking-tight">
                Share Note
              </span>
            </Link>
          </div>

          <Card className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-black/5">
            <CardHeader className="border-b bg-muted/20 px-6 py-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>

              <CardTitle className="mt-4 text-xl">
                Unable to access note
              </CardTitle>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This shared note may have expired, been revoked, or no longer be
                available.
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive">
                {message}
              </div>

              <Link
                href="/"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                Go to Share Note
              </Link>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Secure note sharing made simple.
          </p>
        </div>
      </main>
    );
  }

  /*
   * Access key required
   */
  if (requiresAccessKey) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <PageBackground />

        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <FileText className="h-4 w-4" />
              </div>

              <span className="text-sm font-bold tracking-tight">
                Share Note
              </span>
            </Link>
          </div>

          <Card className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-black/5">
            <CardHeader className="border-b bg-muted/20 px-6 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Lock className="h-7 w-7" />
              </div>

              <CardTitle className="mt-5 text-2xl tracking-tight">
                Protected note
              </CardTitle>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                This note is protected by an access key. Enter the key provided
                by the note owner to continue.
              </p>
            </CardHeader>

            <CardContent className="p-6 sm:p-7">
              <form onSubmit={handleUnlock} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="accessKey" className="text-sm font-semibold">
                    Access key
                  </Label>

                  <Input
                    id="accessKey"
                    type="password"
                    value={accessKey}
                    onChange={(event) => setAccessKey(event.target.value)}
                    placeholder="Enter your access key"
                    autoComplete="off"
                    disabled={unlockMutation.isPending}
                    className="h-11 rounded-xl"
                  />
                </div>

                {unlockMutation.isError && (
                  <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>{getErrorMessage(unlockMutation.error)}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl font-semibold shadow-sm"
                  disabled={!accessKey.trim() || unlockMutation.isPending}
                >
                  {unlockMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying access...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Unlock note
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 border-t pt-5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected shared note
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            The access key is never displayed publicly.
          </p>
        </div>
      </main>
    );
  }

  /*
   * Note unavailable
   */
  if (!note) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
        <PageBackground />

        <Card className="w-full max-w-md rounded-2xl shadow-xl shadow-black/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>

            <CardTitle className="mt-4">Note unavailable</CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-sm leading-6 text-muted-foreground">
              The shared note could not be loaded. It may no longer be
              available.
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Go home
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  /*
   * Shared note
   */
  return (
    <main className="relative min-h-screen bg-background px-4 py-8 sm:py-10">
      <PageBackground />

      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="group inline-flex w-fit items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-translate-y-0.5">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <div className="text-sm font-bold tracking-tight">Share Note</div>

              <div className="text-xs text-muted-foreground">
                Secure note sharing
              </div>
            </div>
          </Link>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure share
          </div>
        </header>

        {/* Note card */}
        <Card className="overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-black/5">
          {/* Note header */}
          <CardHeader className="border-b px-6 py-7 sm:px-10 sm:py-9">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <FileText className="h-3 w-3" />
                Shared note
              </span>

              <span className="text-muted-foreground/40">•</span>

              <span className="text-[11px] font-medium text-muted-foreground">
                Read only
              </span>
            </div>

            <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {note.title}
            </CardTitle>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Created {formatDate(note.createdAt)}</span>
              </div>

              {data?.viewCount !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />

                  <span>
                    {data.viewCount} {data.viewCount === 1 ? "view" : "views"}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          {/* Note content */}
          <CardContent className="px-6 py-7 sm:px-10 sm:py-10">
            <div className="rounded-2xl border bg-background px-5 py-6 shadow-sm sm:px-7 sm:py-8">
              <div className="whitespace-pre-wrap break-words text-[15px] leading-8 text-foreground sm:text-base sm:leading-8">
                {note.content}
              </div>
            </div>
          </CardContent>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t bg-muted/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Securely shared with you</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>Read-only access</span>
            </div>
          </div>
        </Card>

        {/* Bottom navigation / branding */}
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <span className="text-xs text-muted-foreground">
            Shared securely using
          </span>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-foreground"
          >
            <FileText className="h-3.5 w-3.5" />
            Share Note
          </Link>
        </div>
      </div>
    </main>
  );
}
