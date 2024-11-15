import { useEffect, useRef, useState } from "react";
import { Edge, MarkerType, Node } from "@xyflow/react";
import * as d3 from "d3";

import { getKnowledgeGraphFromDB } from "@/lib/storage";
import useCurrentUrl from "@/hooks/useCurrentUrlHook";
import {
  generateDeterministicPosition,
  getColorForRelationshipType,
  getContrastingTextColor,
  layoutStorage,
} from "@/sidepanel/utils";

const useGraphData = (dimensions: { width: number; height: number }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const currentUrl = useCurrentUrl();
  const hasLayoutRun = useRef(false);

  useEffect(() => {
    const loadGraph = async () => {
      const graph = await getKnowledgeGraphFromDB(currentUrl);

      if (!graph) return;

      const cachedLayout = layoutStorage.get(currentUrl);

      if (cachedLayout) {
        setNodes(cachedLayout.nodes);
        setEdges(cachedLayout.edges);

        return;
      }

      const flowNodes: Node[] = graph.nodes.map((node) => {
        const bgColor = getColorForRelationshipType(node.type);
        const textColor = getContrastingTextColor(bgColor);

        const x = generateDeterministicPosition(
          `${currentUrl}-${node.id}-x`,
          dimensions.width,
        );
        const y = generateDeterministicPosition(
          `${currentUrl}-${node.id}-y`,
          dimensions.height,
        );

        return {
          id: node.id,
          data: { label: node.id },
          position: { x, y },
          style: {
            backgroundColor: bgColor,
            color: textColor,
            padding: "8px",
            borderRadius: "4px",
            border: "none",
          },
        };
      });

      const flowEdges: Edge[] = graph.relationships.map((rel) => ({
        id: `${rel.sourceNodeId}-${rel.targetNodeId}`,
        source: rel.sourceNodeId,
        target: rel.targetNodeId,
        label: rel.relationshipType,
        markerEnd: { type: MarkerType.Arrow },
        style: { stroke: "#d4d4d8" },
      }));

      if (!hasLayoutRun.current) {
        const simulation = d3
          // @ts-ignore
          .forceSimulation(flowNodes)
          .force("charge", d3.forceManyBody().strength(-300))
          .force(
            "link",
            d3
              .forceLink(flowEdges)
              .id((d: any) => d.id)
              .distance(150),
          )
          .force(
            "center",
            d3.forceCenter(dimensions.width / 2, dimensions.height / 2),
          )
          .stop();

        for (let i = 0; i < 100; i++) {
          simulation.tick();
        }

        const layoutedNodes = flowNodes.map((node) => ({
          ...node,
          position: {
            x: (node as any).x,
            y: (node as any).y,
          },
        }));

        const updatedEdges = flowEdges.map((edge) => ({
          ...edge,
          // @ts-ignore
          source: edge.source.id || edge.source,
          // @ts-ignore
          target: edge.target.id || edge.target,
        }));

        layoutStorage.set(currentUrl, {
          nodes: layoutedNodes,
          edges: updatedEdges,
        });

        setNodes(layoutedNodes);
        setEdges(updatedEdges);
        hasLayoutRun.current = true;
      }
    };

    loadGraph();
  }, [currentUrl, dimensions.width, dimensions.height]);

  return { nodes, edges };
};

export default useGraphData;
