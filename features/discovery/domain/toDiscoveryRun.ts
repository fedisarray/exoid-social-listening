import type { DiscoveryRun } from "../schemas/discoveryRun";
import { discoveryRunSchema } from "../schemas/discoveryRun";
export function toDiscoveryRun(row: unknown): DiscoveryRun {
  return discoveryRunSchema.parse(row);
}
