"use client";

import { signIn } from "next-auth/react";
import { Waves } from "lucide-react";
import { TributaryMotif } from "@/components/layout/tributary-motif";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <TributaryMotif className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Waves className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">ICAP</h1>
        <p className="mt-1 text-sm text-muted-foreground">منصة تحليل النزاعات العراقية</p>
        <p className="mt-4 text-sm text-muted-foreground">سجّل الدخول بحساب Google للمتابعة</p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          <GoogleIcon />
          الدخول بحساب Google
        </button>

        <p className="mt-6 text-xs text-muted-foreground">
          بياناتك (النزاعات اللي تسجّلها) تُحفظ محلياً على جهازك فقط، ولا تُشارك مع أي شخص آخر.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.4 29.3 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.3-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.4 29.3 3.5 24 3.5c-7.8 0-14.5 4.4-17.7 11.2z" />
      <path fill="#4CAF50" d="M24 44.5c5.2 0 9.9-1.8 13.5-4.8l-6.2-5.3C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.4 40 16.1 44.5 24 44.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.3C40.9 36.6 44.5 30.9 44.5 24c0-1.2-.1-2.3-.3-3.5z" />
    </svg>
  );
}
