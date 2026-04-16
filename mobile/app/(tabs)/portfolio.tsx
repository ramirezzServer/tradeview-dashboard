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
import { usePortfolios } from '../../src/hooks/usePortfolio';
import { useMarketQuote } from '../../src/hooks/useMarketQuote';
import { ChangeBadge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonLoader } from '../../src/components/ui/SkeletonLoader';
import type { Portfolio, PortfolioItem } from '../../src/types/market';

// ─── Holding row ──────────────────────────────────────────────────────────────

function HoldingRow({
  item,
  onRemove,
}: {
  item:     PortfolioItem;
  onRemove: () => void;
}) {
  const { data: quote, isLoading } = useMarketQuote(item.symbol, { refetchIntervalMs: 30_000 });

  const currentValue = quote ? quote.c * item.quantity : null;
  const costBasis    = item.avg_cost * item.quantity;
  const pnl          = currentValue !== null ? currentValue - costBasis : null;
  const pnlPct       = pnl !== null ? (pnl / costBasis) * 100 : null;

  return (
    <View style={styles.holdingRow}>
      <View style={styles.holdingLeft}>
        <Text style={styles.holdingSymbol}>{item.symbol}</Text>
        <Text style={styles.holdingDetail}>
          {item.quantity} shares @ ${item.avg_cost.toFixed(2)}
        </Text>
      </View>

      <View style={styles.holdingRight}>
        {isLoading ? (
          <SkeletonLoader width={70} height={12} borderRadius={4} />
        ) : currentValue !== null ? (
          <>
            <Text style={styles.holdingValue}>
              ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            {pnlPct !== null && <ChangeBadge value={pnlPct} small />}
          </>
        ) : (
          <Text style={styles.holdingValue}>—</Text>
        )}
        <TouchableOpacity
          onPress={() => Alert.alert('Remove', `Remove ${item.symbol}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: onRemove },
          ])}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={15} color={COLORS.bear} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Portfolio card ───────────────────────────────────────────────────────────

function PortfolioCard({
  portfolio,
  onDelete,
  onAddItem,
  onRemoveItem,
}: {
  portfolio:    Portfolio;
  onDelete:     () => void;
  onAddItem:    (symbol: string, quantity: number, avg_cost: number) => void;
  onRemoveItem: (itemId: number) => void;
}) {
  const [expanded,    setExpanded]    = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sym,  setSym]  = useState('');
  const [qty,  setQty]  = useState('');
  const [cost, setCost] = useState('');

  const handleAdd = () => {
    const symbol   = sym.trim().toUpperCase();
    const quantity = parseFloat(qty);
    const avg_cost = parseFloat(cost);
    if (!symbol || isNaN(quantity) || isNaN(avg_cost)) return;
    onAddItem(symbol, quantity, avg_cost);
    setSym(''); setQty(''); setCost('');
    setShowAddForm(false);
  };

  return (
    <View style={styles.portCard}>
      <TouchableOpacity
        style={styles.portHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={styles.portHeaderLeft}>
          <Text style={styles.portName}>{portfolio.name}</Text>
          <Text style={styles.portCount}>{portfolio.items.length} holdings</Text>
        </View>
        <View style={styles.portHeaderRight}>
          <TouchableOpacity
            onPress={() => setShowAddForm((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Delete Portfolio', `Delete "${portfolio.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ])}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>

      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.formInput}
            placeholder="Symbol"
            placeholderTextColor={COLORS.textDim}
            autoCapitalize="characters"
            value={sym}
            onChangeText={setSym}
          />
          <TextInput
            style={styles.formInput}
            placeholder="Qty"
            placeholderTextColor={COLORS.textDim}
            keyboardType="decimal-pad"
            value={qty}
            onChangeText={setQty}
          />
          <TextInput
            style={styles.formInput}
            placeholder="Avg cost"
            placeholderTextColor={COLORS.textDim}
            keyboardType="decimal-pad"
            value={cost}
            onChangeText={setCost}
          />
          <TouchableOpacity style={styles.addFormBtn} onPress={handleAdd}>
            <Text style={styles.addFormBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {expanded && (
        portfolio.items.length === 0 ? (
          <Text style={styles.emptyText}>No holdings yet — tap + to add one</Text>
        ) : (
          portfolio.items.map((item) => (
            <HoldingRow key={item.id} item={item} onRemove={() => onRemoveItem(item.id)} />
          ))
        )
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PortfolioScreen() {
  const {
    portfolios, isLoading, isError, refetch,
    createPortfolio, deletePortfolio, addItem, removeItem,
    isCreating,
  } = usePortfolios();

  const [showModal, setShowModal] = useState(false);
  const [newName,   setNewName]   = useState('');

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await createPortfolio(name);
    setNewName('');
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Portfolios</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => setShowModal(true)}>
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
            <View key={i} style={styles.portCard}>
              <SkeletonLoader width="55%" height={18} borderRadius={4} style={{ marginBottom: 10 }} />
              <SkeletonLoader width="100%" height={48} borderRadius={8} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="100%" height={48} borderRadius={8} />
            </View>
          ))
        ) : isError ? (
          <ErrorState message="Could not load portfolios" onRetry={refetch} />
        ) : portfolios.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title="No portfolios yet"
            description="Create a portfolio to track your holdings and P&L in real time."
            action={{ label: 'Create Portfolio', onPress: () => setShowModal(true) }}
          />
        ) : (
          portfolios.map((port) => (
            <PortfolioCard
              key={port.id}
              portfolio={port}
              onDelete={() => deletePortfolio(port.id)}
              onAddItem={(symbol, quantity, avg_cost) =>
                addItem({ portfolioId: port.id, symbol, quantity, avg_cost })
              }
              onRemoveItem={removeItem}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Portfolio</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Portfolio name"
              placeholderTextColor={COLORS.textDim}
              autoFocus
              value={newName}
              onChangeText={setNewName}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowModal(false); setNewName(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, isCreating && { opacity: 0.7 }]} onPress={handleCreate} disabled={isCreating}>
                <Text style={styles.modalConfirmText}>{isCreating ? 'Creating…' : 'Create'}</Text>
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
  screenHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  screenTitle:   { fontSize: 22, fontWeight: '700', color: COLORS.text },
  newBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14 },
  newBtnText:    { fontSize: 13, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  portCard: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  portHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  portHeaderLeft:  { flex: 1 },
  portHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  portName:        { fontSize: 15, fontWeight: '700', color: COLORS.text },
  portCount:       { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  emptyText:       { fontSize: 12, color: COLORS.textMuted, paddingVertical: 8 },
  holdingRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  holdingLeft:     { flex: 1, gap: 3 },
  holdingSymbol:   { fontSize: 14, fontWeight: '700', color: COLORS.text },
  holdingDetail:   { fontSize: 11, color: COLORS.textMuted },
  holdingRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  holdingValue:    { fontSize: 13, fontWeight: '600', color: COLORS.text },
  addForm:         { flexDirection: 'row', gap: 6, marginBottom: 10 },
  formInput:       { flex: 1, backgroundColor: COLORS.cardElevated, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, height: 38, color: COLORS.text, fontSize: 13 },
  addFormBtn:      { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  addFormBtnText:  { fontSize: 13, fontWeight: '600', color: COLORS.text },
  modalOverlay:    { flex: 1, backgroundColor: COLORS.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  modal:           { backgroundColor: COLORS.card, borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: COLORS.border },
  modalTitle:      { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  modalInput:      { backgroundColor: COLORS.cardElevated, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, height: 48, fontSize: 15, color: COLORS.text, marginBottom: 20 },
  modalActions:    { flexDirection: 'row', gap: 10 },
  modalCancel:     { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cardElevated, borderWidth: 1, borderColor: COLORS.border },
  modalCancelText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
  modalConfirm:    { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary },
  modalConfirmText: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
});
