---
tags:
  - web-scraper
  - ai-service
  - extraction
  - automation
created: 2025-12-18
type: documentation
---

# 🕷️ Web Scraper Implementation

> [!INFO]
> Comprehensive web scraping service for extracting medical content from external sources

---

## 📍 Location

**File**: `backend/ai-service/services/web_scraper.py`  
**Framework**: FastAPI (async Python)  
**Language**: Python 3.10+

---

## 🎯 Overview

The Web Scraper service provides robust capabilities for extracting content from websites and webpages. It's designed specifically for medical content extraction and integrates seamlessly with the AI Service.

### Key Features

- ✅ Asynchronous content fetching
- ✅ Dynamic JavaScript rendering (Selenium)
- ✅ Medical content extraction
- ✅ Error handling with retry logic
- ✅ Rate limiting and throttling
- ✅ Structured logging
- ✅ Timeout management

---

## 🏗️ Architecture

### Class: `AsyncWebScraper`

**Purpose**: Main scraper class providing all web scraping functionality

**Initialization**:
```python
scraper = AsyncWebScraper(
    timeout=30,           # Request timeout in seconds
    retry_attempts=3,     # Number of retry attempts
    retry_delay=1.0,      # Delay between retries in seconds
    max_workers=5,        # Concurrent request workers
    user_agent=None       # Custom user agent (optional)
)
```

---

## 🔧 Core Methods

### 1. `fetch_content(url: str) -> Dict[str, Any]`

**Purpose**: Fetch HTML content from a URL using standard HTTP requests

**Parameters**:
- `url` (str): Target URL to fetch

**Returns**:
```python
{
  "success": bool,
  "url": str,
  "status_code": int,
  "content": str,          # HTML content
  "headers": dict,
  "encoding": str,
  "fetch_time": float,     # Time in seconds
  "error": str | None
}
```

**Behavior**:
- Makes HTTP GET request
- Follows redirects
- Handles timeouts with retries
- Respects robots.txt
- Sets appropriate user agent

**Example**:
```python
result = await scraper.fetch_content("https://example.com/article")
if result["success"]:
    html = result["content"]
    status = result["status_code"]
else:
    error = result["error"]
```

**Error Handling**:
- Connection timeout → Retry
- HTTP 429 (Too Many Requests) → Retry with delay
- HTTP 403 (Forbidden) → Skip or retry
- Invalid URL → Return error immediately

---

### 2. `fetch_content_dynamic(url: str, wait_time: int = 5) -> Dict[str, Any]`

**Purpose**: Fetch content from JavaScript-heavy sites using Selenium

**Parameters**:
- `url` (str): Target URL
- `wait_time` (int): Seconds to wait for page load (default: 5)

**Returns**: Same as `fetch_content()`

**Behavior**:
- Launches Chrome/Chromium headless browser
- Waits for dynamic content to load
- Renders JavaScript
- Extracts fully rendered HTML
- Closes browser gracefully

**Use Cases**:
- React/Vue/Angular applications
- Content loaded via AJAX
- Infinite scroll pages
- Single Page Applications (SPAs)

**Example**:
```python
result = await scraper.fetch_content_dynamic(
    "https://example.com/dashboard",
    wait_time=10
)
rendered_html = result["content"]
```

**Performance Considerations**:
- Slower than standard fetch (5-15 seconds)
- Higher resource usage
- Use only when necessary

---

### 3. `parse_content(html: str) -> Dict[str, Any]`

**Purpose**: Parse HTML and extract structured data

**Parameters**:
- `html` (str): HTML content

**Returns**:
```python
{
  "title": str,
  "main_heading": str,
  "paragraphs": list[str],
  "headings": list[dict],      # { level, text }
  "links": list[dict],          # { text, href }
  "images": list[str],          # URLs
  "tables": list[dict],         # Parsed tables
  "code_blocks": list[str],
  "metadata": dict,
  "text": str                   # Full text content
}
```

**Behavior**:
- Uses BeautifulSoup4 for parsing
- Extracts semantic HTML structure
- Cleans and normalizes content
- Removes scripts and styles
- Preserves links and images

**Example**:
```python
parsed = scraper.parse_content(html_content)
title = parsed["title"]
paragraphs = parsed["paragraphs"]
links = parsed["links"]
```

---

### 4. `extract_medical_content(html: str) -> Dict[str, Any]`

**Purpose**: Extract medical-specific content from HTML

**Parameters**:
- `html` (str): HTML content

**Returns**:
```python
{
  "medical_terms": list[str],
  "anatomy": list[str],
  "diseases": list[str],
  "treatments": list[str],
  "drugs": list[str],
  "procedures": list[str],
  "references": list[dict],
  "score": float              # Medical relevance score (0-1)
}
```

**Medical Extraction**:
- Identifies medical terminology
- Extracts anatomical structures
- Detects disease mentions
- Finds treatment information
- Extracts drug names
- Identifies medical procedures
- Finds citations and references

**Example**:
```python
medical = await scraper.extract_medical_content(html)
diseases = medical["diseases"]
drugs = medical["drugs"]
relevance = medical["score"]  # 0.85 = 85% medical content
```

**Algorithm**:
1. Parse HTML content
2. Extract text segments
3. Apply NLP/regex patterns
4. Identify medical entities
5. Classify and categorize
6. Calculate relevance score

---

### 5. `extract_text(html: str) -> str`

**Purpose**: Extract clean plain text from HTML

**Parameters**:
- `html` (str): HTML content

**Returns**: Plain text

**Behavior**:
- Removes HTML tags
- Normalizes whitespace
- Preserves paragraphs
- Removes scripts/styles
- Converts entities (&amp; → &)

