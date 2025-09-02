# Calendário do Humor - IndexedDB Implementation

Este projeto agora usa **IndexedDB** com **Dexie.js** para armazenamento local de dados, eliminando a necessidade de um backend.

## 🗄️ Banco de Dados

### Tecnologias Utilizadas
- **IndexedDB**: API nativa do navegador para armazenamento local
- **Dexie.js**: Wrapper moderno e fácil de usar para IndexedDB
- **dexie-react-hooks**: Hooks React para queries reativas

### Estrutura de Dados

```typescript
interface MoodEntry {
  id?: number;              // Chave primária auto-incremento
  date: string;            // Data no formato YYYY-MM-DD
  dose: 0 | 50 | 100 | 150; // Dose do Venvanse
  clonazepamDrops: number; // Número de gotas de clonazepam
  mood: 1 | 2 | 3 | 4 | 5; // Escala de humor (1=muito ruim, 5=muito bom)
  comment: string;         // Comentário sobre o dia
  createdAt?: Date;        // Data de criação (automática)
  updatedAt?: Date;        // Data de atualização (automática)
}
```

## 🚀 Funcionalidades

### 1. Armazenamento Local
- Todos os dados são armazenados localmente no navegador
- Não requer conexão com internet após carregamento inicial
- Dados persistem entre sessões do navegador

### 2. Queries Reativas
- Interface atualiza automaticamente quando dados mudam
- Múltiplas abas/janelas sincronizam automaticamente
- Uso de `useLiveQuery` para observar mudanças

### 3. Operações de Dados
- **Criar**: Adicionar nova entrada
- **Ler**: Visualizar entradas no calendário
- **Atualizar**: Editar entradas existentes
- **Deletar**: Remover entradas

### 4. Funcionalidades Avançadas
- **Estatísticas**: Humor médio, total de entradas
- **Busca**: Pesquisar por comentários
- **Filtros**: Por data, período, humor
- **Backup**: Exportar dados em JSON
- **Restauração**: Importar dados de backup

## 📱 Como Usar

### Primeira Execução
1. Os dados de exemplo são automaticamente migrados na primeira vez
2. O aplicativo funciona offline após carregamento inicial

### Gerenciamento de Dados
1. Clique no ícone de configurações (⚙️) no cabeçalho
2. Use o painel de "Gerenciamento de Dados" para:
   - Visualizar estatísticas
   - Exportar backup dos dados
   - Importar dados de backup
   - Limpar todos os dados (cuidado!)

### Backup e Restauração
- **Exportar**: Baixa arquivo JSON com todos os dados
- **Importar**: Carrega dados de um arquivo de backup
- **Formato**: JSON compatível com a estrutura MoodEntry

## 🔧 Estrutura Técnica

### Arquivos Principais
- `lib/db.ts`: Configuração do Dexie e operações de banco
- `hooks/use-mood-db.ts`: Hooks React para queries reativas
- `lib/migration.ts`: Utilitários de migração e backup
- `components/data-management.tsx`: Interface de gerenciamento

### Hooks Disponíveis
```typescript
useMoodEntries()                    // Todas as entradas
useMoodEntriesForMonth(year, month) // Entradas do mês
useMoodEntryByDate(date)           // Entrada específica
useMoodStats()                     // Estatísticas
useSearchMoodEntries(term)         // Busca por termo
useMoodEntriesInRange(start, end)  // Entradas em período
```

### API da Classe MoodCalendarDB
```typescript
// Operações básicas
MoodCalendarDB.getAllEntries()
MoodCalendarDB.getEntryByDate(date)
MoodCalendarDB.saveEntry(entry)
MoodCalendarDB.updateEntry(id, updates)
MoodCalendarDB.deleteEntry(id)

// Operações avançadas
MoodCalendarDB.getStats()
MoodCalendarDB.searchEntries(term)
MoodCalendarDB.exportData()
MoodCalendarDB.importData(entries)
```

## 🌟 Vantagens do IndexedDB

1. **Offline First**: Funciona sem internet
2. **Performance**: Muito rápido para consultas locais
3. **Capacidade**: Pode armazenar grandes volumes de dados
4. **Segurança**: Dados ficam apenas no dispositivo do usuário
5. **Sincronização**: Múltiplas abas se atualizam automaticamente

## 🔒 Privacidade

- Todos os dados são armazenados localmente no navegador
- Nenhum dado é enviado para servidores externos
- O usuário tem controle total sobre seus dados
- Backup e restauração são opcionais e controlados pelo usuário

## 📋 Próximos Passos

Possíveis melhorias futuras:
- [ ] Sincronização na nuvem (opcional)
- [ ] Notificações para lembrar de registrar o humor
- [ ] Relatórios e gráficos mais detalhados
- [ ] Exportação em outros formatos (CSV, PDF)
- [ ] Themes e personalização
