// components/FeaturesSection.tsx

import FeatureCard from "./FeatureCard";
import { Lock, Database, Mail } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 px-4 bg-gradient-to-r from-stone-950 via-rose-900 to-stone-950"
    >
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
            Everything you need to build
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pre-built, production-ready backend components that integrate
            seamlessly with your existing codebase.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Lock className="w-6 h-6 text-white" />}
            title="Authentication"
            description="OAuth, JWT, session management, and user roles out of the box"
            items={[
              "Google, GitHub, Discord OAuth",
              "JWT token management",
              "Role-based permissions",
            ]}
          />
          <FeatureCard
            icon={<Database className="w-6 h-6 text-white" />}
            title="Database"
            description="Prisma, migrations, and database utilities configured instantly"
            items={[
              "PostgreSQL, MySQL, SQLite",
              "Auto-generated migrations",
              "Type-safe queries",
            ]}
          />
          <FeatureCard
            icon={<Mail className="w-6 h-6 text-white" />}
            title="Communication"
            description="Email, SMS, push notifications, and real-time messaging"
            items={[
              "Transactional emails",
              "WebSocket support",
              "SMS notifications",
            ]}
          />
        </div>
      </div>
    </section>
  );
}
