"use client";

export default function IconNavButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 border border-border text-text hover:border-accent hover:text-accent transition-colors"
    >
      {children}
    </button>
  );
}
