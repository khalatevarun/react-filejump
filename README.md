# react-filejump

Jump from any React component in the browser to its source file in your editor.

- **Alt+Click** — open the component's source file
- **Alt+Shift+Click** — open the file where the component is used (parent)

Works with React 16.8+ and any editor (VS Code, Cursor, WebStorm, etc.).

## Install

```bash
npm install react-filejump
```

## Setup

**1. Import once** at the top of your app entry file:

```tsx
import "react-filejump";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

**2. Start the server** in a separate terminal from your project root:

```bash
npx filejump-server
```

That's it. The server auto-detects your running editor and opens files automatically.

## How It Works

1. You Alt+Click on any element in your React app
2. react-filejump finds the React component that rendered it
3. The server resolves the file path and opens it in your editor

The server auto-detects editors by checking running processes. Supported: VS Code, Cursor, WebStorm, IntelliJ, Sublime, Atom, Vim, and more.

## Configuration

Override the editor with an environment variable:

```bash
LAUNCH_EDITOR=cursor npx filejump-server
```

Or set `VISUAL` or `EDITOR` in your shell profile.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Server not running" | Run `npx filejump-server` from your project root |
| File doesn't open | Ensure your editor CLI is on PATH (`code --version`) |
| No source location found | Import `react-filejump` before React renders |

## License

MIT
