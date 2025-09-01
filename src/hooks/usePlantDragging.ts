import { useState, useCallback } from "react";
import { useUpdatePlant } from "@/lib/convex-hooks";
import { Plant, Garden } from "@/types";

interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

interface UsePlantDraggingProps {
  garden: Garden | null | undefined;
  plants: Plant[] | undefined;
  selectedPlant: Plant | null;
  setSelectedPlant: (plant: Plant | null) => void;
  scale: number;
}

interface UsePlantDraggingReturn extends DragState {
  startDrag: (e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
  updateDrag: (e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
  endDrag: () => void;
  findPlantAtPoint: (x: number, y: number) => Plant | undefined;
  getCanvasCoordinates: (e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>) => { x: number; y: number };
}

export function usePlantDragging({
  garden,
  plants,
  selectedPlant,
  setSelectedPlant,
  scale,
}: UsePlantDraggingProps): UsePlantDraggingReturn {
  const updatePlant = useUpdatePlant();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      
      return { x, y };
    },
    [scale]
  );

  const findPlantAtPoint = useCallback(
    (x: number, y: number) => {
      return plants?.find((plant) => {
        return (
          x >= plant.x &&
          x <= plant.x + plant.width &&
          y >= plant.y &&
          y <= plant.y + plant.height
        );
      });
    },
    [plants]
  );

  const startDrag = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
      const { x, y } = getCanvasCoordinates(e, canvasRef);
      const clickedPlant = findPlantAtPoint(x, y);

      if (clickedPlant) {
        setSelectedPlant(clickedPlant);
        setIsDragging(true);
        setDragOffset({
          x: x - clickedPlant.x,
          y: y - clickedPlant.y,
        });
      }
    },
    [getCanvasCoordinates, findPlantAtPoint, setSelectedPlant]
  );

  const updateDrag = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
      if (!isDragging || !selectedPlant || !garden) return;

      const { x, y } = getCanvasCoordinates(e, canvasRef);
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;

      // Constrain plant within garden bounds
      const constrainedX = Math.max(0, Math.min(garden.width - selectedPlant.width, newX));
      const constrainedY = Math.max(0, Math.min(garden.height - selectedPlant.height, newY));

      // Update selected plant position with quarter precision
      setSelectedPlant({
        ...selectedPlant,
        x: Math.round(constrainedX * 4) / 4,
        y: Math.round(constrainedY * 4) / 4,
      });
    },
    [isDragging, selectedPlant, garden, dragOffset, getCanvasCoordinates, setSelectedPlant]
  );

  const endDrag = useCallback(() => {
    if (isDragging && selectedPlant && selectedPlant._id) {
      // Save the plant's new position to the database
      updatePlant.mutate({
        id: selectedPlant._id,
        x: selectedPlant.x,
        y: selectedPlant.y,
      });
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, selectedPlant, updatePlant]);

  return {
    isDragging,
    dragOffset,
    startDrag,
    updateDrag,
    endDrag,
    findPlantAtPoint,
    getCanvasCoordinates,
  };
}