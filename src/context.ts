import { getFiberFromHostInstance, isInstrumentationActive } from "bippy";
import { getOwnerStack, isSourceFile, normalizeFileName } from "bippy/source";

export interface SourceLocation {
    fileName: string;
    componentName?: string;
}

export const getSourceLocation = async (
    element: Element,
    depth: number = 0
): Promise<SourceLocation | null> => {
    if (!isInstrumentationActive()) return null;

    const hostFiber = getFiberFromHostInstance(element);
    if (!hostFiber) return null;

    const ownerStack = await getOwnerStack(hostFiber);
    if (!ownerStack || ownerStack.length === 0) return null;

    const userLandFrames = ownerStack.filter(frame => {
        if (!frame.fileName) return false;
        const normalized = normalizeFileName(frame.fileName);
        return isSourceFile(normalized) && !normalized.includes("node_modules");
    });

    if (userLandFrames.length === 0) return null;

    const targetIndex = Math.min(depth, userLandFrames.length - 1);
    const frame = userLandFrames[targetIndex];

    return {
        fileName: normalizeFileName(frame.fileName!),
        componentName: frame.functionName,
    };
};
