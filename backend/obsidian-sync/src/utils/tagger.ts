/**
 * Tagging and Categorization Utility
 * Automatically tag and categorize content based on keywords and patterns
 */

interface TaggingResult {
  tags: string[];
  categories: string[];
  keywords: string[];
  confidence: number;
}

interface ContentTags {
  content: string;
  tags: TaggingResult;
}

// Medical/educational keywords by category
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  anatomy: [
    'anatomy',
    'anatomical',
    'muscle',
    'bone',
    'organ',
    'tissue',
    'system',
    'structure',
    'body part',
  ],
  pathology: [
    'pathology',
    'disease',
    'disorder',
    'condition',
    'syndrome',
    'infection',
    'inflammation',
    'lesion',
  ],
  pharmacology: [
    'drug',
    'medication',
    'pharmaceutical',
    'pharmacology',
    'dosage',
    'side effect',
    'adverse',
    'interaction',
  ],
  physiology: [
    'physiology',
    'function',
    'process',
    'mechanism',
    'homeostasis',
    'metabolism',
    'circulation',
  ],
  biochemistry: [
    'biochemistry',
    'enzyme',
    'protein',
    'metabolite',
    'reaction',
    'pathway',
    'molecule',
  ],
  clinical: [
    'clinical',
    'patient',
    'diagnosis',
    'treatment',
    'management',
    'intervention',
    'prognosis',
  ],
  diagnosis: [
    'diagnosis',
    'symptom',
    'sign',
    'test',
    'investigation',
    'imaging',
    'laboratory',
  ],
  surgery: [
    'surgery',
    'surgical',
    'operation',
    'procedure',
    'technique',
    'incision',
    'suture',
  ],
};

/**
 * Analyze content and generate tags
 */
export function tagAndCategorize(content: string): TaggingResult {
  const lowerContent = content.toLowerCase();
  const tags = extractTags(lowerContent);
  const categories = extractCategories(lowerContent);
  const keywords = extractKeywords(lowerContent, categories);
  const confidence = calculateConfidence(tags, categories);

  return {
    tags,
    categories,
    keywords,
    confidence,
  };
}

/**
 * Extract tags from content
 */
function extractTags(content: string): string[] {
  const tags = new Set<string>();

  // Extract hashtags
  const hashtagRegex = /#[\w-]+/g;
  let match;
  while ((match = hashtagRegex.exec(content)) !== null) {
    tags.add(match[0].substring(1).toLowerCase());
  }

  // Extract mentions
  const mentionRegex = /@[\w-]+/g;
  while ((match = mentionRegex.exec(content)) !== null) {
    tags.add(match[0].substring(1).toLowerCase());
  }

  // Add auto-generated tags
  const autoTags = generateAutoTags(content);
  autoTags.forEach((tag) => tags.add(tag));

  return Array.from(tags);
}

/**
 * Extract categories from content keywords
 */
function extractCategories(content: string): string[] {
  const categories = new Set<string>();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (regex.test(content)) {
        categories.add(category);
        break;
      }
    }
  }

  return Array.from(categories);
}

/**
 * Generate auto-tags based on content analysis
 */
function generateAutoTags(content: string): string[] {
  const tags: string[] = [];

  // Tag for question content
  if (content.includes('?')) {
    tags.push('question');
  }

  // Tag for code content
  if (content.includes('```') || content.includes('```')) {
    tags.push('code');
  }

  // Tag for list content
  if (content.includes('- ') || content.includes('* ')) {
    tags.push('list');
  }

  // Tag for definition content
  if (content.includes('definition') || content.includes('def:')) {
    tags.push('definition');
  }

  // Tag for note content
  if (content.includes('note:') || content.includes('note-')) {
    tags.push('note');
  }

  // Tag for important content
  if (
    content.includes('important') ||
    content.includes('!!!') ||
    content.includes('***')
  ) {
    tags.push('important');
  }

  // Tag for learning objectives
  if (
    content.includes('learning objective') ||
    content.includes('objective:') ||
    content.includes('goals:')
  ) {
    tags.push('learning-objective');
  }

  // Tag for case study
  if (
    content.includes('case study') ||
    content.includes('patient case') ||
    content.includes('case:')
  ) {
    tags.push('case-study');
  }

  return tags;
}

/**
 * Extract key medical terms and keywords
 */
function extractKeywords(content: string, categories: string[]): string[] {
  const keywords = new Set<string>();

  // Extract keywords from identified categories
  for (const category of categories) {
    const categoryKeywords = CATEGORY_KEYWORDS[category] || [];
    for (const keyword of categoryKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (regex.test(content)) {
        keywords.add(keyword);
      }
    }
  }

  // Extract capitalized terms (potential medical terms)
  const capitalizedRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  let match;
  let count = 0;
  while ((match = capitalizedRegex.exec(content)) !== null && count < 10) {
    keywords.add(match[0]);
    count++;
  }

  return Array.from(keywords);
}

/**
 * Calculate confidence score for tagging
 */
function calculateConfidence(
  tags: string[],
  categories: string[]
): number {
  const totalElements = tags.length + categories.length;
  if (totalElements === 0) return 0;

  // Confidence based on number of identified elements
  // More elements = higher confidence
  const elementConfidence = Math.min(totalElements / 5, 1);

  // Confidence based on consistency (same category keywords appearing multiple times)
  const consistencyBonus = 0.1 * Math.min(categories.length / 3, 1);

  return Math.min(elementConfidence + consistencyBonus, 1);
}

/**
 * Suggest tags based on content
 */
export function suggestTags(content: string): string[] {
  const { tags, categories } = tagAndCategorize(content);
  return [...tags, ...categories];
}

/**
 * Classify content by difficulty level
 */
export function classifyDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced' {
  const complexKeywords = [
    'advanced',
    'complex',
    'molecular',
    'pathophysiology',
    'differential',
    'clinical correlation',
  ];
  const beginnerKeywords = [
    'introduction',
    'basic',
    'fundamental',
    'overview',
    'simple',
  ];

  const complexCount = complexKeywords.filter((keyword) =>
    content.toLowerCase().includes(keyword)
  ).length;
  const beginnerCount = beginnerKeywords.filter((keyword) =>
    content.toLowerCase().includes(keyword)
  ).length;

  if (complexCount > beginnerCount && complexCount > 2) {
    return 'advanced';
  }
  if (beginnerCount > 0) {
    return 'beginner';
  }
  return 'intermediate';
}

/**
 * Generate suggested filename based on content
 */
export function suggestFilename(content: string): string {
  // Extract first heading or first meaningful text
  const headingMatch = content.match(/^#+\s+(.+)$/m);
  const heading = headingMatch ? headingMatch[1] : '';

  if (heading) {
    return (
      heading
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + '.md'
    );
  }

  // Fallback: use first 50 characters
  const sanitized = content
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  return sanitized + '.md';
}

/**
 * Extract table-of-contents structure with categories
 */
export function extractStructure(
  content: string
): {
  title: string;
  structure: any[];
  metadata: any;
} {
  const headingMatch = content.match(/^#+\s+(.+)$/m);
  const title = headingMatch ? headingMatch[1] : 'Untitled';

  const structure: any[] = [];
  const headingRegex = /^(#+)\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    structure.push({
      level: match[1].length,
      text: match[2],
      children: [],
    });
  }

  const tagging = tagAndCategorize(content);
  const difficulty = classifyDifficulty(content);

  return {
    title,
    structure,
    metadata: {
      categories: tagging.categories,
      tags: tagging.tags,
      difficulty,
      confidence: tagging.confidence,
    },
  };
}
