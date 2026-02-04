"use strict";

// src/index.ts
var import_bippy2 = require("bippy");

// src/context.ts
var import_bippy = require("bippy");
var import_source = require("bippy/source");
var getSourceLocation = async (element, depth = 0) => {
  if (!(0, import_bippy.isInstrumentationActive)()) return null;
  const hostFiber = (0, import_bippy.getFiberFromHostInstance)(element);
  if (!hostFiber) return null;
  const ownerStack = await (0, import_source.getOwnerStack)(hostFiber);
  if (!ownerStack || ownerStack.length === 0) return null;
  const userLandFrames = ownerStack.filter((frame2) => {
    if (!frame2.fileName) return false;
    const normalized = (0, import_source.normalizeFileName)(frame2.fileName);
    return (0, import_source.isSourceFile)(normalized) && !normalized.includes("node_modules");
  });
  if (userLandFrames.length === 0) return null;
  const targetIndex = Math.min(depth, userLandFrames.length - 1);
  const frame = userLandFrames[targetIndex];
  return {
    fileName: (0, import_source.normalizeFileName)(frame.fileName),
    componentName: frame.functionName
  };
};

// src/editor.ts
var SERVER_URL = "http://localhost:5555";
var openInEditor = async (sourceLocation, clickedComponentName, isUsageMode) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3e3);
    const response = await fetch(`${SERVER_URL}/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filePath: sourceLocation.fileName,
        componentName: clickedComponentName,
        isUsageMode
      }),
      signal: controller.signal
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

// src/core.ts
var init = () => {
  document.addEventListener("click", async (event) => {
    if (!event.altKey) return;
    event.preventDefault();
    const target = event.target;
    if (!(target instanceof Element)) return;
    const isUsageMode = event.shiftKey;
    const clickedComponent = await getSourceLocation(target, 0);
    if (!clickedComponent) return;
    const targetLocation = isUsageMode ? await getSourceLocation(target, 1) : clickedComponent;
    if (targetLocation) {
      await openInEditor(targetLocation, clickedComponent.componentName, isUsageMode);
    }
  });
};

// src/index.ts
try {
  (0, import_bippy2.instrument)({ name: "react-filejump" });
} catch (error) {
  console.warn("[filejump] Failed to initialize bippy:", error);
}
init();
