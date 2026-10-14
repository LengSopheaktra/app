import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CATEGORY_COLORS = {
  Work: '#2563EB',
  University: '#7C3AED',
  Coding: '#059669',
  English: '#D97706',
  Assignment: '#DC2626',
  'Meal / Travel': '#4B5563',
  Rest: '#10B981',
  Sleep: '#6B7280',
};

// Initial base routine extracted from My_Schedule.xlsx
const INITIAL_SLOTS = [
  { id: '1', time: '06:00 - 07:00', title: 'Wake up & breakfast', category: 'Meal / Travel', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { id: '2', time: '07:00 - 08:00', title: 'Travel to work', category: 'Meal / Travel', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { id: '3', time: '08:00 - 12:00', title: 'Work session', category: 'Work', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { id: '4', time: '12:00 - 13:00', title: 'Lunch break', category: 'Meal / Travel', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  { id: '5', time: '13:00 - 17:00', title: 'Work afternoon', category: 'Work', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { id: '6', time: '17:00 - 17:45', title: 'Travel to University', category: 'Meal / Travel', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { id: '7', time: '17:45 - 20:45', title: 'University classes', category: 'University', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { id: '8', time: '21:00 - 21:30', title: 'English practice', category: 'English', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  { id: '9', time: '21:30 - 22:30', title: 'Coding & assignments', category: 'Coding', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { id: '10', time: '08:00 - 11:00', title: 'Web dev project session', category: 'Coding', days: ['Saturday'] },
  { id: '11', time: '13:00 - 16:00', title: 'University homework / assignments', category: 'Assignment', days: ['Saturday'] },
  { id: '12', time: '09:00 - 11:00', title: 'Coding practice & review', category: 'Coding', days: ['Sunday'] },
  { id: '13', time: '19:00 - 20:00', title: 'Assignment catch-up', category: 'Assignment', days: ['Sunday'] },
];

export default function App() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [scheduleList, setScheduleList] = useState(INITIAL_SLOTS);
  const [editingItem, setEditingItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states inside modal
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCategory, setEditCategory] = useState('Work');

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Schedule Alerts',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications in settings.');
      }
    })();
  }, []);

  const openEditor = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditTime(item.time);
    setEditCategory(item.category);
    setModalVisible(true);
  };

  const saveSlot = () => {
    if (!editTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    setScheduleList((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? { ...item, title: editTitle, time: editTime, category: editCategory }
          : item
      )
    );
    setModalVisible(false);
  };

  const scheduleReminder = async (item) => {
    const timeParts = item.time.split(' - ')[0].split(':');
    const hour = parseInt(timeParts[0], 10) || 8;
    const minute = parseInt(timeParts[1], 10) || 0;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming: ${item.title}`,
        body: `Category: ${item.category} (${item.time})`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour,
        minute: minute,
      },
    });

    Alert.alert('Reminder Set!', `Daily reminder active for ${item.time}`);
  };

  const filteredSlots = scheduleList.filter((item) => item.days.includes(selectedDay));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Weekly Schedule</Text>
        <Text style={styles.headerSubtitle}>Tap slot to edit • Tap 🔔 to set reminder</Text>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelectorContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DAYS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isActive = item === selectedDay;
            return (
              <TouchableOpacity
                onPress={() => setSelectedDay(item)}
                style={[styles.dayButton, isActive && styles.dayButtonActive]}
              >
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                  {item.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={filteredSlots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const accentColor = CATEGORY_COLORS[item.category] || '#2563EB';
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openEditor(item)}
              style={[styles.card, { borderLeftColor: accentColor }]}
            >
              <View style={styles.cardContent}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}>
                    <Text style={[styles.badgeText, { color: accentColor }]}>{item.category}</Text>
                  </View>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.taskTitle}>{item.title}</Text>
              </View>

              <TouchableOpacity
                style={styles.bellButton}
                onPress={() => scheduleReminder(item)}
              >
                <Text style={styles.bellIcon}>🔔</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events scheduled for {selectedDay}.</Text>
          </View>
        }
      />

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Schedule Item</Text>

            <Text style={styles.inputLabel}>Activity Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="e.g. Work Session"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Time Range</Text>
            <TextInput
              style={styles.modalInput}
              value={editTime}
              onChangeText={setEditTime}
              placeholder="e.g. 08:00 - 12:00"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryPicker}>
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setEditCategory(cat)}
                  style={[
                    styles.categoryChip,
                    editCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      editCategory === cat && { color: '#FFF' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={saveSlot}
              >
                <Text style={styles.btnSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },

  daySelectorContainer: { paddingVertical: 12, paddingLeft: 20 },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  dayButtonActive: { backgroundColor: '#3B82F6' },
  dayText: { color: '#94A3B8', fontWeight: '600', fontSize: 14 },
  dayTextActive: { color: '#FFFFFF' },

  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
  },
  cardContent: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  timeText: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  taskTitle: { color: '#F1F5F9', fontSize: 16, fontWeight: '600' },
  bellButton: { padding: 8, backgroundColor: '#334155', borderRadius: 20, marginLeft: 10 },
  bellIcon: { fontSize: 16 },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#64748B', fontSize: 15 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 16 },
  inputLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  modalInput: {
    backgroundColor: '#0F172A',
    color: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  categoryChip: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipText: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnCancel: { backgroundColor: '#334155' },
  btnCancelText: { color: '#F8FAFC', fontWeight: '600' },
  btnSave: { backgroundColor: '#3B82F6' },
  btnSaveText: { color: '#FFF', fontWeight: '700' },
});