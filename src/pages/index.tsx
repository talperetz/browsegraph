import { Background, ReactFlow } from "@xyflow/react";
import React from "react";

import "@xyflow/react/dist/style.css";
import DefaultLayout from "@/layouts/default";
import { subtitle, title } from "@/components/primitives";
import { CommandMenu } from "@/components/command-menu";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <ReactFlow
        fitView
        colorMode="dark"
        edges={[]}
        nodes={[]}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 h-screen relative">
          <div className="inline-block max-w-lg text-center relative z-20">
            <h1 className={title()}>BrowseGraph&nbsp;</h1>
            <h4 className={subtitle({ class: "mt-4" })}>
              The 2nd brain for visual thinkers
            </h4>
            <CommandMenu />
          </div>
        </section>
      </ReactFlow>
    </DefaultLayout>
  );
}
