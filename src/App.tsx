import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Github, Linkedin, Mail, Twitter, ExternalLink, ChevronDown, Clock, Calendar, GraduationCap, Trophy, BookOpen, LogIn, LogOut, Plus, Trash2, User as UserIcon, Activity, Edit2, Check, X } from 'lucide-react';
import React, { useEffect, useState, ReactNode } from 'react';
import { cn } from './lib/utils';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc, User, updateDoc 
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

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      let message = "Login failed. Please try again.";
      if (error.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized in Firebase. Please add " + window.location.hostname + " to your Firebase Authorized Domains.";
      } else if (error.code === 'auth/popup-blocked') {
        message = "Login popup was blocked by your browser. Please allow popups for this site.";
      } else if (error.message) {
        message = error.message;
      }
      setLoginError(message);
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
    <>
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

      <AnimatePresence>
        {loginError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg flex items-start gap-3">
              <div className="flex-1 text-sm font-medium">
                {loginError}
              </div>
              <button onClick={() => setLoginError(null)} className="text-red-400 hover:text-red-600">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editDate, setEditDate] = useState('');

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
    if (!subject || !grade || !date) return;
    try {
      await addDoc(collection(db, 'grades'), {
        subject,
        grade,
        date,
        createdAt: new Date().toISOString(),
        uid: user.uid
      });
      setSubject('');
      setGrade('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'grades');
    }
  };

  const startEditing = (g: any) => {
    setEditingId(g.id);
    setEditSubject(g.subject);
    setEditGrade(g.grade);
    setEditDate(g.date);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, 'grades', id), {
        subject: editSubject,
        grade: editGrade,
        date: editDate,
        edited: true,
        lastEditedAt: new Date().toISOString()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'grades');
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
        <div className="w-full md:w-48">
          <label className="block text-sm font-bold mb-2 text-muted">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-accent outline-none"
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
              {editingId === g.id ? (
                <div className="flex-1 flex flex-col md:flex-row gap-4 mr-4">
                  <input 
                    type="text" 
                    value={editSubject} 
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 focus:border-accent outline-none text-sm"
                  />
                  <input 
                    type="text" 
                    value={editGrade} 
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg border border-zinc-200 focus:border-accent outline-none text-sm"
                  />
                  <input 
                    type="date" 
                    value={editDate} 
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-40 px-3 py-2 rounded-lg border border-zinc-200 focus:border-accent outline-none text-sm"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{g.subject}</h3>
                    {g.edited && <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/5 px-2 py-0.5 rounded">Edited</span>}
                  </div>
                  <p className="text-sm text-muted">{new Date(g.date).toLocaleDateString()}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                {editingId === g.id ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveEdit(g.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Check size={20} />
                    </button>
                    <button onClick={cancelEditing} className="p-2 text-zinc-400 hover:bg-zinc-50 rounded-lg transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl font-serif font-bold text-accent">{g.grade}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(g)} className="p-2 text-zinc-400 hover:text-accent transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteGrade(g.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');

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
    if (!title || !date) return;
    try {
      await addDoc(collection(db, 'achievements'), {
        title,
        description: desc,
        date,
        createdAt: new Date().toISOString(),
        uid: user.uid
      });
      setTitle('');
      setDesc('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'achievements');
    }
  };

  const startEditing = (a: any) => {
    setEditingId(a.id);
    setEditTitle(a.title);
    setEditDesc(a.description);
    setEditDate(a.date);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, 'achievements', id), {
        title: editTitle,
        description: editDesc,
        date: editDate,
        edited: true,
        lastEditedAt: new Date().toISOString()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'achievements');
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
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold mb-2 text-muted">Achievement Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-accent outline-none"
              placeholder="e.g. Science Fair Winner"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold mb-2 text-muted">Brief Description</label>
            <input 
              type="text" 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-accent outline-none"
              placeholder="Optional details..."
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold mb-2 text-muted">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-accent outline-none"
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
              {editingId === a.id ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:border-accent outline-none text-sm"
                    />
                    <input 
                      type="date" 
                      value={editDate} 
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:border-accent outline-none text-sm"
                    />
                  </div>
                  <textarea 
                    value={editDesc} 
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:border-accent outline-none text-sm resize-none h-20"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => saveEdit(a.id)} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium flex items-center gap-2">
                      <Check size={16} /> Save
                    </button>
                    <button onClick={cancelEditing} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium flex items-center gap-2">
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-accent/5 rounded-lg text-accent">
                        <Trophy size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted font-mono">{new Date(a.date).toLocaleDateString()}</span>
                        {a.edited && <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Edited</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(a)} className="p-2 text-zinc-400 hover:text-accent transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteDoc(doc(db, 'achievements', a.id))} className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{a.title}</h3>
                  <p className="text-muted leading-relaxed">{a.description}</p>
                </>
              )}
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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState('');

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
    if (!content || !date) return;
    try {
      await addDoc(collection(db, 'diary_entries'), {
        content,
        date,
        createdAt: new Date().toISOString(),
        uid: user.uid
      });
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'diary_entries');
    }
  };

  const startEditing = (entry: any) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setEditDate(entry.date);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, 'diary_entries', id), {
        content: editContent,
        date: editDate,
        edited: true,
        lastEditedAt: new Date().toISOString()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'diary_entries');
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
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-bold text-muted uppercase tracking-widest">Daily Reflection</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1 rounded-lg border border-zinc-200 focus:border-accent outline-none text-sm font-medium"
          />
        </div>
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
              {editingId === entry.id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-muted uppercase tracking-widest">Editing Entry</span>
                    <input 
                      type="date" 
                      value={editDate} 
                      onChange={(e) => setEditDate(e.target.value)}
                      className="px-3 py-1 rounded-lg border border-zinc-200 focus:border-accent outline-none text-sm"
                    />
                  </div>
                  <textarea 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-40 px-6 py-4 rounded-2xl border border-zinc-200 focus:border-accent outline-none resize-none text-lg"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => saveEdit(entry.id)} className="px-6 py-2 bg-accent text-white rounded-xl font-medium flex items-center gap-2">
                      <Check size={18} /> Save Changes
                    </button>
                    <button onClick={cancelEditing} className="px-6 py-2 bg-zinc-100 text-zinc-600 rounded-xl font-medium flex items-center gap-2">
                      <X size={18} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <Activity size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          {entry.edited && <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/5 px-2 py-0.5 rounded">Edited</span>}
                        </div>
                        <p className="text-xs text-muted font-mono">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString() : 'Recorded'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(entry)} className="p-2 text-zinc-400 hover:text-accent transition-colors">
                        <Edit2 size={20} />
                      </button>
                      <button onClick={() => deleteDoc(doc(db, 'diary_entries', entry.id))} className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xl text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </>
              )}
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
