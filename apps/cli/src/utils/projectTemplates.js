export const entryTemplates = {
  js: `import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Welcome to your new Devark app!");
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
`,

  ts: `import express, { Request, Response, Application } from "express";

const app: Application = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Welcome to your new Devark TypeScript app!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`✅ Server running on port \${PORT}\`));
`,
};

export const tsConfigTemplate = {
  compilerOptions: {
    target: "ESNext",
    module: "NodeNext",
    moduleResolution: "NodeNext",
    esModuleInterop: true,
    strict: true,
    skipLibCheck: true,
    outDir: "dist",
  },
  include: ["src/**/*"],
};
