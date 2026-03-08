// components/FeatureCard.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

export default function FeatureCard({
  icon,
  title,
  description,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl text-black">{title}</CardTitle>
        <CardDescription className="text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
