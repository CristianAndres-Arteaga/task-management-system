import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className = "", ...rest }: InputProps) {
  return (
    <div>
      <input
        className={`w-full px-3 py-2 rounded-lg border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? "border-error" : "border-border"
        } ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}