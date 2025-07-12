import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all maps for a user
export const getUserMaps = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Get user ID from clerkId
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("maps")
      .filter((q) => q.eq(q.field("createdBy"), user._id))
      .collect();
  },
});

// Query to get a specific map
export const getMap = query({
  args: { mapId: v.id("maps") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mapId);
  },
});

// Mutation to create a new map
export const createMap = mutation({
  args: {
    name: v.string(),
    width: v.number(),
    height: v.number(),
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

    const { width, height } = args;
    
    // Create initial cells array with all cells set to "inbounds" and "normal" terrain
    const cells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        cells.push({
          x,
          y,
          state: "inbounds" as const,
          terrain: "normal" as const,
          terrainModifier: 0,
        });
      }
    }

    return await ctx.db.insert("maps", {
      name: args.name,
      width,
      height,
      cells,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mutation to update a map's cells
export const updateMapCells = mutation({
  args: {
    mapId: v.id("maps"),
    cells: v.array(v.object({
      x: v.number(),
      y: v.number(),
      state: v.union(
        v.literal("inbounds"),
        v.literal("outbounds"),
        v.literal("occupied")
      ),
      terrain: v.optional(v.union(
        v.literal("normal"),
        v.literal("soft"),
        v.literal("rough"),
        v.literal("intense"),
        v.literal("brutal"),
        v.literal("deadly")
      )),
      terrainModifier: v.optional(v.number()),
      affectedAbilityScores: v.optional(v.array(v.string())),
      occupant: v.optional(v.object({
        id: v.string(),
        type: v.union(
          v.literal("playerCharacter"),
          v.literal("npc"),
          v.literal("monster")
        ),
        color: v.string(),
        speed: v.number(),
        name: v.string()
      })),
      customColor: v.optional(v.string())
    })),
  },
  handler: async (ctx, args) => {
    const map = await ctx.db.get(args.mapId);
    if (!map) throw new Error("Map not found");

    return await ctx.db.patch(args.mapId, {
      cells: args.cells,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete a map
export const deleteMap = mutation({
  args: { mapId: v.id("maps") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.mapId);
  },
});

// Query to get map instances for a user
export const getUserMapInstances = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("mapInstances")
      .filter((q) => q.eq(q.field("createdBy"), user._id))
      .collect();
  },
});

// Query to get a specific map instance
export const getMapInstance = query({
  args: { instanceId: v.id("mapInstances") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.instanceId);
  },
});

// Mutation to create a new map instance
export const createMapInstance = mutation({
  args: {
    mapId: v.id("maps"),
    name: v.string(),
    clerkId: v.string(),
    campaignId: v.optional(v.id("campaigns")),
    interactionId: v.optional(v.id("interactions")),
    initialPositions: v.optional(v.array(v.object({
      entityId: v.string(),
      entityType: v.union(
        v.literal("playerCharacter"),
        v.literal("npc"),
        v.literal("monster")
      ),
      x: v.number(),
      y: v.number(),
      speed: v.number(),
      name: v.string(),
      color: v.string()
    }))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("mapInstances", {
      mapId: args.mapId,
      name: args.name,
      campaignId: args.campaignId,
      interactionId: args.interactionId,
      currentPositions: args.initialPositions || [],
      movementHistory: [],
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mutation to move an entity on a map instance
export const moveEntity = mutation({
  args: {
    instanceId: v.id("mapInstances"),
    entityId: v.string(),
    toX: v.number(),
    toY: v.number(),
  },
  handler: async (ctx, args) => {
    const instance = await ctx.db.get(args.instanceId);
    if (!instance) throw new Error("Map instance not found");

    const entity = instance.currentPositions.find(pos => pos.entityId === args.entityId);
    if (!entity) throw new Error("Entity not found");

    // Calculate distance (Manhattan distance for simplicity)
    const distance = Math.abs(entity.x - args.toX) + Math.abs(entity.y - args.toY);
    const distanceInFeet = distance * 5; // Each cell is 5 feet

    if (distanceInFeet > entity.speed) {
      throw new Error(`Entity cannot move that far. Speed: ${entity.speed}ft, Distance: ${distanceInFeet}ft`);
    }

    // Update current positions
    const updatedPositions = instance.currentPositions.map(pos =>
      pos.entityId === args.entityId
        ? { ...pos, x: args.toX, y: args.toY }
        : pos
    );

    // Add to movement history
    const newMovement = {
      entityId: args.entityId,
      entityType: entity.entityType,
      fromX: entity.x,
      fromY: entity.y,
      toX: args.toX,
      toY: args.toY,
      timestamp: Date.now(),
      distance: distanceInFeet
    };

    return await ctx.db.patch(args.instanceId, {
      currentPositions: updatedPositions,
      movementHistory: [...instance.movementHistory, newMovement],
      updatedAt: Date.now(),
    });
  },
});

// Mutation to reset map instance to original positions
export const resetMapInstance = mutation({
  args: { instanceId: v.id("mapInstances") },
  handler: async (ctx, args) => {
    const instance = await ctx.db.get(args.instanceId);
    if (!instance) throw new Error("Map instance not found");

    // Reset to initial positions (first entry in movement history for each entity)
    const initialPositions = instance.currentPositions.map(pos => {
      const firstMove = instance.movementHistory
        .filter(move => move.entityId === pos.entityId)
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      
      if (firstMove) {
        return { ...pos, x: firstMove.fromX, y: firstMove.fromY };
      }
      return pos;
    });

    return await ctx.db.patch(args.instanceId, {
      currentPositions: initialPositions,
      movementHistory: [],
      updatedAt: Date.now(),
    });
  },
});

// Mutation to undo last move
export const undoLastMove = mutation({
  args: { instanceId: v.id("mapInstances") },
  handler: async (ctx, args) => {
    const instance = await ctx.db.get(args.instanceId);
    if (!instance) throw new Error("Map instance not found");

    if (instance.movementHistory.length === 0) {
      throw new Error("No moves to undo");
    }

    const lastMove = instance.movementHistory[instance.movementHistory.length - 1];
    
    // Update current positions
    const updatedPositions = instance.currentPositions.map(pos =>
      pos.entityId === lastMove.entityId
        ? { ...pos, x: lastMove.fromX, y: lastMove.fromY }
        : pos
    );

    // Remove last move from history
    const updatedHistory = instance.movementHistory.slice(0, -1);

    return await ctx.db.patch(args.instanceId, {
      currentPositions: updatedPositions,
      movementHistory: updatedHistory,
      updatedAt: Date.now(),
    });
  },
}); 