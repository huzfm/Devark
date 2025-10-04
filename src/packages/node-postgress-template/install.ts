import path from "path";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import { installDepsWithChoice } from "../../utils/packageManager.js";
import { detectPackageManagerByCommnad } from "../../utils/packageManager.js";
// __dirname workaround
// Use process.argv[1] for CommonJS compatibility
const __filename = process.argv[1];
const __dirname = path.dirname(__filename);

export default async function runNodePostgresGenerator(targetPath: string) {
  console.log("\x1b[1m\x1b[32m🚀 Setting up Node.js + PostgreSQL + Prisma project...\x1b[0m");

  //detect package manager from command
  const packageManager = detectPackageManagerByCommnad();
  console.log(`📦 Using package manager: ${packageManager}`);

  // Ensure required folders exist
  const folders = ["prisma", "routes", "controllers"];
  folders.forEach((folder) => ensureDir(path.join(targetPath, folder)));

  // Templates directory
  const templatesDir = path.join(__dirname, "templates");

  // Core files
  renderTemplate(path.join(templatesDir, "app.ejs"), path.join(targetPath, "app.js"), {});
  renderTemplate(path.join(templatesDir, "env.example.ejs"), path.join(targetPath, ".env.example"), {});
  renderTemplate(path.join(templatesDir, "package.json.ejs"), path.join(targetPath, "package.json"), {});

  // Prisma schema
  renderTemplate(path.join(templatesDir, "schema.prisma.ejs"), path.join(targetPath, "prisma/schema.prisma"), {});

  // Example MVC boilerplate
  renderTemplate(path.join(templatesDir, "routes/userRoutes.ejs"), path.join(targetPath, "routes/userRoutes.js"), {});
  renderTemplate(
    path.join(templatesDir, "controllers/userController.ejs"),
    path.join(targetPath, "controllers/userController.js"),
    {}
  );

  // Add Instructions.md
  renderTemplate(path.join(templatesDir, "Instructions.ejs"), path.join(targetPath, "Instructions.md"), {});

  // Install dependencies
  const deps = ["express", "@prisma/client", "dotenv", "morgan", "nodemon"];
  const devDeps = ["prisma"];
  await installDepsWithChoice(targetPath, deps, packageManager);
  await installDepsWithChoice(targetPath, devDeps, packageManager);


  console.log(
    "\x1b[1m\x1b[32m✅ Node.js + PostgreSQL + Prisma project setup completed!\x1b[0m\n" +
    "📄 Please read the Instructions.md file for help on how to run and use your project."
  );

  console.log(
    "\x1b[1m\x1b[32m✅ Run the following commands:\x1b[0m\n"
  );

  console.log(
    "\x1b[36m npx prisma generate\x1b[0m"
  );

  console.log(
    "\x1b[36m npx prisma migrate dev --name init\x1b[0m\n"
  );

  console.log(
    "\x1b[33m Once done, you're all set! \x1b[0m"
  );
}
