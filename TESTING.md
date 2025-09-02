# Como Testar a Implementação IndexedDB

## ✅ Lista de Verificação de Funcionalidades

### 1. Carregamento Inicial
- [ ] Aplicação carrega sem erros
- [ ] Dados de exemplo aparecem no calendário (3 entradas em setembro/2025)
- [ ] Contador mostra "3 entradas registradas"
- [ ] Console mostra "Successfully migrated 3 entries to IndexedDB"

### 2. Criação de Entradas
- [ ] Clicar em uma data vazia abre o modal
- [ ] Preencher todos os campos funciona
- [ ] Salvar cria nova entrada no calendário
- [ ] Entrada aparece imediatamente no calendário

### 3. Edição de Entradas
- [ ] Clicar em data com entrada abre modal em modo edição
- [ ] Campos carregam com dados existentes
- [ ] Salvar atualiza entrada existente
- [ ] Mudanças aparecem imediatamente

### 4. Exclusão de Entradas
- [ ] Botão de lixeira aparece quando editando
- [ ] Clicar exclui a entrada
- [ ] Entrada desaparece do calendário

### 5. Persistência
- [ ] Recarregar página mantém dados
- [ ] Abrir nova aba mostra mesmos dados
- [ ] Fechar e reabrir navegador mantém dados

### 6. Gerenciamento de Dados
- [ ] Clicar no ícone de configurações abre painel
- [ ] Estatísticas mostram valores corretos
- [ ] Botão de exportar baixa arquivo JSON
- [ ] Botão de importar aceita arquivo JSON válido
- [ ] Botão de limpar remove todos os dados

### 7. Reatividade
- [ ] Mudanças em uma aba aparecem em outras
- [ ] Contador de entradas atualiza automaticamente
- [ ] Estatísticas atualizam em tempo real

## 🧪 Testes Específicos

### Teste de Migração
1. Abra o DevTools (F12)
2. Vá para Application > Storage > IndexedDB
3. Verifique se existe "MoodCalendarDB" com tabela "moodEntries"
4. Confirme que há 3 entradas iniciais

### Teste de Backup/Restauração
1. Clique em configurações
2. Exporte os dados
3. Limpe todos os dados
4. Importe o arquivo baixado
5. Confirme que dados foram restaurados

### Teste de Performance
1. Adicione várias entradas (10-20)
2. Navegue entre meses
3. Confirme que resposta é instantânea
4. Abra múltiplas abas e teste sincronização

### Teste de Validação
1. Tente importar arquivo JSON inválido
2. Verifique se erro é tratado adequadamente
3. Teste limites de campos (ex: gotas de clonazepam)

## 🔍 Debugging

### Console do Navegador
Mensagens esperadas:
```
Migrating mock data to IndexedDB...
Successfully migrated 3 entries to IndexedDB
```

### DevTools - Application
- Navegue para `Application > Storage > IndexedDB`
- Expanda `MoodCalendarDB`
- Verifique tabela `moodEntries`
- Visualize dados armazenados

### Erros Comuns
1. **"IndexedDB not supported"**: Navegador muito antigo
2. **"Migration failed"**: Problema com inicialização
3. **"Export failed"**: Problema com download de arquivo
4. **"Import failed"**: Arquivo JSON inválido

## 📊 Estrutura dos Dados no IndexedDB

```javascript
// Exemplo de entrada no IndexedDB
{
  id: 1,
  date: "2025-09-01",
  dose: 100,
  clonazepamDrops: 2,
  mood: 4,
  comment: "Dia produtivo...",
  createdAt: "2025-09-02T14:30:00.000Z",
  updatedAt: "2025-09-02T14:30:00.000Z"
}
```

## ⚠️ Limitações a Considerar

1. **Capacidade**: IndexedDB tem limites de storage por domínio
2. **Navegadores**: Privado/incógnito pode ter restrições
3. **Sincronização**: Dados não sincronizam entre dispositivos
4. **Backup**: Responsabilidade do usuário

## 🎯 Casos de Uso Reais

1. **Uso Diário**: Registrar humor e medicação
2. **Acompanhamento**: Visualizar padrões ao longo do tempo
3. **Consulta Médica**: Exportar dados para compartilhar
4. **Backup Pessoal**: Exportar periodicamente por segurança
