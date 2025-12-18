---
tags:
  - obsidian
  - utilities
  - parser
  - markdown
created: 2025-12-18
type: documentation
---

# 🔧 Obsidian Sync Utilities

> [!INFO]
> Comprehensive markdown parsing and content categorization utilities for Obsidian synchronization

---

## 📍 Location

**File**: `backend/obsidian-sync/src/utils/parser.ts`  
**Size**: ~400 lines  
**Language**: TypeScript  
**Dependencies**: TypeScript standard library only

---

## 🎯 Parser Utilities (`parser.ts`)

### Overview
The parser module provides comprehensive markdown parsing capabilities for extracting structured data from Obsidian vault notes.

---

### Core Functions

#### 1. `parseMarkdown(content: string): ParsedMarkdown`

**Purpose**: Main parser function - extracts all structured data from markdown content

**Parameters**:
- `content` (string): Raw markdown file content

**Returns**:
```typescript
interface ParsedMarkdown {
  frontmatter: Record<string, any>;
  headings: Heading[];
  links: Link[];
  codeBlocks: CodeBlock[];
  metadata: Metadata;
  rawContent: string;
}
```

**Example**:
```typescript
const content = `---
tags: [anatomy, cardiology]
---
# Cardiac System

## Structure
The heart is composed of...

[[Related Note]]
\`\`\`python
print("Example")
\`\`\`
`;

const parsed = parseMarkdown(content);
// parsed.frontmatter = { tags: ["anatomy", "cardiology"] }
// parsed.headings = [{ level: 1, title: "Cardiac System" }, ...]
// parsed.links = [{ text: "Related Note", ... }]
```

---

#### 2. `extractFrontmatter(content: string): Record<string, any>`

**Purpose**: Extract YAML frontmatter from markdown file

**Parameters**:
- `content` (string): Raw markdown content

**Returns**: YAML object as dictionary

**Behavior**:
- Extracts content between `---` delimiters
- Parses YAML format
- Returns empty object if no frontmatter

**Example**:
```typescript
const content = `---
tags: [anatomy, cardiology]
difficulty: intermediate
created: 2025-12-18
---
Content here`;

const frontmatter = extractFrontmatter(content);
// { tags: ["anatomy", "cardiology"], difficulty: "intermediate", ... }
```

---

#### 3. `extractHeadings(content: string): Heading[]`

**Purpose**: Extract all markdown headings with hierarchy

**Parameters**:
- `content` (string): Markdown content

**Returns**:
```typescript
interface Heading {
  level: number;      // 1-6
  title: string;      // heading text
  id: string;         // anchor id
  lineNumber: number; // position in file
}
```

**Behavior**:
- Parses `#`, `##`, `###`, etc.
- Generates anchor IDs from titles
- Preserves heading hierarchy

**Example**:
```typescript
const headings = extractHeadings(markdown);
// [
//   { level: 1, title: "Cardiac System", id: "cardiac-system", lineNumber: 5 },
//   { level: 2, title: "Structure", id: "structure", lineNumber: 8 }
// ]
```

---

#### 4. `extractLinks(content: string): Link[]`

**Purpose**: Extract internal and external links

**Parameters**:
- `content` (string): Markdown content

**Returns**:
```typescript
interface Link {
  text: string;        // link display text
  url: string;         // link destination
  type: 'internal' | 'external' | 'heading';
  lineNumber: number;
}
```

**Link Types**:
- **Internal**: `[[Note Name]]` or `[[Note#Heading]]`
- **External**: `[Text](https://...)`
- **Heading**: `[[#Heading]]`

**Example**:
```typescript
const links = extractLinks(markdown);
// [
//   { text: "Anatomy Basics", url: "Anatomy Basics", type: "internal" },
//   { text: "Wikipedia", url: "https://wikipedia.org", type: "external" },
//   { text: "Section", url: "#structure", type: "heading" }
// ]
```

---

#### 5. `extractCodeBlocks(content: string): CodeBlock[]`

**Purpose**: Extract all code blocks with language specification

**Parameters**:
- `content` (string): Markdown content

**Returns**:
```typescript
interface CodeBlock {
  language: string;   // python, javascript, etc.
  code: string;       // code content
  lineNumber: number;
}
```

**Example**:
```typescript
const blocks = extractCodeBlocks(markdown);
// [
//   {
//     language: "python",
//     code: "import pandas\ndf = pd.read_csv('data.csv')",
//     lineNumber: 15
//   }
// ]
```

---

#### 6. `extractMetadata(content: string): Metadata`

**Purpose**: Extract key metadata from document

