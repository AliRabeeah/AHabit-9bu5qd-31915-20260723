import { StorageService } from './storageService';
import { STORAGE_KEYS } from '../constants/config';

export interface NoteBlock {
  id: string;
  type: 'text' | 'heading' | 'checklist' | 'link';
  content: string;
  checked?: boolean;
}

export interface Note {
  id: string;
  title: string;
  blocks: NoteBlock[];
  habitId?: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  color?: string;
}

const DEFAULT_NOTES: Note[] = [
  {
    id: '1',
    title: 'My Goals for This Month',
    blocks: [
      { id: 'b1', type: 'heading', content: 'Health & Fitness' },
      { id: 'b2', type: 'checklist', content: 'Run 5km three times a week', checked: false },
      { id: 'b3', type: 'checklist', content: 'Drink 8 glasses of water daily', checked: true },
      { id: 'b4', type: 'text', content: 'Focus on consistency, not perfection. Small steps every day add up to big results.' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: true,
    color: '#7C5CFC',
  },
  {
    id: '2',
    title: 'Morning Workout Notes',
    blocks: [
      { id: 'b1', type: 'text', content: 'Today felt great! Completed 30 min workout. Energy level was 8/10.' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
];

export const NoteService = {
  async getAll(): Promise<Note[]> {
    const notes = await StorageService.get<Note[]>(STORAGE_KEYS.NOTES);
    if (!notes) {
      await StorageService.set(STORAGE_KEYS.NOTES, DEFAULT_NOTES);
      return DEFAULT_NOTES;
    }
    return notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },

  async getById(id: string): Promise<Note | null> {
    const notes = await StorageService.get<Note[]>(STORAGE_KEYS.NOTES);
    return notes?.find(n => n.id === id) ?? null;
  },

  async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const notes = await StorageService.get<Note[]>(STORAGE_KEYS.NOTES) ?? [];
    const now = new Date().toISOString();
    const newNote: Note = { ...note, id: Date.now().toString(), createdAt: now, updatedAt: now };
    await StorageService.set(STORAGE_KEYS.NOTES, [newNote, ...notes]);
    return newNote;
  },

  async update(id: string, updates: Partial<Note>): Promise<void> {
    const notes = await StorageService.get<Note[]>(STORAGE_KEYS.NOTES) ?? [];
    const updated = notes.map(n =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    await StorageService.set(STORAGE_KEYS.NOTES, updated);
  },

  async delete(id: string): Promise<void> {
    const notes = await StorageService.get<Note[]>(STORAGE_KEYS.NOTES) ?? [];
    await StorageService.set(STORAGE_KEYS.NOTES, notes.filter(n => n.id !== id));
  },

  async togglePin(id: string): Promise<void> {
    const note = await NoteService.getById(id);
    if (note) await NoteService.update(id, { pinned: !note.pinned });
  },

  async search(query: string): Promise<Note[]> {
    const notes = await NoteService.getAll();
    const q = query.toLowerCase();
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.blocks.some(b => b.content.toLowerCase().includes(q))
    );
  },
};
