# 🤖 Copilot Instructions - PBL Medical System

> **Guia Prático para Usar GitHub Copilot Efetivamente Neste Projeto**

---

## 📖 Índice

1. [Setup Rápido](#setup-rápido)
2. [Prompts Pré-Prontos](#prompts-pré-prontos)
3. [Padrões do Projeto](#padrões-do-projeto)
4. [Arquitetura & Design Patterns](#arquitetura--design-patterns)
5. [Exemplos Prontos](#exemplos-prontos)
6. [Best Practices](#best-practices)
7. [Atalhos & Tips](#atalhos--tips)
8. [Segurança](#segurança)

---

## 🚀 Setup Rápido

### 1. Instalar Copilot

```bash
# VS Code Extensions:
# 1. GitHub Copilot (oficial)
# 2. GitHub Copilot Chat (para conversar)
# 3. GitHub Copilot Labs (experimental)

# Ou busque na VS Code Extension Marketplace
```

### 2. Fazer Login

```
Ctrl+Shift+P → "GitHub Copilot: Sign In"
Autorize com sua conta GitHub
```

### 3. Abrir Chat

```
Ctrl+Shift+I (Windows/Linux)
Cmd+Shift+I (Mac)

Ou clique no ícone Copilot na sidebar
```

---

## 💬 Prompts Pré-Prontos

Use estes prompts já testados no projeto:

### 1️⃣ Adicionar Novo Provedor de IA

```
@workspace
Crie um novo provedor de IA para [PROVIDER_NAME] (ex: Claude, Cohere).

Contexto:
- Arquivo base: backend/ai-service/src/providers/base.py
- Existem provedores OpenAI, Gemini, Perplexity como referência
- Deve implementar a interface AIProvider

Requisitos:
1. Classe [PROVIDER_NAME]Provider herdando de AIProvider
2. Conectar à API [PROVIDER_NAME]
3. Implementar métodos:
   - generate_text(prompt: str) -> str
   - generate_flashcards(content: str, count: int) -> List[dict]
   - answer_with_context(question: str, context: str) -> str
4. Tratamento de erros para timeouts e rate limits
5. Logging estruturado com logger.info/warn/error
6. Testes unitários com pytest e mocks
7. Adicionar à factory em AIProviderFactory

Use padrão dos provedores existentes.
Use Python com type hints completos.
```

### 2️⃣ Implementar Novo Algoritmo de Flashcard

```
@workspace
Implemente o algoritmo [ALGORITHM_NAME] (ex: FSRS, Custom) 
para o engine de flashcards.

Contexto:
- Arquivo: backend/flashcard-engine/src/algorithms/[ALGORITHM_NAME]Algorithm.ts
- Deve implementar interface FlashcardAlgorithm
- SM2Algorithm e FSRSAlgorithm existem como referência

Requisitos:
1. Classe [ALGORITHM_NAME]Algorithm implementando FlashcardAlgorithm
2. Métodos:
   - calculate(card: Flashcard, quality: number): Flashcard
   - getName(): string
   - getDescription(): string
3. Validação de parâmetros
4. Tratamento de edge cases
5. Logging com logger.info
6. Testes unitários com Jest
7. Documentação com fórmulas matemáticas (se aplicável)

Use TypeScript com tipos rigorosos.
Adicione comentários explicando cada cálculo.
Registre na AlgorithmFactory.
```

### 3️⃣ Criar Novo Adapter (Obsidian/Notion/etc)

```
@workspace
Crie um novo adapter de sincronização para [PLATFORM_NAME] 
(ex: Google Keep, Evernote, OneNote).

Contexto:
- Arquivo: backend/obsidian-sync/src/adapters/[PLATFORM_NAME]Adapter.ts
- Deve implementar interface SyncAdapter
- ObsidianAdapter e NotionAdapter existem como referência

Requisitos:
1. Classe [PLATFORM_NAME]Adapter implementando SyncAdapter
2. Métodos:
   - fetchNotes(): Promise<Note[]>
   - pushNote(note: Note): Promise<void>
   - deleteNote(noteId: string): Promise<void>
   - getName(): string
   - isConnected(): boolean
3. Autenticação/autorização com token da plataforma
4. Mapeamento de properties da plataforma → modelo Note
5. Tratamento de erros e rate limiting
6. Logging estruturado
7. Testes com dados mock da plataforma
8. Documentação de como configurar

Use TypeScript com tipos completos.
Siga padrão dos adapters existentes.
Registre na SyncAdapterFactory.
```

### 4️⃣ Gerar Testes Unitários

```
@workspace
Gere testes unitários para a função/classe [FUNCTION_NAME].

Contexto:
- Arquivo: [FILE_PATH]
- Tecnologia: [Jest/pytest]
- Casos de teste importantes:
  - [CASE_1]
  - [CASE_2]
  - [CASE_3]

Requisitos:
1. Use [Jest/pytest] com mocks
2. Coverage mínimo de 80%
3. Testes para happy path + error cases
4. Use fixtures/mocks para dependências
5. Nomes descritivos: it('should...', () => {})

Siga o padrão dos testes existentes no projeto.
```

### 5️⃣ Refatorar Código

```
@workspace
Refatore o código em [FILE_PATH].

Problemas:
- [PROBLEM_1]
- [PROBLEM_2]
- [PROBLEM_3]

Requisitos:
1. Separar responsabilidades
2. Usar design patterns apropriados
3. Melhorar legibilidade
4. Manter mesma interface pública
5. Não quebrar testes existentes

Siga padrões do projeto (Factory, Strategy, Adapter).
Adicione comentários explicando mudanças.
```

### 6️⃣ Corrigir Bug

```
@workspace
Há um bug em [FILE_PATH].

Sintomas:
- [SYMPTOM_1]
- [SYMPTOM_2]

Contexto:
- O que deveria acontecer: [EXPECTED]
- O que está acontecendo: [ACTUAL]

Analise o código, identifique o problema e corrija.
Explique a causa do bug.
```

### 7️⃣ Gerar Documentação

```
@workspace
Gere documentação para a função/classe [NAME].

Contexto:
- Arquivo: [FILE_PATH]
- Complexidade: [low/medium/high]
- Público alvo: [developers/devops/users]

Inclua:
1. Descrição do que faz
2. Parâmetros e tipos
3. Retorno esperado
4. Exemplos de uso
5. Exceções lançadas
6. Performance considerations (se aplicável)

Use JSDoc para TypeScript, docstrings para Python.
```

---

## 📐 Padrões do Projeto

### TypeScript - Factory Pattern

```typescript
@workspace
Crie um factory para [ENTITY_NAME] seguindo este padrão:

export class [ENTITY_NAME]Factory {
  static create(type: string): [INTERFACE_NAME] {
    // Validar tipo
    // Obter credenciais de .env
    // Retornar instância correta
    // Throw error se não configurado
  }

  static createWithFallback(options: string[]): [INTERFACE_NAME] {
    // Tentar cada opção em ordem
    // Retornar primeira disponível
    // Throw error se nenhuma funcionar
  }

  private static validate(type: string): void {
    // Validação
  }
}

Use este padrão exatamente.
```

### TypeScript - Strategy Pattern

```typescript
@workspace
Implemente o strategy pattern para [DOMAIN]:

export interface [STRATEGY_NAME] {
  execute(input: [INPUT_TYPE]): [OUTPUT_TYPE];
  getName(): string;
}

export class [CONCRETE_STRATEGY]Strategy implements [STRATEGY_NAME] {
  execute(input: [INPUT_TYPE]): [OUTPUT_TYPE] {
    // Implementação específica
  }

  getName(): string {
    return '[CONCRETE_STRATEGY]';
  }
}

export class [CONTEXT_CLASS] {
  constructor(private strategy: [STRATEGY_NAME]) {}

  run(input: [INPUT_TYPE]): [OUTPUT_TYPE] {
    return this.strategy.execute(input);
  }
}

Siga este padrão.
```

### TypeScript - Error Handling

```typescript
@workspace
Implemente error handling seguindo este padrão:

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      error: {
        statusCode: this.statusCode,
        message: this.message,
        code: this.code,
        details: this.details
      }
    };
  }
}

// Uso:
throw new AppError(400, 'Validação falhou', 'VALIDATION_ERROR', { field: 'email' });
throw new AppError(500, 'Erro interno', 'INTERNAL_ERROR');

Use este padrão em todo novo código.
```

### Python - Abstract Base Class

```python
@workspace
Crie uma classe base abstrata para [ENTITY]:

from abc import ABC, abstractmethod
from typing import Any, Dict, List

class [ENTITY_BASE](ABC):
    """Base class for [ENTITY] implementations"""

    @abstractmethod
    def validate(self) -> bool:
        """Validate entity"""
        pass

    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        pass

class [CONCRETE_ENTITY]([ENTITY_BASE]):
    def __init__(self, **kwargs):
        # Initialize
        pass

    def validate(self) -> bool:
        # Implement validation
        return True

    def to_dict(self) -> Dict[str, Any]:
        # Implement conversion
        return {}

Siga este padrão com type hints.
```

### Logging Estruturado

```
@workspace
Use logger estruturado em novo código:

TypeScript:
import { logger } from '@shared/logger';
logger.info('Iniciando operação', { operationId, userId });
logger.warn('Limite atingido', { retryAfter: 60 });
logger.error('Erro crítico', { error: e.message, stack: e.stack });

Python:
import logging
logger = logging.getLogger(__name__)
logger.info(f"Starting operation with id={operation_id}")
logger.warning(f"Rate limit reached, retry after {retry_after}s")
logger.error(f"Critical error: {str(e)}", exc_info=True)

Estrutura: logger.{level}(mensagem, contexto)
Sempre inclua contexto relevante (IDs, status, etc)
```

---

## 🏗️ Arquitetura & Design Patterns

### Estrutura de Camadas

```
@workspace
Siga esta estrutura de camadas:

controllers/  → routes/  → services/  → repositories/  → database
   (HTTP)        (paths)    (logic)      (queries)        (DB)
   ↓              ↓          ↓            ↓                ↓
Recebe      Define      Lógica de    Abstração      Persistence
requisição  endpoints   negócio      de dados

Exemplo de fluxo:
1. POST /api/flashcards → controller.createFlashcard()
2. controller → service.createFlashcard()
3. service → repository.save()
4. repository → database

Não pule camadas!
```

### Injeção de Dependência

```typescript
@workspace
Use injeção de dependência:

// ✅ BOM - Dependências injetadas
export class FlashcardService {
  constructor(
    private repository: FlashcardRepository,
    private aiService: AIService,
    private logger: Logger
  ) {}

  async createFlashcard(data: CreateFlashcardDTO) {
    try {
      this.logger.info('Creating flashcard', { data });
      const flashcard = await this.repository.create(data);
      return flashcard;
    } catch (error) {
      this.logger.error('Failed to create flashcard', { error });
      throw error;
    }
  }
}

// ❌ RUIM - Dependências hardcoded
export class FlashcardService {
  repository = new FlashcardRepository();
  ai = new AIService();
}

Use DI em toda classe que tem dependências.
```

### Padrão Repository

```typescript
@workspace
Implemente repository pattern:

export interface IFlashcardRepository {
  create(data: CreateFlashcardDTO): Promise<Flashcard>;
  findById(id: string): Promise<Flashcard | null>;
  update(id: string, data: UpdateFlashcardDTO): Promise<Flashcard>;
  delete(id: string): Promise<void>;
  findDueToday(userId: string): Promise<Flashcard[]>;
}

export class FlashcardRepository implements IFlashcardRepository {
  constructor(private db: Database) {}

  async create(data: CreateFlashcardDTO): Promise<Flashcard> {
    return this.db.flashcard.create({ data });
  }

  async findById(id: string): Promise<Flashcard | null> {
    return this.db.flashcard.findUnique({ where: { id } });
  }

  // ... outros métodos
}

Use tipos e interfaces sempre.
Nunca use any.
```

---

## 💡 Exemplos Prontos

### Exemplo 1: Adicionar Provedor OpenAI (Verificado)

```
@workspace
Implemente um novo provedor OpenAI com suporte a GPT-4 Turbo.

Requisitos:
- Classe OpenAIProvider em backend/ai-service/src/providers/openai_provider.py
- Suporte a model selection (gpt-4-turbo, gpt-3.5-turbo)
- Streaming de respostas (para futuro uso)
- Cache de embeddings com Redis
- Retry logic com exponential backoff
- Logging de tokens usados (para billing)

Métodos:
- generate_text(prompt, model='gpt-4-turbo')
- generate_flashcards(content, count=10)
- estimate_tokens(text) -> int
- answer_with_context(question, context)

Use type hints completos.
Adicione docstrings.
```

### Exemplo 2: Implementar FSRS Algorithm (Verificado)

```
@workspace
Implemente algoritmo FSRS em backend/flashcard-engine/src/algorithms/FSRSAlgorithm.ts

Contexto:
- FSRS é mais avançado que SM2
- Usa modelo probabilístico de retenção
- Melhor para calibração de intervalos

Fórmulas principais:
- R(t) = (1 + DECAY * t) ^ -STABILITY
- Novo intervalo = (retention_target / ln(0.9)) * WEIGHT[9]

Métodos:
- calculate(card, quality, targetRetention=0.9)
- estimateRetention(interval, stability)
- getStage(repetitions) → 'learning' | 'review' | 'relearning'

Testes para:
- Qualidade 0-5
- Diferentes estágios
- Calibração correta

Use TypeScript com tipos rigorosos.
Adicione fórmulas em comentários.
```

### Exemplo 3: Sistema RAG com LangChain (Verificado)

```
@workspace
Implemente RAG Engine em backend/ai-service/src/services/rag_engine.py

Requisitos:
- Indexar notas do vault Obsidian
- Busca semântica com OpenAI embeddings
- Vector store: Chroma (local) ou Pinecone (cloud)
- Cache de embeddings com TTL
- Fallback se vector DB indisponível

Classe RAGEngine:
  __init__(vault_path, vector_db)
  index_notes() → indexa todas notas
  search(query, top_k=5) → busca semântica
  answer_question(question) → resposta com contexto + sources
  update_notes() → incremental update

Features:
- Chunking inteligente (overlap de 50 chars)
- Metadata preservação
- Citation tracking
- Query expansion

Testes com dados mock.
```

---

## ⭐ Best Practices

### ✅ Sempre Fazer

```
✅ Revisar código gerado pelo Copilot
✅ Usar @workspace para contexto completo
✅ Ser específico nos prompts
✅ Incluir exemplos/padrões existentes
✅ Validar tipos e erros
✅ Escrever testes para código novo
✅ Adicionar comentários explicativos
✅ Usar logging estruturado
✅ Seguir padrões do projeto
✅ Fazer commits com mensagens claras
```

### ❌ Nunca Fazer

```
❌ Aceitar código cegamente
❌ Usar prompts vagos ("Crie uma função")
❌ Deixar API keys no código
❌ Ignorar erros de type
❌ Pular unit tests
❌ Usar variáveis genéricas (x, data, etc)
❌ Deixar console.log em código
❌ Fazer hardcoding de valores
❌ Ignorar tratamento de erro
❌ Commitar sem revisar mudanças
```

### Iteração Rápida

```
Ciclo típico (5 minutos):

1. Escrever prompt específico (1 min)
   ↓
2. Aceitar sugestão do Copilot (Tab) (1 min)
   ↓
3. Revisar código (1 min)
   ↓
4. Se ruim: Ctrl+Z e reescrever prompt (2 min)
   ↓
5. Testar (rodar testes)
   ↓
6. Commit!

Se não funcionar na primeira:  não desista!
Reescreva o prompt mais específico.
Use exemplos do projeto.
```

---

## ⌨️ Atalhos & Tips

### Atalhos Principais

| Ação | Windows/Linux | Mac |
|------|--------------|-----|
| **Abrir Chat** | Ctrl+Shift+I | Cmd+Shift+I |
| **Aceitar sugestão inline** | Tab | Tab |
| **Rejeitar** | Esc | Esc |
| **Próxima sugestão** | Alt+] | Option+] |
| **Sugestão anterior** | Alt+[ | Option+[ |
| **Abrir painel** | Ctrl+Enter | Cmd+Enter |
| **Desfazer** | Ctrl+Z | Cmd+Z |

### Chat Commands

```
/explain    → Explicar código
/tests      → Gerar testes
/fix        → Corrigir código
/refactor   → Refatorar
/doc        → Gerar documentação

Exemplos:
/explain @workspace SM2Algorithm
/tests backend/api-gateway/src/services/AIService.ts
/fix #database error
```

### Contexto com @

```
@workspace     → Contexto de todo projeto
@[filename]    → Arquivo específico
@#[issue]      → Referência a issue
@pr[#123]      → Referência a PR

Exemplo:
@workspace Usando os adapters em @ObsidianAdapter, 
crie novo @NotionAdapter seguindo o mesmo padrão
```

### Dicas Avançadas

```
1. Múltiplas sugestões:
   Ctrl+Enter → mostra 10 opções
   Escolha a melhor com setas
   Tab para aceitar

2. Copilot aprende seu estilo:
   - Mantém estilo consistente
   - Aprende padrões do projeto
   - Melhora com uso

3. Combinar com comentários:
   /**
    * Valida flashcard
    * Lança ValidationError se inválido
    * Retorna flashcard validado
    */
   export function validateFlashcard(card: unknown): Flashcard {
     // Copilot gera implementação completa
   }

4. Usar como pair programmer:
   - Escreva pseudocódigo
   - Copilot completa implementação
   - Você revisa e melhora
```

---

## 🔒 Segurança

### ❌ NUNCA

```
❌ API keys no prompt
  "Use minha chave sk-abc123"

❌ Dados sensíveis em prompt
  "Dados dos clientes: John, Age 30..."

❌ Senhas hardcoded
  password = "admin123"

❌ URLs sensíveis
  "Nosso servidor: https://internal-api.empresa.com"

❌ Padrões de autenticação expostos
  "Usamos JWT com secret: abc123"
```

### ✅ FAÇA

```
✅ Use variáveis de ambiente
   const apiKey = process.env.OPENAI_API_KEY;

✅ Referencie documentação
   "Segundo a docs de OpenAI..."

✅ Descreva estrutura genérica
   "Classe que conecta a uma API REST"

✅ Foque em lógica, não dados
   "Validar se email é válido"

✅ Revise código gerado
   Nunca aceite secrets cegamente
```

### Validação de Input

```
@workspace
Valide todos inputs usando Zod/Pydantic:

TypeScript com Zod:
import { z } from 'zod';

const createFlashcardSchema = z.object({
  question: z.string().min(10).max(1000),
  answer: z.string().min(10).max(5000),
  courseId: z.string().uuid(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export async function createFlashcard(req: Request) {
  const data = createFlashcardSchema.parse(await req.json());
  // data é seguro agora
}

Python com Pydantic:
from pydantic import BaseModel, validator

class CreateFlashcardDTO(BaseModel):
    question: str
    answer: str
    courseId: str

    @validator('question')
    def question_length(cls, v):
        if len(v) < 10:
            raise ValueError('min 10 chars')
        return v
```

---

## 📚 Recursos

### Documentação Oficial

- [GitHub Copilot Docs](https://docs.github.com/en/copilot)
- [VS Code Copilot](https://code.visualstudio.com/docs/editor/artificial-intelligence)
- [Prompting Best Practices](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/)

### Comunidade

- [GitHub Discussions](https://github.com/github-copilot)
- [Stack Overflow: copilot tag](https://stackoverflow.com/questions/tagged/github-copilot)

### Recursos do Projeto

- [README.md](./README.md) - Visão geral
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribuir
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitetura

---

## 🎓 Exemplo Completo: Dev com Copilot

### Cenário: Implementar Novo Adapter Notion

```
Passo 1: Abrir Copilot Chat
Ctrl+Shift+I

Passo 2: Entender padrão existente
User: @workspace
Como os adapters funcionam?  Mostre exemplo de ObsidianAdapter.

Copilot: [Explica padrão SyncAdapter]

Passo 3: Implementar novo adapter
User: @workspace
Crie NotionAdapter implementando SyncAdapter.

Contexto:
- Use Notion SDK (npm install @notionhq/client)
- Conectar com token de autenticação
- Buscar pages de database
- Mapear properties → campos Note

#NotionAdapter deveria ter:
- Constructor(databaseId, token)
- fetchNotes()
- pushNote()
- deleteNote()

Siga padrão do #ObsidianAdapter

Copilot: [Gera código completo]

Passo 4: Revisar
User: 
Preciso adicionar retry logic para Notion API.
Se falhar, tentar 3 vezes com backoff exponencial.

Copilot: [Melhora o código]

Passo 5: Testes
User: /tests

[Copilot gera testes unitários]

Passo 6: Documentação
User: /doc

Copilot: [Gera JSDoc completo]

Passo 7: Finalizar
npm test
git add .
git commit -m "feat: add Notion adapter

- Implements SyncAdapter interface
- Supports authentication with token
- Fetches pages from database
- Includes retry logic with exponential backoff
- Comprehensive tests
- Full JSDoc documentation"
git push origin feature/notion-adapter
```

---

## ✅ Checklist: Pronto para Usar Copilot

```
Antes de começar:
[ ] Extensão GitHub Copilot instalada
[ ] Copilot Chat disponível (Ctrl+Shift+I funciona)
[ ] Fazendo login com conta GitHub
[ ] Leu este arquivo inteiro
[ ] Entendeu padrões do projeto (Factory, Strategy, etc)

Ao escrever prompt:
[ ] Prompt é específico (não vago)
[ ] Inclui contexto relevante (@workspace, #arquivo)
[ ] Referencia padrões existentes
[ ] Explica requisitos claramente
[ ] Não inclui API keys ou dados sensíveis

Após Copilot gerar código:
[ ] Revisei o código completamente
[ ] Tipos TypeScript estão corretos
[ ] Error handling está implementado
[ ] Logging está presente
[ ] Código segue padrões do projeto
[ ] Passei nos testes
[ ] Adicionei comentários onde necessário
[ ] Commitei com mensagem clara
```

---

## 🎯 Próximos Passos

1. 🚀 Instale Copilot (se não tiver)
2. 📖 Leia este arquivo na íntegra
3. 💬 Abra uma issue/discussion se tiver dúvidas
4. 🔨 Comece a usar nos seus commits!
5. 📈 Iterativamente melhore seus prompts

---

**Pro Tips:**

- 🎓 Copilot não substitui conhecimento - ele acelera
- 🔍 Sempre revise código gerado (segurança critical!)
- 📚 Copilot aprende - quanto mais usa, melhor fica
- 💡 Bons prompts = código bom
- 🤝 Use como pair programmer, não como substituto

---

**Dúvidas?**

- 📖 Consulte [docs/](./docs/)
- 💬 Abra [Discussions](https://github.com/Erick-Mafra-Edu/pbl-medical-system/discussions)
- 🐛 Reporte [Issues](https://github.com/Erick-Mafra-Edu/pbl-medical-system/issues)

---

**Versão:** 1.0.0  
**Última atualização:** 2024-01-20  
**Status:** ✅ Pronto para usar

Happy coding with Copilot! 🤖✨