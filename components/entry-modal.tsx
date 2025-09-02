"use client"

import { useState, useEffect } from "react"
import type { MoodEntry } from "@/lib/db"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: Omit<MoodEntry, "id" | "createdAt" | "updatedAt">) => void
  onDelete?: () => void
  selectedDate: string
  initialEntry?: MoodEntry | null
}

const MOOD_OPTIONS = [
  { value: 1 as const, label: "Muito ruim", emoji: "😢", color: "bg-[color:var(--color-mood-1)]" },
  { value: 2 as const, label: "Ruim", emoji: "😞", color: "bg-[color:var(--color-mood-2)]" },
  { value: 3 as const, label: "Neutro", emoji: "😐", color: "bg-[color:var(--color-mood-3)]" },
  { value: 4 as const, label: "Bom", emoji: "😊", color: "bg-[color:var(--color-mood-4)]" },
  { value: 5 as const, label: "Muito bom", emoji: "😃", color: "bg-[color:var(--color-mood-5)]" },
]

const DOSE_OPTIONS = [
  { value: 0 as const, label: "0mg", color: "bg-[color:var(--color-dose-0)]" },
  { value: 50 as const, label: "50mg", color: "bg-[color:var(--color-dose-50)]" },
  { value: 100 as const, label: "100mg", color: "bg-[color:var(--color-dose-100)]" },
  { value: 150 as const, label: "150mg", color: "bg-[color:var(--color-dose-150)]" },
]

export function EntryModal({ isOpen, onClose, onSave, onDelete, selectedDate, initialEntry }: EntryModalProps) {
  const [dose, setDose] = useState<0 | 50 | 100 | 150>(0)
  const [clonazepamDrops, setClonazepamDrops] = useState<number>(0)
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [comment, setComment] = useState("")

  useEffect(() => {
    if (initialEntry) {
      setDose(initialEntry.dose)
      setClonazepamDrops(initialEntry.clonazepamDrops || 0)
      setMood(initialEntry.mood)
      setComment(initialEntry.comment)
    } else {
      setDose(0)
      setClonazepamDrops(0)
      setMood(3)
      setComment("")
    }
  }, [initialEntry, isOpen])

  const handleSave = () => {
    onSave({
      date: selectedDate,
      dose,
      clonazepamDrops,
      mood,
      comment: comment.trim(),
    })
  }

  const handleClonazepamChange = (value: string) => {
    const numValue = Number.parseInt(value) || 0
    if (numValue >= 0 && numValue <= 20) {
      setClonazepamDrops(numValue)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-lg">{initialEntry ? "Editar entrada" : "Nova entrada"}</DialogTitle>
          <p className="text-xs text-muted-foreground text-center capitalize">
            {selectedDate && formatDate(selectedDate)}
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {/* Dose Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Dose do Venvanse</Label>
            <div className="grid grid-cols-4 gap-1">
              {DOSE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDose(option.value)}
                  className={cn(
                    "py-1 px-2 text-xs rounded border-2 transition-all text-white font-medium",
                    option.color,
                    dose === option.value ? "ring-1 ring-primary ring-offset-1" : "opacity-70 hover:opacity-90",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clonazepam Drops input section */}
          <div className="space-y-2">
            <Label htmlFor="clonazepam" className="text-xs font-medium">
              Dose de clonazepam
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="clonazepam"
                type="number"
                min="0"
                max="20"
                value={clonazepamDrops}
                onChange={(e) => handleClonazepamChange(e.target.value)}
                className="w-16 h-8 text-sm"
                placeholder="0"
              />
              <span className="text-xs text-sky-400 font-medium">
                {clonazepamDrops} {clonazepamDrops === 1 ? "gota" : "gotas"}
              </span>
            </div>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Como foi seu dia?</Label>
            <div className="grid grid-cols-5 gap-1">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={cn(
                    "p-1 rounded border-2 transition-all flex flex-col items-center gap-1",
                    mood === option.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                  )}
                  title={option.label}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-xs font-medium">{option.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-xs font-medium">
              Comentário (opcional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Como você se sentiu hoje?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive bg-transparent h-8"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent h-8 text-sm">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 h-8 text-sm">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
