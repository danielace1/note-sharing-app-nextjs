import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  KeyRound,
  Link2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText className="h-4.5 w-4.5" />
            </div>

            <span className="text-lg font-bold tracking-tight">Share Note</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-muted/70 blur-3xl" />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Simple notes. Secure sharing.
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Write it.
            <br className="sm:hidden" /> Share it.
            <br />
            <span className="text-muted-foreground">Keep it simple.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Create notes, organize your thoughts, and securely share them with
            anyone using a simple link. Add an access key when you need an extra
            layer of protection.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl sm:w-auto"
            >
              Create your first note
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border bg-background px-6 text-sm font-semibold shadow-sm transition-all hover:bg-muted sm:w-auto"
            >
              Sign in
            </Link>
          </div>

          {/* Trust */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Easy to use
            </span>

            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Secure sharing
            </span>

            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Read-only links
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold">Everything you need</p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Notes made for sharing
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Keep your notes simple while having the controls you need when
              sharing them with others.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <FileText className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">Create notes</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Quickly create and manage your notes in one clean,
                distraction-free workspace.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <Link2 className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">Share with a link</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Generate a unique share link and send your note to anyone
                without exposing your account.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <KeyRound className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-semibold">Protect with an access key</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Add an access key to shared notes when you want additional
                protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Built for simple sharing
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From note to
              <br />
              shared link in seconds.
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
              Share Note keeps the process straightforward. Create your note,
              choose how you want to share it, and send the link.
            </p>

            <Link
              href="/register"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Start sharing notes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>

              <div>
                <h3 className="font-semibold">Create your note</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Write whatever you need and keep it organized in your account.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>

              <div>
                <h3 className="font-semibold">Generate a share link</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Create a unique link that you can send to your recipient.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>

              <div>
                <h3 className="font-semibold">Share securely</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Optionally protect the note with an access key and share it
                  confidently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security banner */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl border bg-muted/30 p-8 sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Lock className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold">Your notes, your control.</h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Share Note gives you simple tools to control how your notes
                  are shared and accessed.
                </p>
              </div>

              <Link
                href="/register"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-7 sm:flex-row sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-3.5 w-3.5" />
            </div>
            Share Note
          </Link>

          <p className="text-xs text-muted-foreground">
            Simple notes. Secure sharing.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="transition-colors hover:text-foreground"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
