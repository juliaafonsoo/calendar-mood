import { NextResponse } from 'next/server';
import { getHybridConfig, getMoodEntries } from '@/lib/hybrid-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeEntries = searchParams.get('includeEntries') === 'true';

    // Obter configuração do Edge Config
    const config = await getHybridConfig();

    const response: any = {
      config,
      timestamp: new Date().toISOString(),
    };

    // Opcionalmente incluir as entradas do Blob
    if (includeEntries) {
      const entries = await getMoodEntries();
      response.entries = entries;
      response.entriesCount = entries.length;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao obter configuração',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  try {
    const config = await getHybridConfig();
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Last-Modified': config.last_updated || new Date().toISOString(),
        'Cache-Version': config.cache_version || '1.0.0',
        'Entries-URL': config.mood_entries_url || '',
      },
    });

  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
