import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Create your account</h2>
      <p className="mt-1.5 text-sm text-zinc-400">Start managing your pipeline in minutes.</p>

      <div className="mt-6">
        <RegisterForm />
      </div>

      <p className="mt-6 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
