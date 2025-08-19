"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "cyberpunk" | "typewriter" | "matrix" | "minimal"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("minimal")

  useEffect(() => {
    const savedTheme = localStorage.getItem("typing-test-theme") as Theme
    if (savedTheme && ["cyberpunk", "typewriter", "matrix", "minimal"].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("typing-test-theme", theme)

    document.documentElement.setAttribute("data-theme", theme)

    document.body.className = document.body.className
      .split(" ")
      .filter((cls) => !["matrix-bg", "cyberpunk-bg", "typewriter-bg", "minimal-bg"].includes(cls))
      .join(" ")

    switch (theme) {
      case "matrix":
        document.body.classList.add("matrix-bg")
        createMatrixEffect()
        break
      case "cyberpunk":
        document.body.classList.add("cyberpunk-bg")
        createCyberpunkEffect()
        break
      case "typewriter":
        document.body.classList.add("typewriter-bg")
        createTypewriterEffect()
        break
      case "minimal":
        document.body.classList.add("minimal-bg")
        break
    }
  }, [theme])

  const createMatrixEffect = () => {
    const existingMatrix = document.querySelectorAll(".matrix-char")
    existingMatrix.forEach((el) => el.remove())

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?"
    const columns = Math.floor(window.innerWidth / 20)

    for (let i = 0; i < columns; i++) {
      const char = document.createElement("div")
      char.className = "matrix-char fixed text-green-400 font-mono text-sm pointer-events-none z-0"
      char.style.left = `${i * 20}px`
      char.style.top = `${Math.random() * -100}px`
      char.style.animationDelay = `${Math.random() * 5}s`
      char.style.animation = "matrix-rain 10s linear infinite"
      char.textContent = chars[Math.floor(Math.random() * chars.length)]
      document.body.appendChild(char)

      setTimeout(() => char.remove(), 10000)
    }
  }

  const createCyberpunkEffect = () => {
    const glitchOverlay = document.createElement("div")
    glitchOverlay.className = "fixed inset-0 pointer-events-none z-0"
    glitchOverlay.style.background = `
      linear-gradient(90deg, transparent 98%, rgba(255, 0, 255, 0.1) 100%),
      linear-gradient(0deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%)
    `
    glitchOverlay.style.animation = "cyberpunk-pulse 3s ease-in-out infinite"

    const existing = document.querySelector(".cyberpunk-glitch")
    if (existing) existing.remove()

    glitchOverlay.classList.add("cyberpunk-glitch")
    document.body.appendChild(glitchOverlay)
  }

  const createTypewriterEffect = () => {
    const paperOverlay = document.createElement("div")
    paperOverlay.className = "fixed inset-0 pointer-events-none z-0 opacity-10"
    paperOverlay.style.backgroundImage = `
      radial-gradient(circle at 1px 1px, rgba(139, 69, 19, 0.3) 1px, transparent 0)
    `
    paperOverlay.style.backgroundSize = "20px 20px"

    const existing = document.querySelector(".typewriter-paper")
    if (existing) existing.remove()

    paperOverlay.classList.add("typewriter-paper")
    document.body.appendChild(paperOverlay)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
