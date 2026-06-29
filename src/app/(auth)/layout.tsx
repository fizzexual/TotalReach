import { CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/brand";

const POINTS = [
  "Visual drag-and-drop deal pipeline",
  "Contacts & companies in one place",
  "Tasks, calls, and meeting reminders",
  "A dashboard that shows what matters",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: "radial-gradient(circle at 15% 20%, white 0, transparent 35%)" }}
        />
        <div className="relative">
          <Brand tone="light" />
        </div>
        <div className="relative">
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            The smart CRM that works the way you do.
          </h1>
          <p className="mt-4 max-w-md text-lg text-indigo-100">
            Smarter pipelines. Faster decisions. Happier teams.
          </p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-indigo-50">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-200" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-indigo-200">© {new Date().getFullYear()} TotalReach CRM</p>
      </div>

      <div className="flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
