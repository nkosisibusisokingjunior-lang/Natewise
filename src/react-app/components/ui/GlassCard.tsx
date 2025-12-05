import type { ReactNode, ElementType, ComponentPropsWithoutRef } from "react";

export type GlassCardProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  /**
   * Set to false to disable hover elevation / border change
   */
  hover?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "className" | "children">;

export function GlassCard<T extends ElementType = "div">({
  as,
  children,
  className = "",
  hover = true,
  ...rest
}: GlassCardProps<T>) {
  const Component = (as || "div") as ElementType;
  const hoverClasses = hover
    ? "hover:border-white/40 hover:bg-white/10 hover:shadow-card hover:-translate-y-[1px]"
    : "";

  return (
    <Component
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-brand-soft/15" />
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
