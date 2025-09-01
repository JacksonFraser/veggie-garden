import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  gardens: defineTable({
    name: v.string(),
    width: v.number(),
    height: v.number(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }),

  plants: defineTable({
    gardenId: v.id("gardens"),
    raisedBedId: v.optional(v.id("raisedBeds")), // Plants can be in raised beds or directly in ground
    name: v.string(),
    variety: v.string(),
    plantingDate: v.optional(v.number()),
    harvestDate: v.optional(v.number()),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    notes: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.union(
      v.literal("planned"),
      v.literal("planted"),
      v.literal("growing"),
      v.literal("harvested")
    ),
  }).index("by_garden", ["gardenId"])
    .index("by_bed", ["raisedBedId"]),

  plantTypes: defineTable({
    name: v.string(),
    category: v.string(),
    spacing: v.number(),
    daysToMaturity: v.number(),
    plantingSeasons: v.array(v.string()),
    companion: v.array(v.string()),
    avoid: v.array(v.string()),
    color: v.string(),
  }),

  raisedBeds: defineTable({
    gardenId: v.id("gardens"),
    name: v.string(),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    bedHeight: v.number(), // Height of the raised bed in meters
    material: v.union(
      v.literal("wood"),
      v.literal("stone"),
      v.literal("metal"),
      v.literal("composite")
    ),
    color: v.string(),
    soilType: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_garden", ["gardenId"]),
});