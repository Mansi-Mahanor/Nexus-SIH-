import React from 'react';

export default function Topbar({ session, onHome, onLogout, onOpenDashboard }) {
  return (
    <div className="topbar card" id="topbar" style={{ display: session ? 'flex' : 'none' }}>
      <div>
        <div id="welcomeText" className="small">Signed in as {session?.name} ({session?.role})</div>
      </div>
      <div className="nav">
        <button className="btn btn-ghost" onClick={onHome}>Home</button>
        {session?.role === 'teacher' && (
          <button className="btn btn-ghost" onClick={onOpenDashboard}>Teacher Dashboard</button>
        )}
        <button className="btn btn-ghost" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
