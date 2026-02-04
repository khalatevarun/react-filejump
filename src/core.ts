import { getSourceLocation } from "./context";
import { openInEditor } from "./editor";

export const init = () => {
  document.addEventListener("click", async (event) => {
    if (!event.altKey) return;

    event.preventDefault();

    const target = event.target;
    if (!(target instanceof Element)) return;

    const isUsageMode = event.shiftKey;
    
    const clickedComponent = await getSourceLocation(target, 0);
    if (!clickedComponent) return;

    const targetLocation = isUsageMode 
      ? await getSourceLocation(target, 1) 
      : clickedComponent;
    
    if (targetLocation) {
      await openInEditor(targetLocation, clickedComponent.componentName, isUsageMode);
    }
  });
};
