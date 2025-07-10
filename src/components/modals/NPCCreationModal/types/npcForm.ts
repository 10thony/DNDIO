export interface CharacterFormData {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  level: number;
  hitPoints: number;
  armorClass: number;
  proficiencyBonus: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  savingThrows: string[];
  proficiencies: string[];
  traits: string[];
  languages: string[];
  equipment: string[];
  description: string;
}

// Legacy interface for backward compatibility
export interface NPCFormData extends CharacterFormData {}

export type CharacterType = "PlayerCharacter" | "NonPlayerCharacter";

export interface CharacterFormProps {
  formData: CharacterFormData;
  setField: (field: keyof CharacterFormData, value: any) => void;
  setNestedField: (parentField: keyof CharacterFormData, childField: string, value: any) => void;
  errors: Record<string, string>;
  isReadOnly?: boolean;
  characterType?: CharacterType;
}

// Legacy interface for backward compatibility
export interface NPCFormProps extends CharacterFormProps {}

export interface CharacterFormHook {
  formData: CharacterFormData;
  setField: (field: keyof CharacterFormData, value: any) => void;
  setNestedField: (parentField: keyof CharacterFormData, childField: string, value: any) => void;
  reset: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  populateForm: (data: Partial<CharacterFormData>) => void;
}

// Legacy interface for backward compatibility
export interface NPCFormHook extends CharacterFormHook {}

export interface CharacterValidationHook {
  errors: Record<string, string>;
  validateForm: () => boolean;
  clearErrors: () => void;
  setErrors: (errors: Record<string, string>) => void;
}

// Legacy interface for backward compatibility
export interface NPCValidationHook extends CharacterValidationHook {} 