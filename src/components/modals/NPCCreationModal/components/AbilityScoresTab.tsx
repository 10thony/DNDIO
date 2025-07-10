import React from "react";
import { FormSection } from "../../shared";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { ErrorDisplay } from "../../shared";
import { CharacterFormProps } from "../types/npcForm";
import { Zap, Brain, Heart, Eye, Shield, MessageSquare } from "lucide-react";

const AbilityScoresTab: React.FC<CharacterFormProps> = ({
  formData,
  setNestedField,
  errors,
  isReadOnly = false,
}) => {
  const abilityScores = [
    { key: "strength", label: "Strength", icon: <Zap className="h-4 w-4" />, color: "text-red-500" },
    { key: "dexterity", label: "Dexterity", icon: <Eye className="h-4 w-4" />, color: "text-green-500" },
    { key: "constitution", label: "Constitution", icon: <Heart className="h-4 w-4" />, color: "text-orange-500" },
    { key: "intelligence", label: "Intelligence", icon: <Brain className="h-4 w-4" />, color: "text-blue-500" },
    { key: "wisdom", label: "Wisdom", icon: <Shield className="h-4 w-4" />, color: "text-purple-500" },
    { key: "charisma", label: "Charisma", icon: <MessageSquare className="h-4 w-4" />, color: "text-pink-500" },
  ];

  const getModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getModifierClass = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    if (modifier >= 3) return "text-green-600 font-semibold";
    if (modifier >= 1) return "text-green-500";
    if (modifier <= -3) return "text-red-600 font-semibold";
    if (modifier <= -1) return "text-red-500";
    return "text-gray-500";
  };

  const renderAbilityScoreField = (ability: typeof abilityScores[0]) => {
    const score = formData.abilityScores[ability.key as keyof typeof formData.abilityScores];
    
    if (isReadOnly) {
      return (
        <div className="p-3 bg-muted rounded-md border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{ability.label}:</span>
            <span className="font-semibold">{score}</span>
          </div>
          <div className={`text-xs mt-1 ${getModifierClass(score)}`}>
            Modifier: {getModifier(score)}
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <Input
          type="number"
          value={score}
          onChange={(e) => setNestedField("abilityScores", ability.key, parseInt(e.target.value) || 0)}
          min="1"
          max="30"
          className={`pr-16 ${errors[`abilityScores.${ability.key}`] ? "border-destructive" : ""}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
          {getModifier(score)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <FormSection
        title="Ability Scores"
        description="The six core D&D ability scores (1-30 range)"
        icon={<Zap className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {abilityScores.map((ability) => (
            <div key={ability.key} className="space-y-2">
              <Label htmlFor={ability.key} className="flex items-center gap-2">
                <span className={ability.color}>{ability.icon}</span>
                {ability.label}
              </Label>
              {renderAbilityScoreField(ability)}
              <ErrorDisplay errors={errors} field={`abilityScores.${ability.key}`} variant="inline" />
              {!isReadOnly && (
                <div className={`text-xs ${getModifierClass(formData.abilityScores[ability.key as keyof typeof formData.abilityScores])}`}>
                  Modifier: {getModifier(formData.abilityScores[ability.key as keyof typeof formData.abilityScores])}
                </div>
              )}
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Ability Score Summary"
        description="Overview of all ability scores and their modifiers"
        icon={<Brain className="h-5 w-5" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {abilityScores.map((ability) => {
            const score = formData.abilityScores[ability.key as keyof typeof formData.abilityScores];
            const modifier = getModifier(score);
            const modifierClass = getModifierClass(score);
            
            return (
              <div key={ability.key} className="text-center p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className={ability.color}>{ability.icon}</span>
                  <span className="text-xs font-medium">{ability.label}</span>
                </div>
                <div className="text-lg font-bold">{score}</div>
                <div className={`text-sm ${modifierClass}`}>{modifier}</div>
              </div>
            );
          })}
        </div>
      </FormSection>
    </div>
  );
};

export default AbilityScoresTab; 