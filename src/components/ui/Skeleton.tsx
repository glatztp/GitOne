import React from "react";

export default function Skeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-slate-200 rounded animate-pulse" />
      ))}
    </div>
  );
}
