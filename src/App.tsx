import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Github, Linkedin, Mail, Twitter, ExternalLink, ChevronDown, Clock, Calendar, GraduationCap, Trophy, BookOpen, LogIn, LogOut, Plus, Trash2, User as UserIcon, Activity } from 'lucide-react';
import React, { useEffect, useState, ReactNode } from 'react';
import { cn } from './lib/utils';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc, User 
} from './firebase';

// --- Error Boundary ---
const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-red-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-muted mb-6">The application encountered an error. This might be due to a connection issue or missing permissions.</p>
          <pre className="bg-zinc-50 p-4 rounded text-xs overflow-auto mb-6 max-h-40">{errorMsg}</pre>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-medium"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onError={(e) => {
      setHasError(true);
      setErrorMsg(String(e));
    }}>
      {children}
    </div>
  );
};

// --- Firestore Error Handler ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

const Navbar = ({ user }: { user: User | null }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(user ? [
      { name: 'Grades', path: '/grades' },
      { name: 'Achievements', path: '/achievements' },
      { name: 'Diary', path: '/diary' },
    ] : []),
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-serif text-xl font-bold tracking-tighter flex items-center gap-2">
          <Activity className="text-accent" size={24} />
          <span>SurgeonPath<span className="text-accent">.</span></span>
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === link.path ? "text-accent" : "text-muted hover:text-accent"
              )}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-zinc-200">
              <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-accent/20" alt="User" />
              <button onClick={handleLogout} className="text-sm font-medium text-muted hover:text-red-600 transition-colors flex items-center gap-2">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="px-6 py-2 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2">
              <LogIn size={16} /> Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ user }: { user: User | null }) => {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        >
          <Activity size={14} /> Future Surgeon Portfolio
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9] text-slate-900"
        >
          Tracking the path to medical excellence.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-muted max-w-2xl mb-12 leading-relaxed"
        >
          A private space to document my high school journey, academic achievements, and daily reflections as I prepare for a career in surgery.
        </motion.p>
        {!user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button 
              onClick={() => signInWithPopup(auth, googleProvider)}
              className="px-8 py-4 bg-accent text-white rounded-xl font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-accent/20"
            >
              Start Your Journey <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </div>
      
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 opacity-10 pointer-events-none hidden lg:block">
        <Activity size={400} className="text-accent" />
      </div>
    </section>
  );
};

