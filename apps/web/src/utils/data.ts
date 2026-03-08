

export const components = [
  {
    title: "Google OAuth Provider",
    description: "Complete OAuth implementation with Google",
    command: "npx devark add google-oauth",
  },
  {
    title: "Email based OTP",
    description: "Email Otps with Resend",
    command: "npx devark add resend-otp",
  },
  {
    title: "Github OAuth Provider",
    description: "Complete OAuth implementation with Github",
    command: "npx devark add github-oauth",
  },
  {
    title:"Node.js and monogodb ", 
     description: "Basic template with node.js and mongodb setup",
    command: "npx devark add node-mongodb",
  },
  {
    title:"Node.js and PostgreSQL with Prisma ", 
     description: "Basic template with node.js and PostgreSQL with Prisma setup",
    command: "npx devark add node-postgres-prisma",
  },
  {
    title: "JWT Manager",
    description: "Token generation and validation",
    command: "npx devark add jwt",
  },
  {
    title: "Redis Cache",
    description: "Redis integration for caching and sessions",
    command: "npx devark add redis",
  },
  {
    title: "File Upload",
    description: "S3, Cloudinary, and local file upload handlers",
    command: "npx devark add upload",
  },
].map((component, index) => ({
  id: index + 1,
  ...component,
}));
