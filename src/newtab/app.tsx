import "@/styles/globals.css";
import "@/styles/globals-v2.scss";
import "@/styles/index.module.scss";

import { Background, Controls, ReactFlow } from "@xyflow/react";
import React from "react";
import "@xyflow/react/dist/style.css";

import { usePGlite } from "@electric-sql/pglite-react";
import { Spinner } from "@nextui-org/spinner";

import DefaultLayout from "@/layouts/default";
import useTodayGraphsData from "@/hooks/useTodayKnowledgeGrpahs";
import { CommandMenu } from "@/components/command-menu";
import BrowseGraphLogo from "@/assets/browsegraph-logo.svg";

export default function IndexPage() {
  const { nodes, edges, loading } = useTodayGraphsData({
    width: 800,
    height: 600,
  });

  const db = usePGlite();

  return (
    <DefaultLayout>
      <div className="absolute top-2 left-2 z-10">
        <a href="https://browsegraph.com" rel="noreferrer" target="_blank">
          <BrowseGraphLogo />
        </a>
      </div>
      <ReactFlow
        fitView
        colorMode="dark"
        edges={edges}
        nodes={nodes}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
        {db && <CommandMenu />}
        {loading && (
          <div className="mt-8">
            <Spinner />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
