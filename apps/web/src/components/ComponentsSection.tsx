"use client"

import { useMemo, useState } from "react"
import { availableComponents, comingSoonComponents, type CatalogItem } from "./components-data"
import { playRoboClick } from "../lib/click"
import TerminalCommands from "./terminal-commands"

export default function ComponentsSection() {
  const [selected, setSelected] = useState<CatalogItem>(availableComponents[0])

  const all = useMemo(
    () => ({
      available: availableComponents,
      comingSoon: comingSoonComponents,
    }),
    [],
  )

  return (
    <section id="components" aria-labelledby="components-title" className="relative w-full bg-black px-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:35px_35px]"
      />
      <div className="relative z-10 mx-auto container py-10 md:py-16">
        <header className="mb-6 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-2xl text-white text-center">Components Catalog</span>
                </div>
          <h2 id="components-title" className="mt-4 text-balance text-3xl md:text-4xl font-bold text-white text-center py-5">
            Browse components and install with one command
          </h2>
          <p className="mt-2 text-white text-center leading-relaxed">
            Pick a component and copy the installation commands for pnpm, yarn, and npm.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          {/* Left: list */}
          <aside aria-label="Components list" className="rounded-lg border border-white/20 bg-black">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white">Available</h3>
              <ul className="mt-3 space-y-1">
                {all.available.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => {
                        playRoboClick()
                        setSelected(item)
                      }}
                      className={[
                        "w-full text-left px-3 py-2 rounded-md transition-colors text-white",
                        selected.name === item.name ? "bg-white/10" : "hover:bg-white/5",
                      ].join(" ")}
                      aria-current={selected.name === item.name ? "true" : "false"}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        {/* <Badge variant="secondary" className="ml-2"> */}
                        <div className="bg-white/10 rounded-2xl px-2 py-0.5 text-[12px] ">
                        <span className="text-white">ready</span>
                        </div>
                        {/* </Badge> */}
                      </div>
                      {item.description ? (
                        <p className="text-xs text-white mt-1 line-clamp-2">{item.description}</p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

         
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white">Coming soon</h3>
              <ul className="mt-3 space-y-1">
                {all.comingSoon.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => {
                        playRoboClick()
                        setSelected(item)
                      }}
                      className={[
                        "w-full text-left px-3 py-2 rounded-md transition-colors text-gray-400",
                        "hover:bg-white/5",
                      ].join(" ")}
                      aria-current={selected.name === item.name ? "true" : "false"}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        {/* <Badge variant="secondary" className="ml-2"> */}
                        <span className="text-gray-400">soon</span>
                        {/* </Badge> */}
                      </div>
                      {item.description ? (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right: detail + terminal */}
          <main className={`rounded-lg border border-white/20 bg-black p-4 md:p-6 relative ${
            !selected.available ? 'opacity-50' : ''
          }`}>
            {!selected.available && (
              <div className="absolute inset-0 z-10 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-bold text-yellow-400 relative">
                    <span className="absolute inset-0 animate-pulse bg-yellow-400/20 blur-[25px] rounded-full"></span>
                    <span className="relative">Coming Soon</span>
                  </div>
                  <p className="text-gray-400 mt-4 text-lg md:text-xl max-w-md">This component is under development and will be available soon.</p>
                </div>
              </div>
            )}
            {/* Header with Version and Status */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-white">{selected.name}</h3>
                  <span className="text-sm font-mono text-gray-400">v{selected.version}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{selected.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`relative inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                  ${selected.available 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${selected.available ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  {selected.available ? 'Available' : (
                    <span className="relative">
                      <span className="absolute inset-0 animate-pulse bg-yellow-400/20 blur-[8px] rounded-full"></span>
                      <span className="relative ">Coming Soon</span>
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Installation */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">Installation</h4>
              <TerminalCommands pkg={selected.pkg} />
            </div>

            {/* Features Grid */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <h4 className="text-sm font-semibold text-white mb-4">Features</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selected.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-white/40" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment Variables */}
            {selected.requiredEnv && selected.requiredEnv.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h4 className="text-sm font-semibold text-white mb-4">Required Environment Variables</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selected.requiredEnv.map((env, index) => (
                    <div key={index} className="font-mono text-sm text-gray-300 px-3 py-2 bg-white/5 rounded-md">
                      {env}
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Technical Details */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <h4 className="text-sm font-semibold text-white mb-4">Technical Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-xs font-medium text-gray-400 mb-2">Package Name</h5>
                  <p className="text-sm font-mono text-white">{selected.pkg}</p>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-400 mb-2">Version</h5>
                  <p className="text-sm font-mono text-white">{selected.version}</p>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-400 mb-2">Dependencies</h5>
                  <div className="flex flex-wrap gap-2">
                    {selected.dependencies.map((dep, index) => (
                      <span key={index} className="px-2 py-1 text-xs font-mono rounded-md bg-white/5 text-gray-300">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
                
              </div>
            </div>

            {/* Documentation Link */}
            {selected.docsLink && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <a 
                  href={selected.docsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  View Documentation
                </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  )
}
