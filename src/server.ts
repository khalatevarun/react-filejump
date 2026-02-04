import launchEditor from "launch-editor";
import path from "path";
import http from "http";
import fs from "fs";

const PORT = 5555;
const HOST = "127.0.0.1";

interface OpenFileRequest {
  filePath: string;
  componentName?: string;
  isUsageMode?: boolean;
}

const resolvePath = (filePath: string): string | null => {
  const relativePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

  if (relativePath.includes("..")) {
    return null;
  }

  const absolutePath = path.join(process.cwd(), relativePath);

  if (!absolutePath.startsWith(process.cwd())) {
    return null;
  }

  return fs.existsSync(absolutePath) ? absolutePath : null;
};

const parseBody = (req: http.IncomingMessage): Promise<string> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
};

const sendJson = (res: http.ServerResponse, status: number, data: object) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
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
      const { filePath, componentName, isUsageMode } = JSON.parse(body) as OpenFileRequest;

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

      launchEditor(absolutePath, (_, errorMsg) => {
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

server.on("error", (err: NodeJS.ErrnoException) => {
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
