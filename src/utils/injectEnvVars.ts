import fs from "fs";
import path from "path";

export function injectEnvVars(targetPath: string, vars: Record<string, string>) {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  const envPath = path.join(targetPath, ".env");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const envMap = new Map(
    envContent
    .split("\n")
    .filter(Boolean)
    .map((line) => {
          const [k, ...v] = line.split("=");
          return [k, v.join("=")];
    })
  );

  for (const [key, value] of Object.entries(vars)) {
    if (value) envMap.set(key, value);
  }

  const content = Array.from(envMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  // Write atomically: write to tmp file then rename.
  const tmpPath = envPath + ".tmp";
  try {
    fs.writeFileSync(tmpPath, content, 'utf-8');
    // Try to flush to disk (best-effort)
    try {
    const fd = fs.openSync(tmpPath, 'r');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    } catch (err) {
    // ignore fsync errors on environments that don't support it
    }
    fs.renameSync(tmpPath, envPath);
    console.log("✅ .env updated");
  } catch (err) {
    // Fallback: attempt direct write
    fs.writeFileSync(envPath, content, 'utf-8');
    console.log("✅ .env updated");
  }
}
