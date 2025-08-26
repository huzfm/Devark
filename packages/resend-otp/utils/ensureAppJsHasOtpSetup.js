import fs from "fs";

export function ensureAppJsHasOtpSetup(entryFilePath) {
      let content = fs.readFileSync(entryFilePath, "utf8");

      if (!content.includes("express.json()")) {
            content = content.replace(
                  /const app = express\(\);/,
                  `const app = express();\napp.use(express.json());`
            );
      }

      if (!content.includes("otpRoutes")) {
            content =
                  `import otpRoutes from "./routes/otpRoutes.js";\n` +
                  content.replace(
                        /app\.listen\([^)]*\);/,
                        `app.use("/", otpRoutes);\n\n$&`
                  );
      }

      fs.writeFileSync(entryFilePath, content, "utf8");
}
