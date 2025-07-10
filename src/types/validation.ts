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

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  fieldErrors: Record<string, string>;
}

// Validation function type
export type ValidatorFunction = (value: any, field?: string) => string | null;

// Common validation rules
export const CommonValidations = {
  required: (field: string): ValidationRule => ({
    field,
    validator: (value: any) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return `${field} is required`;
      }
      return null;
    },
    message: `${field} is required`,
    required: true,
  }),

  minLength: (field: string, min: number): ValidationRule => ({
    field,
    validator: (value: any) => {
      if (value && typeof value === 'string' && value.length < min) {
        return `${field} must be at least ${min} characters`;
      }
      return null;
    },
    message: `${field} must be at least ${min} characters`,
    minLength: min,
  }),

  maxLength: (field: string, max: number): ValidationRule => ({
    field,
    validator: (value: any) => {
      if (value && typeof value === 'string' && value.length > max) {
        return `${field} must be no more than ${max} characters`;
      }
      return null;
    },
    message: `${field} must be no more than ${max} characters`,
    maxLength: max,
  }),

  min: (field: string, min: number): ValidationRule => ({
    field,
    validator: (value: any) => {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue < min) {
        return `${field} must be at least ${min}`;
      }
      return null;
    },
    message: `${field} must be at least ${min}`,
    min,
  }),

  max: (field: string, max: number): ValidationRule => ({
    field,
    validator: (value: any) => {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > max) {
        return `${field} must be no more than ${max}`;
      }
      return null;
    },
    message: `${field} must be no more than ${max}`,
    max,
  }),

  pattern: (field: string, pattern: RegExp, message: string): ValidationRule => ({
    field,
    validator: (value: any) => {
      if (value && !pattern.test(value)) {
        return message;
      }
      return null;
    },
    message,
    pattern,
  }),

  email: (field: string): ValidationRule => ({
    field,
    validator: (value: any) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailPattern.test(value)) {
        return `${field} must be a valid email address`;
      }
      return null;
    },
    message: `${field} must be a valid email address`,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }),

  url: (field: string): ValidationRule => ({
    field,
    validator: (value: any) => {
      try {
        if (value && new URL(value)) {
          return null;
        }
      } catch {
        return `${field} must be a valid URL`;
      }
      return null;
    },
    message: `${field} must be a valid URL`,
  }),

  positiveNumber: (field: string): ValidationRule => ({
    field,
    validator: (value: any) => {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue <= 0) {
        return `${field} must be a positive number`;
      }
      return null;
    },
    message: `${field} must be a positive number`,
  }),

  integer: (field: string): ValidationRule => ({
    field,
    validator: (value: any) => {
      const numValue = Number(value);
      if (!isNaN(numValue) && !Number.isInteger(numValue)) {
        return `${field} must be a whole number`;
      }
      return null;
    },
    message: `${field} must be a whole number`,
  }),
};

// Validation helper functions
export const ValidationHelpers = {
  // Validate a single field
  validateField: (value: any, rules: ValidationRule[]): string | null => {
    for (const rule of rules) {
      const error = rule.validator(value);
      if (error) return error;
    }
    return null;
  },

  // Validate multiple fields
  validateFields: (data: Record<string, any>, rules: ValidationRule[]): ValidationResult => {
    const errors: Record<string, string> = {};
    const fieldErrors: Record<string, string> = {};

    for (const rule of rules) {
      const value = data[rule.field];
      const error = rule.validator(value);
      if (error) {
        errors[rule.field] = error;
        fieldErrors[rule.field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      fieldErrors,
    };
  },

  // Validate form data
  validateForm: (data: Record<string, any>, fieldRules: Record<string, ValidationRule[]>): ValidationResult => {
    const errors: Record<string, string> = {};
    const fieldErrors: Record<string, string> = {};

    for (const [field, rules] of Object.entries(fieldRules)) {
      const value = data[field];
      const error = ValidationHelpers.validateField(value, rules);
      if (error) {
        errors[field] = error;
        fieldErrors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      fieldErrors,
    };
  },

  // Clear specific field errors
  clearFieldError: (errors: Record<string, string>, field: string): Record<string, string> => {
    const newErrors = { ...errors };
    delete newErrors[field];
    return newErrors;
  },

  // Clear all errors
  clearAllErrors: (): Record<string, string> => ({}),
}; 