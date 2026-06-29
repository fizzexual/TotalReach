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
  Lead: "#a1a1aa",
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} />
          <YAxis
            tickFormatter={(v) => formatCompactCurrency(Number(v))}
            tickLine={false}
            axisLine={false}
            width={60}
            tick={{ fontSize: 12, fill: "#71717a" }}
          />
          <Tooltip
            formatter={(v) => [formatCurrency(Number(v)), "Value"]}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "#18181b",
              color: "#e4e4e7",
              fontSize: 12,
            }}
            labelStyle={{ color: "#e4e4e7" }}
            itemStyle={{ color: "#e4e4e7" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {data.map((d) => (
              <Cell key={d.stage} fill={COLORS[d.stage] ?? "#10b981"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
