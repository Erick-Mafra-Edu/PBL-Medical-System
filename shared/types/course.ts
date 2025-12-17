export interface Course {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string; // hex color for UI
  icon?: string;
  
  // Stats
  totalFlashcards: number;
  totalNotes: number;
  totalStudyTime: number; // minutes
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDTO {
  userId: string;
  name: string;
  description: string;
  color?: string;
  icon?: string;
}

export interface UpdateCourseDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface Note {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  content: string; // markdown content
  tags: string[];
  
  // Source
  sourceType: 'obsidian' | 'notion' | 'manual' | 'upload';
  sourceId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export interface CreateNoteDTO {
  userId: string;
  courseId: string;
  title: string;
  content: string;
  tags?: string[];
  sourceType: 'obsidian' | 'notion' | 'manual' | 'upload';
  sourceId?: string;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  tags?: string[];
}
