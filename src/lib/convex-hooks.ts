import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { GardenId } from "@/types";

// Garden hooks
export const useGardens = () => {
  return useQuery(convexQuery(api.gardens.list, {}));
};

export const useGarden = (id: GardenId) => {
  return useQuery(convexQuery(api.gardens.get, { id }));
};

export const useCreateGarden = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.gardens.create),
  });
};

export const useDeleteGarden = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.gardens.remove),
  });
};

// Plant hooks
export const usePlantsByGarden = (gardenId: GardenId) => {
  return useQuery(convexQuery(api.plants.listByGarden, { gardenId }));
};

export const useCreatePlant = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.plants.create),
  });
};

export const useUpdatePlant = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.plants.update),
  });
};

export const useDeletePlant = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.plants.remove),
  });
};

// Raised beds hooks
export const useRaisedBedsByGarden = (gardenId: GardenId) => {
  return useQuery(convexQuery(api.raisedBeds.listByGarden, { gardenId }));
};

export const useCreateRaisedBed = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.raisedBeds.create),
  });
};

export const useDeleteRaisedBed = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.raisedBeds.remove),
  });
};

// Plant types hooks
export const usePlantTypes = () => {
  return useQuery(convexQuery(api.plantTypes.list, {}));
};

export const useSeedPlantTypes = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.plantTypes.seed),
  });
};

