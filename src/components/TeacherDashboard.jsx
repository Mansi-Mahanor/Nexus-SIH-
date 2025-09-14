import React from 'react';
import { QUESTIONS } from '../data';

export default function TeacherDashboard({ users, allAnswers, saveAllAnswers }) {

  function renderStudentDetailData(username) {
    return allAnswers[username] || { answers: QUESTIONS.map(()=>({ selectedIndex:null, reasoning:'' })), submitted: false, feedback: {} };
  }

  function saveFeedback(username, container) {
    // container is DOM node where textareas are present
    const textareas = container.querySelectorAll('textarea[data-q]');
    allAnswers[username] = allAnswers[username] || { answers: QUESTIONS.map(()=>({ selectedIndex:null, reasoning:'' })), submitted: false, score: null, feedback: {} };
    const fd = allAnswers[username].feedback || {};
    textareas.forEach(t => {
      const idx = Number(t.dataset.q);
      fd[idx] = t.value.trim();
    });
    allAnswers[username].feedback = fd;
    saveAllAnswers(allAnswers);
    alert('Feedback saved for ' + username);
  }

  function exportCSV(username) {
    const data = allAnswers[username] || { answers: QUESTIONS.map(()=>({ selectedIndex:null, reasoning:'' })), submitted: false };
    let csv = 'Q,Selected,Correct,Reasoning,Submitted,Score\n';
    QUESTIONS.forEach((q,i)=>{
      const a = data.answers[i] || { selectedIndex:null, reasoning:'' };
      csv += `${i+1},${a.selectedIndex===null ? '' : String.fromCharCode(65+a.selectedIndex)},${String.fromCharCode(65+q.correct)},"${(a.reasoning||'').replace(/"/g,'""')}",${data.submitted ? 'yes' : 'no'},${data.score||''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}_test_export.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="teacherSection" className="card">
      <h2>Teacher Dashboard</h2>
      <p className="small">Review student submissions and add feedback on each question.</p>
      <div id="studentsList" className="list" style={{ marginTop: 12 }}>
        {users.filter(u => u.role === 'student').map(u => {
          const data = renderStudentDetailData(u.username);
          const sc = data.submitted ? `${data.score} / ${QUESTIONS.length}` : (data.answers.some(a => a.selectedIndex !== null || (a.reasoning && a.reasoning.trim())) ? 'In progress' : 'Not started');

          return (
            <div key={u.username} className="student-card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{u.name} <span className="small">({u.username})</span></div>
                  <div className="small">Status: {sc}</div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-ghost viewBtn"
                    onClick={(ev) => {
                      const card = ev.currentTarget.closest('.student-card');
                      const detail = card.querySelector('.studentDetail');
                      if (detail.classList.contains('hidden')) {
                        
                        const d = renderStudentDetailData(u.username);
                        detail.classList.remove('hidden');
                        detail.innerHTML = `
                          <div>
                            <div style="margin-bottom:8px"><strong>Submission: </strong> ${d.submitted ? `Submitted — Score ${d.score}` : 'Not submitted'}</div>
                            <table>
                              <thead><tr><th>Q</th><th>Question</th><th>Student Answer</th><th>Reasoning</th><th>Teacher Feedback</th></tr></thead>
                              <tbody>
                                ${QUESTIONS.map((q,i)=>`<tr>
                                  <td>${i+1}</td>
                                  <td style="max-width:300px">${escapeHtml(q.text)}</td>
                                  <td>${d.answers[i].selectedIndex===null? '—' : String.fromCharCode(65+d.answers[i].selectedIndex)}</td>
                                  <td>${escapeHtml(d.answers[i].reasoning || '—')}</td>
                                  <td><textarea data-q="${i}" style="width:100%;min-height:60px">${escapeHtml(d.feedback && d.feedback[i] ? d.feedback[i] : '')}</textarea></td>
                                </tr>`).join('')}
                              </tbody>
                            </table>
                            <div style="display:flex;justify-content:flex-end;margin-top:8px">
                              <button class="btn btn-primary saveFeedbackBtn">Save Feedback</button>
                            </div>
                          </div>
                        `;
                       
                        const saveBtn = detail.querySelector('.saveFeedbackBtn');
                        saveBtn.addEventListener('click', () => saveFeedback(u.username, detail));
                        ev.currentTarget.textContent = 'Hide';
                      } else {
                        detail.classList.add('hidden');
                        ev.currentTarget.textContent = 'View';
                      }
                    }}
                  >View</button>

                  <button className="btn btn-ghost" onClick={()=>exportCSV(u.username)}>Export</button>
                </div>
              </div>

              <div style={{ marginTop: 10 }} className="studentDetail hidden"></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// small helper: escape html for injecting into innerHTML in teacher view
function escapeHtml(s){
  return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
