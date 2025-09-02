"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, Database, Trash2 } from "lucide-react"
import { exportMoodData, importMoodData } from "@/lib/migration"
import { MoodCalendarDB } from "@/lib/db"
import { useMoodStats } from "@/hooks/use-mood-db"

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const stats = useMoodStats()

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportMoodData()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Erro ao exportar dados. Verifique o console para mais detalhes.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      const count = await importMoodData(file)
      alert(`${count} entradas importadas com sucesso!`)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Erro ao importar dados. Verifique se o arquivo está no formato correto.')
    } finally {
      setIsImporting(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleClearData = async () => {
    if (!window.confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setIsClearing(true)
      await MoodCalendarDB.clearAllEntries()
      alert('Todos os dados foram removidos.')
    } catch (error) {
      console.error('Clear failed:', error)
      alert('Erro ao apagar dados.')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciamento de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">{stats.totalEntries}</div>
              <div className="text-muted-foreground">Entradas totais</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">{stats.averageMood.toFixed(1)}</div>
              <div className="text-muted-foreground">Humor médio</div>
            </div>
          </div>
        )}

        {/* Export Data */}
        <div className="space-y-2">
          <Label>Exportar dados</Label>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Baixar backup dos dados'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Baixa um arquivo JSON com todos os seus dados do calendário de humor
          </p>
        </div>

        {/* Import Data */}
        <div className="space-y-2">
          <Label htmlFor="import-file">Importar dados</Label>
          <Input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isImporting}
          />
          <p className="text-xs text-muted-foreground">
            {isImporting ? 'Importando...' : 'Selecione um arquivo JSON de backup para restaurar seus dados'}
          </p>
        </div>

        {/* Clear Data */}
        <div className="space-y-2 border-t pt-4">
          <Label className="text-destructive">Zona de perigo</Label>
          <Button 
            onClick={handleClearData} 
            disabled={isClearing}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Apagando...' : 'Apagar todos os dados'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Esta ação remove permanentemente todos os dados do aplicativo
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
