type FieldInlineErrorProps = {
  message?: string | null;
  id?: string;
};

/** Inline validation message shown directly under a form field. */
export function FieldInlineError({ message, id }: FieldInlineErrorProps) {
  if (!message?.trim()) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-destructive flex items-start gap-1.5">
      <span aria-hidden className="mt-0.5 h-1 w-1 rounded-full bg-destructive shrink-0" />
      <span>{message}</span>
    </p>
  );
}
