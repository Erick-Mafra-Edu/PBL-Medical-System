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