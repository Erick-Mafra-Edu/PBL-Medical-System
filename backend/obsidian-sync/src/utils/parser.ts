/**
 * Markdown Parser Utility
 * Parses markdown content and extracts metadata, frontmatter, and structured content
 */

interface ParsedMarkdown {
  frontmatter: Record<string, any>;
  content: string;
  headings: HeadingStructure[];
  links: Link[];
  codeBlocks: CodeBlock[];
  metadata: {
    wordCount: number;
    estimatedReadTime: number;
    lastModified?: Date;
  };
}

interface HeadingStructure {
  level: number;
  text: string;
  id: string;
}

interface Link {
  text: string;
  url: string;
  type: 'internal' | 'external';
}

interface CodeBlock {
  language: string;
  content: string;
}

/**
 * Parse markdown content and extract structured data
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const { frontmatter, bodyContent } = extractFrontmatter(content);
  const headings = extractHeadings(bodyContent);
  const links = extractLinks(bodyContent);
  const codeBlocks = extractCodeBlocks(bodyContent);
  const metadata = extractMetadata(bodyContent);

  return {
    frontmatter,
    content: bodyContent,
    headings,
    links,
    codeBlocks,
    metadata,
  };
}

/**
 * Extract YAML frontmatter from markdown
 */
function extractFrontmatter(content: string): {
  frontmatter: Record<string, any>;
  bodyContent: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, bodyContent: content };
  }

  const [, frontmatterStr, bodyContent] = match;
  const frontmatter = parseFrontmatter(frontmatterStr);

  return { frontmatter, bodyContent };
}

/**
 * Parse YAML frontmatter string
 */
function parseFrontmatter(frontmatterStr: string): Record<string, any> {
  const frontmatter: Record<string, any> = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = parseYamlValue(value);
    }
  }

  return frontmatter;
}

/**
 * Parse YAML value string to appropriate type
 */
function parseYamlValue(value: string): any {
  value = value.trim();

  // Handle arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''));
  }

  // Handle booleans
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Handle numbers
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

  // Handle strings
  return value.replace(/^["']|["']$/g, '');
}

/**
 * Extract headings from markdown
 */
function extractHeadings(content: string): HeadingStructure[] {
  const headings: HeadingStructure[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = generateHeadingId(text);

    headings.push({ level, text, id });
  }

  return headings;
}

/**
 * Generate URL-friendly ID from heading text
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extract links from markdown
 */
function extractLinks(content: string): Link[] {
  const links: Link[] = [];

  // External links [text](url)
  const externalLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = externalLinkRegex.exec(content)) !== null) {
    const [, text, url] = match;
    const isInternal = url.startsWith('#') || url.endsWith('.md');

    links.push({
      text,
      url,
      type: isInternal ? 'internal' : 'external',
    });
  }

  // Obsidian wikilinks [[text]]
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    const text = match[1];
    links.push({
      text,
      url: `${text}.md`,
      type: 'internal',
    });
  }

  return links;
}

/**
 * Extract code blocks from markdown
 */
function extractCodeBlocks(content: string): CodeBlock[] {
  const codeBlocks: CodeBlock[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [, language, code] = match;
    codeBlocks.push({
      language: language || 'text',
      content: code,
    });
  }

  return codeBlocks;
}

/**
 * Extract metadata from markdown content
 */
function extractMetadata(
  content: string
): {
  wordCount: number;
  estimatedReadTime: number;
  lastModified?: Date;
} {
  const wordCount = content
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  // Estimate 200 words per minute reading speed
  const estimatedReadTime = Math.ceil(wordCount / 200);

  return {
    wordCount,
    estimatedReadTime,
  };
}

/**
 * Remove markdown formatting and return plain text
 */
export function extractPlainText(content: string): string {
  return content
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]*`/g, '')
    // Remove links
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove wikilinks
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    // Remove headers
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove list markers
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Clean up whitespace
    .trim();
}

/**
 * Extract table of contents from markdown
 */
export function generateTableOfContents(headings: HeadingStructure[]): string {
  let toc = '';
  let currentLevel = 1;

  for (const heading of headings) {
    if (heading.level > currentLevel) {
      for (let i = currentLevel; i < heading.level; i++) {
        toc += '  '.repeat(i - 1) + '- \n';
      }
    } else if (heading.level < currentLevel) {
      currentLevel = heading.level;
    }

    toc += '  '.repeat(heading.level - 1) + `- [${heading.text}](#${heading.id})\n`;
    currentLevel = heading.level;
  }

  return toc;
}

/**
 * Convert markdown to HTML (simple conversion)
 */
export function markdownToHtml(content: string): string {
  let html = content;

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  return html;
}
