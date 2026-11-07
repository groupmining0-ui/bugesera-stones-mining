import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const session = await auth();
  const { error, next } = await searchParams;

  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/account");
  }

  const locale = await getLocale();
  const t = dictionary[locale];

  async function action(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    // Determine target redirect based on user role if next is not explicitly provided
    let target = next && next.startsWith("/") ? next : "/account";
    if (!next) {
      try {
        const foundUser = await db.user.findUnique({ where: { email } });
        if (foundUser?.role === "ADMIN") {
          target = "/admin";
        }
      } catch {
        // Fall back to /account if DB lookup fails
      }
    }

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: target,
      });
    } catch (e) {
      if (e instanceof AuthError) redirect(`/login?error=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
      throw e;
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="font-display text-3xl font-bold">{t.login.title}</h1>
      <form action={action} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">{t.login.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">{t.login.password}</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-laterite">{t.login.error}</p>}
        <Button type="submit" className="w-full" size="lg">{t.login.title}</Button>
      </form>
      <p className="mt-6 text-sm text-granite">
        {t.login.newHere} <Link className="font-medium text-basalt underline underline-offset-2" href="/register">{t.login.createAccount}</Link>
      </p>
    </div>
  );
}
