"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import MobileWarning from "@/components/mobile-warning"
import TypingTest from "@/components/typing-test"
import ThemeSelector from "@/components/theme-selector"
import { useTheme } from "@/components/theme-provider"

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  if (isMobile) {
    return <MobileWarning />
  }

  const getThemeTitle = () => {
    switch (theme) {
      case "cyberpunk":
        return "TYPESPEED.EXE"
      case "matrix":
        return "TYPE_SPEED.SYS"
      case "typewriter":
        return "TypeSpeed Classic"
      default:
        return "TypeSpeed Pro"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-base-100 relative"
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl font-bold text-primary ${theme === "cyberpunk" ? "cyberpunk-text" : ""} ${
              theme === "typewriter" ? "typewriter-cursor" : ""
            }`}
          >
            {getThemeTitle()}
          </motion.h1>
          <ThemeSelector />
        </header>

        <TypingTest />
      </div>
    </motion.div>
  )
}
