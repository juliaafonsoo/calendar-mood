import { NextRequest, NextResponse } from 'next/server';
import { syncMoodData, type MoodEntry } from '@/lib/hybrid-config';

export async function POST(request: NextRequest) {
  try {
    const { entries } = await request.json();

    if (!Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Entries deve ser um array' },
        { status: 400 }
      );
    }

    // Validar estrutura das entradas
    const validEntries: MoodEntry[] = entries.filter(entry => 
      entry.id && 
      entry.date && 
      typeof entry.mood === 'number' &&
      entry.mood >= 1 && 
      entry.mood <= 5
    );

    if (validEntries.length !== entries.length) {
      return NextResponse.json(
        { 
          error: 'Algumas entradas são inválidas',
          validCount: validEntries.length,
          totalCount: entries.length 
        },
        { status: 400 }
      );
    }

    // Sincronizar dados
    await syncMoodData(validEntries);

    return NextResponse.json({
      success: true,
      message: 'Dados sincronizados com sucesso',
      entriesCount: validEntries.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno na sincronização',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de sincronização mood calendar',
    endpoints: {
      'POST /api/sync': 'Sincronizar entradas de humor',
    },
    example: {
      method: 'POST',
      body: {
        entries: [
          {
            id: 'entry-1',
            date: '2025-01-01',
            mood: 4,
            notes: 'Bom dia!',
            tags: ['feliz'],
            createdAt: '2025-01-01T12:00:00Z',
            updatedAt: '2025-01-01T12:00:00Z'
          }
        ]
      }
    }
  });
}
