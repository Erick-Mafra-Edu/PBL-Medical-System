# 🤝 Contributing to PBL Medical System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

---

## 🛠️ How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Description:** Clear and concise description of the bug
- **Steps to Reproduce:** Step-by-step instructions
- **Expected Behavior:** What you expected to happen
- **Actual Behavior:** What actually happened
- **Environment:** OS, Docker version, Node.js version, etc.
- **Screenshots:** If applicable

**Template:**
```markdown
**Bug Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: Ubuntu 22.04
- Docker: 24.0.5
- Browser: Chrome 120
```

### Suggesting Features

Feature suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide detailed description of the proposed feature
- Explain why this feature would be useful
- Include mockups or examples if possible

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test your changes**
5. **Commit with conventional commits**
6. **Push to your fork**
7. **Open a Pull Request**

---

## 💻 Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Git

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/PBL-Medical-System.git
cd PBL-Medical-System

# 2. Create a feature branch
git checkout -b feature/my-new-feature

# 3. Copy environment variables
cp .env.example .env

# 4. Start services
docker-compose up -d

# 5. Install dependencies for local development
cd backend/api-gateway && npm install
cd ../flashcard-engine && npm install
cd ../obsidian-sync && npm install
cd ../../frontend && npm install
```

---

## 📝 Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** rules (run `npm run lint`)
- Use **Prettier** for formatting
- Add **JSDoc comments** for public functions
- Use **async/await** instead of callbacks

**Example:**
```typescript
/**
 * Calculate next review date using SM2 algorithm
 * @param card - Current flashcard state
 * @param quality - Quality of recall (0-5)
 * @returns Updated flashcard with next review date
 */
export function calculateSM2(
  card: Flashcard,
  quality: number
): SM2Result {
  // Implementation
}
```

### Python

- Follow **PEP 8** style guide
- Use **type hints** for all functions
- Add **docstrings** for classes and functions
- Use **Black** for formatting

**Example:**
```python
def generate_flashcards(
    content: str,
    count: int = 10
) -> List[Dict[str, Any]]:
    """
    Generate flashcards from content using AI.
    
    Args:
        content: The text content to generate flashcards from
        count: Number of flashcards to generate (default: 10)
    
    Returns:
        List of flashcard dictionaries with question, answer, tags
    
    Raises:
        ValueError: If content is empty
        APIError: If AI service fails
    """
    # Implementation
```

### General Principles

- **DRY** (Don't Repeat Yourself)
- **KISS** (Keep It Simple, Stupid)
- **SOLID** principles
- Write **self-documenting code**
- Add comments for **complex logic** only

---

## 📦 Commit Guidelines

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(flashcard): add FSRS algorithm support

Implemented FSRS (Free Spaced Repetition Scheduler) as an
alternative to SM2. Provides better interval calibration
through probabilistic modeling.

Closes #42
```

```bash
fix(api): resolve JWT token expiration issue

Users were being logged out prematurely due to incorrect
token expiration calculation. Fixed by using seconds instead
of milliseconds.

Fixes #128
```

```bash
docs(setup): update Docker installation instructions

Added troubleshooting section for common Docker setup issues
on Windows and macOS.
```

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Added tests for new features
- [ ] Updated documentation if needed
- [ ] Branch is up to date with `main`

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass locally
```

### Review Process

1. **Automated Checks:** CI/CD runs tests and linters
2. **Code Review:** Maintainers review your code
3. **Feedback:** Address requested changes
4. **Approval:** Once approved, PR will be merged
5. **Merge:** Squash and merge into `main`

---

## 🏗️ Project Structure

```
pbl-medical-system/
├── backend/
│   ├── api-gateway/          # Main API gateway
│   ├── flashcard-engine/     # Spaced repetition engine
│   ├── obsidian-sync/        # Obsidian sync service
│   └── ai-service/           # AI & RAG service
├── frontend/                 # Next.js frontend
├── shared/                   # Shared types & utilities
├── docs/                     # Documentation
└── docker-compose.yml        # Orchestration
```

---

## 🧪 Testing

### Run Tests

```bash
# All services
npm test

# Specific service
cd backend/api-gateway
npm test

# With coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for all new features
- Maintain >80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

**Example:**
```typescript
describe('SM2Algorithm', () => {
  it('should increase interval for quality >= 3', () => {
    // Arrange
    const card = { interval: 1, repetition: 0, easeFactor: 2.5 };
    
    // Act
    const result = SM2Algorithm.calculate(card, 4);
    
    // Assert
    expect(result.interval).toBeGreaterThan(1);
    expect(result.repetition).toBe(1);
  });
});
```

---

## 📚 Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ❓ Questions?

- Open a [Discussion](https://github.com/Erick-Mafra-Edu/PBL-Medical-System/discussions)
- Join our community chat (if available)
- Email: [contact information]

---

Thank you for contributing! 🎉
