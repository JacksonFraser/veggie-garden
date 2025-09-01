import { query } from "./_generated/server";
import { mutation } from "./functions";
import { v } from "convex/values";

export const listByGarden = query({
  args: { gardenId: v.id("gardens") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("raisedBeds")
      .withIndex("by_garden", (q) => q.eq("gardenId", args.gardenId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("raisedBeds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    gardenId: v.id("gardens"),
    name: v.string(),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    bedHeight: v.number(),
    material: v.union(
      v.literal("wood"),
      v.literal("stone"),
      v.literal("metal"),
      v.literal("composite")
    ),
    color: v.string(),
    soilType: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("raisedBeds", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("raisedBeds"),
    name: v.optional(v.string()),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    bedHeight: v.optional(v.number()),
    material: v.optional(
      v.union(
        v.literal("wood"),
        v.literal("stone"),
        v.literal("metal"),
        v.literal("composite")
      )
    ),
    color: v.optional(v.string()),
    soilType: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("raisedBeds") },
  handler: async (ctx, args) => {
    // First, update all plants in this bed to remove the bed reference
    const plantsInBed = await ctx.db
      .query("plants")
      .withIndex("by_bed", (q) => q.eq("raisedBedId", args.id))
      .collect();
    
    for (const plant of plantsInBed) {
      await ctx.db.patch(plant._id, { raisedBedId: undefined });
    }
    
    // Then delete the bed
    return await ctx.db.delete(args.id);
  },
});

// Get material color defaults
export const getMaterialDefaults = query({
  handler: async () => {
    return {
      wood: "#8B4513",
      stone: "#696969",
      metal: "#708090",
      composite: "#654321",
    };
  },
});