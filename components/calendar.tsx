"use client"

import type { MoodEntry } from "@/lib/db"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface CalendarProps {
  entries: MoodEntry[]
  onDateClick: (date: string) => void
}

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const MOOD_EMOJIS = {
  1: "😢",
  2: "😞",
  3: "😐",
  4: "😊",
  5: "😃",
} as const

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const getDoseColor = (dose: 0 | 50 | 100 | 150) => {
  switch (dose) {
    case 0:
      return "bg-[color:var(--color-dose-0)] text-white"
    case 50:
      return "bg-[color:var(--color-dose-50)] text-white"
    case 100:
      return "bg-[color:var(--color-dose-100)] text-white"
    case 150:
      return "bg-[color:var(--color-dose-150)] text-white"
  }
}

export function Calendar({ entries, onDateClick }: CalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  // Allow navigation from January 2025 to December 2026
  const canGoBack = !(currentYear === 2025 && currentMonth === 0) // January 2025
  const canGoForward = !(currentYear === 2026 && currentMonth === 11) // December 2026

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Create array of days
  const days = []

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const getDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getEntryForDate = (day: number) => {
    const dateString = getDateString(day)
    return entries.find((entry) => entry.date === dateString)
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-20 bg-background border-b border-border pb-1 mb-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-semibold">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToToday}
                className="ml-3 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                HOJE
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoBack}
              className={cn(
                "p-1 rounded-lg transition-colors",
                canGoBack ? "hover:bg-muted text-foreground" : "text-muted-foreground cursor-not-allowed",
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToNextMonth}
              disabled={!canGoForward}
              className={cn(
                "p-1 rounded-lg transition-colors",
                canGoForward ? "hover:bg-muted text-foreground" : "text-muted-foreground cursor-not-allowed",
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="p-1 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-36" />
          }

          const entry = getEntryForDate(day)
          const isToday =
            day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

          return (
            <button
              key={getDateString(day)}
              onClick={() => onDateClick(getDateString(day))}
              className={cn(
                  "h-36 p-1 border border-border rounded-lg hover:bg-muted transition-colors",
                  "relative text-xs flex flex-col items-start justify-start",
                  isToday && "ring-2 ring-primary",
                )}
            >
              <span className="absolute top-1 left-1 font-medium text-sm">{day}</span>

              {entry && (
                <>
                  <div className="absolute top-1 right-1 flex flex-col items-end gap-1">
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium min-w-[32px] text-center",
                        getDoseColor(entry.dose),
                      )}
                    >
                      {entry.dose}
                    </div>

                    {entry.clonazepamDrops > 0 && (
                      <div className="text-xs text-sky-400 font-medium">
                        {entry.clonazepamDrops} {entry.clonazepamDrops === 1 ? "gota" : "gotas"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start justify-start flex-1 gap-1 pt-6 w-full h-full">
                    <div className="text-lg leading-none">{MOOD_EMOJIS[entry.mood]}</div>

                    {entry.comment && (
                      <div
                        className="text-xs text-muted-foreground text-left w-full flex-1"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 6,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}
                      >
                        {entry.comment}
                      </div>
                    )}
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
