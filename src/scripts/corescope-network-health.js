/**
 * corescope-network-health.js
 *
 * Browser-compatible ES module for querying a CoreScope server for node
 * counts and degraded-node counts, filtered to a subset of IATA regions.
 *
 * Mirrors what the CoreScope frontend itself does: hits `/api/nodes` with a
 * comma-separated `region` param and reuses the server-provided `counts`
 * object, then derives degraded status using the same thresholds the UI
 * ships in public/roles.js.
 */

// Defaults mirror window.HEALTH_THRESHOLDS in public/roles.js.
// Override by fetching /api/config/client if you want server-configured values.
const DEFAULT_THRESHOLDS = {
  nodeDegradedMs:   3_600_000,   // 1 hour — older than this = degraded
  nodeSilentMs:    86_400_000,   // 24 hours — older than this = silent (not degraded)
  infraDegradedMs: 86_400_000,   // 24 hours for repeaters / rooms
  infraSilentMs:  259_200_000,   // 72 hours
};

const ROLES = ['repeater', 'companion', 'room', 'sensor'];
const INFRA_ROLES = new Set(['repeater', 'room']);

/**
 * Fetch nodes for a set of regions. CoreScope's `region` query parameter
 * accepts a comma-separated list of IATA codes, exactly how RegionFilter
 * joins them in the UI.
 *
 * @param {Object}      opts
 * @param {string}      [opts.baseUrl='']  e.g. 'https://analyzer.example.net'
 *                                         (omit or '' for same-origin)
 * @param {string[]}    opts.regions       IATA codes, e.g. ['SJC', 'SFO', 'OAK']
 * @param {number}      [opts.limit=5000]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<{nodes: Array, counts: Object}>}
 */
export async function fetchNodes({ baseUrl = '', regions, limit = 5000, signal }) {
  if (!Array.isArray(regions) || regions.length === 0) {
    throw new Error('regions must be a non-empty array of IATA codes');
  }
  const params = new URLSearchParams({ limit: String(limit) });
  params.set('region', regions.join(','));

  const url = `${baseUrl}/api/nodes?${params}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET /api/nodes -> HTTP ${res.status}`);
  const data = await res.json();
  return { nodes: data.nodes ?? [], counts: data.counts ?? {} };
}

/**
 * Optionally pull the server's configured health thresholds. CoreScope
 * exposes them at /api/config/client under `healthThresholds` (see
 * public/roles.js). Falls back to the shipped defaults on any error.
 */
export async function fetchThresholds({ baseUrl = '', signal } = {}) {
  try {
    const res = await fetch(`${baseUrl}/api/config/client`, { signal });
    if (!res.ok) return { ...DEFAULT_THRESHOLDS };
    const cfg = await res.json();
    return { ...DEFAULT_THRESHOLDS, ...(cfg.healthThresholds ?? {}) };
  } catch {
    return { ...DEFAULT_THRESHOLDS };
  }
}

/**
 * Classify a single node as 'healthy' | 'degraded' | 'silent'.
 * Uses per-role thresholds — repeaters and rooms are infrastructure and get
 * the longer grace periods, same as the server's getHealthThresholds().
 */
export function classifyNode(node, thresholds = DEFAULT_THRESHOLDS, now = Date.now()) {
  const role = String(node.role ?? '').toLowerCase();
  const isInfra = INFRA_ROLES.has(role);
  const degradedMs = isInfra ? thresholds.infraDegradedMs : thresholds.nodeDegradedMs;
  const silentMs   = isInfra ? thresholds.infraSilentMs   : thresholds.nodeSilentMs;

  const ts = node.last_heard ?? node.last_seen;
  const lastMs = ts ? Date.parse(ts) : NaN;
  if (!Number.isFinite(lastMs)) return 'silent';

  const age = now - lastMs;
  if (age < degradedMs) return 'healthy';
  if (age < silentMs)   return 'degraded';
  return 'silent';
}

/**
 * Query network health across a set of regions. Uses the server's own
 * `counts` response for role totals, and derives the degraded count locally
 * using the same thresholds the UI uses.
 *
 * @returns {Promise<{
 *   total: number,
 *   degraded: number,
 *   silent: number,
 *   byRole: {repeater:number, companion:number, room:number, sensor:number},
 *   regions: string[],
 * }>}
 */
export async function queryNetworkHealth({ baseUrl = '', regions, signal, thresholds }) {
  const [{ nodes, counts }, thr] = await Promise.all([
    fetchNodes({ baseUrl, regions, signal }),
    thresholds ? Promise.resolve(thresholds) : fetchThresholds({ baseUrl, signal }),
  ]);

  // Role counts: prefer server-provided counts, fall back to local tally.
  const byRole = Object.fromEntries(ROLES.map(r => [r, 0]));
  if (counts && ROLES.some(r => typeof counts[r] === 'number')) {
    for (const r of ROLES) byRole[r] = counts[r] ?? 0;
  } else {
    for (const n of nodes) {
      const r = String(n.role ?? '').toLowerCase();
      if (byRole[r] !== undefined) byRole[r]++;
    }
  }
  const total = byRole.repeater + byRole.companion + byRole.room + byRole.sensor;

  // Degraded/silent tallies — computed from the nodes we got back.
  let degraded = 0, silent = 0;
  const now = Date.now();
  for (const n of nodes) {
    const s = classifyNode(n, thr, now);
    if (s === 'degraded') degraded++;
    else if (s === 'silent') silent++;
  }

  return { total, degraded, silent, byRole, regions };
}

/**
 * Format the result in the same style as CoreScope's UI:
 *   "2,536 nodes — 1,762 repeaters · 588 companions · 185 rooms · 1 sensor"
 *   "1 degraded"
 */
export function formatSummary({ total, byRole, degraded }) {
  const { repeater, companion, room, sensor } = byRole;
  const parts = [
    `${repeater.toLocaleString()} repeaters`,
    `${companion.toLocaleString()} companions`,
    `${room.toLocaleString()} rooms`,
    `${sensor.toLocaleString()} ${sensor === 1 ? 'sensor' : 'sensors'}`,
  ];
  return (
    `${total.toLocaleString()} nodes — ${parts.join(' · ')}\n` +
    `${degraded.toLocaleString()} degraded`
  );
}
