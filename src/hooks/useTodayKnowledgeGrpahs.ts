import { useEffect, useRef, useState } from "react";
import { Edge, MarkerType, Node } from "@xyflow/react";
import * as d3 from "d3";

import {
  generateDeterministicPosition,
  getColorForRelationshipType,
  getContrastingTextColor,
} from "@/sidepanel/utils";
import { getTodayKnowledgeGraphsFromDB } from "@/lib/storage";

const useTodayGraphsData = (dimensions: { width: number; height: number }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const hasLayoutRun = useRef(false);

  useEffect(() => {
    const loadTodayGraphs = async () => {
      setLoading(true);
      const graphs = await getTodayKnowledgeGraphsFromDB();

      if (!graphs.length) {
        setLoading(false);

        return;
      }

      const allNodes: Node[] = [];
      const allEdges: Edge[] = [];
      const nodeIdSet = new Set<string>();

      graphs.forEach((graph) => {
        graph.nodes.forEach((node) => {
          let nodeId = node.id;

          // Handle duplicate node IDs
          if (nodeIdSet.has(nodeId)) {
            console.warn(`Duplicate node ID found: ${nodeId}`);
            // Append a unique suffix if nodes are different
            nodeId = `${nodeId}-${graph.createdAt}`;
          }
          nodeIdSet.add(nodeId);

          const bgColor = getColorForRelationshipType(node.type);
          const textColor = getContrastingTextColor(bgColor);

          const x = generateDeterministicPosition(
            `node-${nodeId}-x`,
            dimensions.width,
          );
          const y = generateDeterministicPosition(
            `node-${nodeId}-y`,
            dimensions.height,
          );

          allNodes.push({
            id: nodeId,
            data: { label: node.id }, // Use node.id or node.type as needed
            position: { x, y },
            style: {
              backgroundColor: bgColor,
              color: textColor,
              padding: "8px",
              borderRadius: "4px",
              border: "none",
            },
          });
        });

        graph.relationships.forEach((rel) => {
          let sourceId = rel.sourceNodeId;
          let targetId = rel.targetNodeId;

          // Adjust source and target IDs if they were modified
          if (nodeIdSet.has(`${sourceId}-${graph.createdAt}`)) {
            sourceId = `${sourceId}-${graph.createdAt}`;
          }
          if (nodeIdSet.has(`${targetId}-${graph.createdAt}`)) {
            targetId = `${targetId}-${graph.createdAt}`;
          }

          allEdges.push({
            id: `${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            label: rel.relationshipType,
            markerEnd: { type: MarkerType.Arrow },
            style: { stroke: "#d4d4d8" },
          });
        });
      });

      // Verify edges to ensure source and target nodes exist
      const filteredEdges = allEdges.filter((edge) => {
        const sourceExists = nodeIdSet.has(edge.source);
        const targetExists = nodeIdSet.has(edge.target);

        if (!sourceExists) {
          console.warn(`Source node not found: ${edge.source}`);
        }
        if (!targetExists) {
          console.warn(`Target node not found: ${edge.target}`);
        }

        return sourceExists && targetExists;
      });

      // Layout only once for all nodes and edges
      if (!hasLayoutRun.current) {
        const simulation = d3
          // @ts-ignore
          .forceSimulation(allNodes)
          .force("charge", d3.forceManyBody().strength(-300))
          .force(
            "link",
            d3
              .forceLink(filteredEdges)
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

        const layoutedNodes = allNodes.map((node) => ({
          ...node,
          position: {
            x: (node as any).x,
            y: (node as any).y,
          },
        }));

        const updatedEdges = filteredEdges.map((edge) => ({
          ...edge,
          // @ts-ignore
          source: edge.source.id || edge.source,
          // @ts-ignore
          target: edge.target.id || edge.target,
        }));

        setNodes(layoutedNodes);
        setEdges(updatedEdges);
        hasLayoutRun.current = true;
      }

      setLoading(false);
    };

    loadTodayGraphs();
  }, [dimensions.width, dimensions.height]);

  return { nodes, edges, loading };
};

export default useTodayGraphsData;
