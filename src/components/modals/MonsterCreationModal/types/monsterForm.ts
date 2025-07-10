export interface MonsterFormData {
  name: string;
  source: string;
  page: string;
  size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
  type: string;
  tags: string[];
  alignment: string;
  armorClass: number;
  armorType: string;
  hitPoints: number;
  hitDice: {
    count: number;
    die: "d4" | "d6" | "d8" | "d10" | "d12";
  };
  proficiencyBonus: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  speed: {
    walk: string;
    swim: string;
    fly: string;
    burrow: string;
    climb: string;
  };
  savingThrows: string[];
  skills: string[];
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: {
    darkvision: string;
    blindsight: string;
    tremorsense: string;
    truesight: string;
    passivePerception: number;
  };
  languages: string;
  challengeRating: string;
  experiencePoints: number;
  traits: Array<{ name: string; description: string }>;
  actions: Array<{ name: string; description: string }>;
  reactions: Array<{ name: string; description: string }>;
  legendaryActions: Array<{ name: string; description: string }>;
  lairActions: Array<{ name: string; description: string }>;
  regionalEffects: Array<{ name: string; description: string }>;
  environment: string[];
}

export interface MonsterFormProps {
  formData: MonsterFormData;
  setField: (field: keyof MonsterFormData, value: any) => void;
  setNestedField: (parentField: keyof MonsterFormData, childField: string, value: any) => void;
  errors: Record<string, string>;
}

export interface MonsterFormHook {
  formData: MonsterFormData;
  setField: (field: keyof MonsterFormData, value: any) => void;
  setNestedField: (parentField: keyof MonsterFormData, childField: string, value: any) => void;
  reset: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

export interface MonsterValidationHook {
  errors: Record<string, string>;
  validateForm: () => boolean;
  clearErrors: () => void;
  setErrors: (errors: Record<string, string>) => void;
} 