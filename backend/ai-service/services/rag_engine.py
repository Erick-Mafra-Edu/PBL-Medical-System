import os
from typing import List, Dict
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA


class RAGEngine:
    """
    Retrieval Augmented Generation (RAG) Engine
    Indexes notes and provides context-aware answers
    """
    
    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self.llm = None
        self.qa_chain = None
        
        # Initialize only if OpenAI key is available
        if os.getenv("OPENAI_API_KEY"):
            self._initialize()

    def _initialize(self):
        """Initialize RAG components"""
        try:
            self.embeddings = OpenAIEmbeddings()
            self.llm = ChatOpenAI(
                model_name=os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview"),
                temperature=0.5
            )
            
            # Initialize empty vectorstore
            self.vectorstore = Chroma(
                embedding_function=self.embeddings,
                persist_directory="./chroma_db"
            )
        except Exception as e:
            print(f"Failed to initialize RAG engine: {e}")

    async def index_notes(self, notes: List[Dict]) -> int:
        """
        Index notes into the vector database
        
        Args:
            notes: List of note dictionaries with 'title', 'content', 'id'
        
        Returns:
            Number of chunks indexed
        """
        if not self.vectorstore:
            raise Exception("RAG engine not initialized")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )

        documents = []
        for note in notes:
            content = f"Title: {note['title']}\n\n{note['content']}"
            chunks = text_splitter.split_text(content)
            
            for i, chunk in enumerate(chunks):
                documents.append({
                    "page_content": chunk,
                    "metadata": {
                        "note_id": note['id'],
                        "title": note['title'],
                        "chunk_index": i
                    }
                })

        if documents:
            self.vectorstore.add_texts(
                texts=[doc["page_content"] for doc in documents],
                metadatas=[doc["metadata"] for doc in documents]
            )
            self.vectorstore.persist()

        return len(documents)

    async def answer_with_context(self, question: str, k: int = 5) -> Dict:
        """
        Answer a question using RAG with context from indexed notes
        
        Args:
            question: User's question
            k: Number of relevant chunks to retrieve
        
        Returns:
            Dictionary with answer and source references
        """
        if not self.vectorstore:
            raise Exception("RAG engine not initialized")

        # Create QA chain if not exists
        if not self.qa_chain:
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever(search_kwargs={"k": k}),
                return_source_documents=True
            )

        try:
            result = self.qa_chain({"query": question})
            
            # Extract source information
            sources = []
            for doc in result.get("source_documents", []):
                sources.append({
                    "note_id": doc.metadata.get("note_id"),
                    "title": doc.metadata.get("title"),
                    "chunk": doc.page_content[:200] + "..."
                })

            return {
                "answer": result["result"],
                "sources": sources
            }
        except Exception as e:
            raise Exception(f"Failed to answer with RAG: {str(e)}")

    async def search_similar(self, query: str, k: int = 5) -> List[Dict]:
        """Search for similar content in the knowledge base"""
        if not self.vectorstore:
            raise Exception("RAG engine not initialized")

        try:
            docs = self.vectorstore.similarity_search(query, k=k)
            
            results = []
            for doc in docs:
                results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata
                })
            
            return results
        except Exception as e:
            raise Exception(f"Search failed: {str(e)}")
