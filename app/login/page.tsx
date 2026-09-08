"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  KeyRound,
  Link2,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError(false);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(true);
      setMessage(error.message ?? "Unable to sign in. Please try again.");
      return;
    }

    setMessage("Login successful.");

    router.push("/notes");
    router.refresh();
  }

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/notes");
    }
  }, [session, isPending, router]);

  if (isPending || session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left side */}
          <div className="hidden lg:block">
            <Link href="/" className="mb-10 inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <FileText className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold tracking-tight">
                Share Note
              </span>
            </Link>

            <div className="max-w-lg">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Simple. Private. Shareable.
              </div>

              <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">
                Your notes,
                <br />
                <span className="text-primary">shared your way.</span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Create private notes, generate secure share links, and control
                who can access your content.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Link2 className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Share with a simple link
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Send notes without complicated setup.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <KeyRound className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Protect sensitive notes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add an access key when you need extra privacy.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Clean read-only sharing
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recipients can view shared notes without editing them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login section */}
          <div className="mx-auto w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 text-center lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <FileText className="h-5 w-5" />
                </div>

                <span className="text-xl font-bold tracking-tight">
                  Share Note
                </span>
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in to manage and share your notes.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border bg-card/90 p-6 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    required
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>

                    <span className="text-xs text-muted-foreground">
                      Keep it private
                    </span>
                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    required
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Message */}
                {message && (
                  <div
                    role={error ? "alert" : "status"}
                    className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
                      error
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {!error && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    )}

                    {error && (
                      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                    )}

                    <span>{message}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="h-4 w-4" />
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />

                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  Secure
                </span>

                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Register */}
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Security */}
            <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
              <span>Your account is protected with secure authentication.</span>
            </div>

            <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
              By continuing, you agree to use Share Note responsibly.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
