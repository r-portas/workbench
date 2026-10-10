const TIMEOUT_MS = 10_000;

/**
 * Fetches an upstream URL with a timeout, throwing on a non-2xx status.
 *
 * @remarks
 * The timeout stops one slow source from holding up its whole section.
 */
export async function fetchUpstream(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res;
}
