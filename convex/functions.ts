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
    
    console.log(`Garden ${gardenId} deleted, cascading deletes...`);
    
    // Delete all plants in this garden
    const plants = await ctx.db
      .query("plants")
      .filter((q) => q.eq(q.field("gardenId"), gardenId))
      .collect();
    
    console.log(`Deleting ${plants.length} plants from garden ${gardenId}`);
    for (const plant of plants) {
      await ctx.db.delete(plant._id);
    }
    
    // Delete all raised beds in this garden
    const raisedBeds = await ctx.db
      .query("raisedBeds")
      .filter((q) => q.eq(q.field("gardenId"), gardenId))
      .collect();
    
    console.log(`Deleting ${raisedBeds.length} raised beds from garden ${gardenId}`);
    for (const bed of raisedBeds) {
      await ctx.db.delete(bed._id);
    }
  }
});

// Cascade delete: when a raised bed is deleted, delete all plants in that bed
triggers.register("raisedBeds", async (ctx, change) => {
  if (change.operation === "delete") {
    const bedId = change.id;
    
    console.log(`Raised bed ${bedId} deleted, deleting plants in bed...`);
    
    // Delete all plants in this raised bed
    const plantsInBed = await ctx.db
      .query("plants")
      .filter((q) => q.eq(q.field("raisedBedId"), bedId))
      .collect();
    
    console.log(`Deleting ${plantsInBed.length} plants from raised bed ${bedId}`);
    for (const plant of plantsInBed) {
      await ctx.db.delete(plant._id);
    }
  }
});

// Create custom function wrappers that include trigger support
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));