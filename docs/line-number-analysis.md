# Line number analysis: what we want vs what we had

## What we wanted

1. **Alt+Click (definition)**  
   Open the file where the component is **defined**, ideally at the line of the component (e.g. the function or the start of the component).

2. **Alt+Shift+Click (usage)**  
   Open the file where the component is **used**, at the **exact line** of the JSX (e.g. `<Card ...>` in `BlogPost.tsx` at line 26).

## What we had (getOwnerStack)

We used **bippy’s `getOwnerStack(fiber)`**, which returns an array of stack frames (one per component in the owner chain). For each frame we used `fileName`, `lineNumber`, `columnNumber`.

- **depth=0** (definition): We used `ownerStack[0]`. We got the right **file** (e.g. `Card.tsx`). The **line** was often a “definition” line (e.g. interface or function start), not necessarily the opening line of the component. So: file correct, line “definition-ish” and sometimes not what you’d expect.

- **depth=1** (usage): We used `ownerStack[1]`. We got the right **file** (e.g. `BlogPost.tsx`) but the **line** was wrong (e.g. 6 instead of 26). In practice that line looked like where the **parent component is defined** (e.g. `BlogPost` function/interface), not where `<Card>` is used in the parent.

So: **reactjump did not implement the usage line number correctly.**  
We had the right file for both cases, but:
- Definition line: often a definition line, but not guaranteed to be the component’s “start” line.
- Usage line: wrong; it reflected the parent’s definition, not the JSX usage line.

## What bippy actually provides

Bippy has two different APIs:

### 1. `getOwnerStack(fiber)`

- Returns a **list of stack frames** for the owner chain.
- Each frame has `fileName`, `lineNumber`, `columnNumber`, `functionName`.
- In practice, those line numbers behave like **definition/call-site** lines (e.g. function/component definition), not like “the line of the JSX that uses this component.”

So **getOwnerStack is not the right tool for “usage line”**.

### 2. `getSource(fiber)` (bippy/source)

From bippy’s types and README:

- **Semantics:** “Returns the source of **where the component is used**.”
- Example: for `<Child />` in `Parent`, `getSource(childFiber)` gives the **parent’s file and the line of the JSX** where `<Child>` is used (the “captures THIS line” line).

So for **usage** (Alt+Shift+Click), the correct approach is:

- Take the **composite fiber** of the component that rendered the clicked element (e.g. `Card`).
- Call **`getSource(thatFiber)`**.
- Use the returned `fileName` and `lineNumber` (and optionally `columnNumber`) as the **usage** location.

That would give the correct usage file and usage line (e.g. `BlogPost.tsx:26`).

## Summary

| Goal              | What we did              | Correct? | Better approach (if we re‑add line numbers)        |
|-------------------|---------------------------|----------|-----------------------------------------------------|
| Definition file   | `getOwnerStack` frame[0]  | Yes      | Keep same                                           |
| Definition line   | same frame’s lineNumber   | Unreliable | Keep or drop; no bippy API that clearly says “component start line” |
| Usage file        | `getOwnerStack` frame[1]  | Yes      | Keep same (or derive from getSource)                |
| Usage line        | same frame’s lineNumber   | No       | Use **getSource(componentFiber)** for file + line   |

So: **reactjump does not implement the (usage) line number correctly** when using only `getOwnerStack`. To implement it correctly, we’d use **`getSource` for the usage case** (and optionally keep or drop definition line as-is).
