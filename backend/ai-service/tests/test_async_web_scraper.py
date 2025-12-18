"""Comprehensive tests for AsyncWebScraper."""

import pytest
from unittest.mock import AsyncMock, Mock, patch
import httpx

from services.web_scraper import AsyncWebScraper, RateLimitError


class TestAsyncWebScraper:
    """Test suite for AsyncWebScraper with comprehensive coverage."""

    @pytest.mark.asyncio
    async def test_context_manager_initialization(self):
        """Test that context manager properly initializes and closes client."""
        async with AsyncWebScraper() as scraper:
            assert scraper.client is not None
            assert isinstance(scraper.client, httpx.AsyncClient)
        
        # Client should be closed after exit
        # Note: Can't directly test closed state, but no exception is a pass

    @pytest.mark.asyncio
    async def test_fetch_html_success(self):
        """Test successful HTML fetching."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = "<html><body>Test</body></html>"
        mock_response.headers = {
            "content-type": "text/html",
            "content-length": "100"
        }
        mock_response.encoding = "utf-8"
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = mock_response
                
                html, metadata = await scraper.fetch_html("https://example.com")
                
                assert html == "<html><body>Test</body></html>"
                assert metadata["status_code"] == 200
                assert metadata["content_type"] == "text/html"
                assert metadata["encoding"] == "utf-8"
                assert "scraped_at" in metadata

    @pytest.mark.asyncio
    async def test_fetch_html_timeout(self):
        """Test timeout handling."""
        async with AsyncWebScraper(timeout=1.0) as scraper:
            with patch.object(scraper.client, 'get', side_effect=httpx.TimeoutException("timeout")):
                with pytest.raises(httpx.TimeoutException):
                    await scraper.fetch_html("https://slow.example.com")

    @pytest.mark.asyncio
    async def test_fetch_html_rate_limit_429(self):
        """Test rate limit detection (429 status code)."""
        mock_response = Mock()
        mock_response.status_code = 429
        mock_response.headers = {"Retry-After": "60"}
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = mock_response
                
                with pytest.raises(RateLimitError) as exc_info:
                    await scraper.fetch_html("https://example.com")
                
                assert "Retry after 60s" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_fetch_html_http_error_404(self):
        """Test HTTP 404 error handling."""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.raise_for_status = Mock(side_effect=httpx.HTTPStatusError(
            "Not Found",
            request=Mock(),
            response=mock_response
        ))
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = mock_response
                
                with pytest.raises(httpx.HTTPStatusError):
                    await scraper.fetch_html("https://example.com/notfound")

    @pytest.mark.asyncio
    async def test_fetch_html_http_error_500(self):
        """Test HTTP 500 error handling."""
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.raise_for_status = Mock(side_effect=httpx.HTTPStatusError(
            "Server Error",
            request=Mock(),
            response=mock_response
        ))
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = mock_response
                
                with pytest.raises(httpx.HTTPStatusError):
                    await scraper.fetch_html("https://example.com/error")

    @pytest.mark.asyncio
    async def test_fetch_html_network_error(self):
        """Test network error handling."""
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', side_effect=httpx.NetworkError("Connection failed")):
                with pytest.raises(httpx.NetworkError):
                    await scraper.fetch_html("https://unreachable.example.com")

    @pytest.mark.asyncio
    async def test_fetch_html_response_too_large(self):
        """Test rejection of oversized responses."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.headers = {
            "content-length": "20000000",  # 20MB
            "content-type": "text/html"
        }
        
        async with AsyncWebScraper(max_response_size=10 * 1024 * 1024) as scraper:
            with patch.object(scraper.client, 'get', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = mock_response
                
                with pytest.raises(ValueError) as exc_info:
                    await scraper.fetch_html("https://example.com/large")
                
                assert "too large" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_fetch_html_without_context_manager(self):
        """Test that fetch_html raises error when client not initialized."""
        scraper = AsyncWebScraper()
        
        with pytest.raises(RuntimeError) as exc_info:
            await scraper.fetch_html("https://example.com")
        
        assert "not initialized" in str(exc_info.value).lower()

    def test_extract_title_from_title_tag(self):
        """Test title extraction from <title> tag."""
        html = "<html><head><title>Test Page</title></head><body></body></html>"
        scraper = AsyncWebScraper()
        
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        title = scraper._extract_title(soup)
        
        assert title == "Test Page"

    def test_extract_title_from_h1_tag(self):
        """Test title extraction from <h1> tag when <title> absent."""
        html = "<html><body><h1>Main Heading</h1></body></html>"
        scraper = AsyncWebScraper()
        
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        title = scraper._extract_title(soup)
        
        assert title == "Main Heading"

    def test_extract_title_from_og_meta(self):
        """Test title extraction from og:title meta tag."""
        html = '<html><head><meta property="og:title" content="OG Title"></head><body></body></html>'
        scraper = AsyncWebScraper()
        
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        title = scraper._extract_title(soup)
        
        assert title == "OG Title"

    def test_extract_title_untitled_fallback(self):
        """Test 'Untitled' fallback when no title found."""
        html = "<html><body><p>No title here</p></body></html>"
        scraper = AsyncWebScraper()
        
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        title = scraper._extract_title(soup)
        
        assert title == "Untitled"

    def test_extract_text_removes_scripts_and_styles(self):
        """Test that scripts and styles are removed from text."""
        html = """
        <html>
        <head><style>body { color: red; }</style></head>
        <body>
            <h1>Hello</h1>
            <script>alert('test');</script>
            <p>World</p>
        </body>
        </html>
        """
        scraper = AsyncWebScraper()
        text = scraper.extract_text(html)
        
        assert "Hello" in text
        assert "World" in text
        assert "alert" not in text
        assert "color: red" not in text

    def test_extract_text_normalizes_whitespace(self):
        """Test whitespace normalization."""
        html = "<html><body><p>  Multiple   spaces  </p></body></html>"
        scraper = AsyncWebScraper()
        text = scraper.extract_text(html)
        
        assert "  " not in text
        assert text == "Multiple spaces"

    def test_extract_text_empty_html(self):
        """Test extraction from empty HTML."""
        html = "<html><body></body></html>"
        scraper = AsyncWebScraper()
        text = scraper.extract_text(html)
        
        assert text == ""

    def test_extract_links_basic(self):
        """Test basic link extraction."""
        html = """
        <html><body>
            <a href="/path1">Link 1</a>
            <a href="https://example.com/path2">Link 2</a>
        </body></html>
        """
        scraper = AsyncWebScraper()
        links = scraper.extract_links("https://example.com", html)
        
        assert "https://example.com/path1" in links
        assert "https://example.com/path2" in links

    def test_extract_links_skips_javascript(self):
        """Test that javascript: links are skipped."""
        html = '<html><body><a href="javascript:void(0)">JS Link</a></body></html>'
        scraper = AsyncWebScraper()
        links = scraper.extract_links("https://example.com", html)
        
        assert len(links) == 0

    def test_extract_links_skips_mailto_tel(self):
        """Test that mailto: and tel: links are skipped."""
        html = """
        <html><body>
            <a href="mailto:test@example.com">Email</a>
            <a href="tel:+1234567890">Phone</a>
        </body></html>
        """
        scraper = AsyncWebScraper()
        links = scraper.extract_links("https://example.com", html)
        
        assert len(links) == 0

    def test_extract_links_deduplication(self):
        """Test link deduplication while preserving order."""
        html = """
        <html><body>
            <a href="/path1">Link 1</a>
            <a href="/path2">Link 2</a>
            <a href="/path1">Link 1 Again</a>
        </body></html>
        """
        scraper = AsyncWebScraper()
        links = scraper.extract_links("https://example.com", html)
        
        assert len(links) == 2
        assert links[0] == "https://example.com/path1"
        assert links[1] == "https://example.com/path2"

    def test_extract_links_handles_invalid_urls(self):
        """Test graceful handling of malformed URLs."""
        html = '<html><body><a href="ht!tp://invalid">Bad URL</a></body></html>'
        scraper = AsyncWebScraper()
        links = scraper.extract_links("https://example.com", html)
        
        # Should not crash, just skip invalid URLs
        assert isinstance(links, list)

    @pytest.mark.asyncio
    async def test_fetch_and_parse_complete_flow(self):
        """Test complete fetch and parse flow."""
        html = """
        <html>
        <head><title>Test Article</title></head>
        <body>
            <h1>Main Content</h1>
            <p>This is a test article with some content.</p>
            <a href="/related">Related Link</a>
        </body>
        </html>
        """
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = html
        mock_response.headers = {"content-type": "text/html"}
        mock_response.encoding = "utf-8"
        mock_response.raise_for_status = Mock()
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = mock_response
                
                result = await scraper.fetch_and_parse("https://example.com/article")
                
                assert result["url"] == "https://example.com/article"
                assert result["title"] == "Test Article"
                assert "Main Content" in result["text"]
                assert "test article" in result["text"]
                assert len(result["links"]) >= 1
                assert result["length"] > 0
                assert "id" in result
                assert "metadata" in result
                assert result["metadata"]["status_code"] == 200

    @pytest.mark.asyncio
    async def test_fetch_and_parse_batch(self):
        """Test batch scraping of multiple URLs."""
        html = "<html><body><h1>Test</h1></body></html>"
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = html
        mock_response.headers = {"content-type": "text/html"}
        mock_response.encoding = "utf-8"
        mock_response.raise_for_status = Mock()
        
        urls = [
            "https://example.com/page1",
            "https://example.com/page2",
            "https://example.com/page3"
        ]
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = mock_response
                
                results = await scraper.fetch_and_parse_batch(urls)
                
                assert len(results) == 3
                assert all("url" in r for r in results)
                assert all("title" in r for r in results)
                assert all("text" in r for r in results)

    @pytest.mark.asyncio
    async def test_fetch_and_parse_batch_with_failures(self):
        """Test batch scraping handles partial failures gracefully."""
        urls = [
            "https://example.com/page1",
            "https://example.com/page2",
            "https://example.com/page3"
        ]
        
        call_count = 0
        
        async def mock_fetch_and_parse(url):
            nonlocal call_count
            call_count += 1
            if call_count == 2:
                raise httpx.TimeoutException("Timeout")
            return {"url": url, "title": "Test", "text": "content", "links": [], "length": 7}
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper, 'fetch_and_parse', side_effect=mock_fetch_and_parse):
                results = await scraper.fetch_and_parse_batch(urls)
                
                # Should have 2 successful results (1 failed)
                assert len(results) == 2

    def test_clean_html_removes_unwanted_tags(self):
        """Test that _clean_html removes scripts, styles, nav, etc."""
        html = """
        <html>
        <head><style>body{}</style></head>
        <body>
            <nav><a href="/">Home</a></nav>
            <header>Header</header>
            <main>Main Content</main>
            <footer>Footer</footer>
            <script>alert('hi');</script>
        </body>
        </html>
        """
        
        scraper = AsyncWebScraper()
        soup = scraper._clean_html(html)
        
        assert soup.find("script") is None
        assert soup.find("style") is None
        assert soup.find("nav") is None
        assert soup.find("header") is None
        assert soup.find("footer") is None
        assert soup.find("main") is not None

    @pytest.mark.asyncio
    async def test_retry_mechanism(self):
        """Test that retry mechanism works on transient failures."""
        call_count = 0
        
        async def mock_get_with_transient_failure(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count < 2:
                raise httpx.TimeoutException("Timeout")
            
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.text = "<html><body>Success</body></html>"
            mock_response.headers = {"content-type": "text/html"}
            mock_response.encoding = "utf-8"
            mock_response.raise_for_status = Mock()
            return mock_response
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', side_effect=mock_get_with_transient_failure):
                html, metadata = await scraper.fetch_html("https://example.com")
                
                assert call_count == 2  # First failed, second succeeded
                assert "Success" in html

    @pytest.mark.asyncio
    async def test_retry_exhaustion(self):
        """Test that retry gives up after max attempts."""
        async def always_timeout(*args, **kwargs):
            raise httpx.TimeoutException("Always timeout")
        
        async with AsyncWebScraper() as scraper:
            with patch.object(scraper.client, 'get', side_effect=always_timeout):
                with pytest.raises(httpx.TimeoutException):
                    await scraper.fetch_html("https://example.com")


class TestWebScraperBackwardCompatibility:
    """Test backward compatibility of sync WebScraper wrapper."""
    
    def test_sync_wrapper_fetch_and_parse(self):
        """Test sync wrapper for fetch_and_parse."""
        from services.web_scraper import WebScraper
        
        html = "<html><body><h1>Test</h1></body></html>"
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = html
        mock_response.headers = {"content-type": "text/html"}
        mock_response.encoding = "utf-8"
        mock_response.raise_for_status = Mock()
        
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_instance = Mock()
            mock_instance.get = AsyncMock(return_value=mock_response)
            mock_instance.aclose = AsyncMock()
            mock_instance.__aenter__ = AsyncMock(return_value=mock_instance)
            mock_instance.__aexit__ = AsyncMock()
            mock_client_class.return_value = mock_instance
            
            scraper = WebScraper()
            result = scraper.fetch_and_parse("https://example.com")
            
            assert "url" in result
            assert "title" in result
