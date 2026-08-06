"use client";

const VARIANTS = {
  primary: "bg-accent text-bg hover:brightness-110",
  ghost: "bg-transparent border border-border text-muted hover:text-text hover:border-accent",
  danger: "bg-loss text-bg hover:brightness-110",
};

export default function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
