import "@/styles/globals.css";
import "@/styles/globals-v2.scss";
import "@/styles/index.module.scss";

import { Background, Controls, ReactFlow } from "@xyflow/react";
import React from "react";
import { Spinner } from "@nextui-org/spinner";
import "@xyflow/react/dist/style.css";

import DefaultLayout from "@/layouts/default";
import { subtitle, title } from "@/components/primitives";
import useTodayGraphsData from "@/hooks/useTodayKnowledgeGrpahs";
import { CommandMenu } from "@/components/command-menu";

export default function IndexPage() {
  const { nodes, edges, loading } = useTodayGraphsData({
    width: 800,
    height: 600,
  });

  return (
    <DefaultLayout>
      <ReactFlow
        fitView
        colorMode="dark"
        edges={edges}
        nodes={nodes}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 h-screen relative">
          <div className="inline-block max-w-lg text-center relative z-20">
            <h1 className={title()}>BrowseGraph&nbsp;</h1>
            <h4 className={subtitle({ class: "mt-4" })}>
              The 2nd brain for visual thinkers
            </h4>
            <CommandMenu />
          </div>
          <div className="mt-8">{loading && <Spinner />}</div>
        </section>
      </ReactFlow>
    </DefaultLayout>
  );
}
