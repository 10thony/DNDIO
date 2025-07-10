import React from "react";
import { FormSection } from "../../shared";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { ErrorDisplay } from "../../shared";
import { CharacterFormProps } from "../types/npcForm";
import { Shield, Heart } from "lucide-react";

const StatsCombatTab: React.FC<CharacterFormProps> = ({
  formData,
  setField,
  errors,
  isReadOnly = false,
}) => {
  const renderField = (fieldName: string, value: number, min: number, max: number) => {
    if (isReadOnly) {
      return (
        <div className="p-3 bg-muted rounded-md border">
          <span className="text-sm font-medium text-muted-foreground">{fieldName}:</span>
          <span className="ml-2">{value || "Not specified"}</span>
        </div>
      );
    }

    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => setField(fieldName as any, parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        className={errors[fieldName] ? "border-destructive" : ""}
      />
    );
  };

  return (
    <div className="space-y-6">
      <FormSection
        title="Combat Statistics"
        description="Core combat-related stats"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hitPoints">Hit Points</Label>
            {renderField("hitPoints", formData.hitPoints, 1, 1000)}
            <ErrorDisplay errors={errors} field="hitPoints" variant="inline" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="armorClass">Armor Class</Label>
            {renderField("armorClass", formData.armorClass, 1, 30)}
            <ErrorDisplay errors={errors} field="armorClass" variant="inline" />
          </div>
        </div>
      </FormSection>

      {!isReadOnly && (
        <FormSection
          title="Combat Guidelines"
          description="General guidelines for character combat stats"
          icon={<Heart className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Hit Points by Level:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Level 1-3: 10-30 HP</li>
                <li>• Level 4-6: 30-60 HP</li>
                <li>• Level 7-10: 60-100 HP</li>
                <li>• Level 11-15: 100-150 HP</li>
                <li>• Level 16-20: 150-200+ HP</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Armor Class Guidelines:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Unarmored: 10-12</li>
                <li>• Light Armor: 12-15</li>
                <li>• Medium Armor: 14-17</li>
                <li>• Heavy Armor: 16-20</li>
                <li>• Magical Protection: +1-5</li>
              </ul>
            </div>
          </div>
        </FormSection>
      )}
    </div>
  );
};

export default StatsCombatTab; 