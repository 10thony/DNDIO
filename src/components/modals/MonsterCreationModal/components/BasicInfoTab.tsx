import React from "react";
import { FormSection } from "../../shared";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { ErrorDisplay } from "../../shared";
import { MonsterFormProps } from "../types/monsterForm";
import { BookOpen, Tag, Compass } from "lucide-react";

const BasicInfoTab: React.FC<MonsterFormProps> = ({
  formData,
  setField,
  errors,
}) => {
  const sizeOptions = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
  const alignmentOptions = [
    "Lawful Good", "Neutral Good", "Chaotic Good",
    "Lawful Neutral", "Neutral", "Chaotic Neutral",
    "Lawful Evil", "Neutral Evil", "Chaotic Evil",
    "Unaligned"
  ];

  return (
    <div className="space-y-6">
      <FormSection
        title="Basic Information"
        description="Core details about the monster"
        icon={<BookOpen className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Enter monster name"
              className={errors.name ? "border-destructive" : ""}
            />
            <ErrorDisplay errors={errors} field="name" variant="inline" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setField("type", e.target.value)}
              placeholder="e.g., Humanoid, Beast, Dragon"
              className={errors.type ? "border-destructive" : ""}
            />
            <ErrorDisplay errors={errors} field="type" variant="inline" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Select value={formData.size} onValueChange={(value) => setField("size", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alignment">Alignment</Label>
            <Select value={formData.alignment} onValueChange={(value) => setField("alignment", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {alignmentOptions.map(alignment => (
                  <SelectItem key={alignment} value={alignment}>{alignment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Source Information"
        description="Reference information for the monster"
        icon={<Tag className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setField("source", e.target.value)}
              placeholder="e.g., Monster Manual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page">Page</Label>
            <Input
              id="page"
              value={formData.page}
              onChange={(e) => setField("page", e.target.value)}
              placeholder="e.g., 25"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Tags"
        description="Additional tags for categorization"
        icon={<Compass className="h-5 w-5" />}
      >
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags.join(", ")}
            onChange={(e) => setField("tags", e.target.value.split(", ").filter(tag => tag.trim()))}
            placeholder="Enter tags separated by commas"
          />
          <p className="text-sm text-muted-foreground">
            Add tags separated by commas (e.g., "undead", "fiend", "legendary")
          </p>
        </div>
      </FormSection>
    </div>
  );
};

export default BasicInfoTab; 