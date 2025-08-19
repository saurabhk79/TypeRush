"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface TestResult {
  wpm: number
  accuracy: number
  keystrokes: number
  errors: Record<string, number>
  duration: number
  text: string
  wpmProgression: number[]
  correctKeystrokes: number
  incorrectKeystrokes: number
}

interface ResultsScreenProps {
  result: TestResult
  onRestart: () => void
}

export default function ResultsScreen({ result, onRestart }: ResultsScreenProps) {
  const [showCopied, setShowCopied] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const statVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const getPerformanceRating = () => {
    if (result.wpm >= 70 && result.accuracy >= 95) return { rating: "Excellent", color: "text-success" }
    if (result.wpm >= 50 && result.accuracy >= 90) return { rating: "Good", color: "text-info" }
    if (result.wpm >= 30 && result.accuracy >= 80) return { rating: "Average", color: "text-warning" }
    return { rating: "Needs Practice", color: "text-error" }
  }

  const performance = getPerformanceRating()

  const createErrorHeatmap = () => {
    const errorEntries = Object.entries(result.errors).sort(([, a], [, b]) => b - a)
    const maxErrors = errorEntries.length > 0 ? errorEntries[0][1] : 1

    return errorEntries.slice(0, 10).map(([char, count]) => ({
      char: char === "SPACE" ? "Space" : char,
      count,
      intensity: count / maxErrors,
    }))
  }

  const errorHeatmap = createErrorHeatmap()

  const renderWpmChart = () => {
    const wpmProgression = result.wpmProgression || []
    const maxWpm = wpmProgression.length > 0 ? Math.max(...wpmProgression, result.wpm) : result.wpm
    const chartHeight = 100

    return (
      <div className="relative h-24 bg-base-300 rounded-lg p-2 overflow-hidden">
        <div className="flex items-end justify-between h-full">
          {wpmProgression.length > 0 ? (
            wpmProgression.map((wpm, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${(wpm / maxWpm) * chartHeight}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-primary rounded-t-sm flex-1 mx-px min-h-1"
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-base-content/60">
              <span className="text-sm">No progression data available</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-1 left-2 text-xs text-base-content/60">0</div>
        <div className="absolute top-1 right-2 text-xs text-base-content/60">{maxWpm} WPM</div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <motion.h1
          className={`text-5xl font-bold mb-2`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        >
          Test Complete!
        </motion.h1>
        <motion.p variants={itemVariants} className={`text-xl ${performance.color} font-semibold`}>
          {performance.rating}
        </motion.p>
      </motion.div>

      {/* Main Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <motion.div variants={statVariants} className="stat bg-base-200 rounded-xl shadow-lg">
          <div className="stat-figure text-primary">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, ease: "easeInOut" }} className="text-3xl">
              ⚡
            </motion.div>
          </div>
          <div className="stat-title">Words Per Minute</div>
          <motion.div
            className="stat-value text-primary text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {result.wpm}
          </motion.div>
          <div className="stat-desc">
            {result.wpm > 40 ? "Above average!" : result.wpm > 25 ? "Keep practicing!" : "Room for improvement"}
          </div>
        </motion.div>

        <motion.div variants={statVariants} className="stat bg-base-200 rounded-xl shadow-lg">
          <div className="stat-figure text-secondary">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="text-3xl"
            >
              🎯
            </motion.div>
          </div>
          <div className="stat-title">Accuracy</div>
          <motion.div
            className="stat-value text-secondary text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          >
            {result.accuracy}%
          </motion.div>
          <div className="stat-desc">
            {result.accuracy >= 95
              ? "Excellent precision!"
              : result.accuracy >= 85
                ? "Good accuracy"
                : "Focus on accuracy"}
          </div>
        </motion.div>

        <motion.div variants={statVariants} className="stat bg-base-200 rounded-xl shadow-lg">
          <div className="stat-figure text-accent">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              className="text-3xl"
            >
              ⌨️
            </motion.div>
          </div>
          <div className="stat-title">Total Keystrokes</div>
          <motion.div
            className="stat-value text-accent text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
          >
            {result.keystrokes}
          </motion.div>
          <div className="stat-desc">
            {result.correctKeystrokes} correct, {result.incorrectKeystrokes} errors
          </div>
        </motion.div>

        <motion.div variants={statVariants} className="stat bg-base-200 rounded-xl shadow-lg">
          <div className="stat-figure text-info">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="text-3xl"
            >
              ⏱️
            </motion.div>
          </div>
          <div className="stat-title">Duration</div>
          <motion.div
            className="stat-value text-info text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
          >
            {result.duration}s
          </motion.div>
          <div className="stat-desc">Time spent typing</div>
        </motion.div>
      </motion.div>

      {/* WPM Progression Chart */}
      {/* <motion.div variants={itemVariants} className="mb-8">
        <h3 className="text-2xl font-bold mb-4 text-center">WPM Progression</h3>
        <div className="bg-base-200 rounded-xl p-6">
          {renderWpmChart()}
          <p className="text-center text-sm text-base-content/60 mt-2">Your typing speed throughout the test</p>
        </div>
      </motion.div> */}

      {/* Error Heatmap */}
      {errorHeatmap.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-center">Error Heatmap</h3>
          <div className="bg-base-200 rounded-xl p-6">
            <p className="text-center text-sm text-base-content/60 mb-4">Characters you struggled with most</p>
            <div className="flex flex-wrap justify-center gap-3">
              {errorHeatmap.map(({ char, count, intensity }, index) => (
                <motion.div
                  key={char}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-white mb-1`}
                    style={{
                      backgroundColor: `hsl(${Math.max(0, 120 - intensity * 120)}, 70%, ${50 + intensity * 20}%)`,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {char}
                  </motion.div>
                  <span className="text-xs text-base-content/60">{count} errors</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex justify-center gap-4">
        <motion.button
          className="btn btn-primary btn-lg"
          onClick={onRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
        <motion.button
          className="btn btn-secondary btn-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
        
            navigator.clipboard?.writeText(
              `I just typed ${result.wpm} WPM with ${result.accuracy}% accuracy on TypeSpeed Pro!`,
            )
            setShowCopied(true)
            setTimeout(() => setShowCopied(false), 2000)
          }}
        >
          Share Results
        </motion.button>
      </motion.div>

      {/* Motivational Message */}
      <motion.div variants={itemVariants} className="text-center mt-8 p-4 rounded-xl">
        <motion.p
          className="text-lg text-base-content/80"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          {result.wpm >= 60
            ? "Outstanding! You're a typing master! 🏆"
            : result.wpm >= 40
              ? "Great job! Keep practicing to reach the next level! 🚀"
              : "Every expert was once a beginner. Keep typing! 💪"}
        </motion.p>
      </motion.div>

      {showCopied && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-primary-content px-4 py-2 rounded shadow-lg"
        >
          Copied to clipboard!
        </motion.div>
      )}
    </motion.div>
  )
}
