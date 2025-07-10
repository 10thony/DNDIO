import { useState, useCallback } from "react";
import { CharacterFormData, CharacterFormHook } from "../types/npcForm";

const initialFormData: CharacterFormData = {
  name: "",
  race: "",
  class: "",
  background: "",
  alignment: "Neutral",
  level: 1,
  hitPoints: 10,
  armorClass: 10,
  proficiencyBonus: 2,
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  skills: [],
  savingThrows: [],
  proficiencies: [],
  traits: [],
  languages: [],
  equipment: [],
  description: "",
};

export const useCharacterForm = (): CharacterFormHook => {
  const [formData, setFormData] = useState<CharacterFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field: keyof CharacterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setNestedField = useCallback((
    parentField: keyof CharacterFormData,
    childField: string,
    value: any
  ) => {
    setFormData(prev => {
      const parentValue = prev[parentField];
      const parentObj = (typeof parentValue === 'object' && parentValue !== null) ? parentValue : {};
      return {
        ...prev,
        [parentField]: {
          ...parentObj,
          [childField]: value,
        },
      };
    });
  }, []);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setIsSubmitting(false);
  }, []);

  const populateForm = useCallback((data: Partial<CharacterFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }));
  }, []);

  return {
    formData,
    setField,
    setNestedField,
    reset,
    isSubmitting,
    setIsSubmitting,
    populateForm,
  };
};

// Legacy export for backward compatibility
export const useNPCForm = useCharacterForm; 