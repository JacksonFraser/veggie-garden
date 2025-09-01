import { useCallback, useEffect } from "react";
import { Plant, RaisedBed, Garden, OptimisticRaisedBed } from "@/types";

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  garden: Garden | null | undefined;
  plants: Plant[] | undefined;
  raisedBeds: RaisedBed[] | undefined;
  optimisticBeds: OptimisticRaisedBed[];
  selectedPlant: Plant | null;
  selectedBed: RaisedBed | null;
  isDragging: boolean;
  scale: number;
}

interface UseCanvasDrawingReturn {
  drawGarden: () => void;
  drawGrid: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  drawRaisedBeds: (ctx: CanvasRenderingContext2D, beds: (RaisedBed | OptimisticRaisedBed)[]) => void;
  drawPlants: (ctx: CanvasRenderingContext2D, plantsToRender: Plant[]) => void;
  drawBackground: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export function useCanvasDrawing({
  canvasRef,
  garden,
  plants,
  raisedBeds,
  optimisticBeds,
  selectedPlant,
  selectedBed,
  isDragging,
  scale,
}: UseCanvasDrawingProps): UseCanvasDrawingReturn {
  
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw garden background (bare soil)
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, 0, width, height);
    },
    []
  );

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!garden) return;
      
      ctx.strokeStyle = "#A0522D";
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x <= garden.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= garden.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(width, y * scale);
        ctx.stroke();
      }
    },
    [garden, scale]
  );

  const drawRaisedBeds = useCallback(
    (ctx: CanvasRenderingContext2D, beds: (RaisedBed | OptimisticRaisedBed)[]) => {
      beds.forEach((bed) => {
        // Draw bed fill (rich soil)
        ctx.fillStyle = "#654321";
        ctx.fillRect(
          bed.x * scale,
          bed.y * scale,
          bed.width * scale,
          bed.height * scale
        );

        // Draw bed border (material)
        ctx.strokeStyle = bed.color;
        ctx.lineWidth = selectedBed?._id === bed._id ? 4 : 3;
        ctx.strokeRect(
          bed.x * scale,
          bed.y * scale,
          bed.width * scale,
          bed.height * scale
        );

        // Draw bed label
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        
        const labelX = (bed.x + bed.width / 2) * scale;
        const labelY = (bed.y + 0.15) * scale;
        
        ctx.strokeText(bed.name, labelX, labelY);
        ctx.fillText(bed.name, labelX, labelY);
      });
    },
    [selectedBed, scale]
  );

  const drawPlants = useCallback(
    (ctx: CanvasRenderingContext2D, plantsToRender: Plant[]) => {
      plantsToRender.forEach((plant) => {
        // Draw plant fill
        ctx.fillStyle = plant.color ?? "#10b981";
        ctx.fillRect(
          plant.x * scale,
          plant.y * scale,
          plant.width * scale,
          plant.height * scale
        );

        // Draw plant border
        ctx.strokeStyle = selectedPlant?._id === plant._id ? "#1f2937" : "#374151";
        ctx.lineWidth = selectedPlant?._id === plant._id ? 3 : 1;
        ctx.strokeRect(
          plant.x * scale,
          plant.y * scale,
          plant.width * scale,
          plant.height * scale
        );

        // Draw plant label
        ctx.fillStyle = "#000000";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        
        const labelX = (plant.x + plant.width / 2) * scale;
        const labelY = (plant.y + plant.height / 2) * scale + 4;
        const plantLabel = plant.name.substring(0, 8);
        
        ctx.strokeText(plantLabel, labelX, labelY);
        ctx.fillText(plantLabel, labelX, labelY);
      });
    },
    [selectedPlant, scale]
  );

  const drawGarden = useCallback(() => {
    if (!canvasRef.current || !garden) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = garden.width * scale;
    canvas.height = garden.height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Prepare beds to render (including optimistic ones)
    const bedsToRender = [...(raisedBeds || []), ...optimisticBeds];
    
    // Draw raised beds
    drawRaisedBeds(ctx, bedsToRender);

    // Prepare plants to render (handle dragging plant on top)
    let plantsToRender = plants || [];
    if (isDragging && selectedPlant) {
      // Move the dragged plant to the end so it renders on top
      const filteredPlants = plantsToRender.filter((p) => p._id !== selectedPlant._id);
      plantsToRender = [...filteredPlants, selectedPlant];
    }

    // Draw plants
    drawPlants(ctx, plantsToRender);
  }, [
    canvasRef,
    garden,
    plants,
    raisedBeds,
    optimisticBeds,
    selectedPlant,
    isDragging,
    scale,
    drawBackground,
    drawGrid,
    drawRaisedBeds,
    drawPlants,
  ]);

  // Throttled canvas redraw for better performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      drawGarden();
    }, 16); // ~60fps throttling

    return () => clearTimeout(timeoutId);
  }, [drawGarden]);

  return {
    drawGarden,
    drawGrid,
    drawRaisedBeds,
    drawPlants,
    drawBackground,
  };
}