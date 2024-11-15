import React, { useEffect, useRef } from "react";
import { Background, ReactFlow, useReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import useResizeObserver from "@/hooks/useResizeObserver";
import useGraphData from "@/hooks/useGraphData";

const KnowledgeGraph: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(wrapperRef);
  const { nodes, edges } = useGraphData(dimensions);
  const { fitView } = useReactFlow();

  // Trigger fitView when nodes, edges, or dimensions change
  useEffect(() => {
    fitView({ duration: 500, padding: 0.1 });
  }, [fitView, nodes, edges, dimensions]);

  return (
    <div
      ref={wrapperRef}
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <ReactFlow
        fitView
        colorMode="dark"
        edges={edges}
        nodes={nodes}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeGraph;
