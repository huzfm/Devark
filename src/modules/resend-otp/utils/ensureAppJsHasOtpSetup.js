import fs from "fs";
import path from "path";


export function ensureAppJsHasOtpSetup(appPath, language = "JavaScript") {
  const isTS = language === "TypeScript";
  const ext = isTS ? ".ts" : ".js";

  if (!fs.existsSync(appPath)) {
    console.warn(`⚠️ File not found: ${appPath}. Aborting update.`);
    return;
  }

  let content = fs.readFileSync(appPath, "utf-8");

  
  const requiredImports = [`import otpRoutes from './routes/otpRoutes.js'`];

  
  const requiredMiddleware = [
    "app.use(express.json())",
    "app.use('/', otpRoutes)",
  ];

  
  if (!content.trim()) {
    const scaffold = `
${requiredImports.join(";\n")};

const app${isTS ? ": Application" : ""} = express();

${requiredMiddleware.join(";\n")};

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
`.trim();

    fs.writeFileSync(appPath, scaffold, "utf-8");
    return;
  }

  
  let lines = content.split("\n");

  
  const trimmedImports = requiredImports.map((imp) => imp.trim());
  lines = lines.filter((line) => !trimmedImports.includes(line.trim()));

  
  lines = [...requiredImports, "", ...lines];

  // Ensure app initialization exists
  let appIndex = lines.findIndex((line) =>
    /(?:const|let|var)\s+app\s*[:=]/.test(line)
  );

  if (appIndex === -1) {
    lines.push(
      "",
      isTS ? "const app: Application = express();" : "const app = express();"
    );
    appIndex = lines.findIndex((line) =>
      /(?:const|let|var)\s+app\s*[:=]/.test(line)
    );
  }

  // Remove old middleware (to prevent duplicates)
  const mwKeywords = ["app.use(express.json", "app.use('/"];
  lines = lines.filter(
    (line) => !mwKeywords.some((kw) => line.trim().startsWith(kw))
  );

  
  lines.splice(appIndex + 1, 0, ...requiredMiddleware, "");

  // Add listener if missing
  if (!lines.some((line) => /app\.listen/.test(line))) {
    lines.push(
      "",
      "app.listen(3000, () => {",
      "  console.log('Server running on http://localhost:3000');",
      "});"
    );
  }

  fs.writeFileSync(appPath, lines.join("\n"), "utf-8");
}
