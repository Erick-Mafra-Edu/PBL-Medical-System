# 🚀 PBL Medical System - Guia Completo de Setup do Repositório

> **Última Atualização:** 2024-01-20  
> **Versão:** 1.0.0  
> **Status:** 🟢 Pronto para Produção

---

## 📖 Índice

1. [Visão Geral Rápida](#visão-geral-rápida)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Setup Local Passo-a-Passo](#setup-local-passo-a-passo)
4. [Arquivos Essenciais](#arquivos-essenciais)
5. [Configuração Git/GitHub](#configuração-gitgithub)
6. [Desenvolvimento](#desenvolvimento)
7. [Deploy](#deploy)

---

## 🎯 Visão Geral Rápida

Este é um **monorepo** com a seguinte estrutura:

```
pbl-medical-system (MIT + Proprietary Dual License)
│
├── 🟢 CORE (MIT - Open-Source)
│   ├── Algoritmos de revisão espaçada
│   ├── Adapters (Obsidian, Notion)
│   ├── Interfaces abstratas
│   └── Qualquer um pode usar/modificar/vender
│
├── 🔴 PROPRIETARY (Seu Controle)
│   ├── Backend SaaS avançado
│   ├── Features premium
│   ├── Integrações pagas
│   └── Não comit no GitHub público
│
└── 💼 BUSINESS
    ├── SaaS hosting em app. seu-site.com
    ├── Marketplace de plugins
    └── Suporte premium
```

---

## 📁 Estrutura de Pastas

### Completa com Comentários

```
pbl-medical-system/                    # Raiz do repositório
│
├── 📄 README.md                        # Documentação principal
├── 📄 CONTRIBUTING.md                  # Guia para contribuidores
├── 📄 LICENSE                          # MIT License (Copiar como-é)
├── 📄 LICENSE_PROPRIETARY              # Seu modelo comercial
├── 📄 LICENSE_STRATEGY. md              # Estratégia de licenças
├── 📄 . gitignore                       # Ignore proprietary/node_modules/etc
├── 📄 . env.example                     # Template de variáveis
├── 📄 docker-compose.yml               # Orquestração local
├── 📄 docker-compose.prod.yml          # Orquestração produção
│
│
├── 📁 shared/                          # Código compartilhado (MIT)
│   ├── types/
│   │   ├── flashcard.ts
│   │   ├── user.ts
│   │   ├── course.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── algorithms.ts
│   │   ├── ai-models.ts
│   │   └── index.ts
│   ├── enums/
│   │   ├── quality-levels.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── helpers.ts
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── index.ts
│   └── package.json
│
│
├── 📁 backend/                         # Serviços Backend
│   │
│   ├── 📁 api-gateway/                 # Express API Principal (MIT)
│   │   ├── src/
│   │   │   ├── controllers/            # Lógica de requisição
│   │   │   ├── services/               # Lógica de negócio
│   │   │   ├── repositories/           # Acesso a dados
│   │   │   ├── routes/                 # Rotas da API
│   │   │   ├── middleware/             # Auth, validation, errors
│   │   │   ├── types/                  # Interfaces TypeScript
│   │   │   ├── config/                 # Configurações
│   │   │   └── app.ts                  # Entrada do app
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # Definição do banco
│   │   │   └── migrations/             # Histórico de migrações
│   │   ├── __tests__/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── jest.config.js
│   │   └── README.md                   # Docs específico do serviço
│   │
│   ├── 📁 flashcard-engine/            # Engine de Flashcards (MIT)
│   │   ├── src/
│   │   │   ├── algorithms/             # SM2, FSRS, Leitner
│   │   │   │   ├── interfaces/
│   │   │   │   │   └── FlashcardAlgorithm. ts
│   │   │   │   ├── SM2Algorithm.ts
│   │   │   │   ├── FSRSAlgorithm.ts
│   │   │   │   ├── LeitnerAlgorithm.ts
│   │   │   │   └── index. ts
│   │   │   ├── factories/
│   │   │   │   └── AlgorithmFactory.ts
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   ├── types/
│   │   │   └── app.ts
│   │   ├── __tests__/
│   │   │   ├── unit/algorithms/
│   │   │   └── integration/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 obsidian-sync/               # Sync Obsidian/Notion (MIT)
│   │   ├── src/
│   │   │   ├── adapters/               # Obsidian, Notion adapters
│   │   │   │   ├── interfaces/
│   │   │   │   │   └── SyncAdapter.ts
│   │   │   │   ├── ObsidianAdapter.ts
│   │   │   │   ├── NotionAdapter.ts
│   │   │   │   └── index.ts
│   │   │   ├── parsers/                # Markdown, PDF parsers
│   │   │   ├── services/
│   │   │   ├── events/                 # Event emitter
│   │   │   └── app.ts
│   │   ├── __tests__/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── 📁 ai-service/                  # Serviço IA (Python + MIT)
│       ├── src/
│       │   ├── providers/              # OpenAI, Gemini, Perplexity
│       │   │   ├── base.py
│       │   │   ├── openai_provider.py
│       │   │   ├── gemini_provider.py
│       │   │   └── perplexity_provider. py
│       │   ├── factories/
│       │   │   └── ai_provider_factory.py
│       │   ├── services/
│       │   │   ├── rag_engine.py
│       │   │   ├── web_scraper.py
│       │   │   └── embeddings.py
│       │   ├── models/
│       │   └── main.py
│       ├── tests/
│       ├── Dockerfile
│       ├── requirements.txt
│       ├── pyproject.toml
│       └── README.md
│
│
├── 📁 frontend/                        # Next.js Frontend (MIT)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout. tsx
│   │   ├── (dashboard)/
│   │   │   ├── courses/
│   │   │   ├── flashcards/
│   │   │   ├── library/
│   │   │   ├── ai-assistant/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/                        # Route handlers
│   │   │   ├── auth/
│   │   │   ├── courses/
│   │   │   └── flashcards/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                         # Shadcn components
│   │   │   ├── button. tsx
│   │   │   ├── card.tsx
│   │   │   └── ... 
│   │   ├── features/
│   │   │   ├── CourseList.tsx
│   │   │   ├── FlashcardReview.tsx
│   │   │   └── ...
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── ... 
│   ├── lib/
│   │   ├── api. ts                      # API client
│   │   ├── hooks/
│   │   │   ├── useCourses.ts
│   │   │   ├── useFlashcards.ts
│   │   │   └── ... 
│   │   ├── utils. ts
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── package. json
│   ├── tsconfig.json
│   └── README.md
│
│
├── 📁 docs/                            # Documentação (MIT)
│   ├── ARCHITECTURE.md                 # Arquitetura detalhada
│   ├── AI_PROVIDERS.md                 # Como adicionar IA providers
│   ├── ALGORITHMS.md                   # Detalhes dos algoritmos
│   ├── DATABASE. md                     # Schema do banco
│   ├── API. md                          # Referência da API
│   ├── SETUP.md                        # Setup detalhado
│   ├── DEPLOYMENT.md                   # Como fazer deploy
│   ├── TROUBLESHOOTING.md              # FAQ e resoluções
│   └── CONTRIBUTING.md                 # Guia de contribuição
│
│
├── 📁 . github/                         # GitHub config (MIT)
│   ├── workflows/
│   │   ├── ci.yml                      # CI/CD tests
│   │   ├── lint.yml                    # Linting
│   │   ├── deploy-staging.yml          # Deploy staging
│   │   └── deploy-prod.yml             # Deploy produção
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── question.md
│   ├── PULL_REQUEST_TEMPLATE. md
│   └── dependabot.yml
│
│
└── 🔴 proprietary/                     # PRIVADO - Não commitar! 
    ├── . gitignore                      # **(IMPORTANTE:  ignore este diretório)**
    ├── LICENSE_PROPRIETARY
    ├── backend/
    │   ├── ai-providers/               # Integrações pagas
    │   ├── advanced-features/          # Features premium
    │   ├── analytics/                  # Analytics avançado
    │   └── enterprise/                 # Enterprise features
    ├── frontend/
    │   ├── premium-components/
    │   ├── advanced-dashboards/
    │   └── white-label/
    ├── saas/
    │   ├── billing/
    │   ├── subscriptions/
    │   ├── payments/                   # Stripe integration
    │   └── admin/
    └── scripts/
        ├── deploy-proprietary.sh
        └── backup. sh
```

---

## ⚙️ Setup Local Passo-a-Passo

### 1️⃣ Pré-requisitos

```bash
# Verificar versões instaladas
node --version          # v18+
npm --version           # v8+
docker --version        # 24+
python --version        # 3.10+
git --version           # 2.37+
```

**Se não tiver, instale:**
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Python 3.10+](https://www.python.org/)
- [Git](https://git-scm.com/)

### 2️⃣ Clonar Repositório

```bash
# Clone seu fork ou repositório
git clone https://github.com/seu-usuario/pbl-medical-system.git
cd pbl-medical-system

# Verificar remote
git remote -v
# Deve mostrar seu fork como origin

# (Opcional) Adicionar upstream
git remote add upstream https://github.com/Erick-Mafra-Edu/pbl-medical-system. git
```

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar com suas credenciais
nano .env  # ou use seu editor favorito
```

**Variáveis essenciais a configurar:**

```env
# ========== DATABASE ==========
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pbl_system_dev
DB_USER=postgres
DB_PASSWORD=seu_password_dev_local

# ========== REDIS ==========
REDIS_URL=redis://redis:6379

# ========== MINIO/S3 ==========
MINIO_ENDPOINT=minio:9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# ========== AI PROVIDERS (Teste) ==========
OPENAI_API_KEY=sk-test-sua-chave
GEMINI_API_KEY=test-key
PERPLEXITY_API_KEY=test-key

# ========== APP ==========
NODE_ENV=development
JWT_SECRET=seu_secret_jwt_dev_aqui
```

> ⚠️ **NÃO comite `.env` no Git!** Sempre use `.env.example`

### 4️⃣ Instalar Dependências

```bash
# Instalar dependências do workspace root
npm install

# Ou com pnpm/yarn (se preferir)
pnpm install
yarn install
```

Isso instalará dependências de todos os packages (monorepo).

### 5️⃣ Iniciar com Docker Compose

```bash
# Build imagens
docker-compose build

# Iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

**Saída esperada:**
```
NAME              STATUS      PORTS
postgres          Up 2 mins   5432/tcp
redis             Up 2 mins   6379/tcp
minio             Up 2 mins   9000/tcp, 9001/tcp
api-gateway       Up 1 min    3000/tcp
obsidian-sync     Up 1 min    3001/tcp
flashcard-engine  Up 1 min    3002/tcp
ai-service        Up 1 min    5000/tcp
frontend          Up 1 min    3010/tcp
```

### 6️⃣ Rodar Migrações

```bash
# Criar banco de dados
docker-compose exec api-gateway npx prisma migrate dev --name init

# Gerar cliente Prisma
docker-compose exec api-gateway npx prisma generate

# (Opcional) Seed dados de teste
docker-compose exec api-gateway npm run seed
```

### 7️⃣ Acessar Aplicação

Abra no browser: 

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Frontend | http://localhost:3010 | Criar nova conta |
| API Docs | http://localhost:3000/api/docs | N/A |
| MinIO | http://localhost:9001 | minioadmin / minioadmin |
| PgAdmin | http://localhost:5050 | admin@admin. com / admin |

### 8️⃣ Parar Serviços

```bash
# Parar tudo
docker-compose down

# Parar + remover volumes (reset)
docker-compose down -v

# Ver logs de um serviço
docker-compose logs -f api-gateway
```

---

## 📄 Arquivos Essenciais

### 1.  LICENSE (MIT - Copiar como-é)

Crie arquivo `/LICENSE`:

```
MIT License

Copyright (c) 2024 Erick Mafra

Permission is hereby granted, free of charge, to any person obtaining a copy... 
[Veja LICENSE_STRATEGY.md para versão completa]
```

### 2. . gitignore (Proteger Proprietary + Sensíveis)

Crie arquivo `/.gitignore`:

```bash
# ========== NODE ==========
node_modules/
dist/
build/
*.tgz
package-lock.json
pnpm-lock.yaml
yarn. lock

# ========== PYTHON ==========
__pycache__/
*.py[cod]
*$py.class
. venv/
venv/
env/
.egg-info/

# ========== ENVIRONMENT ==========
.env
.env.local
.env.*. local
.env.production
.env.test

# ========== IDE ==========
.vscode/
.idea/
*.swp
*.swo
*.sublime-project
*.sublime-workspace

# ========== OS ==========
.DS_Store
Thumbs.db

# ========== PRIVATE/PROPRIETARY ⚠️  ==========
proprietary/
private/
enterprise/
. secrets/
*. key
*. pem

# ========== BUILD ==========
.next/
dist/
out/
coverage/

# ========== LOGS ==========
*.log
npm-debug.log*
yarn-debug.log*
```

### 3. . env.example (Template)

Crie arquivo `/.env.example`:

```env
# Copie este arquivo para .env e preencha com suas credenciais

# ========== DATABASE ==========
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pbl_system
DB_USER=postgres
DB_PASSWORD=seu_password_aqui

# ========== REDIS ==========
REDIS_URL=redis://redis:6379

# ========== MINIO/S3 ==========
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=medical-materials

# ========== AI PROVIDERS ==========
OPENAI_API_KEY=sk-sua-chave-aqui
GEMINI_API_KEY=sua-chave-aqui
PERPLEXITY_API_KEY=sua-chave-aqui

# ========== JWT ==========
JWT_SECRET=seu_secret_super_seguro_aqui

# ========== NODE ==========
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. docker-compose.yml (Orquestração)

Crie arquivo `/docker-compose.yml`:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME:-pbl_system}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis: 7-alpine
    ports: 
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    ports: 
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  api-gateway:
    build: 
      context: ./backend/api-gateway
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      NODE_ENV: ${NODE_ENV:-development}
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY:  ${OPENAI_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend/api-gateway/src:/app/src

  flashcard-engine:
    build: 
      context: ./backend/flashcard-engine
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - redis

  ai-service:
    build:
      context: ./backend/ai-service
      dockerfile: Dockerfile
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "5000:5000"
    depends_on:
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api-gateway:3000
    ports:
      - "3010:3000"
    depends_on: 
      - api-gateway

volumes: 
  postgres_data:
  redis_data:
  minio_data:
```

### 5. package.json (Workspace Root)

Crie arquivo `/package.json`:

```json
{
  "name": "pbl-medical-system",
  "version": "1.0.0",
  "description": "Plataforma de estudos inteligente para Medicina com PBL",
  "private": true,
  "license": "MIT",
  "workspaces": [
    "backend/api-gateway",
    "backend/flashcard-engine",
    "backend/obsidian-sync",
    "frontend",
    "shared"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "type-check": "turbo run type-check",
    "docker: up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "migrate":  "docker-compose exec api-gateway npx prisma migrate dev"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

---

## 🔄 Configuração Git/GitHub

### 1. Criar Repositório no GitHub

```bash
# Opção A: Via Web
# 1. Vá para https://github.com/new
# 2. Nome:  pbl-medical-system
# 3. Descrição: "PBL Medical System - Open-Source Dual License"
# 4. Selecione:  Public
# 5. Não inicialize com README (já temos)
# 6. Clique "Create repository"

# Opção B: Via CLI (gh)
gh repo create pbl-medical-system --public --source=. --remote=origin
```

### 2. Configurar Git Localmente

```bash
# Setar identidade local (ou global)
git config user.name "Seu Nome"
git config user.email "seu-email@example.com"

# Adicionar remote
git remote add origin https://github.com/seu-usuario/pbl-medical-system.git

# Verificar remote
git remote -v
```

### 3. Primeiro Push

```bash
# Criar branch main
git checkout -b main

# Adicionar todos arquivos
git add .

# Commit inicial
git commit -m "feat: initial project setup with MIT + Proprietary dual license

- Set up monorepo structure
- Configure Docker Compose
- Add core algorithms (SM2, FSRS)
- Implement service architecture
- Add frontend scaffolding
- Configure environment"

# Push para GitHub
git push -u origin main
```

### 4. Proteger Branch main

No GitHub: 

```
Settings → Branches → Branch Protection Rules

✅ Require pull request reviews before merging
✅ Require status checks to pass
✅ Include administrators
✅ Require branches to be up to date
✅ Dismiss stale pull request approvals
```

### 5. Configurar GitHub Pages (Opcional)

```
Settings → Pages → Source
Selecione: Deploy from a branch
Branch: main
Folder: /docs

Acesse: https://seu-usuario.github.io/pbl-medical-system
```

---

## 💻 Desenvolvimento

### Fluxo de Feature

```bash
# 1. Update local
git pull origin main

# 2. Criar branch
git checkout -b feature/nova-feature

# 3. Instalar/desenvolver
npm install
npm run dev

# 4. Fazer commits
git commit -m "feat: adiciona suporte a Claude provider"

# 5. Push
git push origin feature/nova-feature

# 6. Abrir PR no GitHub
```

### Scripts Disponíveis

```bash
# Desenvolvimento (todos os serviços)
npm run dev

# Build tudo
npm run build

# Rodar testes
npm run test

# Linter + format
npm run lint
npm run format

# Docker
npm run docker:up       # Iniciar
npm run docker:down     # Parar
npm run docker:logs     # Ver logs

# Database
npm run migrate         # Rodar migrações
```

### Estrutura de Commits

```bash
# ✅ BOM
git commit -m "feat: add Claude AI provider

- Implements IAIProvider interface
- Adds factory method for instantiation
- Includes unit tests
- Closes #123"

# ❌ EVITAR
git commit -m "update"
git commit -m "fix bug"
```

---

## 🚀 Deploy

### Deploy em Staging

```bash
# Criar branch staging
git checkout -b staging

# Push
git push origin staging

# GitHub Actions roda automaticamente
# Veja . github/workflows/deploy-staging.yml
```

### Deploy em Produção

```bash
# Merge main → production
git checkout production
git pull origin production
git merge main
git push origin production

# Ou via GitHub (Releases)
# 1. Vá para Releases
# 2. Clique "Create new release"
# 3. Tag: v1.0.0
# 4. Publish release
```

---

## 📋 Checklist Final

Antes de fazer primeiro commit:

```
SETUP LOCAL:
[ ] Node, Docker, Python instalados
[ ] Variáveis . env configuradas
[ ] docker-compose up funcionando
[ ] Banco de dados criado
[ ] Frontend carregando em localhost: 3010

GITHUB:
[ ] Repositório criado
[ ] LICENSE adicionado (MIT)
[ ] .gitignore configurado
[ ] Branch main protegido
[ ] CONTRIBUTING.md adicionado

DOCUMENTAÇÃO:
[ ] README.md completo
[ ] SETUP.md com instruções
[ ] CONTRIBUTING.md com guias
[ ] API.md com endpoints

CI/CD:
[ ] GitHub Actions configurado
[ ] Testes rodando automaticamente
[ ] Linting ativo
[ ] Deploy workflow pronto

SEGURANÇA:
[ ] .env não commitado
[ ] proprietary/ ignorado no git
[ ] API keys não expostas
[ ] CORS configurado
```

---

## 🆘 Troubleshooting

### Docker não inicia

```bash
# Limpar tudo
docker-compose down -v

# Reconstruir
docker-compose build --no-cache

# Iniciar novamente
docker-compose up -d

# Ver logs
docker-compose logs api-gateway
```

### Erro de porta em uso

```bash
# Encontrar processo na porta
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou mudar porta em docker-compose. yml
```

### Banco não inicia

```bash
# Verificar volume
docker volume ls
docker volume inspect pbl_postgres_data

# Remover e recriar
docker-compose down -v
docker-compose up -d postgres
docker-compose exec postgres pg_isready
```

---

## 📚 Próximos Passos

1. ✅ Clonar este repositório
2. ✅ Configurar `.env`
3. ✅ Rodar `docker-compose up`
4. ✅ Explorar em `http://localhost:3010`
5. ✅ Ler `docs/ARCHITECTURE.md` para entender o fluxo
6. ✅ Fazer seu primeiro commit
7. ✅ Abrir seu primeiro Pull Request! 

---

## 🤝 Precisa de Ajuda?

- 📖 Leia [CONTRIBUTING.md](./CONTRIBUTING.md)
- 💬 Abra uma [Discussion](https://github.com/Erick-Mafra-Edu/pbl-medical-system/discussions)
- 🐛 Reporte [Issues](https://github.com/Erick-Mafra-Edu/pbl-medical-system/issues)
- 📧 Email:  seu-email@example.com

---

**Happy coding! 🚀**

Versão:  1.0.0 | Última atualização: 2024-01-20