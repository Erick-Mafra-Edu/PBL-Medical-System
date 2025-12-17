import os
import json
from typing import List, Dict
from openai import AsyncOpenAI


class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")

    async def generate_text(self, prompt: str) -> str:
        """Generate text from a prompt"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")

    async def generate_flashcards(self, content: str, count: int = 10) -> List[Dict]:
        """Generate flashcards from content"""
        prompt = f"""
        Generate {count} high-quality flashcards from the following content.
        
        Content:
        {content}
        
        Return ONLY a valid JSON array of flashcards with this exact structure:
        [
          {{
            "question": "Clear, specific question",
            "answer": "Concise, accurate answer",
            "tags": ["relevant", "tags"],
            "difficulty": "easy|medium|hard"
          }}
        ]
        
        Make questions test understanding, not just memorization.
        Keep answers concise but complete.
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a medical education expert that creates high-quality flashcards. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            content = response.choices[0].message.content
            # Try to extract JSON if there's extra text
            start = content.find('[')
            end = content.rfind(']') + 1
            if start != -1 and end > start:
                content = content[start:end]
            
            flashcards = json.loads(content)
            return flashcards
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse flashcards JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to generate flashcards: {str(e)}")

    async def answer_with_context(self, question: str, context: str) -> str:
        """Answer a question using provided context"""
        prompt = f"""
        Context:
        {context}
        
        Question: {question}
        
        Answer the question based on the context provided. If the answer cannot be found in the context, say so.
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful medical education assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Failed to answer question: {str(e)}")

    async def summarize(self, content: str, max_length: int = 500) -> str:
        """Summarize long content"""
        prompt = f"""
        Summarize the following content in approximately {max_length} characters.
        Focus on the key points and main ideas.
        
        Content:
        {content}
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Failed to summarize: {str(e)}")
