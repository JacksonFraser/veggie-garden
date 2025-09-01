import { query } from "./_generated/server";
import { mutation } from "./functions";
import { v } from "convex/values";

// Find orphaned plants (plants that reference non-existent gardens)
export const findOrphanedPlants = query({
  handler: async (ctx) => {
    const plants = await ctx.db.query("plants").collect();
    const orphanedPlants = [];
    
    for (const plant of plants) {
      // Check if the garden still exists
      const garden = await ctx.db.get(plant.gardenId);
      if (!garden) {
        orphanedPlants.push({
          plantId: plant._id,
          plantName: plant.name,
          gardenId: plant.gardenId,
          x: plant.x,
          y: plant.y
        });
      }
      
      // Also check if the plant references a raised bed that no longer exists
      if (plant.raisedBedId) {
        const bed = await ctx.db.get(plant.raisedBedId);
        if (!bed) {
          orphanedPlants.push({
            plantId: plant._id,
            plantName: plant.name,
            gardenId: plant.gardenId,
            raisedBedId: plant.raisedBedId,
            issue: "orphaned_raised_bed",
            x: plant.x,
            y: plant.y
          });
        }
      }
    }
    
    return orphanedPlants;
  },
});

// Find orphaned raised beds (beds that reference non-existent gardens)
export const findOrphanedRaisedBeds = query({
  handler: async (ctx) => {
    const raisedBeds = await ctx.db.query("raisedBeds").collect();
    const orphanedBeds = [];
    
    for (const bed of raisedBeds) {
      // Check if the garden still exists
      const garden = await ctx.db.get(bed.gardenId);
      if (!garden) {
        orphanedBeds.push({
          bedId: bed._id,
          bedName: bed.name,
          gardenId: bed.gardenId,
          x: bed.x,
          y: bed.y,
          material: bed.material
        });
      }
    }
    
    return orphanedBeds;
  },
});

// Clean up all orphaned plants
export const cleanupOrphanedPlants = mutation({
  handler: async (ctx) => {
    const plants = await ctx.db.query("plants").collect();
    let deletedCount = 0;
    
    for (const plant of plants) {
      // Check if the garden still exists
      const garden = await ctx.db.get(plant.gardenId);
      if (!garden) {
        await ctx.db.delete(plant._id);
        deletedCount++;
        console.log(`Deleted orphaned plant: ${plant.name} (${plant._id})`);
        continue;
      }
      
      // Also remove plants that reference non-existent raised beds
      if (plant.raisedBedId) {
        const bed = await ctx.db.get(plant.raisedBedId);
        if (!bed) {
          // Just remove the raised bed reference, don't delete the plant
          await ctx.db.patch(plant._id, { raisedBedId: undefined });
          console.log(`Removed invalid raised bed reference from plant: ${plant.name} (${plant._id})`);
        }
      }
    }
    
    return { deletedPlants: deletedCount };
  },
});

// Clean up all orphaned raised beds
export const cleanupOrphanedRaisedBeds = mutation({
  handler: async (ctx) => {
    const raisedBeds = await ctx.db.query("raisedBeds").collect();
    let deletedCount = 0;
    
    for (const bed of raisedBeds) {
      // Check if the garden still exists
      const garden = await ctx.db.get(bed.gardenId);
      if (!garden) {
        await ctx.db.delete(bed._id);
        deletedCount++;
        console.log(`Deleted orphaned raised bed: ${bed.name} (${bed._id})`);
      }
    }
    
    return { deletedBeds: deletedCount };
  },
});

// Clean up everything at once
export const cleanupAll = mutation({
  handler: async (ctx) => {
    // Clean up orphaned plants
    const plants = await ctx.db.query("plants").collect();
    let deletedPlants = 0;
    
    for (const plant of plants) {
      const garden = await ctx.db.get(plant.gardenId);
      if (!garden) {
        await ctx.db.delete(plant._id);
        deletedPlants++;
        console.log(`Deleted orphaned plant: ${plant.name} (${plant._id})`);
        continue;
      }
      
      if (plant.raisedBedId) {
        const bed = await ctx.db.get(plant.raisedBedId);
        if (!bed) {
          await ctx.db.patch(plant._id, { raisedBedId: undefined });
          console.log(`Removed invalid raised bed reference from plant: ${plant.name} (${plant._id})`);
        }
      }
    }
    
    // Clean up orphaned raised beds
    const raisedBeds = await ctx.db.query("raisedBeds").collect();
    let deletedBeds = 0;
    
    for (const bed of raisedBeds) {
      const garden = await ctx.db.get(bed.gardenId);
      if (!garden) {
        await ctx.db.delete(bed._id);
        deletedBeds++;
        console.log(`Deleted orphaned raised bed: ${bed.name} (${bed._id})`);
      }
    }
    
    return {
      deletedPlants,
      deletedBeds,
      totalDeleted: deletedPlants + deletedBeds
    };
  },
});