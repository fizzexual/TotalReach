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
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
      <p className="mt-1.5 text-sm text-slate-500">Sign in to your TotalReach workspace.</p>

      <div className="mt-6">
        <LoginForm next={next} />
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Create one
        </Link>
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-600">Demo account</span> — email{" "}
        <span className="font-mono text-slate-700">demo@totalreach.app</span>, password{" "}
        <span className="font-mono text-slate-700">password123</span>
      </div>
    </div>
  );
}
