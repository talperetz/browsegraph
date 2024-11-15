// SidePanelKnowledgeGraph.tsx
import React from "react";
import { ReactFlowProvider } from "@xyflow/react";

import KnowledgeGraph from "./KnowledgeGraph";

const SidePanelKnowledgeGraph: React.FC = () => {
  return (
    <ReactFlowProvider>
      <KnowledgeGraph />
    </ReactFlowProvider>
  );
};

export default SidePanelKnowledgeGraph;
