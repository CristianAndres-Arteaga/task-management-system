import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className = "", ...rest }: TextareaProps) {
  return (
    <div>
      <textarea
        className={`w-full px-3 py-2 rounded-lg border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? "border-error" : "border-border"
        } ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}