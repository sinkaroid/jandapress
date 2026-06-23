import { Registry, Gauge, Counter } from "prom-client";
import type { MiddlewareHandler } from "hono";

const registry = new Registry();

// ── PRD Metrics ─────────────────────────────────────

const rss = new Gauge({
  name: "process_resident_set_size_bytes",
  help: "Resident Set Size — total physical RAM used by the process",
  registers: [registry],
});

const jscMemory = new Gauge({
  name: "bun_edge_format_memory",
  help: "JavaScriptCore heap memory allocation (Bun-specific)",
  registers: [registry],
});

const eventloopLag = new Gauge({
  name: "eventloop_lag_seconds",
  help: "Event loop lag — delay of the event loop for synchronous blocking detection",
  registers: [registry],
});

// ── Extended Metrics ────────────────────────────────

const cpuTotal = new Counter({
  name: "process_cpu_seconds_total",
  help: "Total user + system CPU time spent (seconds)",
  registers: [registry],
});

const heapBytes = new Gauge({
  name: "process_heap_bytes",
  help: "Heap memory usage (used / total)",
  labelNames: ["state"] as const,
  registers: [registry],
});

const externalMemory = new Gauge({
  name: "process_external_memory_bytes",
  help: "External memory usage (C++ objects bound to JS objects)",
  registers: [registry],
});

const uptime = new Gauge({
  name: "process_start_time_seconds",
  help: "Start time of the process since unix epoch (seconds)",
  registers: [registry],
});

const inflight = new Gauge({
  name: "http_requests_in_flight",
  help: "Number of HTTP requests currently being processed (active)",
  labelNames: ["method"] as const,
  registers: [registry],
});

// ── In-Flight Middleware ────────────────────────────

const inflightMiddleware: MiddlewareHandler = async (c, next) => {
  inflight.inc({ method: c.req.method });
  try {
    await next();
  } finally {
    inflight.dec({ method: c.req.method });
  }
};

// ── Collector Logic ─────────────────────────────────

let cpuPrevious = { user: 0, system: 0 };
let processStartTime = Date.now();

function measureEventLoopLag(): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now();
    setTimeout(() => {
      resolve((performance.now() - start) / 1000);
    }, 0);
  });
}

async function collect() {
  // RSS
  rss.set(process.memoryUsage().rss);

  // Bun runtime — use process.memoryUsage().heapUsed as JSC proxy
  jscMemory.set(process.memoryUsage().heapUsed);

  // Event loop lag
  const lag = await measureEventLoopLag();
  eventloopLag.set(lag);

  // CPU
  const cpu = process.cpuUsage();
  const userDelta = cpu.user - cpuPrevious.user;
  const sysDelta = cpu.system - cpuPrevious.system;
  cpuPrevious = cpu;
  if (userDelta > 0 || sysDelta > 0) {
    cpuTotal.inc((userDelta + sysDelta) / 1_000_000);
  }

  // Heap (used / total)
  const heap = process.memoryUsage();
  heapBytes.set({ state: "used" }, heap.heapUsed);
  heapBytes.set({ state: "total" }, heap.heapTotal);

  // External
  externalMemory.set(heap.external);

  // Active handles & requests — Bun doesn't expose these
  // Skipped: _getActiveHandles/_getActiveRequests are Node.js internals
}

let interval: ReturnType<typeof setInterval> | null = null;

function startSystemMetrics(intervalMs = 15_000) {
  processStartTime = Date.now();
  uptime.set(Math.floor(processStartTime / 1000));
  cpuPrevious = process.cpuUsage();

  collect();
  interval = setInterval(collect, intervalMs);
}

function stopSystemMetrics() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export {
  registry,
  inflightMiddleware,
  startSystemMetrics,
  stopSystemMetrics,
};
