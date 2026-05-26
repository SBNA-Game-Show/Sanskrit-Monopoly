import type { ToastVariant } from "../../context/ToastContext";

const variantStyles: Record<
  ToastVariant,
  {
    container: string;
    icon: string;
    title: string;
  }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-950",
    icon: "bg-emerald-600",
    title: "text-emerald-950",
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-950",
    icon: "bg-red-600",
    title: "text-red-950",
  },
};

export default function Toast({
  variant,
  title,
  message,
  onDismiss,
}: {
  variant: ToastVariant;
  title?: string;
  message: string;
  onDismiss: () => void;
}) {
  const s = variantStyles[variant];

  return (
    <div
      role="status"
      className={`toast-slide-down pointer-events-auto flex w-[min(520px,calc(100vw-2rem))] items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${s.container}`}
    >
      <div
        aria-hidden="true"
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${s.icon}`}
      />

      <div className="min-w-0 flex-1">
        {title && (
          <p className={`m-0 text-sm font-bold leading-5 ${s.title}`}>
            {title}
          </p>
        )}
        <p className="m-0 text-sm font-medium leading-5">{message}</p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 rounded-lg px-2 py-1 text-sm font-bold text-slate-700/70 transition hover:bg-black/5 hover:text-slate-900"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
