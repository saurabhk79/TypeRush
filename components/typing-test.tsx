"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import ResultsScreen from "./results-screen"
import GhostRace from "./ghost-race"

interface TypingStats {
  wpm: number
  accuracy: number
  keystrokes: number
  correctKeystrokes: number
  incorrectKeystrokes: number
  errors: Record<string, number>
  rawWpm: number
}

interface TestResult {
  wpm: number
  accuracy: number
  keystrokes: number
  errors: Record<string, number>
  duration: number
  text: string
  wmpProgression: number[]
  correctKeystrokes: number
  incorrectKeystrokes: number
}

interface GhostData {
  wmpProgression: number[]
  text: string
  finalWmp: number
  finalAccuracy: number
}

export default function TypingTest() {
  const [testText, setTestText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [customTime, setCustomTime] = useState(60)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wmpHistory, setWmpHistory] = useState<number[]>([])
  const [ghostMode, setGhostMode] = useState(false)
  const [ghostData, setGhostData] = useState<GhostData | null>(null)
  const [userId] = useState(() => `user_${Date.now()}`)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    keystrokes: 0,
    correctKeystrokes: 0,
    incorrectKeystrokes: 0,
    errors: {},
    rawWpm: 0,
  })

  const [testResult, setTestResult] = useState<TestResult | null>(null)

  // Fetch random text from backend
  const fetchText = async () => {
    try {
      const response = await fetch("/api/text")
      const data = await response.json()
      setTestText(data.text)
    } catch (error) {
      console.error("Failed to fetch text:", error)
      setTestText("The quick brown fox jumps over the lazy dog near the riverbank.")
    }
  }

  // Fetch ghost data
  const fetchGhostData = async () => {
    try {
      const response = await fetch(`/api/ghost/${userId}`)
      const data = await response.json()
      if (data.wmpProgression) {
        setGhostData({
          wmpProgression: data.wmpProgression,
          text: data.text,
          finalWmp: data.final_wmp,
          finalAccuracy: data.final_accuracy,
        })
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to fetch ghost data:", error)
      return false
    }
  }

  useEffect(() => {
    fetchText()
  }, [])

  // Timer logic with WPM tracking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0 && !isFinished) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false)
            setIsFinished(true)
            return 0
          }
          return prev - 1
        })

        if (userInput.length > 0) {
          const timeElapsed = (customTime - timeLeft + 1) / 60
          const words = userInput.trim().split(/\s+/).length
          const currentWmp = timeElapsed > 0 ? Math.round(words / timeElapsed) : 0
          setWmpHistory((prev) => [...prev, currentWmp])
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isFinished, userInput.length, customTime])

  const calculateStats = useCallback(() => {
    if (userInput.length === 0) return

    const timeElapsed = startTime ? (Date.now() - startTime) / 60000 : 0.01 // Convert to minutes
    const totalChars = userInput.length
    const words = userInput.trim().split(/\s+/).length

    let correctChars = 0
    let incorrectChars = 0
    const errorMap: Record<string, number> = {}

    // Character-by-character comparison
    for (let i = 0; i < Math.min(userInput.length, testText.length); i++) {
      if (userInput[i] === testText[i]) {
        correctChars++
      } else {
        incorrectChars++
        const expectedChar = testText[i] === " " ? "SPACE" : testText[i]
        errorMap[expectedChar] = (errorMap[expectedChar] || 0) + 1
      }
    }

    // Handle extra characters
    if (userInput.length > testText.length) {
      incorrectChars += userInput.length - testText.length
    }

    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100
    const wpm = timeElapsed > 0 ? Math.round(correctChars / 5 / timeElapsed) : 0
    const rawWpm = timeElapsed > 0 ? Math.round(totalChars / 5 / timeElapsed) : 0

    setStats({
      wpm,
      rawWpm,
      accuracy,
      keystrokes: totalChars,
      correctKeystrokes: correctChars,
      incorrectKeystrokes: incorrectChars,
      errors: errorMap,
    })
  }, [userInput, testText, startTime])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  useEffect(() => {
    if (userInput.length >= testText.length && testText.length > 0) {
      setIsActive(false)
      setIsFinished(true)
    }
  }, [userInput.length, testText.length])

  // Save results when test finishes
  useEffect(() => {
    if (isFinished && stats.keystrokes > 0) {
      const result: TestResult = {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        keystrokes: stats.keystrokes,
        errors: stats.errors,
        duration: customTime - timeLeft,
        text: testText,
        wmpProgression: wmpHistory,
        correctKeystrokes: stats.correctKeystrokes,
        incorrectKeystrokes: stats.incorrectKeystrokes,
      }
      setTestResult(result)

      // Save to backend
      saveResult(result)
      // Save ghost data for future races
      saveGhostData(result)
    }
  }, [isFinished, stats, customTime, timeLeft, testText, wmpHistory])

  const saveResult = async (result: TestResult) => {
    try {
      await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          wpm: result.wpm,
          accuracy: result.accuracy,
          keystrokes: result.keystrokes,
          errors: result.errors,
          duration: result.duration,
        }),
      })
    } catch (error) {
      console.error("Failed to save result:", error)
    }
  }

  const saveGhostData = async (result: TestResult) => {
    try {
      await fetch("/api/ghost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          wmp_progression: result.wmpProgression,
          text: result.text,
          final_wmp: result.wpm,
          final_accuracy: result.accuracy,
        }),
      })
    } catch (error) {
      console.error("Failed to save ghost data:", error)
    }
  }

  const startTest = async () => {
    setIsActive(true)
    setIsFinished(false)
    setUserInput("")
    setTimeLeft(customTime)
    setStartTime(Date.now())
    setWmpHistory([])
    setTestResult(null)
    fetchText()

    // Load ghost data if ghost mode is enabled
    if (ghostMode) {
      await fetchGhostData()
    }

    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const resetTest = () => {
    setIsActive(false)
    setIsFinished(false)
    setUserInput("")
    setTimeLeft(customTime)
    setStartTime(null)
    setWmpHistory([])
    setStats({
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      keystrokes: 0,
      correctKeystrokes: 0,
      incorrectKeystrokes: 0,
      errors: {},
    })
    setTestResult(null)
    setGhostData(null)
    fetchText()
  }

  const toggleGhostMode = async () => {
    if (!ghostMode) {
      const hasGhostData = await fetchGhostData()
      if (hasGhostData) {
        setGhostMode(true)
      } else {
        alert("No previous run found! Complete a test first to enable ghost race mode.")
      }
    } else {
      setGhostMode(false)
      setGhostData(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // Prevent typing beyond text length
    if (value.length > testText.length) {
      return
    }

    // Start test on first keystroke
    if (!isActive && !isFinished && value.length > 0) {
      setIsActive(true)
      setStartTime(Date.now())
    }

    setUserInput(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent certain keys during test
    if (isActive && (e.ctrlKey || e.metaKey)) {
      if (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x") {
        e.preventDefault()
      }
    }
  }

  const renderText = () => {
    const currentPosition = userInput.length
    const visibleRange = 50 // Number of characters to show around cursor
    const startIndex = Math.max(0, currentPosition - 25)
    const endIndex = Math.min(testText.length, startIndex + visibleRange)

    const visibleText = testText.slice(startIndex, endIndex)
    const adjustedPosition = currentPosition - startIndex

    return (
      <div className="relative overflow-hidden h-16 flex items-center">
        <div className="flex text-2xl font-mono leading-relaxed">
          {visibleText.split("").map((char, index) => {
            const actualIndex = startIndex + index
            let className = "transition-all duration-200 inline-block"

            if (actualIndex < userInput.length) {
              // Already typed characters
              const distance = adjustedPosition - index
              const opacity = Math.max(0.2, 1 - distance * 0.1)

              if (userInput[actualIndex] === char) {
                className += ` text-base-content`
                return (
                  <span key={actualIndex} className={className} style={{ opacity }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                )
              } else {
                className += ` text-red-500 bg-red-500/20 rounded-sm`
                return (
                  <span key={actualIndex} className={className} style={{ opacity }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                )
              }
            } else if (actualIndex === userInput.length) {
              // Current cursor position - always in center
              className += " bg-primary/60 animate-pulse rounded-sm relative"
              return (
                <span key={actualIndex} className={className}>
                  {char === " " ? "\u00A0" : char}
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-primary animate-pulse"></div>
                </span>
              )
            } else {
              // Future characters
              className += " text-base-content/40"
              return (
                <span key={actualIndex} className={className}>
                  {char === " " ? "\u00A0" : char}
                </span>
              )
            }
          })}
        </div>
      </div>
    )
  }

  if (testResult) {
    return <ResultsScreen result={testResult} onRestart={resetTest} />
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Ghost Race Display */}
      {ghostMode && ghostData && (
        <GhostRace
          currentWmp={stats.wpm}
          timeElapsed={customTime - timeLeft}
          isActive={isActive}
          ghostData={ghostData}
        />
      )}

      {/* Timer and Stats */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center mb-6 p-4 bg-base-200 rounded-lg"
      >
        <div className="flex gap-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? "text-error animate-pulse" : "text-primary"}`}>
              {timeLeft}s
            </div>
            <div className="text-sm text-base-content/70">Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{stats.wpm}</div>
            <div className="text-sm text-base-content/70">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.accuracy}%</div>
            <div className="text-sm text-base-content/70">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-info">{stats.keystrokes}</div>
            <div className="text-sm text-base-content/70">Keystrokes</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${ghostMode ? "btn-accent" : "btn-ghost"}`}
            onClick={toggleGhostMode}
            disabled={isActive}
            title="Race against your previous performance"
          >
            👻 Ghost
          </button>
          <select
            className="select select-bordered select-sm"
            value={customTime}
            onChange={(e) => setCustomTime(Number(e.target.value))}
            disabled={isActive}
          >
            <option value={30}>30s</option>
            <option value={60}>60s</option>
            <option value={120}>2min</option>
            <option value={300}>5min</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={startTest} disabled={isActive && !isFinished}>
            {isFinished ? "Restart" : "Start"}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={resetTest}>
            Reset
          </button>
        </div>
      </motion.div>

      {/* Text Display */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6 p-8 bg-base-200 rounded-lg select-none relative"
        style={{ userSelect: "none" }}
      >
        <div className="flex justify-center">
          <div className="relative">{renderText()}</div>
        </div>

        {/* Cursor indicator line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform -translate-x-1/2 pointer-events-none"></div>
      </motion.div>

      {/* Input Area */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        <textarea
          ref={textareaRef}
          className="textarea textarea-bordered w-full h-32 text-lg font-mono resize-none"
          placeholder={isActive ? "Keep typing..." : "Click Start and begin typing here..."}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isFinished || timeLeft === 0}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        <div className="mt-2">
          <div className="flex justify-between text-sm text-base-content/70 mb-1">
            <span>Progress</span>
            <span>{Math.round((userInput.length / testText.length) * 100)}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={userInput.length}
            max={testText.length}
          ></progress>
        </div>
      </motion.div>
    </div>
  )
}
