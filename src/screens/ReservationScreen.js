import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import useReservation, { MAX_PARTY, MIN_PARTY } from '../hooks/useReservation';
import { AppButton, Card, Chip, Field, Screen, SectionTitle } from '../components/ui';
import { radius, spacing } from '../theme/colors';

// UI only: every rule (availability, validation, create/cancel) lives in
// the useReservation custom hook.
export default function ReservationScreen() {
  const { colors } = useTheme();
  const r = useReservation();
  const [showConfirm, setShowConfirm] = useState(false); // pure UI state

  const openConfirm = () => {
    if (r.validate()) setShowConfirm(true);
  };

  const confirmBooking = () => {
    const created = r.createReservation();
    setShowConfirm(false);
    if (created) {
      Alert.alert('Table requested 🎉', `Your booking ${created.id} is waiting for the manager to accept it.`);
    }
  };

  const askCancel = (res) =>
    Alert.alert('Cancel reservation?', `${res.date} at ${res.time} for ${res.partySize}.`, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => r.cancelReservation(res.id) },
    ]);

  const dateLabel = r.dates.find((d) => d.key === r.date)?.label;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }} keyboardShouldPersistTaps="handled">
        <SectionTitle style={{ marginTop: 0 }}>Date</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {r.dates.map((d) => (
            <Chip key={d.key} label={d.label} selected={r.date === d.key} onPress={() => r.selectDate(d.key)} />
          ))}
        </ScrollView>
        {r.errors.date ? <Text style={[styles.error, { color: colors.danger }]}>{r.errors.date}</Text> : null}

        <SectionTitle>Party size</SectionTitle>
        <View style={styles.partyRow}>
          <Pressable
            onPress={() => r.setPartySize(r.partySize - 1)}
            disabled={r.partySize <= MIN_PARTY}
            style={[styles.round, { borderColor: colors.border, opacity: r.partySize <= MIN_PARTY ? 0.4 : 1 }]}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.party, { color: colors.text }]}>{r.partySize}</Text>
          <Pressable
            onPress={() => r.setPartySize(r.partySize + 1)}
            disabled={r.partySize >= MAX_PARTY}
            style={[styles.round, { borderColor: colors.border, opacity: r.partySize >= MAX_PARTY ? 0.4 : 1 }]}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.textMuted }}>guests (1–12)</Text>
        </View>
        {r.errors.partySize ? <Text style={[styles.error, { color: colors.danger }]}>{r.errors.partySize}</Text> : null}

        <SectionTitle>Time</SectionTitle>
        <View style={styles.wrap}>
          {r.slots.map((s) => (
            <View key={s.time} style={{ alignItems: 'center', marginBottom: spacing.sm }}>
              <Chip label={s.time} selected={r.time === s.time} disabled={!s.isAvailable} onPress={() => r.selectTime(s.time)} />
              {!s.isAvailable ? <Text style={[styles.slotReason, { color: colors.textMuted }]}>{s.reason}</Text> : null}
            </View>
          ))}
        </View>
        {r.errors.time ? <Text style={[styles.error, { color: colors.danger }]}>{r.errors.time}</Text> : null}

        {r.time && r.availableTables.length > 0 ? (
          <>
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm, marginBottom: 6 }}>Free tables for {r.partySize}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {r.availableTables.map((t) => (
                <Chip
                  key={t.id}
                  label={`T${t.number} · ${t.seats} seats · ${t.location}`}
                  selected={r.selectedTable?.id === t.id}
                  onPress={() => r.selectTable(t.id)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <SectionTitle>Contact details</SectionTitle>
        <Field label="Name" value={r.contact.name} onChangeText={(v) => r.setContactField('name', v)} error={r.errors.name} placeholder="Ali Raza" />
        <Field
          label="Mobile number"
          value={r.contact.phone}
          onChangeText={(v) => r.setContactField('phone', v)}
          error={r.errors.phone}
          placeholder="03XX-XXXXXXX"
          keyboardType="phone-pad"
          maxLength={12}
        />

        <AppButton title="Review booking" onPress={openConfirm} icon={<Ionicons name="calendar-outline" size={18} color={colors.primaryText} />} />

        <SectionTitle style={{ marginTop: spacing.xl }}>My reservations</SectionTitle>
        {r.myReservations.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>You have no reservations yet.</Text>
        ) : (
          r.myReservations.map((res) => (
            <Card key={res.id} style={{ marginBottom: spacing.sm }}>
              <View style={styles.resRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '800' }}>{res.date} · {res.time}</Text>
                  <Text style={{ color: colors.textMuted }}>
                    {res.partySize} guests · Table {res.tableId.replace('t', '')} · {res.status}
                  </Text>
                </View>
                {res.status === 'Pending' || res.status === 'Accepted' ? (
                  <AppButton small title="Cancel" variant="outline" onPress={() => askCancel(res)} />
                ) : null}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Confirmation modal */}
      <Modal visible={showConfirm} transparent animationType="fade" onRequestClose={() => setShowConfirm(false)}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm your booking</Text>
            {[
              ['Date', `${dateLabel} (${r.date})`],
              ['Time', r.time],
              ['Guests', String(r.partySize)],
              ['Table', r.selectedTable ? `T${r.selectedTable.number} · ${r.selectedTable.location}` : '-'],
              ['Name', r.contact.name],
              ['Mobile', r.contact.phone],
            ].map(([k, v]) => (
              <View key={k} style={styles.modalRow}>
                <Text style={{ color: colors.textMuted }}>{k}</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{v}</Text>
              </View>
            ))}
            <View style={styles.modalButtons}>
              <AppButton title="Edit" variant="outline" onPress={() => setShowConfirm(false)} style={{ flex: 1 }} />
              <AppButton title="Confirm" onPress={confirmBooking} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 12, marginTop: 6 },
  partyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  round: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  party: { fontSize: 22, fontWeight: '900', minWidth: 28, textAlign: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  slotReason: { fontSize: 10, marginTop: 2, marginRight: spacing.sm },
  resRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backdrop: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  modal: { borderRadius: radius.lg, padding: spacing.xl, maxWidth: 480, width: '100%', alignSelf: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: spacing.md },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
