import fs from "fs";

const requiredImports = [
      "import otpRoutes from './routes/otpRoutes.js'",
];

const requiredMiddleware = [
      "app.use(express.json())",
      "app.use('/', otpRoutes)",
];

export async function ensureAppJsHasOtpSetup(appJsPath) {
      if (!fs.existsSync(appJsPath) || !fs.lstatSync(appJsPath).isFile()) {
            throw new Error(`❌ Provided path is not a file: ${appJsPath}`);
      }

      let content = fs.readFileSync(appJsPath, "utf-8");
      let lines = content.split("\n");

      // ✅ Remove old imports (prevent duplicates)
      lines = lines.filter(
            (line) => !requiredImports.includes(line.trim())
      );

      // ✅ Insert required imports at the top
      lines = [...requiredImports, "", ...lines];

      // ✅ Ensure app = express() exists
      const appLineIndex = lines.findIndex((line) =>
            /(?:const|let|var)\s+app\s*=\s*express\s*\(\)/.test(line)
      );

      if (appLineIndex === -1) {
            lines.push("", "const app = express()");
      }

      const finalAppLineIndex = lines.findIndex((line) =>
            /(?:const|let|var)\s+app\s*=\s*express\s*\(\)/.test(line)
      );

      // ✅ Remove old middleware lines (prevent duplicates)
      const middlewareKeywords = [
            "app.use(express.json()",
            "app.use('/', otpRoutes)",
      ];
      lines = lines.filter(
            (line) =>
                  !middlewareKeywords.some((keyword) =>
                        line.trim().startsWith(keyword)
                  )
      );

      // ✅ Insert middlewares after `app = express()`
      lines.splice(finalAppLineIndex + 1, 0, ...requiredMiddleware);

      fs.writeFileSync(appJsPath, lines.join("\n"), "utf-8");
}
