import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "success" | "warning";
type Size = "sm" | "md" | "lg";

interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-all focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-slate-950 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand-soft to-brand-accent text-white shadow-md shadow-black/40",
  secondary:
    "bg-white/10 text-slate-50 border border-white/25 shadow-sm hover:bg-white/15",
  success:
    "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-md shadow-emerald-500/40",
  warning:
    "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/40",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={[
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
