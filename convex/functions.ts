import { mutation as rawMutation, internalMutation as rawInternalMutation } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";

// Initialize triggers with our DataModel type
const triggers = new Triggers<DataModel>();

// Cascade delete: when a garden is deleted, delete all related plants and raised beds
triggers.register("gardens", async (ctx, change) => {
  if (change.operation === "delete") {
    const gardenId = change.id;

    // Delete all plants in this garden
    const plants = await ctx.db
      .query("plants")
      .filter((q) => q.eq(q.field("gardenId"), gardenId))
      .collect();

    for (const plant of plants) {
      await ctx.db.delete(plant._id);
    }

    // Delete all raised beds in this garden
    const raisedBeds = await ctx.db
      .query("raisedBeds")
      .filter((q) => q.eq(q.field("gardenId"), gardenId))
      .collect();

    for (const bed of raisedBeds) {
      await ctx.db.delete(bed._id);
    }
  }
});

// Cascade: when a raised bed is deleted, orphan plants (remove bed reference, keep plants)
triggers.register("raisedBeds", async (ctx, change) => {
  if (change.operation === "delete") {
    const bedId = change.id;

    // Orphan plants by removing bed reference (don't delete them)
    const plantsInBed = await ctx.db
      .query("plants")
      .filter((q) => q.eq(q.field("raisedBedId"), bedId))
      .collect();

    for (const plant of plantsInBed) {
      await ctx.db.patch(plant._id, { raisedBedId: undefined });
    }
  }
});

// Create custom function wrappers that include trigger support
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));