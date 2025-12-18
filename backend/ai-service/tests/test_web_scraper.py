import pytest

from services.web_scraper import WebScraper


class _FakeResponse:
    def __init__(self, text: str, status_code: int = 200):
        self.text = text
        self.status_code = status_code

    def raise_for_status(self) -> None:  # pragma: no cover - simple pass
        if self.status_code >= 400:
            raise Exception("HTTP error")


class _FakeSession:
    def __init__(self, text: str, status_code: int = 200):
        self._resp = _FakeResponse(text, status_code)
        self.headers = {}

    def get(self, _url: str, timeout: int):  # noqa: ARG002
        return self._resp


def test_fetch_and_parse_extracts_text_and_links():
    html = """
    <html><head><title>Test</title></head>
    <body>
      <h1>Hello</h1>
      <p>World</p>
      <a href="/path">Link</a>
      <script>var a = 1;</script>
    </body></html>
    """
    scraper = WebScraper(session=_FakeSession(html))

    result = scraper.fetch_and_parse("https://example.com")

    assert result["url"] == "https://example.com"
    assert "Hello World" in result["text"]
    assert result["links"] == ["https://example.com/path"]
    assert result["length"] == len(result["text"])


def test_fetch_html_raises_timeout(monkeypatch):
    def _raise_timeout(_url: str, timeout: int):  # noqa: ARG002
        raise TimeoutError("timeout")

    class _TimeoutSession:
        headers = {}

        def get(self, url: str, timeout: int):  # noqa: ARG002
            return _raise_timeout(url, timeout)

    scraper = WebScraper(session=_TimeoutSession())

    with pytest.raises(TimeoutError):
        scraper.fetch_html("https://slow.example.com")