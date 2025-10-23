#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { detect } from "package-manager-detector/detect";

type SupportedPackageManager = "pnpm" | "npm" | "yarn" | "bun" | "deno";

function isGitRepo(directory: string): boolean {
  // Walk up until filesystem root or no .git and no enclosing repo
  let current: string | null = directory;
  // To avoid infinite loops
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    seen.add(current);
    const gitPath = path.join(current, ".git");
    if (fs.existsSync(gitPath)) {
      return true;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return false;
}

// Package manager detection is delegated to `package-manager-detector`.

async function runShadcnVueAdd(manager: SupportedPackageManager, forwardedArgs: readonly string[]): Promise<number> {
  // Map to the correct runner
  let command: string;
  let args: string[];

  switch (manager) {
    case "pnpm":
      command = "pnpm";
      args = ["dlx", "shadcn-vue@latest", "add", ...forwardedArgs];
      break;
    case "npm":
      command = "npx";
      args = ["shadcn-vue@latest", "add", ...forwardedArgs];
      break;
    case "yarn":
      command = "yarn";
      args = ["shadcn-vue@latest", "add", ...forwardedArgs];
      break;
    case "bun":
      command = "bunx";
      args = ["--bun", "shadcn-vue@latest", "add", ...forwardedArgs];
      break;
    case "deno":
      command = "deno";
      // Use npm specifier to execute the shadcn-vue CLI from npm registry
      args = ["run", "-A", "npm:shadcn-vue@latest", "add", ...forwardedArgs];
      break;
    default:
      // Should be unreachable due to type
      throw new Error("Unsupported package manager");
  }

  const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  return await new Promise<number>((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function getCwd(): string {
  return process.cwd();
}

async function main(): Promise<void> {
  // Forward all args after the binary name. If user typed `tweakcn add ...`,
  // drop the leading `add` so we don't end up duplicating it.
  const rawArgs = process.argv.slice(2);
  const forwarded = rawArgs.length > 0 && rawArgs[0] === "add" ? rawArgs.slice(1) : rawArgs;
  const cwd = getCwd();
  const withinRepo = isGitRepo(cwd);

  if (!withinRepo) {
    console.error(
      "Error: Not inside an active git repository. Run this inside a repository with shadcn-vue initialized (see https://www.shadcn-vue.com/docs/cli.html#init)."
    );
    process.exit(1);
    return;
  }

  const detected = await detect();
  const manager = detected?.agent as SupportedPackageManager | undefined;
  if (!manager || !["pnpm", "npm", "yarn", "bun", "deno"].includes(manager)) {
    console.error(
      "Error: No package manager detected. Ensure your project is initialized and a supported package manager is used."
    );
    process.exit(1);
    return;
  }

  const exitCode = await runShadcnVueAdd(manager, forwarded);
  process.exit(exitCode);
}

// Top-level run with robust error surface
main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Unexpected error:", message);
  process.exit(1);
});
