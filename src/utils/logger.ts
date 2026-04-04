const LOG_PREFIX = "[irrigation-card]";

let debugEnabled = false;

export function enableDebug(): void {
  debugEnabled = true;
  console.info(`${LOG_PREFIX} Debug logging enabled`);
}

export function disableDebug(): void {
  debugEnabled = false;
  console.info(`${LOG_PREFIX} Debug logging disabled`);
}

export function isDebugEnabled(): boolean {
  return debugEnabled;
}

export function logDiscovery(message: string, data?: unknown): void {
  if (!debugEnabled) return;
  if (data !== undefined) {
    console.log(`${LOG_PREFIX} [discovery] ${message}`, data);
  } else {
    console.log(`${LOG_PREFIX} [discovery] ${message}`);
  }
}

export function logServiceCall(
  domain: string,
  service: string,
  data: Record<string, unknown>,
): void {
  if (!debugEnabled) return;
  console.log(
    `${LOG_PREFIX} [service] ${domain}.${service}`,
    data,
  );
}

export function logRender(component: string, message: string, data?: unknown): void {
  if (!debugEnabled) return;
  if (data !== undefined) {
    console.log(`${LOG_PREFIX} [render] <${component}> ${message}`, data);
  } else {
    console.log(`${LOG_PREFIX} [render] <${component}> ${message}`);
  }
}
