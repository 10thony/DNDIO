import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx, QueryCtx } from "./_generated/server";

// Turn Creation and Management Functions
export const createTurn = mutation({
  args: {
    interactionId: v.id("interactions"),
    turnOwner: v.object({
      id: v.string(),
      type: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    }),
    actionTaken: v.string(),
    turnTarget: v.optional(v.object({
      id: v.string(),
      type: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    })),
    distanceAvailable: v.number(),
    turnNumber: v.number(),
    roundNumber: v.number(),
  },
  handler: async (ctx: MutationCtx, args) => {
    // Validate interaction exists
    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    // Validate turn owner exists based on type
    await validateTurnOwner(ctx, args.turnOwner);

    // Validate turn target if provided
    if (args.turnTarget) {
      await validateTurnTarget(ctx, args.turnTarget);
    }

    // Create the turn
    const turnId = await ctx.db.insert("turns", {
      interactionId: args.interactionId,
      turnOwner: args.turnOwner,
      actionTaken: args.actionTaken,
      turnTarget: args.turnTarget,
      distanceAvailable: args.distanceAvailable,
      turnNumber: args.turnNumber,
      roundNumber: args.roundNumber,
      createdAt: Date.now(),
    });

    // Update interaction with the new turn
    const currentTurns = interaction.turns || [];
    currentTurns.push(turnId);
    
    await ctx.db.patch(args.interactionId, {
      turns: currentTurns,
      updatedAt: Date.now(),
    });

    return turnId;
  },
});

export const getTurnsByInteraction = query({
  args: { interactionId: v.id("interactions") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("turns")
      .filter((q) => q.eq(q.field("interactionId"), args.interactionId))
      .order("asc")
      .collect();
  },
});

export const getTurnsByRound = query({
  args: {
    interactionId: v.id("interactions"),
    roundNumber: v.number(),
  },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("turns")
      .filter((q) => 
        q.and(
          q.eq(q.field("interactionId"), args.interactionId),
          q.eq(q.field("roundNumber"), args.roundNumber)
        )
      )
      .order("asc")
      .collect();
  },
});

export const getTurnsByOwner = query({
  args: {
    interactionId: v.id("interactions"),
    ownerId: v.string(),
    ownerType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
  },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("turns")
      .filter((q) => 
        q.and(
          q.eq(q.field("interactionId"), args.interactionId),
          q.eq(q.field("turnOwner.id"), args.ownerId),
          q.eq(q.field("turnOwner.type"), args.ownerType)
        )
      )
      .order("asc")
      .collect();
  },
});

export const getTurnHistory = query({
  args: { interactionId: v.id("interactions") },
  handler: async (ctx: QueryCtx, args) => {
    const turns = await ctx.db
      .query("turns")
      .filter((q) => q.eq(q.field("interactionId"), args.interactionId))
      .order("asc")
      .collect();

    // Group turns by round for better organization
    const turnsByRound: Record<number, typeof turns> = {};
    turns.forEach(turn => {
      if (!turnsByRound[turn.roundNumber]) {
        turnsByRound[turn.roundNumber] = [];
      }
      turnsByRound[turn.roundNumber].push(turn);
    });

    return {
      totalTurns: turns.length,
      currentRound: Math.max(...turns.map(t => t.roundNumber), 0),
      turnsByRound,
      allTurns: turns,
    };
  },
});

export const updateTurn = mutation({
  args: {
    id: v.id("turns"),
    actionTaken: v.optional(v.string()),
    turnTarget: v.optional(v.object({
      id: v.string(),
      type: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    })),
    distanceAvailable: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const turn = await ctx.db.get(args.id);
    if (!turn) {
      throw new Error("Turn not found");
    }

    // Validate turn target if provided
    if (args.turnTarget) {
      await validateTurnTarget(ctx, args.turnTarget);
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);

    return turn;
  },
});

