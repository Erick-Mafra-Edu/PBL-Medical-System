"""Async web scraper for extracting structured content.

This module provides async HTML fetching with production-grade features:
- Async/await support with httpx
- Automatic retry with exponential backoff
- Rate limit detection and handling
- Metadata extraction (title, timestamps)
- Comprehensive error handling
Designed for integration with RAG engine and AI services.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

logger = logging.getLogger(__name__)


class RateLimitError(Exception):
    """Raised when a rate limit is detected."""
    pass


class AsyncWebScraper:
    """Async web scraper with production-grade features."""
    
    def __init__(
        self,
        timeout: float = 10.0,
        max_redirects: int = 5,
        user_agent: str = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/119.0 Safari/537.36"
        ),
        max_response_size: int = 10 * 1024 * 1024,  # 10MB
    ) -> None:
        """Initialize scraper with configurable settings.
        
        Args:
            timeout: Request timeout in seconds
            max_redirects: Maximum number of redirects to follow
            user_agent: User agent string for requests
            max_response_size: Maximum response size in bytes
        """
        self.timeout = timeout
        self.max_redirects = max_redirects
        self.user_agent = user_agent
        self.max_response_size = max_response_size
        self.client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        """Context manager entry - initialize HTTP client."""
        self.client = httpx.AsyncClient(
            timeout=self.timeout,
            headers={"User-Agent": self.user_agent},
            follow_redirects=True,
            limits=httpx.Limits(max_redirects=self.max_redirects),
        )
        return self

    async def __aexit__(self, *args):
        """Context manager exit - close HTTP client."""
        if self.client:
            await self.client.aclose()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
    )
    async def fetch_html(self, url: str) -> tuple[str, Dict]:
        """Fetch raw HTML with automatic retry on transient failures.
        
        Args:
            url: URL to fetch
            
        Returns:
            Tuple of (html_content, metadata_dict)
            
        Raises:
            RateLimitError: When rate limit is detected
            httpx.HTTPStatusError: On HTTP errors
            httpx.TimeoutException: On timeout
            ValueError: On invalid content type or size
        """
        if not self.client:
            raise RuntimeError("Scraper not initialized. Use 'async with' context manager.")
        
        try:
            response = await self.client.get(url)
            
            # Check for rate limiting
            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", "60")
                logger.warning(
                    "Rate limit detected",
                    extra={"url": url, "retry_after": retry_after}
                )
                raise RateLimitError(f"Rate limited. Retry after {retry_after}s")
            
            # Check response size
            content_length = response.headers.get("content-length")
            if content_length and int(content_length) > self.max_response_size:
                raise ValueError(f"Response too large: {content_length} bytes")
            
            response.raise_for_status()
            
            # Validate content type
            content_type = response.headers.get("content-type", "")
            if not any(ct in content_type.lower() for ct in ["html", "text", "xml"]):
                logger.warning(
                    "Non-HTML content type",
                    extra={"url": url, "content_type": content_type}
                )
            
            logger.info(
                "Successfully fetched URL",
                extra={
                    "url": url,
                    "status_code": response.status_code,
                    "content_length": len(response.text),
                }
            )
            
            metadata = {
                "status_code": response.status_code,
                "content_type": content_type,
                "encoding": response.encoding or "utf-8",
                "scraped_at": datetime.utcnow().isoformat(),
            }
            
            return response.text, metadata
            
        except httpx.TimeoutException:
            logger.error("Request timeout", extra={"url": url})
            raise
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error",
                extra={
                    "url": url,
                    "status_code": e.response.status_code,
                }
            )
            raise
        except httpx.NetworkError as e:
            logger.error("Network error", extra={"url": url, "error": str(e)})
            raise
        except Exception as e:
            logger.error("Unexpected error", extra={"url": url, "error": str(e)})
            raise

    @staticmethod
    def _clean_html(html: str) -> BeautifulSoup:
        """Clean HTML by removing scripts, styles, and other non-content elements."""
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "noscript", "iframe", "header", "footer", "nav"]):
            tag.decompose()
        return soup

    @staticmethod
    def _extract_title(soup: BeautifulSoup) -> str:
        """Extract title from HTML.
        
        Tries multiple strategies:
        1. <title> tag
        2. <h1> tag
        3. og:title meta tag
        4. First heading found
        """
        # Try <title> tag
        if title_tag := soup.find("title"):
            if title := title_tag.get_text(strip=True):
                return title
        
        # Try <h1> tag
        if h1 := soup.find("h1"):
            if title := h1.get_text(strip=True):
                return title
        
        # Try og:title meta tag
        if og_title := soup.find("meta", property="og:title"):
            if title := og_title.get("content"):
                return str(title).strip()
        
        # Try any heading
        for heading in soup.find_all(["h1", "h2", "h3"]):
            if title := heading.get_text(strip=True):
                return title
        
        return "Untitled"

    def extract_text(self, html: str) -> str:
        """Extract readable text from HTML, trimming excessive whitespace."""
        soup = self._clean_html(html)
        text = soup.get_text(" ")
        normalized = " ".join(text.split())
        return normalized

    def extract_links(self, base_url: str, html: str) -> List[str]:
        """Extract and normalize all links from HTML."""
        soup = self._clean_html(html)
        links: List[str] = []

        for anchor in soup.find_all("a", href=True):
            href = anchor.get("href")
            if not href or href.startswith(("javascript:", "mailto:", "tel:")):
                continue
            
            try:
                full_url = urljoin(base_url, href)
                links.append(full_url)
            except ValueError:
                logger.debug("Invalid URL", extra={"href": href})
                continue

        # Deduplicate while preserving order
        seen = set()
        deduped: List[str] = []
        for link in links:
            if link in seen:
                continue
            seen.add(link)
            deduped.append(link)

        return deduped

    async def fetch_and_parse(self, url: str) -> Dict:
        """Fetch a URL and return structured content for downstream use.
        
        Args:
            url: URL to scrape
            
        Returns:
            Dictionary with keys:
            - url: Original URL
            - title: Extracted page title
            - text: Normalized text content
            - links: List of discovered links
            - length: Character count of text
            - id: Content hash (MD5)
            - metadata: Scraping metadata (status, encoding, timestamp)
        """
        html, metadata = await self.fetch_html(url)
        soup = self._clean_html(html)
        text = self.extract_text(html)
        
        return {
            "url": url,
            "title": self._extract_title(soup),
            "text": text,
            "links": self.extract_links(url, html),
            "length": len(text),
            "id": hashlib.md5(url.encode()).hexdigest(),
            "metadata": metadata,
        }

    async def fetch_and_parse_batch(self, urls: List[str]) -> List[Dict]:
        """Fetch and parse multiple URLs concurrently.
        
        Args:
            urls: List of URLs to scrape
            
        Returns:
            List of parsed content dictionaries
        """
        tasks = [self.fetch_and_parse(url) for url in urls]
        results = []
        
        for coro in asyncio.as_completed(tasks):
            try:
                result = await coro
                results.append(result)
            except Exception as e:
                logger.error("Error in batch scraping", extra={"error": str(e)})
        
        return results


# Legacy sync wrapper for backward compatibility
class WebScraper:
    """Synchronous wrapper for AsyncWebScraper (deprecated).
    
    This class is maintained for backward compatibility only.
    New code should use AsyncWebScraper directly.
    """
    
    def __init__(
        self,
        timeout: int = 10,
        user_agent: str = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/119.0 Safari/537.36"
        ),
        session=None,
    ) -> None:
        """Initialize sync scraper (deprecated)."""
        logger.warning(
            "WebScraper is deprecated. Use AsyncWebScraper instead.",
            extra={"class": "WebScraper"}
        )
        self.timeout = timeout
        self.user_agent = user_agent

    def fetch_and_parse(self, url: str) -> Dict:
        """Sync version of fetch_and_parse (deprecated)."""
        async def _async_fetch():
            async with AsyncWebScraper(
                timeout=float(self.timeout),
                user_agent=self.user_agent
            ) as scraper:
                return await scraper.fetch_and_parse(url)
        
        return asyncio.run(_async_fetch())

    def fetch_html(self, url: str) -> str:
        """Sync version of fetch_html (deprecated)."""
        async def _async_fetch():
            async with AsyncWebScraper(
                timeout=float(self.timeout),
                user_agent=self.user_agent
            ) as scraper:
                html, _ = await scraper.fetch_html(url)
                return html
        
        return asyncio.run(_async_fetch())

    @staticmethod
    def extract_text(html: str) -> str:
        """Extract text (static method, not deprecated)."""
        scraper = AsyncWebScraper()
        return scraper.extract_text(html)

    def extract_links(self, base_url: str, html: str) -> List[str]:
        """Extract links (deprecated)."""
        scraper = AsyncWebScraper()
        return scraper.extract_links(base_url, html)


__all__ = ["AsyncWebScraper", "WebScraper", "RateLimitError"]