import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useNotes } from '../hooks/useNotes';
import { useAlert } from '@/template';
import { Note } from '../services/noteService';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NoteCard({ note, onPress, onDelete, onPin }: {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const preview = note.blocks
    .filter(b => b.type === 'text' || b.type === 'checklist')
    .map(b => b.content)
    .join(' ')
    .slice(0, 80);

  return (
    <Pressable
      style={[styles.noteCard, note.color ? { borderTopColor: note.color, borderTopWidth: 3 } : null]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.04)' }}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
        <View style={styles.noteHeaderRight}>
          {note.pinned ? (
            <MaterialIcons name="push-pin" size={14} color={Colors.primary} />
          ) : null}
          <Text style={styles.noteTime}>{timeAgo(note.updatedAt)}</Text>
        </View>
      </View>
      {preview ? (
        <Text style={styles.notePreview} numberOfLines={2}>{preview}</Text>
      ) : null}
      <View style={styles.noteFooter}>
        <View style={styles.noteBlocks}>
          {note.blocks.slice(0, 3).map(b => (
            <View key={b.id} style={styles.noteBlockBadge}>
              <Text style={styles.noteBlockText}>
                {b.type === 'heading' ? 'H' : b.type === 'checklist' ? '☐' : b.type === 'link' ? '🔗' : 'T'}
              </Text>
            </View>
          ))}
          {note.blocks.length > 3 ? (
            <Text style={styles.noteMoreBlocks}>+{note.blocks.length - 3}</Text>
          ) : null}
        </View>
        <View style={styles.noteActions}>
          <Pressable onPress={onPin} hitSlop={8} style={styles.noteActionBtn}>
            <MaterialIcons name="push-pin" size={16} color={note.pinned ? Colors.primary : Colors.textTertiary} />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8} style={styles.noteActionBtn}>
            <MaterialIcons name="delete-outline" size={16} color={Colors.error + 'AA'} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes, deleteNote, togglePin, addNote } = useNotes();
  const { showAlert } = useAlert();
  const [search, setSearch] = useState('');

  const filtered = search
    ? notes.filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.blocks.some(b => b.content.toLowerCase().includes(search.toLowerCase()))
    )
    : notes;

  const handleDelete = (note: Note) => {
    showAlert('Delete Note', `Delete "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteNote(note.id) },
    ]);
  };

  const handleCreate = async () => {
    const newNote = await addNote({
      title: 'New Note',
      blocks: [{ id: Date.now().toString(), type: 'text', content: '' }],
      pinned: false,
    });
    router.push({ pathname: '/note-editor', params: { id: newNote.id } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Notes</Text>
        <Pressable style={styles.addBtn} onPress={handleCreate}>
          <MaterialIcons name="add" size={22} color="#000" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <MaterialIcons name="close" size={16} color={Colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      {/* Notes List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>{search ? 'No results' : 'No notes yet'}</Text>
          <Text style={styles.emptySubtitle}>Tap + to create your first note</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40)}>
              <NoteCard
                note={item}
                onPress={() => router.push({ pathname: '/note-editor', params: { id: item.id } })}
                onDelete={() => handleDelete(item)}
                onPin={() => togglePin(item.id)}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 40, height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  noteCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  noteTitle: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  noteHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteTime: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  notePreview: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteBlocks: {
    flexDirection: 'row',
    gap: 4,
  },
  noteBlockBadge: {
    width: 20, height: 20,
    borderRadius: 4,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteBlockText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  noteMoreBlocks: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 4,
  },
  noteActionBtn: {
    width: 32, height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textTertiary,
  },
  listContent: {
    paddingBottom: 30,
  },
});
