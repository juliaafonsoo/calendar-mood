# 📅 Mood Calendar

Um aplicativo de calendário para rastreamento de humor, medicação e bem-estar pessoal.

## 🚀 Características

- **Calendário Interativo**: Visualização mensal com códigos de cores por humor
- **Entrada de Dados**: Registro de humor, dosagem de medicação e comentários
- **Armazenamento Local**: Dados persistentes usando IndexedDB
- **Backup e Restauração**: Exportação/importação de dados em JSON
- **Sincronização Cloud**: Integração com Vercel Edge Config e Blob Storage
- **Tema Adaptável**: Suporte a modo claro e escuro

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Database**: IndexedDB com Dexie.js
- **Cloud Storage**: Vercel Blob Storage, Edge Config
- **Styling**: Tailwind CSS v4, CSS Custom Properties

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute em modo de desenvolvimento
pnpm dev
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Servidor de desenvolvimento
pnpm build            # Build de produção
pnpm start            # Servidor de produção
pnpm lint             # Linting do código

# Edge Config (Sincronização Cloud)
pnpm setup-edge-config        # Configurar Edge Config
pnpm upload-edge-config-api   # Upload via API
pnpm hybrid:sync              # Sincronizar dados
pnpm hybrid:upsert            # Upsert no Edge Config
```

## 🏗️ Estrutura do Projeto

```
📦 calendar-mood/
├── 📁 app/                    # Next.js App Router
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx            # Layout principal
│   ├── page.tsx              # Página inicial
│   └── 📁 api/               # API Routes
├── 📁 components/            # Componentes React
│   ├── calendar.tsx          # Componente do calendário
│   ├── entry-modal.tsx       # Modal de entrada
│   ├── data-management.tsx   # Gerenciamento de dados
│   └── 📁 ui/                # Componentes UI base
├── 📁 hooks/                 # Hooks customizados
├── 📁 lib/                   # Utilitários e lógica
├── 📁 types/                 # Definições TypeScript
├── 📁 scripts/               # Scripts de automação
└── 📁 deprecated/            # Arquivos não utilizados
```

## 🗄️ Banco de Dados

O aplicativo usa IndexedDB para armazenamento local através do Dexie.js:

- **Entradas de Humor**: Data, humor (1-5), dosagem, comentários
- **Persistência**: Dados salvos localmente no navegador
- **Hooks Reativos**: Atualizações automáticas da UI

## ☁️ Sincronização Cloud

### Vercel Edge Config
- Armazenamento de configurações globais
- Dados de estatísticas agregadas
- Sincronização rápida via Edge Network

### Vercel Blob Storage
- Backup completo dos dados
- Arquivos JSON exportados
- URLs públicas para compartilhamento

## 🎨 Customização

### Temas
O aplicativo suporta temas claro e escuro usando CSS Custom Properties:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### UI Components
Baseado em Radix UI com personalização Tailwind:
- Componentes acessíveis por padrão
- Styled com Tailwind CSS
- Variantes através de `class-variance-authority`

## 📊 Funcionalidades Principais

### 1. Calendário de Humor
- Visualização mensal interativa
- Cores baseadas no humor (1-5)
- Clique para adicionar/editar entradas

### 2. Modal de Entrada
- Seleção de humor (emoji + número)
- Campo de dosagem de medicação
- Campo de gotas de clonazepam
- Comentários livres

### 3. Gerenciamento de Dados
- Exportar para JSON
- Importar dados existentes
- Limpar banco de dados
- Estatísticas de uso

### 4. Sincronização
- Upload para Vercel Blob
- Sincronização com Edge Config
- Backup automático
- Controle de versão

## 🔐 Variáveis de Ambiente

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token

# Vercel Edge Config
EDGE_CONFIG=your_edge_config_url
EDGE_CONFIG_ID=your_edge_config_id
VERCEL_API_TOKEN=your_api_token
```

## 📱 Responsividade

O aplicativo é totalmente responsivo:
- Desktop: Layout completo com sidebar
- Tablet: Layout adaptado
- Mobile: Interface otimizada para toque

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Conecte seu repositório ao Vercel
vercel --prod

# Configure as variáveis de ambiente no dashboard
```

### Docker
```bash
# Build da imagem
docker build -t mood-calendar .

# Execute o container
docker run -p 3000:3000 mood-calendar
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação em `/docs`
- Verifique os logs no console do navegador

## 📋 Changelog

### v0.1.0 (Atual)
- ✅ Calendário interativo de humor
- ✅ Armazenamento local com IndexedDB
- ✅ Exportação/importação de dados
- ✅ Integração com Vercel Blob e Edge Config
- ✅ Interface responsiva
- ✅ Suporte a temas
