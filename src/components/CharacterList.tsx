import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { PlayerCharacter } from "../types/character";
import { getAbilityModifier } from "../types/dndRules";
import CharacterForm from "./CharacterForm";
import { useRoleAccess } from "../hooks/useRoleAccess";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import "./CharacterList.css";

const CharacterList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useUser();
  const { isAdmin } = useRoleAccess();
  
  // Get user's database ID - always call this hook
  const userRecord = useQuery(api.users.getUserByClerkId, 
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Get characters based on user role - always call both hooks
  const allCharacters = useQuery(api.characters.getAllCharacters);
  const userCharacters = useQuery(
    api.characters.getCharactersByUserId,
    userRecord?._id ? { userId: userRecord._id } : "skip"
  );
  
  // Use appropriate character list based on user role
  const characters = Array.isArray(isAdmin ? allCharacters : userCharacters) ? (isAdmin ? allCharacters : userCharacters) : [];
  
  const deleteCharacter = useMutation(api.characters.deleteCharacter);
  const importPlayerData = useMutation(api.characters.importPlayerData);

  // Check if we should show creation form based on query parameter
  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true';
    if (shouldCreate) {
      setIsCreating(true);
    }
  }, [searchParams]);

  console.log("Characters data:", characters); // Debug log
  console.log("allCharacters:", allCharacters); // Debug log
  console.log("userCharacters:", userCharacters); // Debug log
  console.log("isAdmin:", isAdmin); // Debug log
  console.log("userRecord:", userRecord); // Debug log

  const handleDelete = async (characterId: string) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await deleteCharacter({ id: characterId as any });
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    }
  };

  const handleImportData = async () => {
    if (!user?.id) return;
    
    setIsImporting(true);
    try {
      const result = await importPlayerData({ clerkId: user.id });
      console.log("Import successful:", result);
      alert(`Successfully imported ${result.playerCharacters.length} player characters!`);
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Error importing data. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo === 'campaign-form') {
      window.location.href = "/campaigns/new";
    } else {
      setIsCreating(false);
      // Clear the create query parameter if it exists
      if (searchParams.get('create') === 'true') {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('create');
        window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
      }
    }
  };

  const handleSubmitSuccess = () => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo === 'campaign-form') {
      window.location.href = "/campaigns/new";
    } else {
      setIsCreating(false);
      // Clear the create query parameter if it exists
      if (searchParams.get('create') === 'true') {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('create');
        window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
      }
    }
  };

  if (isCreating) {
    const returnTo = searchParams.get('returnTo');
    return (
      <div className="character-list">
        <div className="character-list-header">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="back-button"
          >
            {returnTo === 'campaign-form' ? "← Back to Campaign Form" : "← Back to Characters"}
          </Button>
        </div>
        <CharacterForm onSuccess={handleSubmitSuccess} />
      </div>
    );
  }

  // Check if any of the queries are still loading
  if (allCharacters === undefined || userCharacters === undefined) {
    console.log("Queries are still loading - allCharacters:", allCharacters, "userCharacters:", userCharacters);
    return (
      <div className="character-list">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading characters...</p>
        </div>
      </div>
    );
  }

  // Check if any of the queries returned an error
  if (allCharacters === null || userCharacters === null) {
    console.log("Queries returned null - allCharacters:", allCharacters, "userCharacters:", userCharacters);
    return (
      <div className="character-list">
        <div className="error">Error loading characters. Please try again later.</div>
      </div>
    );
  }

  console.log("Number of characters:", characters?.length || 0); // Debug log

  // Debug log for troubleshooting
  console.log("DEBUG: characters:", characters, "hasAnyCharacters:", (characters?.length || 0) > 0);

  const hasAnyCharacters = (characters?.length || 0) > 0;

  return (
    <div className="character-list">
      <div className="character-list-header">
        <div className="header-content">
          <h2 className="character-list-title">{isAdmin ? "All Characters" : "My Characters"}</h2>
          <p className="character-list-subtitle">
            Manage and organize all player characters and NPCs in your campaign
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="create-button"
        >
          <span className="button-icon">+</span>
          Create New Character
        </Button>
      </div>

      {!hasAnyCharacters ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Characters Yet</h3>
          <p>{isAdmin ? "No characters have been created yet." : "You haven't created any characters yet."}</p>
          <div className="empty-state-buttons">
            <Button
              onClick={() => setIsCreating(true)}
              className="create-button"
            >
              Create Your First Character
            </Button>
            {isAdmin && (
              <Button
                onClick={handleImportData}
                disabled={isImporting}
                variant="outline"
                className="import-button ml-2"
              >
                {isImporting ? "🔄 Importing..." : "📥 Generate Sample Data"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="characters-grid">
          {characters?.map((character: PlayerCharacter) => (
            <div key={character._id} className="character-card-link-wrapper">
              <Link to={`/characters/${character._id}`} className="character-card-link" tabIndex={-1} aria-label={`View details for ${character.name}`}> 
                <Card className="character-card clickable-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {character.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{character.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{character.race}</Badge>
                            <Badge variant="secondary">{character.class}</Badge>
                            <Badge variant="default">Level {character.level}</Badge>
                            <Badge variant="outline" className="capitalize">
                              {character.characterType === "PlayerCharacter" ? "PC" : "NPC"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(character._id!); }}
                          variant="destructive"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Character Background */}
                    <div className="text-sm text-muted-foreground">
                      <strong>Background:</strong> {character.background}
                      {character.alignment && (
                        <span className="ml-2">
                          • <strong>Alignment:</strong> {character.alignment}
                        </span>
                      )}
                    </div>
                    <Separator />
                    {/* Character Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{character.hitPoints}</div>
                        <div className="text-xs text-muted-foreground">Hit Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{character.armorClass}</div>
                        <div className="text-xs text-muted-foreground">Armor Class</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">+{character.proficiencyBonus}</div>
                        <div className="text-xs text-muted-foreground">Proficiency</div>
                      </div>
                    </div>
                    <Separator />
                    {/* Ability Scores */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Ability Scores</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(character.abilityScores).map(
                          ([ability, score]) => (
                            <div key={ability} className="text-center p-2 bg-muted rounded">
                              <div className="text-xs font-medium uppercase text-muted-foreground">
                                {ability.slice(0, 3)}
                              </div>
                              <div className="text-lg font-bold">{score}</div>
                              <div className="text-xs text-muted-foreground">
                                {getAbilityModifier(score) >= 0 ? "+" : ""}
                                {getAbilityModifier(score)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <Separator />
                    {/* Proficiencies */}
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Saving Throws:</strong>{" "}
                        <span className="text-muted-foreground">
                          {character.savingThrows.join(", ")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <strong>Skills:</strong>{" "}
                        <span className="text-muted-foreground">
                          {character.skills.slice(0, 3).join(", ")}
                          {character.skills.length > 3 && (
                            <span className="text-primary">
                              {" "+"+"}{character.skills.length - 3} more
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created: {new Date(character.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterList;