**Parameters**:
- `content` (string): Markdown content

**Returns**:
```typescript
interface Metadata {
  wordCount: number;
  lineCount: number;
  codeBlockCount: number;
  linkCount: number;
  headingCount: number;
  lastModified?: string;
  fileSize: number;
}
```

**Example**:
```typescript
const meta = extractMetadata(markdown);
// {
//   wordCount: 1250,
//   lineCount: 87,
//   codeBlockCount: 3,
//   linkCount: 12,
//   headingCount: 5,
//   fileSize: 8234
// }
```

---

## 🏷️ Tagger Utilities (`tagger.ts`)

### Overview
The tagger module provides intelligent categorization and auto-tagging of medical content extracted from markdown files.

**File**: `backend/obsidian-sync/src/utils/tagger.ts`  
**Size**: ~350 lines

---

### Core Functions

#### 1. `tagAndCategorize(content: string, title: string): TaggingResult`

**Purpose**: Main function - automatically tags and categorizes content

**Parameters**:
- `content` (string): Document content
- `title` (string): Document title

**Returns**:
```typescript
interface TaggingResult {
  tags: string[];
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  keywords: string[];
  suggestedFilename: string;
  medicalTopics: string[];
}
```

**Example**:
```typescript
const result = tagAndCategorize(
  "The cardiac cycle consists of systole and diastole phases...",
  "Cardiac Physiology"
);
// {
//   tags: ["cardiology", "physiology", "cycles"],
//   categories: ["Physiology"],
//   difficulty: "intermediate",
//   keywords: ["cardiac", "systole", "diastole"],
//   medicalTopics: ["Cardiology", "Cardiovascular System"],
//   suggestedFilename: "cardiac-physiology-intermediate"
// }
```

---

#### 2. `extractTags(content: string): string[]`

**Purpose**: Extract relevant tags from content

**Parameters**:
- `content` (string): Document content

**Returns**: Array of tags

**Tag Generation**:
- Medical keywords
- Anatomical structures
- Disease names
- Procedures
- Concepts

**Example**:
```typescript
const tags = extractTags("Discussion of myocardial infarction and ECG changes");
// ["cardiology", "myocardial-infarction", "ecg", "pathology"]
```

---

#### 3. `extractCategories(content: string): string[]`

**Purpose**: Categorize content into medical categories

**Parameters**:
- `content` (string): Document content

**Returns**: Array of medical categories

**Categories**:
- Anatomy
- Pathology
- Pharmacology
- Physiology
- Biochemistry
- Clinical
- Diagnosis
- Surgery
- Procedures
- Microbiology

**Example**:
```typescript
const categories = extractCategories("Bacterial cell wall structure");
// ["Microbiology", "Anatomy"]
```

---

#### 4. `generateAutoTags(title: string, content: string): string[]`

**Purpose**: Generate smart tags from title and content

**Parameters**:
- `title` (string): Document title
- `content` (string): Document content

**Returns**: Generated tags array

**Algorithm**:
1. Extract title keywords
2. Identify medical concepts
3. Find anatomical structures
4. Detect diseases/conditions
5. Combine and deduplicate

**Example**:
```typescript
const tags = generateAutoTags(
  "Diabetes Mellitus Management",
  "Type 2 diabetes treatment options including metformin..."
);
// ["diabetes", "endocrinology", "treatment", "metformin", "glucose"]
```

---

#### 5. `classifyDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced'`

**Purpose**: Assess content difficulty level

**Parameters**:
- `content` (string): Document content

**Returns**: Difficulty level

**Criteria**:
- **Beginner**: Basic concepts, simple terminology
- **Intermediate**: Complex concepts, medical terminology
- **Advanced**: Highly specialized, rare conditions, research

**Scoring**:
- Medical term density
- Concept complexity
- Technical depth

**Example**:
```typescript
const diff1 = classifyDifficulty("What is a cell?");
// "beginner"

const diff2 = classifyDifficulty("Mitochondrial ATP synthesis via chemiosmotic hypothesis");
// "advanced"
```

---

#### 6. `suggestFilename(title: string, difficulty: string): string`

**Purpose**: Generate suggested filename from title and difficulty

**Parameters**:
- `title` (string): Document title
- `difficulty` (string): Difficulty level

**Returns**: Suggested filename

**Format**: `{slugified-title}-{difficulty}`

**Example**:
```typescript
const filename = suggestFilename("Cardiac Physiology", "intermediate");
// "cardiac-physiology-intermediate"
```

---

## 📊 Medical Category System

### Supported Categories

