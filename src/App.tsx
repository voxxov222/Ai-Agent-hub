import React, { useState, useEffect } from 'react';
import { ViewMode, UserProfile, ChatMessage, MemoryFact, HeartbeatTask, PendingAction } from './types';
import { Navbar } from './components/Navbar';
import { VoiceAssistant } from './components/VoiceAssistant';
import { DesktopStudio } from './components/DesktopStudio';
import { MediaStudio } from './components/MediaStudio';
import { MemoryHeartbeat } from './components/MemoryHeartbeat';
import { AuthModal } from './components/AuthModal';
import { auth, signOutUser, onAuthStateChanged, db, collection, addDoc, getDocs, doc, deleteDoc, query, where } from './lib/firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('assistant');
  const [isOpenMicActive, setIsOpenMicActive] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Chat Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Long-Term Memory Facts State
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>([
    {
      id: 'fact-1',
      userId: 'local',
      fact: 'Prefers dark-mode UI with high-contrast slate and indigo colors',
      category: 'preference',
      createdAt: '2026-07-23'
    },
    {
      id: 'fact-2',
      userId: 'local',
      fact: 'Building a desktop app wrapper using macOS pywebview with WKWebView',
      category: 'identity',
      createdAt: '2026-07-23'
    }
  ]);

  // Heartbeat Tasks State
  const [heartbeatTasks, setHeartbeatTasks] = useState<HeartbeatTask[]>([
    {
      id: 'task-1',
      title: 'Local Agent Server Wake Polling',
      schedule: 'Every 1 minute',
      enabled: true,
      status: 'idle',
      quietOnly: true
    },
    {
      id: 'task-2',
      title: 'Daily Tech News Grounding Digest',
      schedule: 'Daily at 9:00 AM',
      enabled: true,
      status: 'idle',
      quietOnly: true
    }
  ]);

  // Pending Actions State
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([
    {
      id: 'act-1',
      title: 'Execute Pywebview macOS App Build Script',
      description: 'Run build_app.sh to assemble and ad-hoc sign Trillion.app bundle on local system.',
      severity: 'medium',
      createdAt: '2026-07-23',
      status: 'pending'
    }
  ]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL
        });
        loadUserMemoryFromFirestore(fbUser.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load Facts from Firestore
  const loadUserMemoryFromFirestore = async (userId: string) => {
    try {
      const q = query(collection(db, 'memoryFacts'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const loadedFacts: MemoryFact[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedFacts.push({
          id: docSnap.id,
          userId: data.userId,
          fact: data.fact,
          category: data.category,
          createdAt: data.createdAt
        });
      });
      if (loadedFacts.length > 0) {
        setMemoryFacts(loadedFacts);
      }
    } catch (err) {
      console.warn('Firestore load notice:', err);
    }
  };

  // Add Memory Fact
  const handleAddFact = async (factText: string, category: 'preference' | 'identity' | 'decision' | 'general') => {
    const newFactObj: MemoryFact = {
      id: 'fact-' + Date.now(),
      userId: user ? user.uid : 'local',
      fact: factText,
      category,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setMemoryFacts((prev) => [newFactObj, ...prev]);

    if (user) {
      try {
        await addDoc(collection(db, 'memoryFacts'), {
          userId: user.uid,
          fact: factText,
          category,
          createdAt: newFactObj.createdAt
        });
      } catch (err) {
        console.warn('Error saving fact to Firestore:', err);
      }
    }
  };

  // Delete Memory Fact
  const handleDeleteFact = async (id: string) => {
    setMemoryFacts((prev) => prev.filter((f) => f.id !== id));
    if (user && !id.startsWith('fact-')) {
      try {
        await deleteDoc(doc(db, 'memoryFacts', id));
      } catch (err) {
        console.warn('Error deleting fact from Firestore:', err);
      }
    }
  };

  // Chat Send Handler
  const handleSendMessage = async (
    text: string,
    options?: { enableThinking?: boolean; enableSearch?: boolean; enableMaps?: boolean; lowLatency?: boolean }
  ) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Build memory context string
      const memoryContext = memoryFacts.map((f) => `- [${f.category}] ${f.fact}`).join('\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: messages,
          model: options?.lowLatency ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash',
          enableThinking: options?.enableThinking,
          enableSearch: options?.enableSearch,
          enableMaps: options?.enableMaps,
          systemPromptExtra: memoryContext
        })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'trillion',
        text: data.reply || 'I processed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinking: data.thinking,
        modelUsed: data.modelUsed,
        sources: data.sources
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Send error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'trillion',
        text: 'I ran into an issue connecting to my brain. Please check your network and API keys.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpenMicActive={isOpenMicActive}
        onToggleOpenMic={() => setIsOpenMicActive(!isOpenMicActive)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={() => signOutUser()}
      />

      <main className="flex-1">
        {currentView === 'assistant' && (
          <VoiceAssistant
            messages={messages}
            onSendMessage={handleSendMessage}
            isOpenMicActive={isOpenMicActive}
            onToggleOpenMic={() => setIsOpenMicActive(!isOpenMicActive)}
            memoryFacts={memoryFacts}
            isThinking={isThinking}
          />
        )}

        {currentView === 'desktop-studio' && <DesktopStudio />}

        {currentView === 'media-studio' && <MediaStudio />}

        {currentView === 'memory-heartbeat' && (
          <MemoryHeartbeat
            memoryFacts={memoryFacts}
            onAddFact={handleAddFact}
            onDeleteFact={handleDeleteFact}
            heartbeatTasks={heartbeatTasks}
            onToggleTask={(id) =>
              setHeartbeatTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
              )
            }
            pendingActions={pendingActions}
            onApproveAction={(id) =>
              setPendingActions((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
              )
            }
            onRejectAction={(id) =>
              setPendingActions((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
              )
            }
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => console.log('Auth success')}
      />
    </div>
  );
}
