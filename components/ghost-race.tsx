"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface GhostData {
  wmpProgression: number[]
  text: string
  finalWpm: number
  finalAccuracy: number
}

interface GhostRaceProps {
  currentWpm: number
  timeElapsed: number
  isActive: boolean
  ghostData: GhostData | null
}

export default function GhostRace({ currentWpm, timeElapsed, isActive, ghostData }: GhostRaceProps) {
  const [ghostPosition, setGhostPosition] = useState(0)
  const [userPosition, setUserPosition] = useState(0)
  const [isAhead, setIsAhead] = useState(false)

  useEffect(() => {
    if (!ghostData || !isActive) return

    const ghostWpmAtTime = ghostData.wmpProgression[Math.min(timeElapsed, ghostData.wmpProgression.length - 1)] || 0
    const ghostPos = (ghostWpmAtTime / Math.max(ghostData.finalWpm, currentWpm, 1)) * 100
    const userPos = (currentWpm / Math.max(ghostData.finalWpm, currentWpm, 1)) * 100

    setGhostPosition(Math.min(ghostPos, 100))
    setUserPosition(Math.min(userPos, 100))
    setIsAhead(currentWpm > ghostWpmAtTime)
  }, [currentWpm, timeElapsed, ghostData, isActive])

  if (!ghostData) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-base-200 rounded-lg p-4 mb-4"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Ghost Race</h3>
        <div className="text-sm text-base-content/70">
          Previous: {ghostData.finalWpm} WPM ({ghostData.finalAccuracy}%)
        </div>
      </div>

      {/* Race Track */}
      <div className="relative bg-base-300 rounded-full h-8 mb-2 overflow-hidden">
        {/* Track background */}
        <div className="absolute inset-0 bg-gradient-to-r from-base-300 to-base-200"></div>

        {/* Ghost runner */}
        <motion.div
          className="absolute top-1 left-0 w-6 h-6 bg-base-content/30 rounded-full flex items-center justify-center text-xs"
          animate={{ left: `${ghostPosition}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transform: "translateX(-50%)" }}
        >
          👻
        </motion.div>

        {/* User runner */}
        <motion.div
          className={`absolute top-1 left-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            isAhead ? "bg-success" : "bg-warning"
          }`}
          animate={{ left: `${userPosition}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transform: "translateX(-50%)" }}
        >
          🏃
        </motion.div>

        {/* Finish line */}
        <div className="absolute right-0 top-0 w-1 h-full bg-primary"></div>
      </div>

      {/* Race stats */}
      <div className="flex justify-between text-sm">
        <div className={`flex items-center gap-2 ${isAhead ? "text-success" : "text-warning"}`}>
          <span>You: {currentWpm} WPM</span>
          {isAhead && <span className="text-xs">🚀 AHEAD!</span>}
          {!isAhead && currentWpm > 0 && <span className="text-xs">📈 CATCH UP!</span>}
        </div>
        <div className="text-base-content/70">Ghost: {ghostData.finalWpm} WPM</div>
      </div>

      {/* Progress comparison */}
      <div className="mt-2 text-xs text-center text-base-content/60">
        {isAhead
          ? `You're ${Math.round(currentWpm - ghostData.wmpProgression[timeElapsed] || 0)} WPM faster than your previous run!`
          : currentWpm > 0
            ? `You're ${Math.round(ghostData.wmpProgression[timeElapsed] || 0 - currentWpm)} WPM behind your previous run`
            : "Start typing to begin the race!"}
      </div>
    </motion.div>
  )
}
