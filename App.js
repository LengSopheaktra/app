import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { WebView } from 'react-native-webview';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [currentTab, setCurrentTab] = useState('schedule'); // 'schedule' or 'coding'

  // Schedule State
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Study Coding', time: '08:00 AM', alarm: true, note: 'HTML & CSS Review' },
    { id: '2', title: 'Video Editing', time: '02:00 PM', alarm: false, note: 'Premiere Pro project' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNote, setNewNote] = useState('');

  // Coding State
  const [htmlCode, setHtmlCode] = useState(
    `<div class="card">\n  <h1>Hello World</h1>\n  <p>Live HTML & CSS Editor</p>\n</div>`
  );
  const [cssCode, setCssCode] = useState(
    `body { background: #0A0A0C; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 90vh; }\n.card { background: #1A1A22; padding: 24px; border-radius: 12px; border: 1px solid #333; text-align: center; }\nh1 { color: #4E95FF; font-size: 22px; }`
  );

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Enable notifications to receive schedule alerts.');
      }
    })();
  }, []);

  // Add Row
  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Field', 'Please enter a title for this schedule.');
      return;
    }
    const newTask = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      time: newTime.trim() || 'Anytime',
      alarm: true,
      note: newNote.trim(),
    };

    setTasks([...tasks, newTask]);

    // Schedule notification test alert
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Schedule Reminder: ${newTask.title}`,
        body: newTask.note || `Time: ${newTask.time}`,
        sound: true,
      },
      trigger: { seconds: 5 }, // triggers quick alert confirmation
    });

    setNewTitle('');
    setNewTime('');
    setNewNote('');
  };

  // Delete Row
  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((item) => item.id !== id));
  };

  // Toggle Alarm
  const handleToggleAlarm = (id) => {
    setTasks(
      tasks.map((item) => (item.id === id ? { ...item, alarm: !item.alarm } : item))
    );
  };

  // Combined HTML for WebView
  const fullHtmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      {/* Navigation Header Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'schedule' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('schedule')}
        >
          <Text style={[styles.tabButtonText, currentTab === 'schedule' && styles.tabButtonTextActive]}>
            📅 Schedule
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'coding' && styles.tabButtonActive]}
          onPress={() => setCurrentTab('coding')}
        >
          <Text style={[styles.tabButtonText, currentTab === 'coding' && styles.tabButtonTextActive]}>
            💻 Coding (HTML/CSS)
          </Text>
        </TouchableOpacity>
      </View>

      {/* SCHEDULE VIEW */}
      {currentTab === 'schedule' && (
        <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
          {/* Cover / Hero Image */}
          <View style={styles.coverWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
              }}
              style={styles.coverImage}
            />
            <View style={styles.coverOverlay}>
              <Text style={styles.coverTitle}>Daily Workspace Tracker</Text>
              <Text style={styles.coverSubtitle}>Organize tasks with audio notifications</Text>
            </View>
          </View>

          {/* Add New Row Box */}
          <View style={styles.cardBox}>
            <Text style={styles.cardHeader}>+ Add Schedule Row</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Task Title (e.g., Database review)"
              placeholderTextColor="#777"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <View style={styles.twoColumnRow}>
              <TextInput
                style={[styles.inputField, { flex: 1, marginRight: 8 }]}
                placeholder="Time (e.g., 04:30 PM)"
                placeholderTextColor="#777"
                value={newTime}
                onChangeText={setNewTime}
              />
              <TextInput
                style={[styles.inputField, { flex: 1 }]}
                placeholder="Details / Note"
                placeholderTextColor="#777"
                value={newNote}
                onChangeText={setNewNote}
              />
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={handleAddTask}>
              <Text style={styles.actionBtnText}>Add Row & Set Alert</Text>
            </TouchableOpacity>
          </View>

          {/* Schedule List */}
          <View style={styles.scheduleListWrapper}>
            <Text style={styles.listSectionTitle}>Your Schedule Rows ({tasks.length})</Text>
            {tasks.map((item) => (
              <View key={item.id} style={styles.scheduleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskTime}>⏰ {item.time}</Text>
                  {item.note ? <Text style={styles.taskNote}>{item.note}</Text> : null}
                </View>
                <View style={styles.rowControls}>
                  <Text style={styles.alarmLabel}>{item.alarm ? '🔔 Sound' : '🔕 Mute'}</Text>
                  <Switch
                    value={item.alarm}
                    onValueChange={() => handleToggleAlarm(item.id)}
                    trackColor={{ false: '#333', true: '#4E95FF' }}
                    thumbColor={item.alarm ? '#fff' : '#888'}
                  />
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteTask(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* CODING (HTML/CSS) VIEW */}
      {currentTab === 'coding' && (
        <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
          <View style={styles.codingHeader}>
            <Text style={styles.codeTitle}>HTML & CSS Editor</Text>
            <Text style={styles.codeSubtitle}>Write or edit code below to view real-time live preview</Text>
          </View>

          {/* HTML Editor */}
          <View style={styles.editorBox}>
            <Text style={styles.editorTag}>HTML</Text>
            <TextInput
              style={styles.codeTextInput}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              value={htmlCode}
              onChangeText={setHtmlCode}
            />
          </View>

          {/* CSS Editor */}
          <View style={styles.editorBox}>
            <Text style={styles.editorTag}>CSS</Text>
            <TextInput
              style={styles.codeTextInput}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              value={cssCode}
              onChangeText={setCssCode}
            />
          </View>

          {/* Live Preview */}
          <Text style={styles.previewTitle}>Live Output Preview</Text>
          <View style={styles.previewContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: fullHtmlContent }}
              style={styles.webview}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#121217',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#1F2430',
  },
  tabButtonText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 15,
  },
  tabButtonTextActive: {
    color: '#4E95FF',
  },
  scrollArea: {
    flex: 1,
    padding: 16,
  },
  coverWrapper: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  coverTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  coverSubtitle: {
    color: '#C0C0C8',
    fontSize: 13,
    marginTop: 4,
  },
  cardBox: {
    backgroundColor: '#16161D',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262633',
    marginBottom: 20,
  },
  cardHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputField: {
    backgroundColor: '#0E0E12',
    color: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A38',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    backgroundColor: '#387BFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  scheduleListWrapper: {
    marginBottom: 40,
  },
  listSectionTitle: {
    color: '#A0A0B0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  scheduleRow: {
    backgroundColor: '#16161D',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#242432',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskTime: {
    color: '#4E95FF',
    fontSize: 13,
    marginTop: 4,
  },
  taskNote: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  rowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  alarmLabel: {
    color: '#888',
    fontSize: 11,
    marginRight: 4,
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  codingHeader: {
    marginBottom: 16,
  },
  codeTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  codeSubtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  editorBox: {
    backgroundColor: '#13131A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262635',
    marginBottom: 14,
    padding: 12,
  },
  editorTag: {
    color: '#4E95FF',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 6,
  },
  codeTextInput: {
    color: '#70FF94',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  previewTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  previewContainer: {
    height: 260,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 40,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
});