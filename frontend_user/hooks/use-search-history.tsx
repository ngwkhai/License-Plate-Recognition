"use client"

import { useState, useEffect } from "react"

export interface HistoryItem {
  id: string
  licensePlate: string
  timestamp: string
  source: "upload" | "camera" | "manual"
  filename?: string
}

export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("license-plate-history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Error parsing history from localStorage:", error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("license-plate-history", JSON.stringify(history))
  }, [history])

  const addToHistory = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev])
  }

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
  }

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  }
}
