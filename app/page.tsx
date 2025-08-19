"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import MobileWarning from "@/components/mobile-warning"
import TypingTest from "@/components/typing-test"

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-base-100 relative"
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-8">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl font-bold text-primary`}
          >
            TypeRush
          </motion.h1>
        </header>

        <TypingTest />
      </div>
    </motion.div>
  )
}
