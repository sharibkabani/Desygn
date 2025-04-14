"use client";

import dynamic from "next/dynamic";

const ExcalidrawPrimitive = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

const Excalidraw = () => {
  return (
    <div className="relative h-[calc(100svh-72px)] overflow-hidden">
      <ExcalidrawPrimitive />
    </div>
  );
};

export default Excalidraw;
