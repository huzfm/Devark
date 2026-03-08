"use client"

import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"

type Props = {
  pkg: string
}

type PackageManager = "pnpm" | "npm" | "bun" | "yarn" 

function buildCommand(pkg: string, manager: PackageManager) {
  switch (manager) {
    case "pnpm":
      return `pnpm dlx devark@latest add ${pkg}`
      case "npm":
        return `npx devark@latest add ${pkg}`
      case "bun":
        return `bunx --bun devark@latest add ${pkg}`
    case "yarn":
      return `yarn devark@latest add ${pkg}`
  }
}

export default function TerminalCommands({ pkg }: Props) {
  const [selectedManager, setSelectedManager] = useState<PackageManager>("pnpm")
  const [copied, setCopied] = useState(false)
  const command = useMemo(() => buildCommand(pkg, selectedManager), [pkg, selectedManager])

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000) // Reset after 2 seconds
    } catch {
      // no-op
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        {(["pnpm","npm","bun","yarn"] as PackageManager[]).map((manager) => (
          <button
            key={manager}
            onClick={() => setSelectedManager(manager)}
            className={`min-w-[80px] px-4 py-2 rounded-md transition-all duration-200 font-medium ${
              selectedManager === manager
                ? "bg-white/10 text-white scale-105 shadow-lg"
                : "text-gray-400 hover:bg-white/5 hover:text-white hover:scale-102"
            }`}
          >
            {manager}
          </button>
        ))}
      </div>
      <div className="flex items-stretch gap-2">
        <pre
          aria-label="installation command"
          className="flex-1 rounded-md bg-black border border-white/10 text-slate-100  px-4 py-3 overflow-x-auto  text-sm"
        >
          <code>{command}</code>
        </pre>
        <Button
  variant="outline"
  onClick={() => copy(command)}
  aria-label="Copy command"
  className="bg-black text-white min-w-[100px] text-md font-extrabold"
>
  {copied ? "Copied!" : "Copy"}
</Button>

      </div>
    </div>
  )
}
