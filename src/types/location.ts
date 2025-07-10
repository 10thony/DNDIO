export const locationTypes = [
  "Town",
  "City",
  "Village",
  "Dungeon",
  "Castle",
  "Forest",
  "Mountain",
  "Temple",
  "Ruins",
  "Camp",
  "Other"
] as const;

export type LocationType = typeof locationTypes[number];

export interface Location {
  _id: string;
  name: string;
  description: string;
  type: LocationType;
  notableNpcIds: string[];
  linkedLocations: string[];
  interactionsAtLocation: string[];
  imageUrls: string[];
  secrets: string;
  mapId?: string;
  creatorId: string;
  createdAt: number;
  updatedAt: number;
} 