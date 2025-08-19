"use client"

import { useTheme } from "./theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

const themes = [
  {
    id: "minimal",
    name: "Minimal",
    icon: "◯",
    description: "Clean and focused",
    colors: ["#ffffff", "#374151", "#6b7280"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: "◈",
    description: "Neon and electric",
    colors: ["#ff00ff", "#00ffff", "#0f0f23"],
  },
  {
    id: "typewriter",
    name: "Typewriter",
    icon: "⌨",
    description: "Vintage and classic",
    colors: ["#8b4513", "#f5f5dc", "#daa520"],
  },
  {
    id: "matrix",
    name: "Matrix",
    icon: "◉",
    description: "Digital rain",
    colors: ["#00ff41", "#000000", "#0d1117"],
  },
] as const

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        className="btn btn-ghost btn-circle relative overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span className="text-xl" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          🎨
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-72 bg-base-200 rounded-xl shadow-xl border border-base-300 p-4 z-50"
          >
            <h3 className="font-bold text-lg mb-3 text-center">Choose Theme</h3>

            <div className="grid grid-cols-1 gap-3">
              {themes.map((themeOption) => (
                <motion.button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id as any)
                    setIsOpen(false)
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    theme === themeOption.id
                      ? "bg-primary text-primary-content shadow-lg"
                      : "bg-base-100 hover:bg-base-300"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">{themeOption.icon}</span>

                  <div className="flex-1 text-left">
                    <div className="font-semibold">{themeOption.name}</div>
                    <div className="text-sm opacity-70">{themeOption.description}</div>
                  </div>

                  <div className="flex gap-1">
                    {themeOption.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-base-content/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {theme === themeOption.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="mt-4 text-center text-xs text-base-content/60">
              Themes change instantly and are saved automatically
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
