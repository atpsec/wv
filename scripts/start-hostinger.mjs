import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const standaloneServer = fileURLToPath(new URL("../.next/standalone/server.js", import.meta.url));
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const port = process.env.PORT || "3000";
const dataDir = process.env.DATA_DIR ? path.resolve(projectRoot, process.env.DATA_DIR) : path.join(projectRoot, "data");
const child = spawn(process.execPath, [standaloneServer], {
  stdio: "inherit",
  env: { ...process.env, PORT: port, HOSTNAME: "0.0.0.0", DATA_DIR: dataDir }
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