| Category | Examples | Keywords |
|----------|----------|----------|
| **Anatomy** | Organ systems, tissues, cells | structure, organ, tissue, cell |
| **Pathology** | Diseases, disorders, abnormalities | disease, syndrome, lesion, pathology |
| **Pharmacology** | Drugs, medications, compounds | drug, medication, therapy, treatment |
| **Physiology** | Functions, processes, mechanisms | function, process, mechanism, cycle |
| **Biochemistry** | Chemical processes, metabolism | enzyme, metabolism, bond, synthesis |
| **Clinical** | Patient care, examinations | patient, clinical, examination, diagnosis |
| **Diagnosis** | Tests, procedures, assessments | test, diagnostic, scan, imaging |
| **Surgery** | Surgical procedures, techniques | surgery, surgical, operation, resection |

---

## 🎯 Medical Keyword System

### Comprehensive Keyword Database

**Anatomical**: Heart, Brain, Liver, Kidney, Lung, Stomach...  
**Diseases**: Diabetes, Hypertension, Cancer, Infection...  
**Procedures**: Surgery, Biopsy, Endoscopy, Imaging...  
**Drugs**: Aspirin, Amoxicillin, Insulin, Lisinopril...  
**Concepts**: Inflammation, Infection, Degeneration, Regeneration...

---

## 🔄 Usage Workflow

### Complete Sync Process

```typescript
import { parseMarkdown } from './parser';
import { tagAndCategorize } from './tagger';

async function syncObsidianNote(filePath: string, content: string) {
  // 1. Parse markdown
  const parsed = parseMarkdown(content);
  
  // 2. Auto-tag and categorize
  const tagging = tagAndCategorize(content, extractTitle(content));
  
  // 3. Combine with database data
  const noteData = {
    title: extractTitle(content),
    content: parsed.rawContent,
    frontmatter: parsed.frontmatter,
    tags: tagging.tags,
    categories: tagging.categories,
    difficulty: tagging.difficulty,
    headings: parsed.headings,
    links: parsed.links,
    metadata: parsed.metadata
  };
  
  // 4. Store in database
  await database.notes.create(noteData);
}
```

---

## 💡 Examples

### Example 1: Cardiac Physiology Note

**Input**:
```markdown
---
tags: [cardiology, physiology]
difficulty: intermediate
---

# Cardiac Cycle

## Overview
The cardiac cycle consists of systole and diastole...

## Systole Phase
During systole, the ventricles contract, pushing blood...

[[Cardiac Output]]
```

**Output**:
```typescript
// Parser
{
  frontmatter: { tags: ["cardiology", "physiology"], difficulty: "intermediate" },
  headings: [
    { level: 1, title: "Cardiac Cycle" },
    { level: 2, title: "Overview" },
    { level: 2, title: "Systole Phase" }
  ],
  links: [{ text: "Cardiac Output", type: "internal" }]
}

// Tagger
{
  tags: ["cardiology", "physiology", "cardiac-cycle", "systole", "diastole"],
  categories: ["Physiology"],
  difficulty: "intermediate",
  keywords: ["cardiac", "systole", "diastole", "ventricles"]
}
```

---

### Example 2: Pharmacology Note

**Input**:
```markdown
# Diabetes Mellitus Management

Treatment involves multiple drug classes including:
- Metformin (first-line)
- SGLT2 inhibitors
- GLP-1 agonists
- Insulin therapy
```

**Output**:
```typescript
{
  tags: ["endocrinology", "diabetes", "pharmacology", "metformin"],
  categories: ["Pharmacology", "Clinical"],
  difficulty: "intermediate",
  medicalTopics: ["Diabetes Mellitus", "Endocrinology"]
}
```

---

## 🧪 Testing

### Unit Tests Available

```typescript
describe('Parser', () => {
  it('should extract frontmatter', () => { /* ... */ });
  it('should extract headings with levels', () => { /* ... */ });
  it('should identify internal and external links', () => { /* ... */ });
  it('should extract code blocks', () => { /* ... */ });
  it('should calculate metadata', () => { /* ... */ });
});

describe('Tagger', () => {
  it('should auto-tag medical content', () => { /* ... */ });
  it('should classify difficulty levels', () => { /* ... */ });
  it('should categorize content', () => { /* ... */ });
  it('should generate appropriate filenames', () => { /* ... */ });
});
```

---

## 🔗 Related Documentation

- [[Architecture Overview]] - System design
- [[Obsidian Sync Implementation]] - Integration details
- [[Testing Guide]] - Test procedures

---

**Last Updated**: 2025-12-18  
**Status**: ✅ Complete  
**Code Coverage**: 85%+
