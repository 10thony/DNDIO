import React, { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { BaseModal, FormTabs, LoadingSpinner, ErrorDisplay } from "./shared";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { 
  Zap,
  Shield,
  Eye,
  Sword,
  BookOpen,
  Loader2,
  Save,
  Edit,
  Calculator
} from "lucide-react";
import { MonsterFormData } from "./MonsterCreationModal/types/monsterForm";
import { useMonsterForm } from "./MonsterCreationModal/hooks/useMonsterForm";
import { useMonsterValidation } from "./MonsterCreationModal/hooks/useMonsterValidation";
import BasicInfoTab from "./MonsterCreationModal/components/BasicInfoTab";
import CombatStatsTab from "./MonsterCreationModal/components/CombatStatsTab";
import AbilityScoresTab from "./MonsterCreationModal/components/AbilityScoresTab";
import MovementSensesTab from "./MonsterCreationModal/components/MovementSensesTab";
import ActionsTab from "./MonsterCreationModal/components/ActionsTab";

interface MonsterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (monsterId: Id<"monsters">) => void;
  isReadOnly?: boolean;
  initialData?: Partial<MonsterFormData>;
  title?: string;
  description?: string;
  monsterId?: Id<"monsters">;
  campaignId?: Id<"campaigns">;
}

