import { Id } from "../../convex/_generated/dataModel";

// Base modal props interface
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  maxHeight?: string;
  showCloseButton?: boolean;
  className?: string;
}

// Form tab interface
export interface FormTab {
  value: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

// Loading state interface
export interface LoadingStateProps {
  isLoading: boolean;
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  overlay?: boolean;
}

// Error display interface
export interface ErrorDisplayProps {
  errors: Record<string, string>;
  field?: string;
  className?: string;
  variant?: "default" | "destructive" | "inline";
}

// Modal size options
export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

// Common modal callbacks
export interface ModalCallbacks {
  onClose: () => void;
  onSuccess?: (id: Id<any>) => void;
  onError?: (error: string) => void;
}

// Form validation interface
export interface FormValidation {
  errors: Record<string, string>;
  isValid: boolean;
  validate: () => boolean;
  clearErrors: () => void;
}

// Form state interface
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Form actions interface
export interface FormActions<T> {
  setField: (field: keyof T, value: any) => void;
  setErrors: (errors: Record<string, string>) => void;
  reset: () => void;
  validate: () => boolean;
} 