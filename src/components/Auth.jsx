import React, { useState } from 'react';


export default function Auth({ onSignIn, onRegister, fillDemo }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!username || !password) {
      alert('Enter username and password');
      return;
    }
    onSignIn(username.trim(), password);
    setUsername('');
    setPassword('');
  }

  return (
    <section id="authSection" className="card">
      <h2>Sign in</h2>
      <p className="small">Use one of the demo accounts below, or create a simple local account (stored in your browser).</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:10}}>
        <div className="card" style={{padding:12}}>
          <strong>Demo Student</strong>
          <div className="small">username: <code>alice</code> | password: <code>student123</code></div>
          <div style={{height:8}} />
          <button className="btn btn-primary" onClick={()=>fillDemo('alice','student123')}>Use Student</button>
        </div>

        <div className="card" style={{padding:12}}>
          <strong>Demo Teacher</strong>
          <div className="small">username: <code>mrsmith</code> | password: <code>teacher123</code></div>
          <div style={{height:8}} />
          <button className="btn btn-primary" onClick={()=>fillDemo('mrsmith','teacher123')}>Use Teacher</button>
        </div>
      </div>

      <hr style={{margin:'14px 0'}} />

      <form id="loginForm" style={{display:'grid',gap:8}} onSubmit={submit}>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" value={username} onChange={(e)=>setUsername(e.target.value)} autoComplete="username" required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" required />
        <div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'flex-end',marginTop:8}}>
          <button type="button" className="btn btn-ghost" onClick={()=>{
            if(!username || !password){ alert('Enter username and password to register'); return; }
            onRegister(username.trim(), password);
            setUsername(''); setPassword('');
          }}>Register (local)</button>
          <button type="submit" className="btn btn-primary">Sign In</button>
        </div>
      </form>
    </section>
  );
}
