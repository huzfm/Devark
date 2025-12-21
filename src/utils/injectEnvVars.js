import fs from "fs";
import path from "path";

export function injectEnvVars(targetPath, vars) {
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

  
  const tmpPath = envPath + ".tmp";
  try {
    fs.writeFileSync(tmpPath, content, "utf-8");
    
    try {
      const fd = fs.openSync(tmpPath, "r");
      fs.fsyncSync(fd);
      fs.closeSync(fd);
    } catch (err) {
      
    }
    fs.renameSync(tmpPath, envPath);
  } catch (err) {
    
    fs.writeFileSync(envPath, content, "utf-8");
  }
}
