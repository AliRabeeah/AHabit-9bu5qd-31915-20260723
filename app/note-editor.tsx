import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useNotes } from '../hooks/useNotes';
import { NoteService, Note, NoteBlock } from '../services/noteService';

type BlockType = 'text' | 'heading' | 'checklist' | 'link';

const BLOCK_TYPES: { type: BlockType; icon: string; label: string }[] = [
  { type: 'text', icon: 'notes', label: 'Text' },
  { type: 'heading', icon: 'title', label: 'Heading' },
  { type: 'checklist', icon: 'check-box', label: 'Checklist' },
  { type: 'link', icon: 'link', label: 'Link' },
];

export default function NoteEditorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateNote } = useNotes();

  const [title, setTitle] = useState('New Note');
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  useEffect(() => {
    if (id) {
      NoteService.getById(id).then(note => {
        if (note) {
          setTitle(note.title);
          setBlocks(note.blocks);
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    await updateNote(id, { title, blocks });
    setSaving(false);
    router.back();
  };

  const updateBlock = (blockId: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b));
  };

  const toggleCheck = (blockId: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, checked: !b.checked } : b));
  };

  const addBlock = (type: BlockType) => {
    const newBlock: NoteBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      checked: type === 'checklist' ? false : undefined,
    };
    setBlocks(prev => [...prev, newBlock]);
    setShowBlockMenu(false);
  };

  const removeBlock = (blockId: string) => {
    if (blocks.length > 1) {
      setBlocks(prev => prev.filter(b => b.id !== blockId));
    }
  };

  const renderBlock = (block: NoteBlock) => {
    if (block.type === 'heading') {
      return (
        <View key={block.id} style={styles.blockRow}>
          <TextInput
            style={styles.headingInput}
            placeholder="Heading..."
            placeholderTextColor={Colors.textTertiary}
            value={block.content}
            onChangeText={t => updateBlock(block.id, t)}
            multiline
          />
          <Pressable onPress={() => removeBlock(block.id)} hitSlop={8}>
            <MaterialIcons name="close" size={16} color={Colors.textTertiary} />
          </Pressable>
        </View>
      );
    }

    if (block.type === 'checklist') {
      return (
        <View key={block.id} style={styles.blockRow}>
          <Pressable onPress={() => toggleCheck(block.id)} hitSlop={8}>
            <MaterialIcons
              name={block.checked ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={block.checked ? Colors.success : Colors.textTertiary}
            />
          </Pressable>
          <TextInput
            style={[styles.checklistInput, block.checked && styles.checklistInputDone]}
            placeholder="Task..."
            placeholderTextColor={Colors.textTertiary}
            value={block.content}
            onChangeText={t => updateBlock(block.id, t)}
          />
          <Pressable onPress={() => removeBlock(block.id)} hitSlop={8}>
            <MaterialIcons name="close" size={16} color={Colors.textTertiary} />
          </Pressable>
        </View>
      );
    }

    if (block.type === 'link') {
      return (
        <View key={block.id} style={styles.blockRow}>
          <MaterialIcons name="link" size={18} color={Colors.primary} />
          <TextInput
            style={styles.linkInput}
            placeholder="https://..."
            placeholderTextColor={Colors.textTertiary}
            value={block.content}
            onChangeText={t => updateBlock(block.id, t)}
            keyboardType="url"
            autoCapitalize="none"
          />
          <Pressable onPress={() => removeBlock(block.id)} hitSlop={8}>
            <MaterialIcons name="close" size={16} color={Colors.textTertiary} />
          </Pressable>
        </View>
      );
    }

    // text
    return (
      <View key={block.id} style={styles.blockRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Write something..."
          placeholderTextColor={Colors.textTertiary}
          value={block.content}
          onChangeText={t => updateBlock(block.id, t)}
          multiline
        />
        {blocks.length > 1 ? (
          <Pressable onPress={() => removeBlock(block.id)} hitSlop={8}>
            <MaterialIcons name="close" size={16} color={Colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Title */}
        <TextInput
          style={styles.titleInput}
          placeholder="Note title"
          placeholderTextColor={Colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        {/* Blocks */}
        <View style={styles.blocks}>
          {blocks.map(block => renderBlock(block))}
        </View>

        {/* Add Block */}
        <Pressable
          style={styles.addBlockBtn}
          onPress={() => setShowBlockMenu(v => !v)}
        >
          <MaterialIcons name="add-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.addBlockText}>Add block</Text>
        </Pressable>

        {showBlockMenu ? (
          <View style={styles.blockMenu}>
            {BLOCK_TYPES.map(bt => (
              <Pressable
                key={bt.type}
                style={styles.blockMenuItem}
                onPress={() => addBlock(bt.type)}
              >
                <MaterialIcons name={bt.icon as any} size={20} color={Colors.textSecondary} />
                <Text style={styles.blockMenuLabel}>{bt.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.xl,
  },
  saveBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: '#000',
  },
  content: { padding: Spacing.md },
  titleInput: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.md,
  },
  blocks: { gap: Spacing.sm },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    lineHeight: 22,
    minHeight: 40,
  },
  headingInput: {
    flex: 1,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    minHeight: 40,
  },
  checklistInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  checklistInputDone: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  linkInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.primary,
  },
  addBlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addBlockText: {
    fontSize: Typography.base,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  blockMenu: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  blockMenuItemIcon: {},
  blockMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  blockMenuLabel: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
});
