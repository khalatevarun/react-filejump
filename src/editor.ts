import type { SourceLocation } from "./context";

const SERVER_URL = "http://localhost:5555";

export const openInEditor = async (
  sourceLocation: SourceLocation,
  clickedComponentName: string | undefined,
  isUsageMode: boolean
): Promise<void> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${SERVER_URL}/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filePath: sourceLocation.fileName,
        componentName: clickedComponentName,
        isUsageMode,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("[filejump]", data.error || "Failed to open file");
    }
  } catch {
    console.error("[filejump] Server not running. Start with: npx filejump-server");
  }
};
