import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getAllLocationsIncludingInactive,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../db";

export const locationsRouter = router({
  // Get all locations (including inactive)
  list: protectedProcedure.query(async () => {
    try {
      const allLocations = await getAllLocationsIncludingInactive();
      return allLocations;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  }),

  // Get single location by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const location = await getLocationById(input.id);
        return location;
      } catch (error) {
        console.error("Error fetching location:", error);
        throw error;
      }
    }),

  // Create new location
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Location name is required"),
        code: z.string().min(1, "Location code is required"),
        region: z.string().optional(),
        country: z.string().optional(),
        status: z.enum(["active", "inactive"]).default("active"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await createLocation(input);
        return { success: true, data: result };
      } catch (error) {
        console.error("Error creating location:", error);
        throw error;
      }
    }),

  // Update location
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        code: z.string().optional(),
        region: z.string().optional(),
        country: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;
        // Filter out undefined values
        const cleanData = Object.fromEntries(
          Object.entries(updateData).filter(([, v]) => v !== undefined)
        );
        const result = await updateLocation(id, cleanData as any);
        return { success: true, data: result };
      } catch (error) {
        console.error("Error updating location:", error);
        throw error;
      }
    }),

  // Delete location
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const result = await deleteLocation(input.id);
        return { success: true, data: result };
      } catch (error) {
        console.error("Error deleting location:", error);
        throw error;
      }
    }),
});
