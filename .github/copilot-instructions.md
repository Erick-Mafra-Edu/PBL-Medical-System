🛠️ Global Development Workflow Rules
Post-Task Requirements:

Documentation: Every task must generate a technical documentation file in /PBL Docs/.

Commit Message: Create a descriptive commit message in English following Conventional Commits (e.g., feat:, fix:, refactor:).

Git Workflow:

Create a feature branch: feature/[TASK_NAME] or bugfix/[ISSUE_NAME].

Simulate the merge into the dev branch upon completion.

Markdown Documentation Standards (Obsidian Optimized):

Path: Always save in /PBL Docs/.

Frontmatter: Include YAML block with tags, created, and type.

Linking: Use Wikilinks [[File Name]] for cross-references.

Formatting: Use Obsidian Callouts (e.g., > [!INFO]) and clear headers for Outline view.

🚀 Optimized Prompts
1. New AI Provider (Python)
@workspace Create a new AI provider for [PROVIDER_NAME] (e.g., Claude, Cohere).

Context:

Base File: backend/ai-service/src/providers/base.py

Reference: OpenAI, Gemini, and Perplexity providers.

Interface: Must implement AIProvider.

Requirements:

Class [PROVIDER_NAME]Provider inheriting from AIProvider.

Integration with [PROVIDER_NAME] API.

Implementation of: generate_text(prompt: str), generate_flashcards(content: str, count: int), and answer_with_context(question: str, context: str).

Robust error handling for timeouts and rate limits.

Structured logging using logger.info/warn/error.

Unit tests using pytest and unittest.mock.

Register the provider in AIProviderFactory.

2. Spaced Repetition Algorithm (TypeScript)
@workspace Implement the [ALGORITHM_NAME] algorithm (e.g., FSRS, Custom) for the flashcard engine.

Context:

Path: backend/flashcard-engine/src/algorithms/[ALGORITHM_NAME]Algorithm.ts

Interface: Must implement FlashcardAlgorithm.

Reference: SM2Algorithm and FSRSAlgorithm.

Requirements:

Class [ALGORITHM_NAME]Algorithm implementing FlashcardAlgorithm.

Methods: calculate(card: Flashcard, quality: number), getName(), and getDescription().

Parameter validation and edge case handling.

Detailed comments explaining each mathematical step.

Unit tests with Jest.

Register in AlgorithmFactory.

Use LaTeX for mathematical formulas in the documentation.

3. Sync Adapter (TypeScript)
@workspace Create a new synchronization adapter for [PLATFORM_NAME] (e.g., Google Keep, Evernote).

Context:

Path: backend/obsidian-sync/src/adapters/[PLATFORM_NAME]Adapter.ts

Interface: Must implement SyncAdapter.

Reference: ObsidianAdapter and NotionAdapter.

Requirements:

Implement fetchNotes(), pushNote(note: Note), deleteNote(noteId: string), getName(), and isConnected().

Handle Auth/Authz using the platform's token system.

Map platform properties to the local Note model.

Structured logging and rate limiting management.

Unit tests with platform-specific mock data.

Documentation on how to configure the integration.

Register in SyncAdapterFactory.

4. Unit Test Generation
@workspace Generate unit tests for the function/class [FUNCTION_NAME].

Context:

File: [FILE_PATH]

Technology: [Jest/pytest]

Key Cases: [CASE_1], [CASE_2], [CASE_3].

Requirements:

Aim for minimum 80% coverage.

Test both "Happy Path" and error/edge cases.

Use fixtures/mocks for all external dependencies.

Use descriptive naming: it('should...', () => {}) or def test_should_....

5. Code Refactoring
@workspace Refactor the code in [FILE_PATH].

Identified Issues:

[ISSUE_1]

[ISSUE_2]

Requirements:

Apply appropriate Design Patterns (Factory, Strategy, Adapter).

Separate responsibilities (SRP) and improve readability.

Maintain the same public interface to prevent breaking changes.

Ensure all existing tests pass.

6. Bug Fix
@workspace Fix a bug in [FILE_PATH].

Symptoms:

[SYMPTOM_1]

[SYMPTOM_2]

Behavior:

Expected: [DESCRIBE_EXPECTED]

Actual: [DESCRIBE_ACTUAL]

Requirements:

Analyze the root cause and implement the fix.

Provide a brief explanation of the cause.

Update/Add a test case to prevent regression.

7. Technical Documentation
@workspace Generate documentation for [NAME].

Context:

File: [FILE_PATH]

Complexity: [low/medium/high]

Target Audience: [developers/devops/users]

Content:

Summary and Purpose.

Parameters, Types, and Return Values.

Usage Examples.

Exceptions/Error handling.

Performance considerations.

Follow Obsidian Optimized rules (YAML, Wikilinks, Callouts).