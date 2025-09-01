import { query } from "./_generated/server";
import { mutation } from "./functions";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("plantTypes").collect();
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plantTypes")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

export const seed = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("plantTypes").first();
    if (existing) return;

    const plantTypes = [
      {
        name: "Tomato",
        category: "Fruit",
        spacing: 60,
        daysToMaturity: 75,
        plantingSeasons: ["Spring", "Early Summer"],
        companion: ["Basil", "Pepper", "Carrot"],
        avoid: ["Corn", "Fennel"],
        color: "#ff6b6b",
      },
      {
        name: "Lettuce",
        category: "Leafy Green",
        spacing: 20,
        daysToMaturity: 45,
        plantingSeasons: ["Spring", "Fall"],
        companion: ["Carrot", "Radish", "Onion"],
        avoid: ["Broccoli"],
        color: "#51cf66",
      },
      {
        name: "Carrot",
        category: "Root",
        spacing: 5,
        daysToMaturity: 70,
        plantingSeasons: ["Spring", "Summer"],
        companion: ["Tomato", "Lettuce", "Chive"],
        avoid: ["Dill"],
        color: "#ff8c42",
      },
      {
        name: "Pepper",
        category: "Fruit",
        spacing: 45,
        daysToMaturity: 70,
        plantingSeasons: ["Spring", "Early Summer"],
        companion: ["Tomato", "Basil", "Onion"],
        avoid: ["Fennel"],
        color: "#ffd43b",
      },
      {
        name: "Spinach",
        category: "Leafy Green",
        spacing: 15,
        daysToMaturity: 40,
        plantingSeasons: ["Spring", "Fall"],
        companion: ["Strawberry", "Radish", "Peas"],
        avoid: [],
        color: "#40c057",
      },
      {
        name: "Radish",
        category: "Root",
        spacing: 5,
        daysToMaturity: 30,
        plantingSeasons: ["Spring", "Summer", "Fall"],
        companion: ["Lettuce", "Spinach", "Carrot"],
        avoid: [],
        color: "#e64980",
      },
    ];

    for (const plantType of plantTypes) {
      await ctx.db.insert("plantTypes", plantType);
    }
  },
});