export const deleteTurn = mutation({
  args: { id: v.id("turns") },
  handler: async (ctx: MutationCtx, args) => {
    const turn = await ctx.db.get(args.id);
    if (!turn) {
      throw new Error("Turn not found");
    }

    // Remove turn from interaction's turn list
    const interaction = await ctx.db.get(turn.interactionId);
    if (interaction && interaction.turns) {
      const updatedTurns = interaction.turns.filter(turnId => turnId !== args.id);
      await ctx.db.patch(turn.interactionId, {
        turns: updatedTurns,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(args.id);
  },
});

// Turn Validation Functions
export const validateTurnConstraints = query({
  args: {
    interactionId: v.id("interactions"),
    turnOwner: v.object({
      id: v.string(),
      type: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    }),
    roundNumber: v.number(),
  },
  handler: async (ctx: QueryCtx, args) => {
    // Check if the owner has already taken a turn this round
    const existingTurns = await ctx.db
      .query("turns")
      .filter((q) => 
        q.and(
          q.eq(q.field("interactionId"), args.interactionId),
          q.eq(q.field("turnOwner.id"), args.turnOwner.id),
          q.eq(q.field("turnOwner.type"), args.turnOwner.type),
          q.eq(q.field("roundNumber"), args.roundNumber)
        )
      )
      .collect();

    return {
      canTakeTurn: existingTurns.length === 0,
      existingTurnsThisRound: existingTurns.length,
      message: existingTurns.length > 0 
        ? "This entity has already taken a turn this round" 
        : "Entity can take a turn",
    };
  },
});

// Helper Functions
async function validateTurnOwner(
  ctx: MutationCtx, 
  turnOwner: { id: string; type: "playerCharacter" | "npc" | "monster" }
) {
  let entity;
  switch (turnOwner.type) {
    case "playerCharacter":
      entity = await ctx.db.get(turnOwner.id as any);
      break;
    case "npc":
      entity = await ctx.db.get(turnOwner.id as any);
      break;
    case "monster":
      entity = await ctx.db.get(turnOwner.id as any);
      break;
  }
  
  if (!entity) {
    throw new Error(`${turnOwner.type} with id ${turnOwner.id} not found`);
  }
}

async function validateTurnTarget(
  ctx: MutationCtx, 
  turnTarget: { id: string; type: "playerCharacter" | "npc" | "monster" }
) {
  let entity;
  switch (turnTarget.type) {
    case "playerCharacter":
      entity = await ctx.db.get(turnTarget.id as any);
      break;
    case "npc":
      entity = await ctx.db.get(turnTarget.id as any);
      break;
    case "monster":
      entity = await ctx.db.get(turnTarget.id as any);
      break;
  }
  
  if (!entity) {
    throw new Error(`${turnTarget.type} with id ${turnTarget.id} not found`);
  }
}

// Advanced Turn Management Functions
export const getCurrentRoundTurns = query({
  args: { interactionId: v.id("interactions") },
  handler: async (ctx: QueryCtx, args) => {
    const turns = await ctx.db
      .query("turns")
      .filter((q) => q.eq(q.field("interactionId"), args.interactionId))
      .order("desc")
      .collect();

    if (turns.length === 0) {
      return { currentRound: 1, turns: [] };
    }

    const currentRound = Math.max(...turns.map(t => t.roundNumber));
    const currentRoundTurns = turns.filter(t => t.roundNumber === currentRound);

    return {
      currentRound,
      turns: currentRoundTurns,
      totalRounds: currentRound,
    };
  },
});

export const getNextTurnNumber = query({
  args: {
    interactionId: v.id("interactions"),
    roundNumber: v.number(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const turnsInRound = await ctx.db
      .query("turns")
      .filter((q) => 
        q.and(
          q.eq(q.field("interactionId"), args.interactionId),
          q.eq(q.field("roundNumber"), args.roundNumber)
        )
      )
      .collect();

    return turnsInRound.length + 1;
  },
});

export const getTurnStatistics = query({
  args: { interactionId: v.id("interactions") },
  handler: async (ctx: QueryCtx, args) => {
    const turns = await ctx.db
      .query("turns")
      .filter((q) => q.eq(q.field("interactionId"), args.interactionId))
      .collect();

    const stats = {
      totalTurns: turns.length,
      totalRounds: turns.length > 0 ? Math.max(...turns.map(t => t.roundNumber)) : 0,
      turnsByType: {
        playerCharacter: turns.filter(t => t.turnOwner.type === "playerCharacter").length,
        npc: turns.filter(t => t.turnOwner.type === "npc").length,
        monster: turns.filter(t => t.turnOwner.type === "monster").length,
      },
      averageTurnsPerRound: 0,
    };

    if (stats.totalRounds > 0) {
      stats.averageTurnsPerRound = stats.totalTurns / stats.totalRounds;
    }

    return stats;
  },
});