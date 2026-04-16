import React, { useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/theme/colors';
import { useWatchlists } from '../../src/hooks/useWatchlist';
import { useMarketQuote } from '../../src/hooks/useMarketQuote';
import { ChangeBadge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonLoader } from '../../src/components/ui/SkeletonLoader';
import type { Watchlist, WatchlistItem } from '../../src/types/market';

// ─── Symbol row with live quote ───────────────────────────────────────────────

function SymbolRow({
  item,
  onRemove,
}: {
  item:     WatchlistItem;
  onRemove: () => void;
}) {
  const { data: quote, isLoading } = useMarketQuote(item.symbol, { refetchIntervalMs: 30_000 });

  return (
    <View style={styles.symbolRow}>
      <View style={styles.symbolLeft}>
        <Text style={styles.symbolText}>{item.symbol}</Text>
        {isLoading ? (
          <SkeletonLoader width={80} height={11} borderRadius={4} />
        ) : quote ? (
          <Text style={styles.symbolPrice}>
            ${quote.c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        ) : (
          <Text style={styles.symbolPrice}>—</Text>
        )}
      </View>
      <View style={styles.symbolRight}>
        {!isLoading && quote && <ChangeBadge value={quote.dp} small />}
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color={COLORS.bear} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Watchlist card ───────────────────────────────────────────────────────────

function WatchlistCard({
  list,
  onAddItem,
  onRemoveItem,
  onDelete,
}: {
  list:         Watchlist;
  onAddItem:    (symbol: string) => void;
  onRemoveItem: (itemId: number) => void;
  onDelete:     () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [addingSymbol, setAddingSymbol] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAdd = () => {
    const sym = addingSymbol.trim().toUpperCase();
    if (!sym) return;
    onAddItem(sym);
    setAddingSymbol('');
    setShowAddInput(false);
  };

  return (
    <View style={styles.listCard}>
      {/* Card header */}
      <TouchableOpacity
        style={styles.listHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={styles.listHeaderLeft}>
          <Text style={styles.listName}>{list.name}</Text>
          <Text style={styles.listCount}>{list.items.length} symbols</Text>
        </View>
        <View style={styles.listHeaderRight}>
          <TouchableOpacity
            onPress={() => setShowAddInput((v) => !v)}
            style={styles.addBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Delete Watchlist', `Delete "${list.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ])}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* Add symbol input */}
      {showAddInput && (
        <View style={styles.addInputRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Symbol (e.g. TSLA)"
            placeholderTextColor={COLORS.textDim}
            autoCapitalize="characters"
            autoCorrect={false}
            value={addingSymbol}
            onChangeText={setAddingSymbol}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity style={styles.addConfirmBtn} onPress={handleAdd}>
            <Text style={styles.addConfirmText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Items */}
      {expanded && (
        list.items.length === 0 ? (
          <Text style={styles.emptyItemsText}>No symbols yet — tap + to add one</Text>
        ) : (
          list.items.map((item) => (
            <SymbolRow
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))
        )
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WatchlistScreen() {
  const {
    watchlists, isLoading, isError, refetch,
    createWatchlist, deleteWatchlist, addItem, removeItem,
    isCreating,
  } = useWatchlists();

  const [showNewModal, setShowNewModal] = useState(false);
  const [newName,      setNewName]      = useState('');

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await createWatchlist(name);
    setNewName('');
    setShowNewModal(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Watchlists</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => setShowNewModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={COLORS.text} />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />
        }
      >
        {isLoading ? (
          [0, 1].map((i) => (
            <View key={i} style={styles.listCard}>
              <SkeletonLoader width="60%" height={18} borderRadius={4} style={{ marginBottom: 10 }} />
              <SkeletonLoader width="100%" height={40} borderRadius={8} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="100%" height={40} borderRadius={8} />
            </View>
          ))
        ) : isError ? (
          <ErrorState message="Could not load watchlists" onRetry={refetch} />
        ) : watchlists.length === 0 ? (
          <EmptyState
            icon="bookmark-outline"
            title="No watchlists yet"
            description="Create a watchlist to track your favourite symbols with live prices."
            action={{ label: 'Create Watchlist', onPress: () => setShowNewModal(true) }}
          />
        ) : (
          watchlists.map((list) => (
            <WatchlistCard
              key={list.id}
              list={list}
              onAddItem={(symbol) => addItem({ watchlistId: list.id, symbol })}
              onRemoveItem={removeItem}
              onDelete={() => deleteWatchlist(list.id)}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Create watchlist modal */}
      <Modal visible={showNewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Watchlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Watchlist name"
              placeholderTextColor={COLORS.textDim}
              autoFocus
              value={newName}
              onChangeText={setNewName}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setShowNewModal(false); setNewName(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, isCreating && { opacity: 0.7 }]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                <Text style={styles.modalConfirmText}>
                  {isCreating ? 'Creating…' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.background },
  screenHeader:  {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
  },
  screenTitle:   { fontSize: 22, fontWeight: '700', color: COLORS.text },
  newBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    backgroundColor:   COLORS.primary,
    borderRadius:      10,
    paddingVertical:    7,
    paddingHorizontal: 14,
  },
  newBtnText:    { fontSize: 13, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  // ── List card ──
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius:    14,
    padding:         14,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  listHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  listHeaderLeft:  { flex: 1 },
  listHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listName:        { fontSize: 15, fontWeight: '700', color: COLORS.text },
  listCount:       { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  addBtn:          {},
  emptyItemsText:  { fontSize: 12, color: COLORS.textMuted, paddingVertical: 8 },
  // ── Symbol row ──
  symbolRow: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingVertical:  10,
    borderTopWidth:   1,
    borderTopColor:   COLORS.borderSubtle,
  },
  symbolLeft:  { flex: 1, gap: 3 },
  symbolText:  { fontSize: 14, fontWeight: '700', color: COLORS.text },
  symbolPrice: { fontSize: 12, color: COLORS.textSecondary },
  symbolRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  removeBtn:   {},
  // ── Add input ──
  addInputRow: {
    flexDirection:  'row',
    gap:            8,
    marginBottom:   10,
  },
  addInput: {
    flex:              1,
    backgroundColor:   COLORS.cardElevated,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       COLORS.border,
    paddingHorizontal: 12,
    height:            40,
    color:             COLORS.text,
    fontSize:          14,
  },
  addConfirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    10,
    paddingHorizontal: 16,
    justifyContent:  'center',
  },
  addConfirmText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  // ── Modal ──
  modalOverlay: {
    flex:            1,
    backgroundColor: COLORS.overlay,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: COLORS.card,
    borderRadius:    20,
    padding:         24,
    width:           '100%',
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  modalInput: {
    backgroundColor:   COLORS.cardElevated,
    borderRadius:      12,
    borderWidth:       1,
    borderColor:       COLORS.border,
    paddingHorizontal: 14,
    height:            48,
    fontSize:          15,
    color:             COLORS.text,
    marginBottom:      20,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    flex:            1,
    height:          46,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: COLORS.cardElevated,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  modalCancelText:  { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
  modalConfirm: {
    flex:            1,
    height:          46,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: COLORS.primary,
  },
  modalConfirmText: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
});
