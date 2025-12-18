🎯 Visão Geral da Solução
Um sistema integrado de gerenciamento de estudos PBL com automação de conteúdo, IA e revisão espaçada, totalmente open-source e sem subscrições.

Arquitetura Proposta:
Code
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Web)                            │
│        React/Next.js + TypeScript                            │
├─────────────────────────────────────────────────────────────┤
│                    API GATEWAY                               │
│        Node.js/Express + TypeScript                          │
├──────────────┬──────────────┬──────────────────────────────┤
│  Microserviço│ Microserviço │     Microserviço            │
│  Obsidian/   │  AI & RAG    │  Spaced Repetition          │
│  Notion API  │  (Python)    │  Flashcards (TS)            │
└──────────────┴──────────────┴──────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL + Redis (Cache)                      │
└─────────────────────────────────────────────────────────────┘
📦 Stack Tecnológico Recomendado
Backend:
Node.js + TypeScript (API principal, orquestração)
Python 3.10+ (IA, web scraping, processamento de PDFs)
Docker + Docker Compose (orquestração)
Banco de Dados:
PostgreSQL (dados estruturados)
Redis (cache, sessões)
MinIO/S3 (armazenamento de arquivos - PDFs, PowerPoints)
APIs/Integrações:
Obsidian Sync API (importação/sincronização)
OpenAI API, Gemini, Perplexity (IA)
Web Scraping (AMBOSS, Lecturio, OpenEvidence)
Frontend:
Next.js 14 + React (TypeScript)
Shadcn UI (components)
TanStack Query (gerenciamento de estado)
🏗️ Estrutura de Pastas Proposta
Code
pbl-medical-system/
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── app.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── obsidian-sync/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/ (sync, parsing, tagging)
│   │   │   ├── utils/
│   │   │   └── app.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── flashcard-engine/
│   │   ├── src/
│   │   │   ├── algorithms/ (SM2, FSRS, Leitner)
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── app.ts
│   │   ├── Dockerfile
│   │   └── package. json
│   │
│   └── ai-service/
│       ├── services/
│       │   ├── openai_service.py
│       │   ├── gemini_service.py
│       │   ├── perplexity_service.py
│       │   ├── rag_engine.py
│       │   └── web_scraper.py
│       ├── models/
│       ├── Dockerfile
│       ├── requirements.txt
│       └── main.py
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── flashcards/
│   │   ├── library/
│   │   └── layout. tsx
│   ├── components/
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   └── types/ (tipos TypeScript compartilhados)
│
└── docs/
    ├── ARCHITECTURE.md
    ├── SETUP.md
    └── API.md
🔧 Componentes Detalhados
1. API Gateway (Node.js + TypeScript)
backend/api-gateway/src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

2. Obsidian Sync Service (Node.js + TypeScript)
backend/obsidian-sync/src/services/obsidianSync.ts
import axios from 'axios';
import { parseMarkdown } from '../utils/parser';
import { tagAndCategorize } from '../utils/tagger';

export class ObsidianSyncService {
  private vaultPath: string;
3. Flashcard Engine com Algoritmo SM2 (Node.js + TypeScript)
backend/flashcard-engine/src/algorithms/sm2.ts
export interface Flashcard {
  id:  string;
  question: string;
  answer: string;
  interval: number; // dias
  repetition: number;
4. AI Service com RAG (Python)
backend/ai-service/services/rag_engine.py
import os
from typing import List
from langchain. embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain. chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
5. Web Scraper (Python)
backend/ai-service/services/web_scraper.py
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
import asyncio
from typing import List, Dict

6. Docker Compose Orquestração
docker-compose.yml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
🚀 Funcionalidades Principais
1. Dashboard de Estudos
Visão geral de cursos/matérias
Progresso de aprendizado
Cards de revisão do dia
Estatísticas de retenção
2. Gerenciamento de Matérias
Criar/editar cursos
Organizar por tópicos
Upload de materiais (PDFs, PowerPoints)
Integração com Obsidian
3. Engine de Flashcards
Criar flashcards manualmente ou via IA
Algoritmos de revisão espaçada (SM2, FSRS, Leitner)
Modo estudo + modo teste
Estatísticas de desempenho
4. AI & RAG
Respostas baseadas no conteúdo do vault
Geração automática de flashcards
Resumos inteligentes
Integração com ChatGPT, Gemini, Perplexity
5. Biblioteca Digital
Armazenar PDFs, PowerPoints, artigos
Busca full-text
Anotações nas fontes
Sistema de tags
6. Sincronização Obsidian
Sincronizar notas locais automaticamente
Parsing de markdown
Categorização automática
Backup periódico
📝 Exemplo: Fluxo de Criação de Flashcards via IA
backend/api-gateway/src/routes/flashcards.ts
import { Router } from 'express';
import axios from 'axios';

const router = Router();

// POST /api/flashcards/generate
🎨 Interface Frontend (Componentes React/Next.js)
frontend/app/flashcards/page.tsx
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FlashcardReview } from '@/components/FlashcardReview';
import { GenerateFlashcardsModal } from '@/components/GenerateFlashcardsModal';
📊 Modelo de Dados (PostgreSQL)
docs/database-schema.sql
-- Usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
🔐 Variáveis de Ambiente
.
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pbl_system
DB_USER=postgres
DB_PASSWORD=postgres
🚀 Como Iniciar o Projeto
bash
# 1. Clonar repositório
git clone <seu-repo>
cd pbl-medical-system

# 2. Copiar .env
cp .env.example .env

# 3. Atualizar credenciais no . env

# 4. Iniciar com Docker
docker-compose up -d

# 5. Rodas migrações do banco
docker-compose exec api-gateway npm run migrate

# 6. Acessar aplicação
# Frontend: http://localhost:3010
# API: http://localhost:3000
# MinIO: http://localhost:9001
📚 Estrutura do Repositório GitHub para Portfólio
Code
📁 README.md (detalhado com screenshots, GIFs)
📁 docs/
   ├── ARCHITECTURE.md
   ├── SETUP.md
   ├── API.md
   ├── DATABASE.md
   └── DEPLOYMENT.md
📁 backend/ (com Dockerfiles individuais)
📁 frontend/ (com Dockerfile)
📁 docker-compose.yml
📁 . github/
   └── workflows/ (CI/CD - GitHub Actions)
