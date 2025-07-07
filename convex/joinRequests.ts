import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createJoinRequest = mutation({
  args: {
    campaignId: v.id("campaigns"),
    requesterUserClerkId: v.string(),
    requesterUserId: v.id("users"),
    playerCharacterId: v.id("playerCharacters"),
  },
  handler: async (ctx, args) => {
    // Check if campaign exists and is public
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    if (!campaign.isPublic) {
      throw new Error("Cannot request to join private campaign");
    }

    // Check if user is already a participant
    if (campaign.players?.includes(args.requesterUserClerkId)) {
      throw new Error("Already a participant in this campaign");
    }

    // Check if user is the DM
    if (campaign.dmId === args.requesterUserClerkId) {
      throw new Error("DM cannot request to join their own campaign");
    }

    // Check for existing pending or approved requests
    const existingRequest = await ctx.db
      .query("joinRequests")
      .filter((q) => 
        q.and(
          q.eq(q.field("campaignId"), args.campaignId),
          q.eq(q.field("requesterUserClerkId"), args.requesterUserClerkId),
          q.or(
            q.eq(q.field("status"), "PENDING"),
            q.eq(q.field("status"), "APPROVED")
          )
        )
      )
      .first();

    if (existingRequest) {
      throw new Error("You already have a pending or approved request for this campaign");
    }

    // Create join request
    const joinRequestId = await ctx.db.insert("joinRequests", {
      campaignId: args.campaignId,
      requesterUserClerkId: args.requesterUserClerkId,
      requesterUserId: args.requesterUserId,
      playerCharacterId: args.playerCharacterId,
      status: "PENDING",
      createdAt: Date.now(),
    });

    // Create notification for DM
    await ctx.db.insert("notifications", {
      userClerkId: campaign.dmId,
      type: "JOIN_REQUEST",
      payload: {
        campaignId: args.campaignId,
        joinRequestId,
        campaignName: campaign.name,
        requesterUserClerkId: args.requesterUserClerkId,
        playerCharacterId: args.playerCharacterId,
      },
      isRead: false,
      createdAt: Date.now(),
    });

    return joinRequestId;
  },
});

export const getJoinRequestsByCampaign = query({
  args: { 
    campaignId: v.id("campaigns"),
    clerkId: v.string(), // For authorization
  },
  handler: async (ctx, args) => {
    // Get campaign and user for authorization
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return [];

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    // Only DM, admin, or campaign creator can view requests
    if (
      user?.role !== "admin" &&
      campaign.dmId !== args.clerkId &&
      campaign.creatorId !== user?._id
    ) {
      return [];
    }

    const requests = await ctx.db
      .query("joinRequests")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .order("desc")
      .collect();

    // Get additional data for each request
    const requestsWithData = await Promise.all(
      requests.map(async (request) => {
        const [requester, playerCharacter] = await Promise.all([
          ctx.db.get(request.requesterUserId),
          ctx.db.get(request.playerCharacterId),
        ]);

        return {
          ...request,
          requester,
          playerCharacter,
        };
      })
    );

    return requestsWithData;
  },
});

export const getJoinRequestsByUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("joinRequests")
      .filter((q) => q.eq(q.field("requesterUserClerkId"), args.clerkId))
      .order("desc")
      .collect();

    // Get additional data for each request
    const requestsWithData = await Promise.all(
      requests.map(async (request) => {
        const [campaign, playerCharacter] = await Promise.all([
          ctx.db.get(request.campaignId),
          ctx.db.get(request.playerCharacterId),
        ]);

        return {
          ...request,
          campaign,
          playerCharacter,
        };
      })
    );

    return requestsWithData;
  },
});

