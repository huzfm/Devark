"use client";
import { useState } from "react";
import Link from "next/link";
import { Zap, Github, X, Menu, Mail } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-black lg:px-25 md:px-20 sm:px-0 relative z-50">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:35px_35px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 ring-1 ring-white/20 bg-black rounded-2xl px-2 py-2 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300">
          <div className="w-8 h-8 rounded-md flex items-center justify-center">
            <Zap className="w-6 h-6 text-slate-300" />
          </div>
          <span className="font-extrabold sm:text-2xl lg:text-3xl text-white">
            DevArk
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="https://github.com/huzfm/Devark/tree/master/documentation"
            target="_blank"
            className="font-mono text-white font-semibold hover:text-gray-300 transition-colors duration-200 relative group"
          >
            Docs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </Link>

          {/* Grouped Buttons */}
          <div className="flex items-center gap-2 border border-white/20 rounded-3xl p-1">
            <Link
              href="mailto:huzfm@proton.me"
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-bold bg-black text-white hover:bg-white/10 transition-all duration-300"
            >
              <Mail className="w-4 h-4" />
            </Link>

            <Link
              href="https://github.com/huzfm/Devark"
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-bold bg-black text-white hover:bg-white/10 transition-all duration-300"
            >
              <Github className="w-4 h-4" />
            </Link>

            <Link
              href="https://x.com/huzfm"
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-md font-mono font-bold bg-black text-white hover:bg-white/10 transition-all duration-300"
            >
              X
            </Link>

            <Link
              href="https://www.npmjs.com/package/devark"
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-bold bg-black text-white hover:bg-white/10 transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                className="w-6 h-6"
                fill="currentColor"
              >
                <path d="M288 288h-32v-64h32v64zm288-128v192H288v32H160v-32H0V160h576zm-416 32H32v128h64v-96h32v96h32V192zm160 0H192v160h64v-32h64V192zm224 0H352v128h64v-96h32v96h32v-96h32v96h32V192z" />
              </svg>
            </Link>
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
          aria-label="Open menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="fixed inset-0 top-[64px] md:hidden bg-black/95 border-t border-white/10 px-6 py-6 flex flex-col items-center gap-6 z-50">
          <Link
            href="https://github.com/huzfm/Devark/tree/master/documentation"
            target="_blank"
            className="font-mono text-white text-xl font-semibold hover:text-gray-300 transition-colors duration-200 border-1 border-white px-5 py-1 rounded-full"
            onClick={() => setMenuOpen(false)}
          >
            Docs
          </Link>

          {/* Row layout for icons */}
          <div className="flex items-center justify-center gap-5 border border-white/20 rounded-3xl px-4 py-2 bg-black/40 backdrop-blur-sm">
            <Link
              href="mailto:huzaaifmushtaq@gmail.com"
              target="_blank"
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-white"
              onClick={() => setMenuOpen(false)}
            >
              <Mail className="w-5 h-5" />
            </Link>

            <Link
              href="https://github.com/huzfm/Devark"
              target="_blank"
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-white"
              onClick={() => setMenuOpen(false)}
            >
              <Github className="w-5 h-5" />
            </Link>

            <Link
              href="https://x.com/huzfm"
              target="_blank"
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-white font-bold text-md font-mono"
              onClick={() => setMenuOpen(false)}
            >
              X
            </Link>

            <Link
              href="https://www.npmjs.com/package/devark"
              target="_blank"
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-white text-lg"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                className="w-5 h-5 "
                fill="currentColor"
              >
                <path d="M288 288h-32v-64h32v64zm288-128v192H288v32H160v-32H0V160h576zm-416 32H32v128h64v-96h32v96h32V192zm160 0H192v160h64v-32h64V192zm224 0H352v128h64v-96h32v96h32v-96h32v96h32V192z" />
              </svg>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
