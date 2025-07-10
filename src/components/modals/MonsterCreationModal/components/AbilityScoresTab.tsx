import React from "react";
import { FormSection } from "../../shared";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { ErrorDisplay } from "../../shared";
import { MonsterFormProps } from "../types/monsterForm";
import { Zap, Brain, Heart, Eye, Shield, MessageSquare } from "lucide-react";

const AbilityScoresTab: React.FC<MonsterFormProps> = ({
  formData,
  setNestedField,
  errors,
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
              <div className="relative">
                <Input
                  id={ability.key}
                  type="number"
                  value={formData.abilityScores[ability.key as keyof typeof formData.abilityScores]}
                  onChange={(e) => setNestedField("abilityScores", ability.key, parseInt(e.target.value) || 0)}
                  min="1"
                  max="30"
                  className={`pr-16 ${errors[`abilityScores.${ability.key}`] ? "border-destructive" : ""}`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {getModifier(formData.abilityScores[ability.key as keyof typeof formData.abilityScores])}
                </div>
              </div>
              <ErrorDisplay errors={errors} field={`abilityScores.${ability.key}`} variant="inline" />
              <div className={`text-xs ${getModifierClass(formData.abilityScores[ability.key as keyof typeof formData.abilityScores])}`}>
                Modifier: {getModifier(formData.abilityScores[ability.key as keyof typeof formData.abilityScores])}
              </div>
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

      <FormSection
        title="Ability Score Guidelines"
        description="General guidelines for ability score ranges"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Score Ranges:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• 1-3: Severely impaired</li>
              <li>• 4-6: Very poor</li>
              <li>• 7-9: Poor</li>
              <li>• 10-11: Average</li>
              <li>• 12-13: Above average</li>
              <li>• 14-15: Good</li>
              <li>• 16-17: Very good</li>
              <li>• 18-19: Exceptional</li>
              <li>• 20-30: Superhuman</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Modifier Values:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• +5: Score of 20-21</li>
              <li>• +4: Score of 18-19</li>
              <li>• +3: Score of 16-17</li>
              <li>• +2: Score of 14-15</li>
              <li>• +1: Score of 12-13</li>
              <li>• +0: Score of 10-11</li>
              <li>• -1: Score of 8-9</li>
              <li>• -2: Score of 6-7</li>
              <li>• -3: Score of 4-5</li>
              <li>• -4: Score of 2-3</li>
              <li>• -5: Score of 1</li>
            </ul>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default AbilityScoresTab; 