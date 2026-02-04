#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_launch_editor = __toESM(require("launch-editor"), 1);
var import_path = __toESM(require("path"), 1);
var import_http = __toESM(require("http"), 1);
var import_fs = __toESM(require("fs"), 1);
var PORT = 5555;
var HOST = "127.0.0.1";
var resolvePath = (filePath) => {
  const relativePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  if (relativePath.includes("..")) {
    return null;
  }
  const absolutePath = import_path.default.join(process.cwd(), relativePath);
  if (!absolutePath.startsWith(process.cwd())) {
    return null;
  }
  return import_fs.default.existsSync(absolutePath) ? absolutePath : null;
};
var parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
};
var sendJson = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};
var server = import_http.default.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/open") {
    try {
      const body = await parseBody(req);
      const { filePath, componentName, isUsageMode } = JSON.parse(body);
      if (!filePath || typeof filePath !== "string") {
        return sendJson(res, 400, { error: "Missing or invalid filePath" });
      }
      const absolutePath = resolvePath(filePath);
      if (!absolutePath) {
        console.log(`[filejump] File not found: ${filePath}`);
        return sendJson(res, 404, { error: "File not found" });
      }
      const name = componentName || "component";
      const shortPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
      if (isUsageMode) {
        console.log(`[filejump] Opening "${name}" usage at: ${shortPath}`);
      } else {
        console.log(`[filejump] Opening source code for "${name}" at: ${shortPath}`);
      }
      (0, import_launch_editor.default)(absolutePath, (_, errorMsg) => {
        if (errorMsg) {
          console.error(`[filejump] Failed: ${errorMsg}`);
          return sendJson(res, 500, { error: errorMsg });
        }
        sendJson(res, 200, { success: true });
      });
    } catch (error) {
      console.error(`[filejump] Error:`, error);
      sendJson(res, 500, { error: "Internal server error" });
    }
    return;
  }
  sendJson(res, 404, { error: "Not found" });
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[filejump] Port ${PORT} already in use`);
  } else {
    console.error(`[filejump] Error: ${err.message}`);
  }
  process.exit(1);
});
server.listen(PORT, HOST, () => {
  console.log(`[filejump] Server: http://${HOST}:${PORT}`);
  console.log(`[filejump] Root: ${process.cwd()}`);
});
