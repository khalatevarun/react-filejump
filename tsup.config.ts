import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs", "iife"],
    dts: true,
    clean: true,
    globalName: "ReactJump",
  },
  {
    entry: ["src/server.ts"],
    format: ["esm", "cjs"],
    dts: true,
    external: ["launch-editor"],
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
