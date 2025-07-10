import React from "react";
import { FormSection } from "../../shared";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { ErrorDisplay } from "../../shared";
import { MonsterFormProps } from "../types/monsterForm";
import { Shield, Heart, Target, Award } from "lucide-react";

const CombatStatsTab: React.FC<MonsterFormProps> = ({
  formData,
  setField,
  setNestedField,
  errors,
}) => {
  const dieOptions = ["d4", "d6", "d8", "d10", "d12"];
  const challengeRatingOptions = [
    "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"
  ];

  return (
    <div className="space-y-6">
      <FormSection
        title="Armor Class & Hit Points"
        description="Defensive statistics"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="armorClass">Armor Class</Label>
            <Input
              id="armorClass"
              type="number"
              value={formData.armorClass}
              onChange={(e) => setField("armorClass", parseInt(e.target.value) || 0)}
              min="0"
              max="30"
              className={errors.armorClass ? "border-destructive" : ""}
            />
            <ErrorDisplay errors={errors} field="armorClass" variant="inline" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="armorType">Armor Type</Label>
            <Input
              id="armorType"
              value={formData.armorType}
              onChange={(e) => setField("armorType", e.target.value)}
              placeholder="e.g., natural armor, leather"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hitPoints">Hit Points</Label>
            <Input
              id="hitPoints"
              type="number"
              value={formData.hitPoints}
              onChange={(e) => setField("hitPoints", parseInt(e.target.value) || 0)}
              min="1"
              max="1000"
              className={errors.hitPoints ? "border-destructive" : ""}
            />
            <ErrorDisplay errors={errors} field="hitPoints" variant="inline" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proficiencyBonus">Proficiency Bonus</Label>
            <Input
              id="proficiencyBonus"
              type="number"
              value={formData.proficiencyBonus}
              onChange={(e) => setField("proficiencyBonus", parseInt(e.target.value) || 0)}
              min="0"
              max="9"
              className={errors.proficiencyBonus ? "border-destructive" : ""}
            />
            <ErrorDisplay errors={errors} field="proficiencyBonus" variant="inline" />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Hit Dice"
        description="Hit dice configuration"
        icon={<Heart className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hitDiceCount">Hit Dice Count</Label>
            <Input
              id="hitDiceCount"
              type="number"
              value={formData.hitDice.count}
              onChange={(e) => setNestedField("hitDice", "count", parseInt(e.target.value) || 0)}
              min="1"
              max="100"
              className={errors["hitDice.count"] ? "border-destructive" : ""}
            />
            <ErrorDisplay errors={errors} field="hitDice.count" variant="inline" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hitDiceDie">Hit Dice Type</Label>
            <Select 
              value={formData.hitDice.die} 
              onValueChange={(value) => setNestedField("hitDice", "die", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dieOptions.map(die => (
                  <SelectItem key={die} value={die}>{die}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Challenge Rating & Experience"
        description="Difficulty and reward information"
        icon={<Target className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="challengeRating">Challenge Rating</Label>
            <Select 
              value={formData.challengeRating} 
              onValueChange={(value) => setField("challengeRating", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {challengeRatingOptions.map(cr => (
                  <SelectItem key={cr} value={cr}>{cr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experiencePoints">Experience Points</Label>
            <Input
              id="experiencePoints"
              type="number"
              value={formData.experiencePoints}
              onChange={(e) => setField("experiencePoints", parseInt(e.target.value) || 0)}
              min="0"
              max="1000000"
              className={errors.experiencePoints ? "border-destructive" : ""}
            />
            <ErrorDisplay errors={errors} field="experiencePoints" variant="inline" />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Saving Throws & Skills"
        description="Proficiency information"
        icon={<Award className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="savingThrows">Saving Throw Proficiencies</Label>
            <Input
              id="savingThrows"
              value={formData.savingThrows.join(", ")}
              onChange={(e) => setField("savingThrows", e.target.value.split(", ").filter(save => save.trim()))}
              placeholder="e.g., Strength, Constitution"
            />
            <p className="text-sm text-muted-foreground">
              Enter saving throw proficiencies separated by commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skill Proficiencies</Label>
            <Input
              id="skills"
              value={formData.skills.join(", ")}
              onChange={(e) => setField("skills", e.target.value.split(", ").filter(skill => skill.trim()))}
              placeholder="e.g., Athletics, Stealth"
            />
            <p className="text-sm text-muted-foreground">
              Enter skill proficiencies separated by commas
            </p>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default CombatStatsTab; 