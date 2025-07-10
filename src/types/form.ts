import { Id } from "../../convex/_generated/dataModel";

// Base form data interface
export interface BaseFormData {
  id?: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Form field types
export type FormFieldType = 
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  | "custom";

// Form field interface
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule[];
  defaultValue?: any;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}

// Validation rule interface
export interface ValidationRule {
  field: string;
  validator: (value: any) => string | null;
  message: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// Form section interface
export interface FormSection {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  fields: FormField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Form configuration interface
export interface FormConfig {
  sections: FormSection[];
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  resetOnSubmit?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// Form submission interface
export interface FormSubmission<T> {
  data: T;
  isValid: boolean;
  errors: Record<string, string>;
}

// Multi-select interface
export interface MultiSelectOption {
  id: Id<any>;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// Form state management interface
export interface FormStateManager<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  setField: (field: keyof T, value: any) => void;
  setErrors: (errors: Record<string, string>) => void;
  reset: () => void;
  validate: () => boolean;
  submit: () => Promise<boolean>;
}

// Form field change event
export interface FormFieldChangeEvent {
  field: string;
  value: any;
  isValid: boolean;
  error?: string;
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  fieldErrors: Record<string, string>;
} 