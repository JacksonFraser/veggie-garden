import { query } from "./_generated/server";
import { mutation } from "./functions";
import { v } from "convex/values";

export const listByGarden = query({
  args: { gardenId: v.id("gardens") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plants")
      .withIndex("by_garden", (q) => q.eq("gardenId", args.gardenId))
      .collect();
  },
});

export const listByBed = query({
  args: { raisedBedId: v.id("raisedBeds") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plants")
      .withIndex("by_bed", (q) => q.eq("raisedBedId", args.raisedBedId))
      .collect();
  },
});

export const create = mutation({
  args: {
    gardenId: v.id("gardens"),
    raisedBedId: v.optional(v.id("raisedBeds")),
    name: v.string(),
    variety: v.string(),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    plantingDate: v.optional(v.number()),
    harvestDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("planned"),
        v.literal("planted"),
        v.literal("growing"),
        v.literal("harvested")
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("plants", {
      ...args,
      status: args.status || "planned",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("plants"),
    raisedBedId: v.optional(v.id("raisedBeds")),
    name: v.optional(v.string()),
    variety: v.optional(v.string()),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    plantingDate: v.optional(v.number()),
    harvestDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("planned"),
        v.literal("planted"),
        v.literal("growing"),
        v.literal("harvested")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("plants") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});