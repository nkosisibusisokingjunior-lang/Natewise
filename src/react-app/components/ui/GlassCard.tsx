import type { ReactNode, HTMLAttributes } from "react";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  /**
   * Set to false to disable hover elevation / border change
   */
  hover?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hover = true,
  ...rest
}: GlassCardProps) {
  const hoverClasses = hover
    ? "hover:border-white/40 hover:bg-white/10 hover:shadow-card hover:-translate-y-[1px]"
    : "";

  return (
    <div
      {...rest}
      className={[
        "relative overflow-hidden rounded-2xl border border-glass-border bg-glass-light",
        "backdrop-blur-xl shadow-glass transition-all duration-300",
        hoverClasses,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* subtle inner gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-brand-soft/10" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