export const approveJoinRequest = mutation({
  args: {
    joinRequestId: v.id("joinRequests"),
    clerkId: v.string(), // For authorization
  },
  handler: async (ctx, args) => {
    const joinRequest = await ctx.db.get(args.joinRequestId);
    if (!joinRequest) {
      throw new Error("Join request not found");
    }

    const campaign = await ctx.db.get(joinRequest.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    // Only DM, admin, or campaign creator can approve requests
    if (
      user?.role !== "admin" &&
      campaign.dmId !== args.clerkId &&
      campaign.creatorId !== user?._id
    ) {
      throw new Error("Unauthorized to approve join requests");
    }

    if (joinRequest.status !== "PENDING") {
      throw new Error("Join request is not pending");
    }

    // Update join request status
    await ctx.db.patch(args.joinRequestId, {
      status: "APPROVED",
      updatedAt: Date.now(),
    });

    // Add user to campaign participants
    const updatedPlayers = campaign.players || [];
    if (!updatedPlayers.includes(joinRequest.requesterUserClerkId)) {
      updatedPlayers.push(joinRequest.requesterUserClerkId);
    }

    const updatedParticipantUserIds = campaign.participantUserIds || [];
    if (!updatedParticipantUserIds.includes(joinRequest.requesterUserId)) {
      updatedParticipantUserIds.push(joinRequest.requesterUserId);
    }

    const updatedParticipantPlayerCharacterIds = campaign.participantPlayerCharacterIds || [];
    if (!updatedParticipantPlayerCharacterIds.includes(joinRequest.playerCharacterId)) {
      updatedParticipantPlayerCharacterIds.push(joinRequest.playerCharacterId);
    }

    await ctx.db.patch(joinRequest.campaignId, {
      players: updatedPlayers,
      participantUserIds: updatedParticipantUserIds,
      participantPlayerCharacterIds: updatedParticipantPlayerCharacterIds,
      updatedAt: Date.now(),
    });

    // Create notification for requester
    await ctx.db.insert("notifications", {
      userClerkId: joinRequest.requesterUserClerkId,
      type: "JOIN_APPROVED",
      payload: {
        campaignId: joinRequest.campaignId,
        campaignName: campaign.name,
        joinRequestId: args.joinRequestId,
      },
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const denyJoinRequest = mutation({
  args: {
    joinRequestId: v.id("joinRequests"),
    clerkId: v.string(), // For authorization
    denyReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const joinRequest = await ctx.db.get(args.joinRequestId);
    if (!joinRequest) {
      throw new Error("Join request not found");
    }

    const campaign = await ctx.db.get(joinRequest.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    // Only DM, admin, or campaign creator can deny requests
    if (
      user?.role !== "admin" &&
      campaign.dmId !== args.clerkId &&
      campaign.creatorId !== user?._id
    ) {
      throw new Error("Unauthorized to deny join requests");
    }

    if (joinRequest.status !== "PENDING") {
      throw new Error("Join request is not pending");
    }

    // Update join request status
    await ctx.db.patch(args.joinRequestId, {
      status: "DENIED",
      denyReason: args.denyReason,
      updatedAt: Date.now(),
    });

    // Create notification for requester
    await ctx.db.insert("notifications", {
      userClerkId: joinRequest.requesterUserClerkId,
      type: "JOIN_DENIED",
      payload: {
        campaignId: joinRequest.campaignId,
        campaignName: campaign.name,
        joinRequestId: args.joinRequestId,
        denyReason: args.denyReason,
      },
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const getNotifications = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userClerkId"), args.clerkId))
      .order("desc")
      .collect();

    return notifications;
  },
});

export const markNotificationRead = mutation({
  args: {
    notificationId: v.id("notifications"),
    clerkId: v.string(), // For authorization
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Only the notification owner can mark it as read
    if (notification.userClerkId !== args.clerkId) {
      throw new Error("Unauthorized to modify this notification");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });

    return { success: true };
  },
});

export const markAllNotificationsRead = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => 
        q.and(
          q.eq(q.field("userClerkId"), args.clerkId),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    // Update all unread notifications
    await Promise.all(
      notifications.map(notification =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );

    return { success: true, updatedCount: notifications.length };
  },
}); 