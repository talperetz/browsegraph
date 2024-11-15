import { Edge, Node } from "@xyflow/react";

export const hexColors = [
  "#6d28d9",
  "#facc15",
  "#ea580c",
  "#dc2626",
  "#f4f4f5",
  "#3b82f6",
  "#4ade80",
];

const relationshipColorMap: Record<string, string> = {};

export const getColorForRelationshipType = (type: string): string => {
  if (!relationshipColorMap[type]) {
    relationshipColorMap[type] =
      hexColors[Object.keys(relationshipColorMap).length % hexColors.length];
  }

  return relationshipColorMap[type];
};

export const getContrastingTextColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
};

export const generateDeterministicPosition = (
  seed: string,
  dimension: number,
) => {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash) % dimension;
};

export const layoutStorage = new Map<
  string,
  { nodes: Node[]; edges: Edge[] }
>();
