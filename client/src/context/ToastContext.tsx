import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ToastViewport from "../components/toast/ToastViewport";

export type ToastVariant = "success" | "error";

export type ShowToastInput = {
  variant: ToastVariant;
  title?: string;
  message: string;
  durationMs?: number;
};

type ToastItem = Required<Pick<ShowToastInput, "variant" | "message">> & {
  id: string;
  title?: string;
  durationMs: number;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ShowToastInput) => {
      const id = makeId();
      const durationMs = input.durationMs ?? 3500;

      setToasts((prev) => [
        ...prev,
        {
          id,
          variant: input.variant,
          title: input.title,
          message: input.message,
          durationMs,
        },
      ]);

      window.setTimeout(() => dismissToast(id), durationMs);
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ showToast, dismissToast }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const c = useContext(ToastContext);
  if (!c) {
    throw Error("useToast must be used under a ToastProvider!");
  }
  return c;
}
