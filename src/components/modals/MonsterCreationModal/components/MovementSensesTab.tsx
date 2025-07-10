import React from "react";
import { FormSection } from "../../shared";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { ErrorDisplay } from "../../shared";
import { MonsterFormProps } from "../types/monsterForm";
import { Eye, Zap, Heart } from "lucide-react";

const MovementSensesTab: React.FC<MonsterFormProps> = ({
  formData,
  setField,
  setNestedField,
  errors,
}) => {
  const movementTypes = [
    { key: "walk", label: "Walking Speed", icon: <Zap className="h-4 w-4" /> },
    { key: "swim", label: "Swimming Speed", icon: <Heart className="h-4 w-4" /> },
    { key: "fly", label: "Flying Speed", icon: <Eye className="h-4 w-4" /> },
    { key: "burrow", label: "Burrowing Speed", icon: <Zap className="h-4 w-4" /> },
    { key: "climb", label: "Climbing Speed", icon: <Heart className="h-4 w-4" /> },
  ];

  const senseTypes = [
    { key: "darkvision", label: "Darkvision", icon: <Eye className="h-4 w-4" /> },
    { key: "blindsight", label: "Blindsight", icon: <Eye className="h-4 w-4" /> },
    { key: "tremorsense", label: "Tremorsense", icon: <Zap className="h-4 w-4" /> },
    { key: "truesight", label: "Truesight", icon: <Eye className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <FormSection
        title="Movement Speeds"
        description="Various movement speeds in feet"
        icon={<Zap className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movementTypes.map((movement) => (
            <div key={movement.key} className="space-y-2">
              <Label htmlFor={movement.key} className="flex items-center gap-2">
                {movement.icon}
                {movement.label}
              </Label>
              <Input
                id={movement.key}
                value={formData.speed[movement.key as keyof typeof formData.speed]}
                onChange={(e) => setNestedField("speed", movement.key, e.target.value)}
                placeholder="e.g., 30 ft."
              />
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Senses"
        description="Special sensory abilities and ranges"
        icon={<Eye className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {senseTypes.map((sense) => (
              <div key={sense.key} className="space-y-2">
                <Label htmlFor={sense.key} className="flex items-center gap-2">
                  {sense.icon}
                  {sense.label}
                </Label>
                <Input
                  id={sense.key}
                  value={formData.senses[sense.key as keyof typeof formData.senses]}
                  onChange={(e) => setNestedField("senses", sense.key, e.target.value)}
                  placeholder="e.g., 60 ft."
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passivePerception">Passive Perception</Label>
              <Input
                id="passivePerception"
                type="number"
                value={formData.senses.passivePerception}
                onChange={(e) => setNestedField("senses", "passivePerception", parseInt(e.target.value) || 0)}
                min="0"
                max="50"
                className={errors["senses.passivePerception"] ? "border-destructive" : ""}
              />
              <ErrorDisplay errors={errors} field="senses.passivePerception" variant="inline" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                value={formData.languages}
                onChange={(e) => setField("languages", e.target.value)}
                placeholder="e.g., Common, Elvish, Undercommon"
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Damage & Condition Immunities"
        description="Resistances, vulnerabilities, and immunities"
        icon={<Heart className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="damageVulnerabilities">Damage Vulnerabilities</Label>
              <Input
                id="damageVulnerabilities"
                value={formData.damageVulnerabilities.join(", ")}
                onChange={(e) => setField("damageVulnerabilities", e.target.value.split(", ").filter(damage => damage.trim()))}
                placeholder="e.g., fire, radiant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="damageResistances">Damage Resistances</Label>
              <Input
                id="damageResistances"
                value={formData.damageResistances.join(", ")}
                onChange={(e) => setField("damageResistances", e.target.value.split(", ").filter(damage => damage.trim()))}
                placeholder="e.g., cold, lightning"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="damageImmunities">Damage Immunities</Label>
              <Input
                id="damageImmunities"
                value={formData.damageImmunities.join(", ")}
                onChange={(e) => setField("damageImmunities", e.target.value.split(", ").filter(damage => damage.trim()))}
                placeholder="e.g., poison, psychic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditionImmunities">Condition Immunities</Label>
            <Input
              id="conditionImmunities"
              value={formData.conditionImmunities.join(", ")}
              onChange={(e) => setField("conditionImmunities", e.target.value.split(", ").filter(condition => condition.trim()))}
              placeholder="e.g., frightened, poisoned"
            />
            <p className="text-sm text-muted-foreground">
              Enter damage types and conditions separated by commas
            </p>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default MovementSensesTab; 