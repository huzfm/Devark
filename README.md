<!DOCTYPE html>
<html lang="en">
<body>

  <h1>🧰 Devark</h1>
  <p><strong>Devark</strong> is a CLI tool that lets developers <strong>scaffold backend features</strong> with a single command. Think of it like <code>create-react-app</code>, but for backend boilerplate such as OAuth, email, and more.</p>

  <blockquote><strong>Example:</strong> <code>devark add oauth</code> will instantly scaffold and configure Google OAuth using Passport, including route setup, middleware, and <code>.env</code> integration.</blockquote>

  <h2>🚀 Features</h2>
  <ul>
    <li>📦 Modular backend components (<code>add oauth</code>, <code>add email-resend</code>, etc.)</li>
    <li>🛠 Express.js setup with auto-wired middleware</li>
    <li>🌐 OAuth (Google) authentication via Passport.js</li>
    <li>📧 Resend email integration (coming soon)</li>
    <li>🔧 Auto-updates <code>package.json</code>, <code>app.js</code>, and <code>.env</code></li>
    <li>⚡ Uses <code>pnpm</code> for fast installs (fallbacks to <code>npm</code>)</li>
  </ul>

  <h2>📁 Project Structure</h2>
  <pre><code>.
├── bin/                  # CLI entry
│   └── devark.js
├── modules/              # Feature modules (OAuth, Email, etc.)
│   └── oauth/
│       ├── templates/
│       └── index.js
├── templates/            # Common boilerplates
│   └── baseApp.js
├── utils/                # Shared utilities
│   ├── createFullAppJs.js
│   ├── ensureAppJsHasOAuthSetup.js
│   └── injectEnvVars.js
├── install.js            # CLI core logic
├── package.json
└── README.md</code></pre>

  <h2>🧑‍💻 Getting Started</h2>

  <h3>1. 📥 Clone the Repository</h3>
  <pre><code>git clone https://github.com/huzfm/devark.git
cd devark</code></pre>

  <h3>2. 📦 Install Dependencies</h3>
  <pre><code>pnpm install
# or
npm install</code></pre>

  <h3>3. 🔗 Link the CLI Globally (for local development)</h3>
  <pre><code>pnpm link
# or
npm link</code></pre>
  <p>You can now use <code>devark</code> as a global CLI command.</p>

  <h3>4. 🔐 Make the CLI Executable (for UNIX)</h3>
  <p>If your CLI entry is in <code>bin/devark.ts</code>, make it executable:</p>
  <pre><code>chmod +x cli/bin/devark.js</code></pre>

  <h2>⚙️ Usage</h2>

  <h3>✅ Add OAuth Setup</h3>
  <pre><code>devark add oauth</code></pre>
  <p>This command will:</p>
  <ul>
    <li>Add Passport and session setup to <code>app.js</code></li>
    <li>Install dependencies (<code>passport</code>, <code>express-session</code>, <code>dotenv</code>, etc.)</li>
    <li>Create <code>/routes/authRoutes.js</code> and <code>/config/passport.js</code></li>
    <li>Inject required <code>.env</code> variables</li>
  </ul>

  <h3>🧪 Run Your App</h3>
  <pre><code>pnpm dev
# or
node app.js</code></pre>
  
  <h2>📦 Upcoming Modules</h2>
  <ul>
    <li><code>add email-resend</code>: Send emails via Resend API</li>
    <li><code>add jwt-auth</code>: JWT-based authentication</li>
    <li><code>add S3</code>: Adds AWS S3 file upload setup for uploading files to Amazon S3.</li>
    <li><code>add payment services</code>: Add Payment services like Razorpay and Stripe</li>
  </ul>

  <h2>🧩 How It Works</h2>
  <p>Each module:</p>
  <ul>
    <li>Lives in <code>/modules/&lt;module-name&gt;/</code></li>
    <li>Modifies your project files (<code>app.js</code>, <code>.env</code>, etc.)</li>
    <li>Installs necessary dependencies automatically</li>
    <li>Uses utilities like <code>ensureAppJsHasOAuthSetup()</code> to inject code safely</li>
  </ul>

  <h2>🛠 Development Notes</h2>
  <ul>
    <li>Requires Node.js 18+</li>
    <li>Uses <code>fs</code>, <code>path</code>, <code>child_process</code>, and optionally <code>ejs</code> for templates</li>
    <li>Automatically inserts <code>import 'dotenv/config'</code> at the top of <code>app.js</code></li>
    <li>Defaults to <code>pnpm</code> (falls back to <code>npm</code> if unavailable)</li>
  </ul>

  <h2>🙋‍♂️ Contributing</h2>
  <p>Pull requests, issues, and feature suggestions are welcome.</p>

</body>
</html>
