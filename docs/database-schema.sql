-- ==========================================
-- PBL Medical System - Database Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Users Table
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  
  -- Preferences (stored as JSONB for flexibility)
  preferences JSONB DEFAULT '{
    "defaultAlgorithm": "sm2",
    "dailyGoal": 20,
    "notificationsEnabled": true,
    "theme": "auto"
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- ==========================================
-- Courses Table
-- ==========================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(10) DEFAULT '📚',
  
  -- Stats
  total_flashcards INTEGER DEFAULT 0,
  total_notes INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- minutes
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courses_user_id ON courses(user_id);

-- ==========================================
-- Notes Table
-- ==========================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Source tracking
  source_type VARCHAR(50) CHECK (source_type IN ('obsidian', 'notion', 'manual', 'upload')),
  source_id TEXT, -- File path for Obsidian, page ID for Notion
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_course_id ON notes(course_id);
CREATE INDEX idx_notes_source_id ON notes(source_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- ==========================================
-- Flashcards Table
-- ==========================================
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  
  -- Spaced Repetition fields
  interval INTEGER DEFAULT 0, -- days until next review
  repetition INTEGER DEFAULT 0, -- number of times reviewed
  ease_factor DECIMAL(3,2) DEFAULT 2.50, -- SM2 ease factor
  next_review TIMESTAMP DEFAULT NOW(),
  last_reviewed TIMESTAMP,
  
  -- FSRS fields (optional, for advanced algorithm)
  stability DECIMAL(5,2),
  fsrs_difficulty DECIMAL(4,2),
  scheduled_days INTEGER,
  state VARCHAR(20) CHECK (state IN ('new', 'learning', 'review', 'relearning')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_course_id ON flashcards(course_id);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX idx_flashcards_tags ON flashcards USING GIN(tags);

-- ==========================================
-- Flashcard Reviews Table (History)
-- ==========================================
CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  quality INTEGER CHECK (quality >= 0 AND quality <= 5), -- SM2 quality (0-5)
  time_spent INTEGER DEFAULT 0, -- seconds spent on review
  reviewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_flashcard_id ON flashcard_reviews(flashcard_id);
CREATE INDEX idx_reviews_reviewed_at ON flashcard_reviews(reviewed_at);

-- ==========================================
-- Study Sessions Table
-- ==========================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  cards_reviewed INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- minutes
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_sessions_course_id ON study_sessions(course_id);

-- ==========================================
-- Files Table (PDFs, PowerPoints, etc.)
-- ==========================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  filename VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- pdf, pptx, docx, etc.
  file_size BIGINT NOT NULL, -- bytes
  storage_path TEXT NOT NULL, -- Path in MinIO/S3
  
  -- Metadata
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE, -- Has OCR/extraction been done?
  extracted_text TEXT
);

CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_course_id ON files(course_id);

-- ==========================================
-- Triggers for updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Sample Data (Optional - for development)
-- ==========================================
-- Uncomment to insert sample data

-- INSERT INTO users (email, password_hash, name) VALUES
--   ('demo@example.com', '$2b$10$...', 'Demo User');

-- INSERT INTO courses (user_id, name, description, color) VALUES
--   ((SELECT id FROM users WHERE email = 'demo@example.com'), 
--    'Cardiology', 'Study of the heart and cardiovascular system', '#EF4444');
