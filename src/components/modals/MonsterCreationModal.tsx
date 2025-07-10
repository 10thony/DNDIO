import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import BaseModal from "./shared/BaseModal";
import { FormTabs } from "./shared/FormTabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Plus, X, Save, Loader2 } from "lucide-react";

interface MonsterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (monsterId: Id<"monsters">) => void;
}

const MonsterCreationModal: React.FC<MonsterCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useUser();
  const createMonster = useMutation(api.monsters.createMonster);

  const [formData, setFormData] = useState({
    name: "",
    source: "",
    page: "",
    size: "Medium" as "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan",
    type: "",
    tags: [] as string[],
    alignment: "",
    armorClass: 10,
    armorType: "",
    hitPoints: 10,
    hitDice: { count: 1, die: "d8" as "d4" | "d6" | "d8" | "d10" | "d12" },
    proficiencyBonus: 2,
    speed: { walk: "30 ft.", swim: "", fly: "", burrow: "", climb: "" },
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    savingThrows: [] as string[],
    skills: [] as string[],
    damageVulnerabilities: [] as string[],
    damageResistances: [] as string[],
    damageImmunities: [] as string[],
    conditionImmunities: [] as string[],
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
    traits: [] as { name: string; description: string }[],
    actions: [] as { name: string; description: string }[],
    reactions: [] as { name: string; description: string }[],
    legendaryActions: [] as { name: string; description: string }[],
    lairActions: [] as { name: string; description: string }[],
    regionalEffects: [] as { name: string; description: string }[],
    environment: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Alignment options data
  const alignmentOptions = [
    "Lawful good", "Lawful neutral", "Lawful evil",
    "Neutral good", "True neutral", "Neutral evil",
    "Chaotic good", "Chaotic neutral", "Chaotic evil"
  ];

  const challengeRatings = [
    "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
    "24", "25", "26", "27", "28", "29", "30"
  ];

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        source: "",
        page: "",
        size: "Medium",
        type: "",
        tags: [],
        alignment: "",
        armorClass: 10,
        armorType: "",
        hitPoints: 10,
        hitDice: { count: 1, die: "d8" },
        proficiencyBonus: 2,
        speed: { walk: "30 ft.", swim: "", fly: "", burrow: "", climb: "" },
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
      });
      setErrors({});
      setNewTag("");
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedChange = <
    T extends keyof typeof formData,
    K extends keyof typeof formData[T]
  >(
    parentField: T,
    childField: K,
    value: typeof formData[T][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as object),
        [childField]: value,
      },
    }));
    if (errors[String(parentField) + "." + String(childField)]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[String(parentField) + "." + String(childField)];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.type.trim()) {
      newErrors.type = "Type is required";
    }

    if (!formData.alignment) {
      newErrors.alignment = "Alignment is required";
    }

    if (formData.armorClass < 0) {
      newErrors.armorClass = "Armor class must be 0 or greater";
    }

    if (formData.hitPoints < 1) {
      newErrors.hitPoints = "Hit points must be 1 or greater";
    }

    if (formData.hitDice.count < 1) {
      newErrors["hitDice.count"] = "Hit dice count must be 1 or greater";
    }

    if (formData.proficiencyBonus < 0) {
      newErrors.proficiencyBonus = "Proficiency bonus must be 0 or greater";
    }

    if (formData.senses.passivePerception < 0) {
      newErrors["senses.passivePerception"] = "Passive perception must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const monsterId = await createMonster({
        ...formData,
        clerkId: user.id,
      });

      onSuccess(monsterId);
      onClose();
    } catch (error) {
      console.error("Error creating monster:", error);
      setErrors({ submit: "Failed to create monster. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    handleInputChange("tags", formData.tags.filter((_, i) => i !== index));
  };

  const addTrait = () => {
    handleInputChange("traits", [...formData.traits, { name: "", description: "" }]);
  };

  const updateTrait = (index: number, field: 'name' | 'description', value: string) => {
    const updatedTraits = [...formData.traits];
    updatedTraits[index] = { ...updatedTraits[index], [field]: value };
    handleInputChange("traits", updatedTraits);
  };

  const removeTrait = (index: number) => {
    handleInputChange("traits", formData.traits.filter((_, i) => i !== index));
  };

  const tabs = [
    {
      value: "basic",
      label: "Basic Info",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about the monster including name, type, and classification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Monster name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  placeholder="e.g., Dragon, Undead, Beast"
                  className={errors.type ? "border-destructive" : ""}
                />
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tiny">Tiny</SelectItem>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                    <SelectItem value="Huge">Huge</SelectItem>
                    <SelectItem value="Gargantuan">Gargantuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alignment">Alignment *</Label>
                <Select value={formData.alignment} onValueChange={(value) => handleInputChange("alignment", value)}>
                  <SelectTrigger className={errors.alignment ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select alignment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {alignmentOptions.map((alignment) => (
                      <SelectItem key={alignment} value={alignment}>
                        {alignment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.alignment && (
                  <p className="text-sm text-destructive">{errors.alignment}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="challengeRating">Challenge Rating</Label>
                <Select value={formData.challengeRating} onValueChange={(value) => handleInputChange("challengeRating", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {challengeRatings.map((cr) => (
                      <SelectItem key={cr} value={cr}>
                        {cr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source Book</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => handleInputChange("source", e.target.value)}
                  placeholder="e.g., Monster Manual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page">Page</Label>
                <Input
                  id="page"
                  value={formData.page}
                  onChange={(e) => handleInputChange("page", e.target.value)}
                  placeholder="e.g., 42"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "combat",
      label: "Combat",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Combat Statistics</CardTitle>
            <CardDescription>
              Armor class, hit points, and combat-related attributes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="armorClass">Armor Class *</Label>
                <Input
                  id="armorClass"
                  type="number"
                  value={formData.armorClass}
                  onChange={(e) => handleInputChange("armorClass", parseInt(e.target.value) || 0)}
                  min="0"
                  className={errors.armorClass ? "border-destructive" : ""}
                />
                {errors.armorClass && (
                  <p className="text-sm text-destructive">{errors.armorClass}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="armorType">Armor Type</Label>
                <Input
                  id="armorType"
                  value={formData.armorType}
                  onChange={(e) => handleInputChange("armorType", e.target.value)}
                  placeholder="e.g., Natural Armor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hitPoints">Hit Points *</Label>
                <Input
                  id="hitPoints"
                  type="number"
                  value={formData.hitPoints}
                  onChange={(e) => handleInputChange("hitPoints", parseInt(e.target.value) || 0)}
                  min="1"
                  className={errors.hitPoints ? "border-destructive" : ""}
                />
                {errors.hitPoints && (
                  <p className="text-sm text-destructive">{errors.hitPoints}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hitDiceCount">Hit Dice Count</Label>
                <Input
                  id="hitDiceCount"
                  type="number"
                  value={formData.hitDice.count}
                  onChange={(e) => handleNestedChange("hitDice", "count", parseInt(e.target.value) || 0)}
                  min="1"
                  className={errors["hitDice.count"] ? "border-destructive" : ""}
                />
                {errors["hitDice.count"] && (
                  <p className="text-sm text-destructive">{errors["hitDice.count"]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hitDiceType">Hit Dice Type</Label>
                <Select
                  value={formData.hitDice.die}
                  onValueChange={(value) =>
                    handleNestedChange(
                      "hitDice",
                      "die",
                      value as "d4" | "d6" | "d8" | "d10" | "d12"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="d4">d4</SelectItem>
                    <SelectItem value="d6">d6</SelectItem>
                    <SelectItem value="d8">d8</SelectItem>
                    <SelectItem value="d10">d10</SelectItem>
                    <SelectItem value="d12">d12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proficiencyBonus">Proficiency Bonus</Label>
                <Input
                  id="proficiencyBonus"
                  type="number"
                  value={formData.proficiencyBonus}
                  onChange={(e) => handleInputChange("proficiencyBonus", parseInt(e.target.value) || 0)}
                  min="0"
                  className={errors.proficiencyBonus ? "border-destructive" : ""}
                />
                {errors.proficiencyBonus && (
                  <p className="text-sm text-destructive">{errors.proficiencyBonus}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(formData.speed).map(([movementType, speed]) => (
                <div key={movementType} className="space-y-2">
                  <Label htmlFor={movementType}>{movementType.charAt(0).toUpperCase() + movementType.slice(1)}</Label>
                  <Input
                    id={movementType}
                    value={speed}
                    onChange={(e) =>
                      handleNestedChange(
                        "speed",
                        movementType as "walk" | "swim" | "fly" | "burrow" | "climb",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 30 ft."
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "abilities",
      label: "Ability Scores",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Ability Scores</CardTitle>
            <CardDescription>
              The six core ability scores that define the monster's capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(formData.abilityScores).map(([ability, score]) => (
                <div key={ability} className="space-y-2">
                  <Label htmlFor={ability}>{ability.charAt(0).toUpperCase() + ability.slice(1)}</Label>
                  <Input
                    id={ability}
                    type="number"
                    value={score}
                    onChange={(e) =>
                      handleNestedChange(
                        "abilityScores",
                        ability as "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min="1"
                    max="30"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "senses",
      label: "Senses & Languages",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Senses</CardTitle>
            <CardDescription>
              Special senses and perception abilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="darkvision">Darkvision</Label>
                <Input
                  id="darkvision"
                  value={formData.senses.darkvision}
                  onChange={(e) => handleNestedChange("senses", "darkvision", e.target.value)}
                  placeholder="e.g., 60 ft."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blindsight">Blindsight</Label>
                <Input
                  id="blindsight"
                  value={formData.senses.blindsight}
                  onChange={(e) => handleNestedChange("senses", "blindsight", e.target.value)}
                  placeholder="e.g., 30 ft."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tremorsense">Tremorsense</Label>
                <Input
                  id="tremorsense"
                  value={formData.senses.tremorsense}
                  onChange={(e) => handleNestedChange("senses", "tremorsense", e.target.value)}
                  placeholder="e.g., 60 ft."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="truesight">Truesight</Label>
                <Input
                  id="truesight"
                  value={formData.senses.truesight}
                  onChange={(e) => handleNestedChange("senses", "truesight", e.target.value)}
                  placeholder="e.g., 120 ft."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passivePerception">Passive Perception</Label>
                <Input
                  id="passivePerception"
                  type="number"
                  value={formData.senses.passivePerception}
                  onChange={(e) => handleNestedChange("senses", "passivePerception", parseInt(e.target.value) || 0)}
                  min="0"
                  className={errors["senses.passivePerception"] ? "border-destructive" : ""}
                />
                {errors["senses.passivePerception"] && (
                  <p className="text-sm text-destructive">{errors["senses.passivePerception"]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => handleInputChange("languages", e.target.value)}
                  placeholder="e.g., Common, Draconic"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "actions",
      label: "Actions & Traits",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Traits</CardTitle>
            <CardDescription>
              Special abilities and characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.traits.map((trait, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`trait-name-${index}`}>Trait {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrait(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id={`trait-name-${index}`}
                  value={trait.name}
                  onChange={(e) => updateTrait(index, 'name', e.target.value)}
                  placeholder="Trait name"
                />
                <Textarea
                  value={trait.description}
                  onChange={(e) => updateTrait(index, 'description', e.target.value)}
                  placeholder="Trait description"
                  rows={3}
                />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTrait}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trait
            </Button>
          </CardContent>
        </Card>
      ),
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Monster"
      description="Define a new monster with comprehensive stats and abilities"
      size="5xl"
      maxHeight="90vh"
    >
      {errors.submit && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormTabs tabs={tabs} defaultValue="basic" />

        <Separator />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Create Monster
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default MonsterCreationModal; 