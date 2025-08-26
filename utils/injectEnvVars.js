import fs from "fs";
import path from "path";

export function injectEnvVars(targetPath, vars) {
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

      fs.writeFileSync(
            envPath,
            Array.from(envMap.entries())
                  .map(([k, v]) => `${k}=${v}`)
                  .join("\n"),
            "utf-8"
      );
      console.log("✅ .env updated");
}
