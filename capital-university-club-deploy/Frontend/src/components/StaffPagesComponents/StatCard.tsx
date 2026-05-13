import type { ComponentType, SVGProps } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  subtitle?: string;
  tone?: "blue" | "cyan" | "orange" | "green" | "purple" | "rose";
  emphasis?: "primary" | "secondary";
  trend?: { value: number; direction?: "up" | "down" };
}

// Navy + cyan palette — matches the sidebar #214474 ↔ #2596be
const TONES: Record<
  NonNullable<StatCardProps["tone"]>,
  { bg: string; icon: string; accent: string; glow: string }
> = {
  // Deepest navy — same as sidebar background
  blue: {
    bg: "bg-[#214474]/10",
    icon: "text-[#214474]",
    accent: "from-[#0e1c38] to-[#214474]",
    glow: "group-hover:shadow-[0_18px_40px_-12px_rgba(33,68,116,0.4)]",
  },
  // Cyan — same as the active pill in landing/header
  cyan: {
    bg: "bg-[#2596be]/15",
    icon: "text-[#2596be]",
    accent: "from-[#214474] to-[#2596be]",
    glow: "group-hover:shadow-[0_18px_40px_-12px_rgba(37,150,190,0.4)]",
  },
  // Brand orange — used as accent (gold) like in the header strip
  orange: {
    bg: "bg-[#f8941c]/15",
    icon: "text-[#f8941c]",
    accent: "from-[#1a4d63] to-[#f8941c]",
    glow: "group-hover:shadow-[0_18px_40px_-12px_rgba(248,148,28,0.35)]",
  },
  // Soft blue tint — for less-emphatic stats
  green: {
    bg: "bg-[#1b71bc]/10",
    icon: "text-[#1b71bc]",
    accent: "from-[#1b71bc] to-[#2596be]",
    glow: "group-hover:shadow-[0_18px_40px_-12px_rgba(27,113,188,0.35)]",
  },
  // Deep cyan — alternative tone
  purple: {
    bg: "bg-[#1a4d63]/15",
    icon: "text-[#1a4d63]",
    accent: "from-[#0e1c38] to-[#1a4d63]",
    glow: "group-hover:shadow-[0_18px_40px_-12px_rgba(26,77,99,0.4)]",
  },
  // Warm accent — only for danger/highlights, kept subtle
  rose: {
    bg: "bg-[#f8941c]/10",
    icon: "text-[#e07d10]",
    accent: "from-[#e07d10] to-[#f8941c]",
    glow: "group-hover:shadow-[0_18px_40px_-12px_rgba(224,125,16,0.35)]",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  tone = "blue",
  emphasis = "secondary",
  trend,
}: StatCardProps) {
  const isPrimary = emphasis === "primary";
  const t = TONES[tone];

  // Always use Western numerals — easier to read in dashboards and aligns
  // with monetary values (EGP 1,250) which already render in Latin digits.
  const formattedValue =
    typeof value === "number" ? value.toLocaleString("en-US") : value;
  const TrendIcon = trend?.direction === "down" ? TrendingDown : TrendingUp;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl bg-white
        ring-1 ring-gray-200/80 shadow-[0_2px_12px_rgba(16,24,40,0.04)]
        transition-all duration-300
        hover:-translate-y-1 hover:ring-gray-300 ${t.glow}
        ${isPrimary ? "p-6 md:p-7" : "p-5 md:p-6"}
      `}
    >
      {/* Accent strip on top */}
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.accent}`} />

      {/* Decorative blur blob in corner */}
      <div
        className={`absolute -bottom-10 -end-10 h-32 w-32 rounded-full bg-gradient-to-br ${t.accent} opacity-[0.07] blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.14]`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`${
              isPrimary ? "text-[18px]" : "text-[17px]"
            } font-extrabold tracking-tight text-gray-600`}
          >
            {title}
          </p>

          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <p
              className={`${
                isPrimary ? "text-5xl md:text-[52px]" : "text-4xl md:text-[42px]"
              } font-black leading-none text-[#0e1c38] tracking-tight`}
              style={{ fontFeatureSettings: '"tnum"' }}
              dir="ltr"
            >
              {formattedValue}
            </p>

            {trend && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  trend.direction === "down"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-3 text-[16px] font-bold leading-relaxed text-gray-600 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex-shrink-0 flex items-center justify-center rounded-2xl ${t.bg} ${
            isPrimary ? "h-14 w-14" : "h-12 w-12"
          } transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className={`h-6 w-6 ${t.icon}`} />
        </div>
      </div>
    </div>
  );
}
