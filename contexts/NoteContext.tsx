import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { NoteService, Note, NoteBlock } from '../services/noteService';

interface NoteContextType {
  notes: Note[];
  loading: boolean;
  refreshNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
}

export const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshNotes = useCallback(async () => {
    setLoading(true);
    const data = await NoteService.getAll();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote = await NoteService.create(note);
    await refreshNotes();
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    await NoteService.update(id, updates);
    await refreshNotes();
  };

  const deleteNote = async (id: string) => {
    await NoteService.delete(id);
    await refreshNotes();
  };

  const togglePin = async (id: string) => {
    await NoteService.togglePin(id);
    await refreshNotes();
  };

  const searchNotes = async (query: string) => NoteService.search(query);

  return (
    <NoteContext.Provider value={{ notes, loading, refreshNotes, addNote, updateNote, deleteNote, togglePin, searchNotes }}>
      {children}
    </NoteContext.Provider>
  );
}
