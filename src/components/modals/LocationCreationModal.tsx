import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRoleAccess } from "../../hooks/useRoleAccess";
import { MapCard } from "../maps/MapCard";
import { BaseModal, FormTabs, LoadingSpinner, ErrorDisplay } from "./shared";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { 
  MapPin,
  Map,
  Plus,
  Loader2,
  Save,
  Edit
} from "lucide-react";

interface LocationCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (locationId: Id<"locations">) => void;
  initialData?: {
    id?: Id<"locations">;
    name?: string;
    description?: string;
    type?: string;
    mapId?: Id<"maps">;
  } | null;
  isEditing?: boolean;
}

interface LocationFormData {
  name: string;
  description: string;
  type: "City" | "Town" | "Village" | "Dungeon" | "Forest" | "Mountain" | "Desert" | "Swamp" | "Castle" | "Temple" | "Tavern" | "Shop" | "Other";
  mapId?: Id<"maps">;
}

const LocationCreationModal: React.FC<LocationCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  isEditing = false
}) => {
  const { user } = useUser();
  const { isAdmin } = useRoleAccess();
  const navigate = useNavigate();
  const createLocation = useMutation(api.locations.create);
  const updateLocation = useMutation(api.locations.update);
  const maps = useQuery(api.maps.getUserMaps, user?.id ? { clerkId: user.id } : "skip") || [];
  
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    description: "",
    type: "Other",
    mapId: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        type: (initialData.type as LocationFormData["type"]) || "Other",
        mapId: initialData.mapId,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Location name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Location description is required";
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
    setError(null);

    try {
      const locationData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        notableNpcIds: [],
        linkedLocations: [],
        interactionsAtLocation: [],
        imageUrls: [],
        secrets: "",
        mapId: formData.mapId,
        clerkId: user.id,
      };

      let locationId;
      if (isEditing && initialData?.id) {
        // Update existing location
        await updateLocation({
          id: initialData.id,
          ...locationData,
        });
        locationId = initialData.id;
      } else {
        // Create new location
        locationId = await createLocation(locationData);
      }

      onSuccess(locationId);
      
      // Handle navigation based on user role
      if (isAdmin) {
        // Admin flow - navigate to locations list
        navigate("/locations");
      } else {
        // General user flow - navigate to campaign creation with refresh parameter
        navigate("/campaigns/new?refresh=true");
      }
      
      handleClose();
    } catch (error) {
      console.error("Error creating/updating location:", error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} location. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      type: "Other",
      mapId: undefined,
    });
    setErrors({});
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const getModalTitle = () => {
    if (isEditing) return "Edit Location";
    return "Create New Location";
  };

  const getModalDescription = () => {
    if (isEditing) return "Edit location details";
    return "Define a new location for your campaign world";
  };

  const tabs = [
    {
      value: "basic",
      label: "Basic Info",
      icon: <MapPin className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
              placeholder="Enter location name"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Location Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as LocationFormData["type"] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="City">City</SelectItem>
                <SelectItem value="Town">Town</SelectItem>
                <SelectItem value="Village">Village</SelectItem>
                <SelectItem value="Dungeon">Dungeon</SelectItem>
                <SelectItem value="Forest">Forest</SelectItem>
                <SelectItem value="Mountain">Mountain</SelectItem>
                <SelectItem value="Desert">Desert</SelectItem>
                <SelectItem value="Swamp">Swamp</SelectItem>
                <SelectItem value="Castle">Castle</SelectItem>
                <SelectItem value="Temple">Temple</SelectItem>
                <SelectItem value="Tavern">Tavern</SelectItem>
                <SelectItem value="Shop">Shop</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? "border-destructive" : ""}
              placeholder="Describe the location..."
              rows={4}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
        </div>
      ),
    },
    {
      value: "map",
      label: "Map",
      icon: <Map className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <Label>Select a map (optional)</Label>
          {maps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maps.map((map) => (
                <MapCard
                  key={map._id}
                  map={map}
                  isSelected={formData.mapId === map._id}
                  onSelect={(mapId) => setFormData({
                    ...formData,
                    mapId: formData.mapId === mapId ? undefined : mapId
                  })}
                  compact={true}
                  className="modal-map-card"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No maps created yet</p>
              <p className="text-sm mb-4">Create your first map to associate with locations</p>
              <Button asChild variant="outline">
                <a href="/maps/new" target="_blank" rel="noopener noreferrer">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Map
                </a>
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      description={getModalDescription()}
      size="4xl"
      maxHeight="90vh"
    >
      <LoadingSpinner isLoading={isSubmitting} overlay text={isEditing ? "Updating location..." : "Creating location..."} />

      {/* Error Display */}
      {error && (
        <div className="mb-4">
          <ErrorDisplay error={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormTabs tabs={tabs} defaultValue="basic" />

        <Separator />

        {/* Action Bar */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
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
            {isEditing ? "Update Location" : "Create Location"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default LocationCreationModal; 