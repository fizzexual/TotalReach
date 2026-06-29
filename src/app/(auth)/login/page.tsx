import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Welcome back</h2>
      <p className="mt-1.5 text-sm text-zinc-400">Sign in to your TotalReach workspace.</p>

      <div className="mt-6">
        <LoginForm next={next} />
      </div>

      <p className="mt-6 text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
          Create one
        </Link>
      </p>

      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Demo account</span> — email{" "}
        <span className="font-mono text-zinc-200">demo@totalreach.app</span>, password{" "}
        <span className="font-mono text-zinc-200">password123</span>
      </div>
    </div>
  );
}
