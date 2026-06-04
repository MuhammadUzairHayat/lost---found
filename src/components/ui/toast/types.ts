export type ToastVariant = "error" | "success" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}