const Grades = ({ user }: { user: User }) => {
  const [grades, setGrades] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'grades'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGrades(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'grades'));
    return () => unsubscribe();
  }, [user.uid]);

  const addGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !grade) return;
    try {
      await addDoc(collection(db, 'grades'), {
        subject,
        grade,
        date: new Date().toISOString(),
        uid: user.uid
      });
      setSubject('');
      setGrade('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'grades');
    }
  };

  const deleteGrade = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'grades', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'grades');
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 lg:px-24 min-h-screen max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-accent/10 rounded-2xl text-accent">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-4xl font-bold">Academic Performance</h1>
      </div>

      <form onSubmit={addGrade} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 mb-12 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold mb-2 text-muted">Subject</label>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-accent outline-none"
            placeholder="e.g. Biology, Chemistry"
          />
        </div>
        <div className="w-full md:w-32">
          <label className="block text-sm font-bold mb-2 text-muted">Grade</label>
          <input 
            type="text" 
            value={grade} 
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-accent outline-none"
            placeholder="A, 95%"
          />
        </div>
        <button type="submit" className="w-full md:w-auto px-8 py-3 bg-accent text-white rounded-xl font-medium flex items-center justify-center gap-2">
          <Plus size={20} /> Add
        </button>
      </form>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-center text-muted py-12">Loading grades...</p>
        ) : grades.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
            <GraduationCap size={48} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-muted">No grades recorded yet. Start tracking your progress!</p>
          </div>
        ) : (
          grades.map(g => (
            <div key={g.id} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-lg">{g.subject}</h3>
                <p className="text-sm text-muted">{new Date(g.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-2xl font-serif font-bold text-accent">{g.grade}</span>
                <button onClick={() => deleteGrade(g.id)} className="text-zinc-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Achievements = ({ user }: { user: User }) => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'achievements'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'achievements'));
    return () => unsubscribe();
  }, [user.uid]);

  const addAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      await addDoc(collection(db, 'achievements'), {
        title,
        description: desc,
        date: new Date().toISOString(),
        uid: user.uid
      });
      setTitle('');
      setDesc('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'achievements');
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 lg:px-24 min-h-screen max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-accent/10 rounded-2xl text-accent">
          <Trophy size={32} />
        </div>
        <h1 className="text-4xl font-bold">Milestones & Achievements</h1>
      </div>

      <form onSubmit={addAchievement} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 mb-12 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-muted">Achievement Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-accent outline-none"
              placeholder="e.g. Science Fair Winner"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-muted">Brief Description</label>
            <input 
              type="text" 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-accent outline-none"
              placeholder="Optional details..."
            />
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-accent text-white rounded-xl font-medium flex items-center justify-center gap-2">
          <Plus size={20} /> Record Achievement
        </button>
      </form>

      <div className="grid gap-6">
        {loading ? (
          <p className="text-center text-muted py-12">Loading achievements...</p>
        ) : achievements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
            <Trophy size={48} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-muted">No achievements recorded yet. Celebrate your wins!</p>
          </div>
        ) : (
          achievements.map(a => (
            <div key={a.id} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 relative group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-accent/5 rounded-lg text-accent">
                  <Trophy size={20} />
                </div>
                <span className="text-sm text-muted font-mono">{new Date(a.date).toLocaleDateString()}</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">{a.title}</h3>
              <p className="text-muted leading-relaxed">{a.description}</p>
              <button 
                onClick={() => deleteDoc(doc(db, 'achievements', a.id))}
                className="absolute top-8 right-8 text-zinc-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Diary = ({ user }: { user: User }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'diary_entries'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'diary_entries'));
    return () => unsubscribe();
  }, [user.uid]);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    try {
      await addDoc(collection(db, 'diary_entries'), {
        content,
        date: new Date().toISOString(),
        uid: user.uid
      });
      setContent('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'diary_entries');
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 lg:px-24 min-h-screen max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-accent/10 rounded-2xl text-accent">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl font-bold">Medical Journey Diary</h1>
      </div>

      <form onSubmit={addEntry} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 mb-12">
        <label className="block text-sm font-bold mb-4 text-muted uppercase tracking-widest">Daily Reflection</label>
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 px-6 py-4 rounded-2xl border border-zinc-200 focus:border-accent outline-none resize-none mb-4 text-lg"
          placeholder="What did you learn today? Any interesting medical cases or observations?"
        />
        <button type="submit" className="w-full py-4 bg-accent text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
          <Plus size={20} /> Save Entry
        </button>
      </form>

      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-muted py-12">Loading diary...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
            <BookOpen size={48} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-muted">Your diary is empty. Start documenting your journey!</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-white p-10 rounded-3xl shadow-sm border border-zinc-100 relative group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-muted font-mono">{new Date(entry.date).toLocaleTimeString()}</p>
                </div>
              </div>
              <p className="text-xl text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              <button 
                onClick={() => deleteDoc(doc(db, 'diary_entries', entry.id))}
                className="absolute top-10 right-10 text-zinc-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PrivateRoute = ({ children, user, loading }: { children: ReactNode, user: User | null, loading: boolean }) => {
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen selection:bg-accent selection:text-white bg-bg">
          <Navbar user={user} />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Hero user={user} />} />
              <Route 
                path="/grades" 
                element={<PrivateRoute user={user} loading={loading}><Grades user={user!} /></PrivateRoute>} 
              />
              <Route 
                path="/achievements" 
                element={<PrivateRoute user={user} loading={loading}><Achievements user={user!} /></PrivateRoute>} 
              />
              <Route 
                path="/diary" 
                element={<PrivateRoute user={user} loading={loading}><Diary user={user!} /></PrivateRoute>} 
              />
            </Routes>
          </AnimatePresence>
          
          <footer className="py-12 px-6 border-t border-zinc-100 text-center text-muted text-sm bg-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <p>© 2024 SurgeonPath. Your personal medical career tracker.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-accent transition-colors">Privacy</a>
                <a href="#" className="hover:text-accent transition-colors">Terms</a>
                <a href="#" className="hover:text-accent transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
