import os
import json
from typing import List, Dict
import google.generativeai as genai


class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-pro")

    async def generate_flashcards(self, content: str, count: int = 10) -> List[Dict]:
        """Generate flashcards using Google Gemini"""
        model = genai.GenerativeModel(self.model_name)

        prompt = f"""
        Generate {count} high-quality medical flashcards from the following content.
        
        Content:
        {content}
        
        Return ONLY a valid JSON array with this structure:
        [
          {{
            "question": "Clear question",
            "answer": "Concise answer",
            "tags": ["tag1", "tag2"],
            "difficulty": "easy|medium|hard"
          }}
        ]
        """

        try:
            response = model.generate_content(prompt)
            content = response.text
            
            # Extract JSON from response
            start = content.find('[')
            end = content.rfind(']') + 1
            if start != -1 and end > start:
                content = content[start:end]
            
            flashcards = json.loads(content)
            return flashcards
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")

    async def generate_text(self, prompt: str) -> str:
        """Generate text using Gemini"""
        model = genai.GenerativeModel(self.model_name)
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