const MonsterCreationModal: React.FC<MonsterCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isReadOnly = false,
  initialData,
  title,
  description,
  monsterId,
  campaignId,
}) => {
  const { user } = useUser();
  const createMonster = useMutation(api.monsters.createMonster);
  
  // Get monster data if viewing an existing monster
  const monster = useQuery(
    api.monsters.getMonsterById,
    monsterId ? { id: monsterId } : "skip"
  );
  
  // Get campaign data for ownership checks
  const campaign = useQuery(
    api.campaigns.getCampaignById,
    campaignId ? { id: campaignId, clerkId: user?.id } : "skip"
  );
  
  // Get user role for admin checks
  const userRole = useQuery(
    api.users.getUserRole,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const {
    formData,
    setField,
    setNestedField,
    reset,
    isSubmitting,
    setIsSubmitting,
    populateForm,
    selectedActions,
    setSelectedActions,
    databaseActions,
    setDatabaseActions,
    newTag,
    setNewTag,
    error,
    setError,
    // Helper methods
    addTag,
    removeTag,
    addTrait,
    updateTrait,
    removeTrait,
    addAction,
    updateAction,
    removeAction,
    addEnvironment,
    removeEnvironment,
  } = useMonsterForm();

  const {
    errors,
    validateForm,
    clearErrors,
    setErrors,
    hasErrors,
    getFieldError
  } = useMonsterValidation(formData);

  // Check if user can edit this monster
  const canEditMonster = () => {
    if (!user?.id) return false;
    
    // Admins can edit everything
    if (userRole === "admin") return true;
    
    // If we have monster data, check if user is the creator
    // For now, we'll allow DM to edit any monster in their campaign
    if (monster && campaign && campaign.dmId === user.id) {
      return true;
    }
    
    return false;
  };

  // Auto-calculate monster stats based on CR and other factors
  const handleAutoCalculateStats = () => {
    if (!formData.challengeRating) return;

    // Basic auto-calculation for monster stats based on CR
    const crNumber = formData.challengeRating === "0" ? 0 : 
                     formData.challengeRating.includes("/") ? 
                     parseFloat(formData.challengeRating.split("/")[0]) / parseFloat(formData.challengeRating.split("/")[1]) :
                     parseInt(formData.challengeRating);

    // Simple proficiency bonus calculation
    const autoProficiencyBonus = Math.max(2, Math.ceil(1 + crNumber / 4));
    
    // Basic HP calculation (this could be more sophisticated)
    const baseHP = Math.max(1, Math.floor((crNumber + 1) * 15));
    
    // Basic AC calculation
    const baseAC = Math.max(10, Math.floor(10 + crNumber / 2));

    setField("proficiencyBonus", autoProficiencyBonus);
    setField("hitPoints", baseHP);
    setField("armorClass", baseAC);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      clearErrors();
      setError(null);
    }
  }, [isOpen, reset, clearErrors, setError]);

  // Populate form with monster data when viewing existing monster
  useEffect(() => {
    if (isOpen && monster && isReadOnly) {
      // Type guard to ensure we have a monster object with the expected properties
      if (monster && typeof monster === 'object') {
        const monsterData: Partial<MonsterFormData> = {
          name: monster.name as string,
          source: monster.source as string,
          page: monster.page as string,
          size: monster.size as any,
          type: monster.type as string,
          tags: monster.tags as string[],
          alignment: monster.alignment as string,
          armorClass: monster.armorClass as number,
          armorType: monster.armorType as string,
          hitPoints: monster.hitPoints as number,
          hitDice: monster.hitDice as any,
          proficiencyBonus: monster.proficiencyBonus as number,
          speed: monster.speed as any,
          abilityScores: monster.abilityScores as any,
          savingThrows: monster.savingThrows as string[],
          skills: monster.skills as string[],
          damageVulnerabilities: monster.damageVulnerabilities as string[],
          damageResistances: monster.damageResistances as string[],
          damageImmunities: monster.damageImmunities as string[],
          conditionImmunities: monster.conditionImmunities as string[],
          senses: monster.senses as any,
          languages: monster.languages as string,
          challengeRating: monster.challengeRating as string,
          experiencePoints: monster.experiencePoints as number,
          traits: monster.traits as any,
          actions: monster.actions as any,
          reactions: monster.reactions as any,
          legendaryActions: monster.legendaryActions as any,
          lairActions: monster.lairActions as any,
          regionalEffects: monster.regionalEffects as any,
          environment: monster.environment as string[],
        };
        populateForm(monsterData);
      }
    }
  }, [isOpen, monster, isReadOnly, populateForm]);

  // Populate form with initial data when provided
  useEffect(() => {
    if (isOpen && initialData && !monster) {
      populateForm(initialData);
    }
  }, [isOpen, initialData, monster, populateForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly || !validateForm() || !user) {
      if (hasErrors) {
        setError("Please fix the form errors before submitting.");
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const monsterData = {
        ...formData,
        clerkId: user.id,
      };

      const monsterId = await createMonster(monsterData);
      
      onSuccess(monsterId);
      onClose();
    } catch (error) {
      console.error("Error creating monster:", error);
      setError("Failed to create monster. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleEdit = () => {
    // Switch to edit mode by closing and reopening in edit mode
    onClose();
    // The parent component should handle reopening in edit mode
    // For now, we'll just close and let the parent handle it
  };

  if (!user) {
    return null;
  }

  const getModalTitle = () => {
    if (title) return title;
    if (isReadOnly) return "View Monster";
    return "Create New Monster";
  };

  const getModalDescription = () => {
    if (description) return description;
    if (isReadOnly) return "View details for this monster";
    return "Define a new monster with comprehensive D&D 5e stats and abilities";
  };

  const tabs = [
    {
      value: "basic",
      label: "Basic Info",
      icon: <BookOpen className="h-4 w-4" />,
      content: (
        <BasicInfoTab
          formData={formData}
          setField={setField}
          setNestedField={setNestedField}
          errors={errors}
          isReadOnly={isReadOnly}
        />
      ),
    },
    {
      value: "combat",
      label: "Combat",
      icon: <Shield className="h-4 w-4" />,
      content: (
        <CombatStatsTab
          formData={formData}
          setField={setField}
          setNestedField={setNestedField}
          errors={errors}
          isReadOnly={isReadOnly}
        />
      ),
    },
    {
      value: "abilities",
      label: "Ability Scores",
      icon: <Zap className="h-4 w-4" />,
      content: (
        <AbilityScoresTab
          formData={formData}
          setField={setField}
          setNestedField={setNestedField}
          errors={errors}
          isReadOnly={isReadOnly}
        />
      ),
    },
    {
      value: "senses",
      label: "Senses & Languages",
      icon: <Eye className="h-4 w-4" />,
      content: (
        <MovementSensesTab
          formData={formData}
          setField={setField}
          setNestedField={setNestedField}
          errors={errors}
          isReadOnly={isReadOnly}
        />
      ),
    },
    {
      value: "actions",
      label: "Actions & Traits",
      icon: <Sword className="h-4 w-4" />,
      content: (
        <ActionsTab
          formData={formData}
          setField={setField}
          setNestedField={setNestedField}
          errors={errors}
          isReadOnly={isReadOnly}
        />
      ),
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      description={getModalDescription()}
      size="5xl"
      maxHeight="90vh"
    >
      <LoadingSpinner isLoading={isSubmitting} overlay text={isReadOnly ? "Loading..." : "Creating monster..."} />

      {/* Enhanced Error Display */}
      {(error || hasErrors) && (
        <div className="mb-4 space-y-2">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
              <div className="flex items-center gap-2">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          {hasErrors && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              <div className="flex items-center gap-2">
                <span className="font-medium">Form Validation:</span>
                <span>Please correct the highlighted fields before submitting.</span>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormTabs tabs={tabs} defaultValue="basic" />

        <Separator />

        {/* Action Bar */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex gap-2">
            {!isReadOnly && formData.challengeRating && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoCalculateStats}
                className="flex items-center gap-2"
                title="Auto-calculate HP, AC, and proficiency bonus based on Challenge Rating"
              >
                <Calculator className="h-4 w-4" />
                Auto-Calculate D&D Stats
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {isReadOnly && canEditMonster() && (
              <Button
                type="button"
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {!isReadOnly && (
              <Button
                type="submit"
                disabled={isSubmitting || hasErrors}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Create Monster
              </Button>
            )}
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default MonsterCreationModal; 