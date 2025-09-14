import React, { useEffect, useState } from 'react';
import { DEMO_USERS } from './data';
import { loadUsers, saveUsers, loadSession, saveSession, clearSession, loadAllAnswers, saveAllAnswers } from './utils/storage';
import Topbar from './components/Topbar';
import Auth from './components/Auth';
import Test from './components/Test';
import TeacherDashboard from './components/TeacherDashboard';
import Login from'./components/Login';

/**
 * Root App — default export.
 * Holds global user list, current session, and the allAnswers object.
 */
export default function App() {
  // load initial data from localStorage (or demo defaults)
  const [users, setUsers] = useState(() => loadUsers(DEMO_USERS));
  const [session, setSession] = useState(() => loadSession());
  const [allAnswers, setAllAnswers] = useState(() => loadAllAnswers());
  // view toggle: 'auth' | 'student' | 'teacher'
  const [view, setView] = useState('auth');

  // keep users in sync with localStorage when they change
  useEffect(()=> {
    saveUsers(users);
  }, [users]);

  // keep allAnswers persisted when changed
  useEffect(()=> {
    saveAllAnswers(allAnswers);
  }, [allAnswers]);

  // When session loads from storage, set view accordingly
  useEffect(()=>{
    if(session){
      setView(session.role === 'teacher' ? 'teacher' : 'student');
    } else {
      setView('auth');
    }
  }, [session]);

  // Auth helpers
  function findUser(username) {
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  function signIn(username, password) {
    const user = findUser(username);
    if(user && user.password === password){
      const s = { username: user.username, role: user.role, name: user.name || user.username };
      setSession(s);
      saveSession(s);
      setView(user.role === 'teacher' ? 'teacher' : 'student');
    } else {
      alert('Invalid credentials');
    }
  }

  function registerLocal(username, password, role = 'student', name) {
    if(findUser(username)){
      alert('Username exists');
      return;
    }
    const u = { username, password, role, name: name || username };
    const next = [...users, u];
    setUsers(next);
    saveUsers(next);
    // sign in immediately
    signIn(username, password);
  }

  function signOut() {
    if(!confirm('Logout?')) return;
    clearSession();
    setSession(null);
    setView('auth');
  }

  // Demo fill helper — sign in directly with demo credentials
  function fillDemo(u, p) {
    signIn(u, p);
  }

  // functions to persist allAnswers from children
  function saveAllAnswersLocal(next) {
    setAllAnswers({ ...next });
    saveAllAnswers(next);
  }

  // on home button, show appropriate section
  function goHome() {
    if(!session){ setView('auth'); return; }
    if(session.role === 'student') setView('student');
    else if(session.role === 'teacher') setView('teacher');
  }

  // small effect to seed demo users if local storage was empty
  useEffect(()=> {
    if(!users || users.length === 0){
      setUsers(DEMO_USERS.slice());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="wrap">
      <div className="brand">
        <div className="logo">N</div>
        <div>
          <h1>Nexus</h1>
        </div>
      </div>

      <Topbar
        session={session}
        onHome={goHome}
        onLogout={signOut}
        onOpenDashboard={()=> setView('teacher')}
      />

      {/* Auth */}
      {!session && view === 'auth' && (
        <Auth
          onSignIn={signIn}
          onRegister={(u,p) => registerLocal(u,p,'student',u)}
          fillDemo={fillDemo}
        />
      )}

      {/* Student Test Section */}
      {session && session.role === 'student' && view === 'student' && (
        <Test
          session={session}
          allAnswers={allAnswers}
          saveAllAnswers={(next)=> saveAllAnswersLocal(next)}
        />
      )}

      {/* Teacher Dashboard */}
      {session && session.role === 'teacher' && view === 'teacher' && (
        <TeacherDashboard
          users={users}
          allAnswers={allAnswers}
          saveAllAnswers={(next)=> saveAllAnswersLocal(next)}
        />
      )}

    </div>
  );
}
