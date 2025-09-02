"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/calendar"
import { EntryModal } from "@/components/entry-modal"
import { DataManagement } from "@/components/data-management"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Settings } from "lucide-react"
import { useMoodEntries } from "@/hooks/use-mood-db"
import { MoodCalendarDB, MoodEntry } from "@/lib/db"
import { migrateMockData } from "@/lib/migration"

export default function Home() {
  // Use the live query hook to get mood entries
  const entries = useMoodEntries() || []
  
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // Run migration on component mount
  useEffect(() => {
    const runMigration = async () => {
      try {
        await migrateMockData()
      } catch (error) {
        console.error('Migration failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    runMigration()
  }, [])

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    const existingEntry = entries.find((entry) => entry.date === date)
    if (existingEntry) {
      setEditingEntry(existingEntry)
    } else {
      setEditingEntry(null)
    }
    setIsModalOpen(true)
  }

  const handleSaveEntry = async (entry: Omit<MoodEntry, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editingEntry?.id) {
        // Update existing entry
        await MoodCalendarDB.updateEntry(editingEntry.id, entry)
      } else {
        // Create new entry
        await MoodCalendarDB.saveEntry(entry)
      }
      
      setIsModalOpen(false)
      setEditingEntry(null)
    } catch (error) {
      console.error('Error saving entry:', error)
      // You could add error handling UI here
    }
  }

  const handleDeleteEntry = async (entryId: number) => {
    try {
      await MoodCalendarDB.deleteEntry(entryId)
      setIsModalOpen(false)
      setEditingEntry(null)
    } catch (error) {
      console.error('Error deleting entry:', error)
      // You could add error handling UI here
    }
  }

  // Show loading state during migration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-2 flex items-center justify-center">
        <div className="text-center space-y-4">
          <CalendarIcon className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando calendário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-1">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 relative">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                <CalendarIcon className="h-8 w-8 text-primary" />
                Mood Calendar
              </h1>
              <p className="text-lg text-muted-foreground mt-2">How is your mood today?</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="absolute right-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <DataManagement />
        )}

        {/* Calendar */}
        <Card>
          <CardContent>
            <Calendar entries={entries} onDateClick={handleDateClick} />
          </CardContent>
        </Card>

        {/* Entry Modal */}
        <EntryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingEntry(null)
          }}
          onSave={handleSaveEntry}
          onDelete={editingEntry?.id ? () => handleDeleteEntry(editingEntry.id!) : undefined}
          selectedDate={selectedDate}
          initialEntry={editingEntry}
        />
      </div>
    </div>
  )
}
