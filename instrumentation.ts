// Next.js instrumentation entry — register() runs once per server start.
// The node-only boot logic lives in instrumentation.node.ts and is imported through a
// NON-LITERAL specifier on purpose: the edge instrumentation bundle must not trace
// node-only modules (pg, node:fs) through this file (dev/Turbopack does not
// dead-code-eliminate conditional literal imports here).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const g = globalThis as unknown as { __midspotInstrumentationRan?: boolean };
  if (g.__midspotInstrumentationRan) return;
  g.__midspotInstrumentationRan = true;
  const specifier = "./instrumentation.node";
  const mod = (await import(specifier)) as { registerNode: () => Promise<void> };
  await mod.registerNode();
}
