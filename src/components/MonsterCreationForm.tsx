import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import "./MonsterCreationForm.css";

interface MonsterCreationFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  editingMonsterId?: Id<"monsters"> | null;
}

interface MonsterFormData {
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
  speed: {
    walk?: string;
    swim?: string;
    fly?: string;
    burrow?: string;
    climb?: string;
  };
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  savingThrows: string[];
  skills: string[];
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: {
    darkvision?: string;
    blindsight?: string;
    tremorsense?: string;
    truesight?: string;
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
  clerkId?: string;
}

const MonsterCreationForm: React.FC<MonsterCreationFormProps> = ({
  onSubmitSuccess,
  onCancel,
  editingMonsterId,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [formData, setFormData] = useState<MonsterFormData>({
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
    clerkId: user?.id,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Alignment options data
  const alignmentOptions = [
    { alignment: "Lawful good" },
    { alignment: "Lawful neutral" },
    { alignment: "Lawful evil" },
    { alignment: "Neutral good" },
    { alignment: "True neutral" },
    { alignment: "Neutral evil" },
    { alignment: "Chaotic good" },
    { alignment: "Chaotic neutral" },
    { alignment: "Chaotic evil" }
  ];

  const createMonster = useMutation(api.monsters.createMonster);
  const updateMonster = useMutation(api.monsters.updateMonster);
  const editingMonster = useQuery(
    api.monsters.getMonsterById,
    editingMonsterId ? { id: editingMonsterId } : "skip"
  );

  useEffect(() => {
    if (editingMonster && editingMonsterId) {
      setFormData({
        name: editingMonster.name,
        source: editingMonster.source || "",
        page: editingMonster.page || "",
        size: editingMonster.size,
        type: editingMonster.type,
        tags: editingMonster.tags || [],
        alignment: editingMonster.alignment,
        armorClass: editingMonster.armorClass,
        armorType: editingMonster.armorType || "",
        hitPoints: editingMonster.hitPoints,
        hitDice: editingMonster.hitDice,
        proficiencyBonus: editingMonster.proficiencyBonus,
        speed: editingMonster.speed || { walk: "30 ft.", swim: "", fly: "", burrow: "", climb: "" },
        abilityScores: editingMonster.abilityScores,
        savingThrows: editingMonster.savingThrows || [],
        skills: editingMonster.skills || [],
        damageVulnerabilities: editingMonster.damageVulnerabilities || [],
        damageResistances: editingMonster.damageResistances || [],
        damageImmunities: editingMonster.damageImmunities || [],
        conditionImmunities: editingMonster.conditionImmunities || [],
        senses: editingMonster.senses || { darkvision: "", blindsight: "", tremorsense: "", truesight: "", passivePerception: 10 },
        languages: editingMonster.languages || "",
        challengeRating: editingMonster.challengeRating,
        experiencePoints: editingMonster.experiencePoints || 0,
        traits: editingMonster.traits || [],
        actions: editingMonster.actions || [],
        reactions: editingMonster.reactions || [],
        legendaryActions: editingMonster.legendaryActions || [],
        lairActions: editingMonster.lairActions || [],
        regionalEffects: editingMonster.regionalEffects || [],
        environment: editingMonster.environment || [],
        clerkId: user?.id,
      });
    }
  }, [editingMonster, editingMonsterId]);

  const handleInputChange = (field: keyof MonsterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors when user starts fixing them
    if (validationAttempted && errors.length > 0) {
      setErrors([]);
      setValidationAttempted(false);
    }
  };

  const handleNestedChange = (parentField: keyof MonsterFormData, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: { ...(prev[parentField] as Record<string, any>), [childField]: value }
    }));
    
    // Clear validation errors when user starts fixing them
    if (validationAttempted && errors.length > 0) {
      setErrors([]);
      setValidationAttempted(false);
    }
  };

  // const handleArrayChange = (field: keyof MonsterFormData, value: string[]) => {
  //   setFormData(prev => ({ ...prev, [field]: value }));
  // };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push("Name is required");
    if (!formData.type.trim()) newErrors.push("Type is required");
    if (!formData.alignment.trim()) newErrors.push("Alignment is required");
    if (formData.armorClass < 0) newErrors.push("Armor Class must be positive");
    if (formData.hitPoints <= 0) newErrors.push("Hit Points must be positive");
    if (formData.hitDice.count <= 0) newErrors.push("Hit Dice count must be positive");
    if (formData.proficiencyBonus < 0) newErrors.push("Proficiency Bonus must be non-negative");
    if (formData.senses.passivePerception < 0) newErrors.push("Passive Perception must be non-negative");

    setErrors(newErrors);
    setValidationAttempted(true);
    
    // Scroll to top if there are errors
    if (newErrors.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingMonsterId) {
        await updateMonster({
          id: editingMonsterId,
          ...formData,
        });
      } else {
        await createMonster({
          ...formData,
          clerkId: user!.id,
        });
      }
      
      // Show success message briefly before navigating
      setShowSuccessMessage(true);
      setTimeout(() => {
        // Navigate based on returnTo parameter
        if (returnTo === 'campaign-form') {
          navigate("/campaigns/new");
        } else {
          onSubmitSuccess();
        }
      }, 1500);
    } catch (error) {
      console.error("Error saving monster:", error);
      setErrors([`Error creating monster: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (returnTo === 'campaign-form') {
      navigate("/campaigns/new");
    } else {
      onCancel();
    }
  };

  // Helper functions to check field-specific errors
  const hasFieldError = (fieldName: string): boolean => {
    if (!validationAttempted) return false;
    return errors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()));
  };

  const getFieldErrorClass = (fieldName: string): string => {
    return hasFieldError(fieldName) ? 'form-input-error' : '';
  };



  return (
    <div className="monster-form">
      <div className="form-header">
        <h2>{editingMonsterId ? "Edit Monster" : "Create New Monster"}</h2>
        <button className="back-button" onClick={handleCancel}>
          {returnTo === 'campaign-form' ? "← Back to Campaign Form" : "← Back to Monsters"}
        </button>
      </div>

      {errors.length > 0 && (
        <div className="form-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <strong>Please fix the following errors:</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {errors.map((error, index) => (
              <li key={index} style={{ marginBottom: '0.25rem' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {showSuccessMessage && (
        <div className="form-success">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
            <strong>Monster saved successfully! Redirecting...</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className={`form-input ${getFieldErrorClass("name")}`}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Monster name"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Type *</label>
              <input
                type="text"
                className={`form-input ${getFieldErrorClass("type")}`}
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                placeholder="e.g., Dragon, Undead, Beast"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Size</label>
              <select
                className="form-select"
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
              >
                <option value="Tiny">Tiny</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Huge">Huge</option>
                <option value="Gargantuan">Gargantuan</option>
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Alignment *</label>
              <select
                className={`form-select ${getFieldErrorClass("alignment")}`}
                value={formData.alignment}
                onChange={(e) => handleInputChange("alignment", e.target.value)}
              >
                <option value="">Select alignment...</option>
                {alignmentOptions.map((option, index) => (
                  <option key={index} value={option.alignment}>
                    {option.alignment}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Source Book</label>
              <input
                type="text"
                className="form-input"
                value={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
                placeholder="e.g., Monster Manual"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Page</label>
              <input
                type="text"
                className="form-input"
                value={formData.page}
                onChange={(e) => handleInputChange("page", e.target.value)}
                placeholder="e.g., 42"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Challenge Rating</label>
              <select
                className="form-select"
                value={formData.challengeRating}
                onChange={(e) => handleInputChange("challengeRating", e.target.value)}
              >
                <option value="0">0</option>
                <option value="1/8">1/8</option>
                <option value="1/4">1/4</option>
                <option value="1/2">1/2</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
                <option value="23">23</option>
                <option value="24">24</option>
                <option value="25">25</option>
                <option value="26">26</option>
                <option value="27">27</option>
                <option value="28">28</option>
                <option value="29">29</option>
                <option value="30">30</option>
              </select>
            </div>
          </div>
        </div>

        {/* Combat Stats */}
        <div className="form-section">
          <h3 className="form-section-title">Combat Statistics</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Armor Class *</label>
              <input
                type="number"
                className={`form-input ${getFieldErrorClass("armor class")}`}
                value={formData.armorClass}
                onChange={(e) => handleInputChange("armorClass", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Armor Type</label>
              <input
                type="text"
                className="form-input"
                value={formData.armorType}
                onChange={(e) => handleInputChange("armorType", e.target.value)}
                placeholder="e.g., Natural Armor"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Hit Points *</label>
              <input
                type="number"
                className={`form-input ${getFieldErrorClass("hit points")}`}
                value={formData.hitPoints}
                onChange={(e) => handleInputChange("hitPoints", parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Hit Dice Count</label>
              <input
                type="number"
                className={`form-input ${getFieldErrorClass("hit dice count")}`}
                value={formData.hitDice.count}
                onChange={(e) => handleNestedChange("hitDice", "count", parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Hit Dice Type</label>
              <select
                className="form-select"
                value={formData.hitDice.die}
                onChange={(e) => handleNestedChange("hitDice", "die", e.target.value)}
              >
                <option value="d4">d4</option>
                <option value="d6">d6</option>
                <option value="d8">d8</option>
                <option value="d10">d10</option>
                <option value="d12">d12</option>
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Proficiency Bonus</label>
              <input
                type="number"
                className={`form-input ${getFieldErrorClass("proficiency bonus")}`}
                value={formData.proficiencyBonus}
                onChange={(e) => handleInputChange("proficiencyBonus", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="form-section">
          <h3 className="form-section-title">Ability Scores</h3>
          <div className="form-row">
            {Object.entries(formData.abilityScores).map(([ability, score]) => (
              <div key={ability} className="form-col">
                <label className="form-label">{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                <input
                  type="number"
                  className="form-input"
                  value={score}
                  onChange={(e) => handleNestedChange("abilityScores", ability, parseInt(e.target.value) || 0)}
                  min="1"
                  max="30"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="form-section">
          <h3 className="form-section-title">Speed</h3>
          <div className="form-row">
            {Object.entries(formData.speed).map(([movementType, speed]) => (
              <div key={movementType} className="form-col">
                <label className="form-label">{movementType.charAt(0).toUpperCase() + movementType.slice(1)}</label>
                <input
                  type="text"
                  className="form-input"
                  value={speed}
                  onChange={(e) => handleNestedChange("speed", movementType, e.target.value)}
                  placeholder="e.g., 30 ft."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Senses */}
        <div className="form-section">
          <h3 className="form-section-title">Senses</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Darkvision</label>
              <input
                type="text"
                className="form-input"
                value={formData.senses.darkvision}
                onChange={(e) => handleNestedChange("senses", "darkvision", e.target.value)}
                placeholder="e.g., 60 ft."
              />
            </div>
            <div className="form-col">
              <label className="form-label">Blindsight</label>
              <input
                type="text"
                className="form-input"
                value={formData.senses.blindsight}
                onChange={(e) => handleNestedChange("senses", "blindsight", e.target.value)}
                placeholder="e.g., 30 ft."
              />
            </div>
            <div className="form-col">
              <label className="form-label">Tremorsense</label>
              <input
                type="text"
                className="form-input"
                value={formData.senses.tremorsense}
                onChange={(e) => handleNestedChange("senses", "tremorsense", e.target.value)}
                placeholder="e.g., 60 ft."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Truesight</label>
              <input
                type="text"
                className="form-input"
                value={formData.senses.truesight}
                onChange={(e) => handleNestedChange("senses", "truesight", e.target.value)}
                placeholder="e.g., 120 ft."
              />
            </div>
            <div className="form-col">
              <label className="form-label">Passive Perception</label>
              <input
                type="number"
                className={`form-input ${getFieldErrorClass("passive perception")}`}
                value={formData.senses.passivePerception}
                onChange={(e) => handleNestedChange("senses", "passivePerception", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Languages</label>
              <input
                type="text"
                className="form-input"
                value={formData.languages}
                onChange={(e) => handleInputChange("languages", e.target.value)}
                placeholder="e.g., Common, Draconic"
              />
            </div>
          </div>
        </div>

        {/* Experience Points */}
        <div className="form-section">
          <h3 className="form-section-title">Experience</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Experience Points</label>
              <input
                type="number"
                className="form-input"
                value={formData.experiencePoints}
                onChange={(e) => handleInputChange("experiencePoints", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : editingMonsterId ? "Update Monster" : "Create Monster"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MonsterCreationForm; 