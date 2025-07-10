import { useState, useCallback } from "react";
import { MonsterFormData, MonsterFormHook } from "../types/monsterForm";

const initialFormData: MonsterFormData = {
  name: "",
  source: "",
  page: "",
  size: "Medium",
  type: "",
  tags: [],
  alignment: "Unaligned",
  armorClass: 10,
  armorType: "",
  hitPoints: 10,
  hitDice: {
    count: 1,
    die: "d8",
  },
  proficiencyBonus: 2,
  speed: {
    walk: "30 ft.",
    swim: "",
    fly: "",
    burrow: "",
    climb: "",
  },
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  savingThrows: [],
  skills: [],
  damageVulnerabilities: [],
  damageResistances: [],
  damageImmunities: [],
  conditionImmunities: [],
  senses: {
    darkvision: "",
    blindsight: "",
    tremorsense: "",
    truesight: "",
    passivePerception: 10,
  },
  languages: "",
  challengeRating: "1/4",
  experiencePoints: 50,
  traits: [],
  actions: [],
  reactions: [],
  legendaryActions: [],
  lairActions: [],
  regionalEffects: [],
  environment: [],
};

export const useMonsterForm = (): MonsterFormHook => {
  const [formData, setFormData] = useState<MonsterFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field: keyof MonsterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setNestedField = useCallback((
    parentField: keyof MonsterFormData,
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

  return {
    formData,
    setField,
    setNestedField,
    reset,
    isSubmitting,
    setIsSubmitting,
  };
}; 