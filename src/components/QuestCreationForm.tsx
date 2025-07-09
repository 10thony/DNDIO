import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { 
  AlertCircle, 
  ArrowLeft, 
  BookOpen,
  MapPin,
  Users,
  Package,
  Gift,
  Target
} from "lucide-react";

interface QuestFormData {
  name: string;
  description: string;
  status: "NotStarted" | "InProgress" | "Completed" | "Failed";
  locationId?: Id<"locations">;
  requiredItemIds: Id<"items">[];
  involvedNpcIds: Id<"npcs">[];
  participantIds: Id<"playerCharacters">[];
  interactions: Id<"interactions">[];
  rewards: {
    xp?: number;
    gold?: number;
    itemIds?: Id<"items">[];
  };
}

const QuestCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { user } = useUser();
  const createQuest = useMutation(api.quests.createQuest);
  
  // Fetch related data
  const locations = useQuery(api.locations.list);
  const items = useQuery(api.items.getItems);
  const npcs = useQuery(api.npcs.getAllNpcs);
  const characters = useQuery(api.characters.getAllCharacters);

  const [formData, setFormData] = useState<QuestFormData>({
    name: "",
    description: "",
    status: "NotStarted",
    requiredItemIds: [],
    involvedNpcIds: [],
    participantIds: [],
    interactions: [],
    rewards: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMultiSelectChange = (
    field: keyof QuestFormData,
    value: Id<any>
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field] as Id<any>[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((id) => id !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const handleRewardChange = (field: keyof QuestFormData["rewards"], value: any) => {
    setFormData((prev) => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Quest name is required";
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
      const questData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        locationId: formData.locationId,
        taskIds: [] as Id<"questTasks">[], // Will be populated when tasks are created
        requiredItemIds: formData.requiredItemIds.length > 0 ? formData.requiredItemIds : undefined,
        involvedNpcIds: formData.involvedNpcIds.length > 0 ? formData.involvedNpcIds : undefined,
        participantIds: formData.participantIds.length > 0 ? formData.participantIds : undefined,
        interactions: formData.interactions.length > 0 ? formData.interactions : undefined,
        rewards: Object.keys(formData.rewards).length > 0 ? formData.rewards : undefined,
        clerkId: user.id,
      };

      const questId = await createQuest(questData);
      navigate(`/quests/${questId}`);
    } catch (error) {
      console.error("Error creating quest:", error);
      setErrors({ submit: "Failed to create quest. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (returnTo === 'campaign-form') {
      navigate("/campaigns/new");
    } else {
      navigate("/quests");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {returnTo === 'campaign-form' ? "Back to Campaign Form" : "Back to Quests"}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Quest</h1>
            <p className="text-muted-foreground">
              Define a new quest with objectives, participants, and rewards
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Requirements
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Core details about the quest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Quest Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter quest name"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter quest description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange({ target: { name: 'status', value } } as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NotStarted">Not Started</SelectItem>
                      <SelectItem value="InProgress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Associated location for this quest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="locationId">Associated Location</Label>
                  <Select 
                    value={formData.locationId || ""} 
                    onValueChange={(value) => handleInputChange({ target: { name: 'locationId', value } } as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No location</SelectItem>
                      {locations?.map((location: any) => (
                        <SelectItem key={location._id} value={location._id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants
                </CardTitle>
                <CardDescription>
                  Characters and NPCs involved in this quest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Player Characters</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select characters participating in this quest
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {characters?.map((character: any) => (
                        <div key={character._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`character-${character._id}`}
                            checked={formData.participantIds.includes(character._id)}
                            onCheckedChange={() => handleMultiSelectChange("participantIds", character._id)}
                          />
                          <Label 
                            htmlFor={`character-${character._id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {character.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              Level {character.level}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Involved NPCs</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select NPCs involved in this quest
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {npcs?.map((npc: any) => (
                        <div key={npc._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`npc-${npc._id}`}
                            checked={formData.involvedNpcIds.includes(npc._id)}
                            onCheckedChange={() => handleMultiSelectChange("involvedNpcIds", npc._id)}
                          />
                          <Label 
                            htmlFor={`npc-${npc._id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {npc.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              Level {npc.level}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Requirements
                </CardTitle>
                <CardDescription>
                  Items required to complete this quest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label className="text-base font-medium">Required Items</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select items that are required to complete this quest
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items?.map((item: any) => (
                      <div key={item._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${item._id}`}
                          checked={formData.requiredItemIds.includes(item._id)}
                          onCheckedChange={() => handleMultiSelectChange("requiredItemIds", item._id)}
                        />
                        <Label 
                          htmlFor={`item-${item._id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {item.name}
                          {item.rarity && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {item.rarity}
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Rewards
                </CardTitle>
                <CardDescription>
                  Rewards for completing this quest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="xpReward">Experience Points</Label>
                    <Input
                      type="number"
                      id="xpReward"
                      value={formData.rewards.xp || ""}
                      onChange={(e) => handleRewardChange("xp", Number(e.target.value) || undefined)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goldReward">Gold</Label>
                    <Input
                      type="number"
                      id="goldReward"
                      value={formData.rewards.gold || ""}
                      onChange={(e) => handleRewardChange("gold", Number(e.target.value) || undefined)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Reward Items</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select items that will be rewarded upon completion
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items?.map((item: any) => (
                      <div key={item._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reward-item-${item._id}`}
                          checked={formData.rewards.itemIds?.includes(item._id) || false}
                          onCheckedChange={() => {
                            const currentItems = formData.rewards.itemIds || [];
                            const newItems = currentItems.includes(item._id)
                              ? currentItems.filter((id) => id !== item._id)
                              : [...currentItems, item._id];
                            handleRewardChange("itemIds", newItems);
                          }}
                        />
                        <Label 
                          htmlFor={`reward-item-${item._id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {item.name}
                          {item.rarity && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {item.rarity}
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Quest..." : "Create Quest"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestCreationForm; 