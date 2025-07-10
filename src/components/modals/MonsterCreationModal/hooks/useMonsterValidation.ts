import { useState, useCallback, useEffect } from "react";
import { MonsterFormData, MonsterValidationHook } from "../types/monsterForm";
import { CommonValidations, ValidationHelpers } from "../../../../types/validation";

export const useMonsterValidation = (formData: MonsterFormData): MonsterValidationHook => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validationRules = [
    CommonValidations.required("name"),
    CommonValidations.minLength("name", 1),
    CommonValidations.maxLength("name", 100),
    CommonValidations.required("type"),
    CommonValidations.minLength("type", 1),
    CommonValidations.maxLength("type", 50),
    CommonValidations.required("alignment"),
    CommonValidations.positiveNumber("armorClass"),
    CommonValidations.min("armorClass", 0),
    CommonValidations.max("armorClass", 30),
    CommonValidations.positiveNumber("hitPoints"),
    CommonValidations.min("hitPoints", 1),
    CommonValidations.max("hitPoints", 1000),
    CommonValidations.positiveNumber("proficiencyBonus"),
    CommonValidations.min("proficiencyBonus", 0),
    CommonValidations.max("proficiencyBonus", 9),
    CommonValidations.positiveNumber("hitDice.count"),
    CommonValidations.min("hitDice.count", 1),
    CommonValidations.max("hitDice.count", 100),
    CommonValidations.positiveNumber("abilityScores.strength"),
    CommonValidations.min("abilityScores.strength", 1),
    CommonValidations.max("abilityScores.strength", 30),
    CommonValidations.positiveNumber("abilityScores.dexterity"),
    CommonValidations.min("abilityScores.dexterity", 1),
    CommonValidations.max("abilityScores.dexterity", 30),
    CommonValidations.positiveNumber("abilityScores.constitution"),
    CommonValidations.min("abilityScores.constitution", 1),
    CommonValidations.max("abilityScores.constitution", 30),
    CommonValidations.positiveNumber("abilityScores.intelligence"),
    CommonValidations.min("abilityScores.intelligence", 1),
    CommonValidations.max("abilityScores.intelligence", 30),
    CommonValidations.positiveNumber("abilityScores.wisdom"),
    CommonValidations.min("abilityScores.wisdom", 1),
    CommonValidations.max("abilityScores.wisdom", 30),
    CommonValidations.positiveNumber("abilityScores.charisma"),
    CommonValidations.min("abilityScores.charisma", 1),
    CommonValidations.max("abilityScores.charisma", 30),
    CommonValidations.positiveNumber("senses.passivePerception"),
    CommonValidations.min("senses.passivePerception", 0),
    CommonValidations.max("senses.passivePerception", 50),
    CommonValidations.positiveNumber("experiencePoints"),
    CommonValidations.min("experiencePoints", 0),
    CommonValidations.max("experiencePoints", 1000000),
  ];

  const validateForm = useCallback((): boolean => {
    const validationResult = ValidationHelpers.validateFields(formData, validationRules);
    setErrors(validationResult.errors);
    return validationResult.isValid;
  }, [formData, validationRules]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  // Auto-validate on form data changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validateForm();
    }
  }, [formData, validateForm, errors]);

  return {
    errors,
    validateForm,
    clearErrors,
    setErrors: setFieldErrors,
  };
}; 