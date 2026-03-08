"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import NpmDownloads from "./npm"; 

export default function HeroSection() {
  const handleGetStarted = () => {
    const componentsSection = document.getElementById("components");
    if (componentsSection) {
      componentsSection.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  return (
    <section className="min-h-screen py-12 px-6 lg:px-12 relative bg-black overflow-hidden">
      {/* grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:35px_35px]" />

      <div className="container mx-auto max-w-7xl relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          {/* Badge + NPM downloads */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
  {/* Badge */}
  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-white border border-white/20">
    <Zap className="w-4 h-4 animate-pulse" />
    <span className="font-bold">shadcn/ui but for backend</span>
  </div>

  {/* NPM Downloads */}
  <NpmDownloads packageName="devark">
    {(downloads) => (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-3xl bg-white/10 text-white border border-white/20">
        <span className="font-extrabold font-sans text-red-800">{downloads !== null ? downloads.toLocaleString() : "..."}</span>
         <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                className="w-7 h-7"
                fill="currentColor"
              >
                <path d="M288 288h-32v-64h32v64zm288-128v192H288v32H160v-32H0V160h576zm-416 32H32v128h64v-96h32v96h32V192zm160 0H192v160h64v-32h64V192zm224 0H352v128h64v-96h32v96h32v-96h32v96h32V192z" />
              </svg>
        <span className="font-bold">downloads last month</span>
      </div>
    )}
  </NpmDownloads>
</div>


          {/* Main Heading */}
          <h1 className="font-doto text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white">
            Build Your{" "}
            <span className="font-doto text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white">
              Infrastructure
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-300 max-w-lg font-mono leading-relaxed">
            With just one command, build your backend infrastructure. Add{" "}
            <span className="font-bold text-white">authentication, payments,</span>
            <br />
            <span className="font-bold text-white">OTP-services</span> and more instantly.
          </p>

          {/* CTA */}
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-white/80 text-black font-extrabold rounded-xl hover:bg-white/100"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
            </Button>
          </div>

          {/* Features */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-100 font-extrabold">
            {["Zero Config", "Production Ready", "Developer First"].map(
              (f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      i === 0
                        ? "bg-white"
                        : i === 1
                        ? "bg-gray-400"
                        : "bg-gray-600"
                    }`}
                  />
                  {f}
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT - Demo Video */}
        <div className="relative w-full h-[250px] sm:h-[320px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden pr-3 sm:pr-0">
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/poster.png"
              className="w-full rounded-xl shadow-lg"
            >
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
