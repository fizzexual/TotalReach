"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

const COLORS: Record<string, string> = {
  Lead: "#94a3b8",
  Qualified: "#0ea5e9",
  Proposal: "#8b5cf6",
  Negotiation: "#f59e0b",
  Won: "#10b981",
  Lost: "#f43f5e",
};

export function DashboardChart({ data }: { data: { stage: string; value: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
          <XAxis
            dataKey="stage"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />
          <YAxis
            tickFormatter={(v) => formatCompactCurrency(Number(v))}
            tickLine={false}
            axisLine={false}
            width={60}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
          />
          <Tooltip
            formatter={(v) => [formatCurrency(Number(v)), "Value"]}
            cursor={{ fill: "rgba(99,102,241,0.06)" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {data.map((d) => (
              <Cell key={d.stage} fill={COLORS[d.stage] ?? "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
