import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-24 px-4 bg-black overflow-hidden">
      {/* Background Glow Effects */}

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:35px_35px]" />

      <div className="container mx-auto text-center relative z-10">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Contributions?
        </h2>

        {/* Description */}
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
          Whether you are fixing bugs, adding features, or improving docs —
          every contribution counts. Let’s build something great together!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="font-mono text-black gap-3 font-thin "
          >
            <Github className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <Link href="https://github.com/huzfm/Devark">GitHub</Link>
          </Button>

          <Button
            size="lg"
            className="font-mono text-black gap-3 font-thin bg-white "
          >
            <Link href="https://github.com/huzfm/Devark/tree/master/documentation">
              View Documentation
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
