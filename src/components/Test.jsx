import React, { useEffect, useRef, useState } from 'react';
import { QUESTIONS } from '../data';
import { debounce } from '../utils/debounce';

const DEFAULT_TIME_SECONDS = 15 * 60;

export default function Test({ session, allAnswers, saveAllAnswers }) {
  const username = session.username;

 
  useEffect(()=>{
    if(!allAnswers[username]){
      allAnswers[username] = {
        startedAt: Date.now(),
        remaining: DEFAULT_TIME_SECONDS,
        answers: QUESTIONS.map(()=>({ selectedIndex: null, reasoning: '' })),
        submitted: false,
        score: null,
        feedback: {}
      };
      saveAllAnswers(allAnswers);
    }
 
  }, [username, allAnswers, saveAllAnswers]);

  
  const [localState, setLocalState] = useState(() => {
    const base = allAnswers[username] || {
      startedAt: Date.now(),
      remaining: DEFAULT_TIME_SECONDS,
      answers: QUESTIONS.map(()=>({ selectedIndex: null, reasoning: '' })),
      submitted: false,
      score: null,
      feedback: {}
    };
    return JSON.parse(JSON.stringify(base));
  });

  const [currentQ, setCurrentQ] = useState(0);
  const [remaining, setRemaining] = useState(localState.remaining ?? DEFAULT_TIME_SECONDS);
  const [saveStatus, setSaveStatus] = useState('Saved');

  
  const timerRef = useRef(null);
  const debouncedSave = useRef(debounce((stateToSave) => {
   
    stateToSave.remaining = remaining;
    allAnswers[username] = stateToSave;
    saveAllAnswers(allAnswers);
    setSaveStatus('Saved');
  }, 400)).current;

  // start/cleanup timer
  useEffect(()=>{
    if(localState.submitted){
      // if already submitted: ensure remaining reflects the saved value
      setRemaining(localState.remaining ?? 0);
      return;
    }

    // update remaining from localState on mount
    setRemaining(typeof localState.remaining === 'number' ? localState.remaining : DEFAULT_TIME_SECONDS);

    timerRef.current = setInterval(() => {
      setRemaining(r => {
        const next = r - 1;
        if(next <= 0){
          clearInterval(timerRef.current);
          // auto-submit when timer hits zero
          handleSubmit(true);
          return 0;
        } else {
          // periodically update remaining to local state (we debounce actual saves)
          return next;
        }
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localState.submitted]);

  // update debounced saver when remaining changes (small throttle)
  useEffect(()=>{
    // push small state snapshot to debouncedSave
    debouncedSave({ ...localState, remaining });
    setSaveStatus('Saving...');
    // no cleanup here (debounce has its own cancel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  function updateAnswer(qIdx, selectedIndex) {
    const copy = { ...localState, answers: localState.answers.map(a => ({ ...a })) };
    copy.answers[qIdx].selectedIndex = selectedIndex;
    setLocalState(copy);
    setSaveStatus('Not saved');
    // schedule save
    debouncedSave(copy);
  }

  function updateReason(qIdx, text) {
    const copy = { ...localState, answers: localState.answers.map(a => ({ ...a })) };
    copy.answers[qIdx].reasoning = text;
    setLocalState(copy);
    setSaveStatus('Not saved');
    debouncedSave(copy);
  }

  function updateAnsweredCount() {
    return localState.answers.filter(a => a.selectedIndex !== null || (a.reasoning && a.reasoning.trim().length > 0)).length;
  }

  function handleSubmit(auto=false) {
    if(!auto){
      if(!confirm('Submit the test now? You cannot change answers after submission.')) return;
    }
    // compute score
    let score = 0;
    for(let i=0;i<QUESTIONS.length;i++){
      if(localState.answers[i].selectedIndex === QUESTIONS[i].correct) score++;
    }
    const updated = { ...localState, submitted: true, score, endedAt: Date.now(), remaining };
    setLocalState(updated);
    allAnswers[username] = updated;
    saveAllAnswers(allAnswers);
    if(timerRef.current) clearInterval(timerRef.current);
    setSaveStatus('Saved');
    alert(`Test submitted. You scored ${score} / ${QUESTIONS.length}`);
  }

  // When teacher feedback in global store changes (e.g., teacher saved feedback),
  // reflect the new feedback for the student when viewing
  useEffect(()=>{
    const global = allAnswers[username];
    if(global && JSON.stringify(global.feedback) !== JSON.stringify(localState.feedback)){
      // merge teacher feedback into localState
      const copy = {...localState, feedback: {...global.feedback}};
      setLocalState(copy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswers[username]?.feedback]);

  // If already submitted: show summary view
  if(localState.submitted){
    return (
      <section id="testSection" className="card" aria-live="polite">
        <div style={{textAlign:'center'}} className="card">
          <div style={{fontWeight:800,color:'var(--primary)',fontSize:22}}>Test Submitted</div>
          <div style={{marginTop:8}} className="small">Score: <strong>{localState.score} / {QUESTIONS.length}</strong></div>
          <div style={{marginTop:10,textAlign:'left'}}>
            <table>
              <thead><tr><th>Q</th><th>Your Ans</th><th>Correct</th><th>Reasoning</th><th>Feedback</th></tr></thead>
              <tbody>
                {QUESTIONS.map((q,i)=>(
                  <tr key={i}>
                    <td>{i+1}</td>
                    <td>{localState.answers[i].selectedIndex===null ? '—' : String.fromCharCode(65+localState.answers[i].selectedIndex)}</td>
                    <td>{String.fromCharCode(65+q.correct)}</td>
                    <td>{localState.answers[i].reasoning || '—'}</td>
                    <td>{localState.feedback && localState.feedback[i] ? <div className="feedback">{localState.feedback[i]}</div> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <section id="testSection" className="card" aria-live="polite">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div id="studentInfo" className="small">{session.name} — {session.username}</div>
          <div id="timerLine" className="small">Time left: <strong id="countdown">{formatTime(remaining)}</strong></div>
        </div>
        <div>
          <div className="small" id="testProgress">Q {currentQ+1} of {QUESTIONS.length}</div>
        </div>
      </div>

      <hr style={{margin:'12px 0'}} />

      <div id="questionArea">
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontWeight:800,color:'var(--primary)'}}>Question {currentQ+1}</div>
              <div className="small" style={{marginTop:6}}>{q.text}</div>
            </div>
            <div className="small">Marks: 1</div>
          </div>

          <div style={{marginTop:12}}>
            <form id="optsForm">
              {q.options.map((opt,i)=>(
                <label key={i} style={{display:'block',padding:8,borderRadius:8,border:'1px solid #f0f0f4',marginBottom:8,cursor:'pointer'}}>
                  <input
                    type="radio"
                    name={`option-${currentQ}`}
                    checked={localState.answers[currentQ].selectedIndex === i}
                    onChange={()=>updateAnswer(currentQ,i)}
                    aria-checked={localState.answers[currentQ].selectedIndex === i}
                  />
                  <strong style={{marginLeft:8}}>{String.fromCharCode(65+i)}.</strong>
                  <span style={{marginLeft:8}}>{opt}</span>
                </label>
              ))}
            </form>

            <label htmlFor="reason">Your Reasoning</label>
            <textarea
              id="reason"
              placeholder="Explain briefly why you chose this option (1-3 sentences)"
              value={localState.answers[currentQ].reasoning || ''}
              onChange={(e)=>updateReason(currentQ, e.target.value)}
            />

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <div className="small">Teacher feedback: <span id="teacherFeedback">{localState.feedback && localState.feedback[currentQ] ? localState.feedback[currentQ] : '—'}</span></div>
              <div className="small">Answered: <strong id="answeredCount">{updateAnsweredCount()}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
        <div id="saveStatus" className="small" style={{color: saveStatus === 'Saved' ? 'var(--success)' : 'var(--muted)'}}>{saveStatus}</div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost" onClick={()=> setCurrentQ(c => Math.max(0, c - 1))}>← Previous</button>
          <button className="btn btn-ghost" onClick={()=> setCurrentQ(c => Math.min(QUESTIONS.length - 1, c + 1))}>Next →</button>
          <button className="btn btn-primary" onClick={()=>handleSubmit(false)}>Submit Test</button>
        </div>
      </div>
    </section>
  );

  // helper
  function formatTime(s){
    const mm = String(Math.floor(s/60)).padStart(2,'0');
    const ss = String(s % 60).padStart(2,'0');
    return `${mm}:${ss}`;
  }
}