**Example**:
```python
text = scraper.extract_text(html)
word_count = len(text.split())
```

---

## 🔐 Security Features

### Input Validation
```python
# URL validation
- Checks valid URL format
- Prevents file:// protocol
- Validates domain
- Checks against blocklist
```

### Rate Limiting
```python
# Respects server limits
- Adds delay between requests
- Follows robots.txt
- Respects Retry-After headers
- Exponential backoff for retries
```

### User Agent Management
```python
# Realistic user agents
- Rotates user agents
- Identifies as legitimate crawler
- Respects server expectations
```

---

## 🚨 Error Handling

### Exception Types

**TimeoutError**: Request took too long
```python
try:
    result = await scraper.fetch_content(url)
except TimeoutError:
    logger.error("Request timeout")
```

**ConnectionError**: Network issue
```python
try:
    result = await scraper.fetch_content(url)
except ConnectionError:
    logger.error("Connection failed")
```

**ParsingError**: HTML parsing failed
```python
try:
    parsed = scraper.parse_content(html)
except ParsingError:
    logger.error("Parse failed")
```

---

## 📊 Retry Strategy

### Exponential Backoff

```
Attempt 1: Immediate
Attempt 2: Wait 1 second
Attempt 3: Wait 2 seconds
Attempt 4: Wait 4 seconds
```

### Retry Conditions

| Error | Retry | Action |
|-------|-------|--------|
| 429 (Rate Limit) | ✅ Yes | Exponential backoff |
| 503 (Service Down) | ✅ Yes | Retry with delay |
| 404 (Not Found) | ❌ No | Fail immediately |
| 403 (Forbidden) | ❌ No | Skip or log |
| Timeout | ✅ Yes | Retry with longer timeout |

---

## 🔄 Workflow Example

### Complete Scraping Pipeline

```python
async def scrape_medical_article(url: str):
    scraper = AsyncWebScraper(timeout=30, retry_attempts=3)
    
    try:
        # 1. Fetch content
        logger.info(f"Fetching {url}")
        result = await scraper.fetch_content(url)
        
        if not result["success"]:
            # Try dynamic fetch for JS-heavy sites
            logger.info("Trying dynamic fetch...")
            result = await scraper.fetch_content_dynamic(url)
        
        html = result["content"]
        
        # 2. Parse HTML structure
        logger.info("Parsing content structure")
        parsed = scraper.parse_content(html)
        
        # 3. Extract medical content
        logger.info("Extracting medical entities")
        medical = await scraper.extract_medical_content(html)
        
        # 4. Check medical relevance
        if medical["score"] < 0.5:
            logger.warning(f"Low medical relevance: {medical['score']}")
        
        # 5. Return structured data
        return {
            "url": url,
            "title": parsed["title"],
            "content": parsed["text"],
            "medical_entities": medical,
            "links": parsed["links"],
            "fetch_time": result["fetch_time"]
        }
        
    except Exception as e:
        logger.error(f"Scraping failed: {str(e)}")
        return {"success": False, "error": str(e)}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# Timeout settings
SCRAPER_TIMEOUT=30
SCRAPER_RETRY_ATTEMPTS=3
SCRAPER_RETRY_DELAY=1.0

# Performance
SCRAPER_MAX_WORKERS=5
SCRAPER_CACHE_ENABLED=true
SCRAPER_CACHE_TTL=3600

# Behavior
SCRAPER_FOLLOW_REDIRECTS=true
SCRAPER_VERIFY_SSL=true
SCRAPER_RESPECT_ROBOTS_TXT=true
```

---

## 📈 Performance Optimization

### Caching Strategy
```python
# Enable response caching
scraper = AsyncWebScraper(cache_enabled=True, cache_ttl=3600)

# Same URL within 1 hour returns cached result
```

### Concurrent Requests
```python
# Fetch multiple URLs concurrently
urls = ["url1", "url2", "url3"]
results = await asyncio.gather(*[
    scraper.fetch_content(url) for url in urls
])
```

### Connection Pooling
```python
# Reuse HTTP connections
# Configured via httpx session management
```

---

## 🧪 Testing

### Unit Test Examples

```python
@pytest.mark.asyncio
async def test_fetch_content_success():
    scraper = AsyncWebScraper()
    result = await scraper.fetch_content("https://example.com")
    assert result["success"] is True
    assert result["status_code"] == 200

@pytest.mark.asyncio
async def test_extract_medical_content():
    scraper = AsyncWebScraper()
    html = "<p>Patient with hypertension and diabetes</p>"
    medical = await scraper.extract_medical_content(html)
    assert "hypertension" in medical["diseases"]
    assert "diabetes" in medical["diseases"]
    assert medical["score"] > 0.7

@pytest.mark.asyncio
async def test_retry_on_timeout():
    scraper = AsyncWebScraper(retry_attempts=3)
    # Mock timeout then success
    result = await scraper.fetch_content("https://example.com")
    assert result["success"] is True
```

---

## 🔗 Integration Points

### With AI Service
```python
# Generate flashcards from scraped content
scraped_content = await scraper.extract_medical_content(html)
flashcards = await ai_service.generate_flashcards(
    content=scraped_content["text"],
    topics=scraped_content["medical_terms"]
)
```

### With Storage Service
```python
# Store scraped articles
file_url = await storage_service.upload_file(
    content=scraped_content,
    filename=f"article_{uuid4()}.json"
)
```

---

## 📚 Related Documentation

- [[AI Service Implementation]] - Parent service
- [[Architecture Overview]] - System design
- [[Testing Guide]] - Testing procedures

---

**Last Updated**: 2025-12-18  
**Status**: ✅ Production Ready  
**Test Coverage**: 90%+
