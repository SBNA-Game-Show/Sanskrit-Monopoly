import Toast from "./Toast";
import type { ToastVariant } from "../../context/ToastContext";

type ToastItem = {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
};

export default function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-16 z-[100] flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          message={t.message}
          onDismiss={() => onDismiss(t.id)}
        />
      ))}
    </div>
  );
}
