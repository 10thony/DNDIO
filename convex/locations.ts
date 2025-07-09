import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

// Note: These functions are duplicated in other files and should be removed
// Campaign functions are in campaigns.ts
// NPC functions are in npcs.ts

// Create a new location (for interaction detail)
export const createLocation = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user ID from clerkId
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const locationId = await ctx.db.insert("locations", {
      name: args.name,
      description: args.description,
      type: args.type as LocationType,
      notableNpcIds: [],
      linkedLocations: [],
      interactionsAtLocation: [],
      imageUrls: [],
      secrets: "",
      creatorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return locationId;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    description: v.string(),
    notableNpcIds: v.array(v.id("npcs")),
    linkedLocations: v.array(v.id("locations")),
    interactionsAtLocation: v.array(v.id("interactions")),
    imageUrls: v.array(v.string()),
    secrets: v.string(),
    mapId: v.optional(v.id("maps")),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user ID from clerkId
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const locationId = await ctx.db.insert("locations", {
      name: args.name,
      type: args.type as LocationType,
      description: args.description,
      notableNpcIds: args.notableNpcIds,
      linkedLocations: args.linkedLocations,
      interactionsAtLocation: args.interactionsAtLocation,
      imageUrls: args.imageUrls,
      secrets: args.secrets,
      mapId: args.mapId,
      creatorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return locationId;
  },
});

export const list = query({
  handler: async (ctx) => {
    const locations = await ctx.db.query("locations").collect();
    return locations;
  },
});

export const getById = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const get = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("locations"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    notableNpcIds: v.optional(v.array(v.id("npcs"))),
    linkedLocations: v.optional(v.array(v.id("locations"))),
    interactionsAtLocation: v.optional(v.array(v.id("interactions"))),
    imageUrls: v.optional(v.array(v.string())),
    secrets: v.optional(v.string()),
    mapId: v.optional(v.union(v.id("maps"), v.null())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Only include fields that are provided
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type as LocationType;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.notableNpcIds !== undefined) updateData.notableNpcIds = updates.notableNpcIds;
    if (updates.linkedLocations !== undefined) updateData.linkedLocations = updates.linkedLocations;
    if (updates.interactionsAtLocation !== undefined) updateData.interactionsAtLocation = updates.interactionsAtLocation;
    if (updates.imageUrls !== undefined) updateData.imageUrls = updates.imageUrls;
    if (updates.secrets !== undefined) updateData.secrets = updates.secrets;
    if (updates.mapId !== undefined) updateData.mapId = updates.mapId;
    
    await ctx.db.patch(id, updateData);
    return id;
  },
}); 