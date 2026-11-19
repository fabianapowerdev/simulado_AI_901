let mode = 'practice';

let state = {
  questions: [],
  index: 0,
  answers: {},
  flags: {},
  timer: null,
  seconds: 0,
  totalSeconds: 0,
  start: 0,
  locked: {},
  finished: false
};

const $ = s => document.querySelector(s);

function setMode(m) {
  mode = m;
  document.querySelectorAll('.mode').forEach(x => x.classList.toggle('active', x.dataset.mode === m));
  const exam = m === 'exam';

  if (exam) {
    $('#topic').value = 'Todos';
    $('#questionCount').value = '40';
    $('#timeLimit').value = 60;
    $('#timeField').classList.remove('hidden');
    $('#sessionConfigRow').classList.remove('session-config-single');
  } else {
    updateQuestionCountOptions();
    $('#timeField').classList.add('hidden');
    $('#sessionConfigRow').classList.add('session-config-single');
  }

  $('#topic').disabled = exam;
  $('#questionCount').disabled = exam;
  $('#timeLimit').disabled = exam;
  $('#modeLabel').textContent = exam ? 'MODO PROVA' : 'MODO ESTUDO';
}

function updateQuestionCountOptions() {
  const selectedTopic = $('#topic').value;
  const available = selectedTopic === 'Todos'
    ? QUESTION_BANK.length
    : QUESTION_BANK.filter(q => q.topic === selectedTopic).length;

  const select = $('#questionCount');
  const currentVal = Number(select.value);
  const presets = [5, 10, 15, 20, 40, 60, 100].filter(n => n <= available);
  if (!presets.includes(available)) presets.push(available);
  presets.sort((a, b) => a - b);

  select.innerHTML = presets.map(n => `<option value="${n}">${n}</option>`).join('');
  if (presets.includes(currentVal)) {
    select.value = String(currentVal);
  } else {
    select.value = String(presets[presets.length - 1]);
  }
}

function freshQuestion(q) {
  const opts = shuffle(q.options);
  return {
    ...q,
    options: opts,
    answer: opts.indexOf(q.options[q.answer])
  };
}

function startQuiz() {
  const selectedTopic = $('#topic').value;
  const pool = selectedTopic === 'Todos'
    ? QUESTION_BANK
    : QUESTION_BANK.filter(q => q.topic === selectedTopic);

  const isExam = mode === 'exam';
  const requested = isExam ? 40 : Number($('#questionCount').value);
  const count = Math.min(requested, pool.length);
  const examMinutes = isExam ? Math.max(1, Number($('#timeLimit').value) || 60) : 0;

  state = {
    questions: shuffle(pool).slice(0, count).map(freshQuestion),
    index: 0,
    answers: {},
    flags: {},
    locked: {},
    timer: null,
    seconds: examMinutes * 60,
    totalSeconds: examMinutes * 60,
    start: Date.now(),
    finished: false
  };

  $('#start').classList.add('hidden');
  $('#quiz').classList.remove('hidden');
  $('#reviewSection').classList.add('hidden');
  $('#modeLabel').textContent = isExam ? 'MODO PROVA' : 'MODO ESTUDO';

  clearInterval(state.timer);

  if (isExam) {
    $('#timerBlock').classList.remove('hidden');
    $('#studyBadge').classList.add('hidden');
    tick(true);
    state.timer = setInterval(() => tick(false), 1000);
  } else {
    $('#timerBlock').classList.add('hidden');
    $('#studyBadge').classList.remove('hidden');
  }

  render();
}

function quitQuiz() {
  const hasProgress = Object.keys(state.answers).length > 0;
  if (hasProgress && !confirm('Deseja sair do simulado atual? O progresso desta tentativa será descartado.')) {
    return;
  }
  clearInterval(state.timer);
  state.finished = true;
  $('#quiz').classList.add('hidden');
  $('#reviewSection').classList.add('hidden');
  $('#resultModal').classList.add('hidden');
  $('#start').classList.remove('hidden');
  setMode(mode);
}

function tick(initial) {
  if (!initial) state.seconds--;
  if (state.seconds < 0) {
    finish();
    return;
  }
  const m = Math.floor(state.seconds / 60);
  const s = state.seconds % 60;
  $('#timer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  $('#timer').classList.toggle('warning', state.seconds <= 300);
}

function render() {
  const q = state.questions[state.index];
  const chosen = state.answers[q.id];
  const locked = mode === 'practice' && state.locked[q.id];

  $('#counter').textContent = `Questão ${state.index + 1} de ${state.questions.length}`;
  $('#topicPill').textContent = `${q.topic} • ${q.concept}`;
  $('#question').textContent = q.question;

  $('#options').innerHTML = q.options.map((o, i) => `
    <button class="option ${chosen === i ? 'selected' : ''} ${locked && i === q.answer ? 'correct' : ''} ${locked && chosen === i && i !== q.answer ? 'wrong' : ''}" ${locked ? 'disabled' : ''} onclick="selectAnswer(${i})">
      <span class="letter">${String.fromCharCode(65 + i)}</span>
      <span>${o}</span>
    </button>
  `).join('');

  $('#progressBar').style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  $('#prev').disabled = state.index === 0;
  $('#next').textContent = state.index === state.questions.length - 1 ? 'Finalizar' : 'Próxima →';
  $('#flag').textContent = state.flags[q.id] ? '★ Marcada' : '☆ Marcar';
  $('#answered').textContent = `${Object.keys(state.answers).length}/${state.questions.length}`;
  $('#marked').textContent = Object.keys(state.flags).filter(k => state.flags[k]).length;

  $('#palette').innerHTML = state.questions.map((x, i) => `
    <button class="dot ${state.answers[x.id] !== undefined ? 'done' : ''} ${state.flags[x.id] ? 'flagged' : ''} ${i === state.index ? 'current' : ''}" onclick="go(${i})">${i + 1}</button>
  `).join('');

  renderFeedback(q, chosen, locked);
}

function selectAnswer(i) {
  const q = state.questions[state.index];
  if (state.locked[q.id]) return;
  state.answers[q.id] = i;
  if (mode === 'practice') state.locked[q.id] = true;
  render();
}

function renderFeedback(q, chosen, locked) {
  const box = $('#feedback');
  if (!locked) {
    box.classList.add('hidden');
    return;
  }
  const ok = chosen === q.answer;
  box.className = 'feedback ' + (ok ? 'good' : 'bad');

  const analyses = q.options.map((o, i) => `
    <li><b>${String.fromCharCode(65 + i)}. ${o}:</b> ${i === q.answer ? 'É a resposta correta porque ' + q.explanation : (OPTION_GUIDE[o] || 'não atende diretamente ao requisito principal do enunciado.')}</li>
  `).join('');

  box.innerHTML = `
    <h4>${ok ? '✓ Resposta correta' : '↗ Vamos revisar'}</h4>
    <p><b>Resposta correta:</b> ${q.options[q.answer]}</p>
    <p>${q.explanation}</p>
    <b>Análise das alternativas:</b>
    <ul>${analyses}</ul>
    <p class="tip">💡 ${q.tip}</p>
  `;
  box.classList.remove('hidden');
}

function prev() {
  if (state.index > 0) {
    state.index--;
    render();
  }
}

function next() {
  if (state.index === state.questions.length - 1) finish();
  else {
    state.index++;
    render();
  }
}

function go(i) {
  state.index = i;
  render();
}

function toggleFlag() {
  const id = state.questions[state.index].id;
  state.flags[id] = !state.flags[id];
  render();
}

function fmt(sec) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

function finish(force = false) {
  if (state.finished) return;
  state.finished = true;
  clearInterval(state.timer);

  let correct = 0;
  const topics = {};

  state.questions.forEach(q => {
    const ok = state.answers[q.id] === q.answer;
    if (ok) correct++;
    topics[q.topic] ??= { c: 0, n: 0 };
    topics[q.topic].n++;
    if (ok) topics[q.topic].c++;
  });

  const pct = Math.round((correct / state.questions.length) * 100);
  const scaled = Math.round(pct * 10);
  const goal = Number($('#goal').value);
  const elapsedSec = Math.round((Date.now() - state.start) / 1000);
  const used = mode === 'exam' ? Math.min(state.totalSeconds, elapsedSec) : elapsedSec;

  $('#quiz').classList.add('hidden');
  $('#score').textContent = pct + '%';
  $('#hits').textContent = `${correct}/${state.questions.length} acertos`;
  $('#scaled').textContent = `${scaled}/1000`;
  $('#elapsed').textContent = fmt(used);
  $('#goalResult').textContent = goal + '%';
  $('#statusText').textContent = pct >= goal ? 'Meta atingida. Excelente progresso!' : 'Você está avançando. Use o diagnóstico abaixo para direcionar a revisão.';
  $('#scoreRing').style.setProperty('--score', pct + '%');

  const entries = Object.entries(topics).sort((a, b) => (a[1].c / a[1].n) - (b[1].c / b[1].n));
  $('#topicScores').innerHTML = entries.map(([topicName, x]) => {
    const p = Math.round((x.c / x.n) * 100);
    return `
      <div>
        <div class="bar-label"><span>${topicName}</span><b>${p}% (${x.c}/${x.n})</b></div>
        <div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div>
      </div>
    `;
  }).join('');

  const weak = entries[0];
  const weakPct = Math.round((weak[1].c / weak[1].n) * 100);
  $('#recommendation').innerHTML = `<b>Prioridade de estudo:</b> ${weak[0]} (${weakPct}%). Revise os conceitos errados deste tema e refaça um simulado focado.`;

  $('#resultModal').classList.remove('hidden');

  $('#review').innerHTML = state.questions.map((q, i) => {
    const a = state.answers[q.id];
    const ok = a === q.answer;
    return `
      <details>
        <summary class="${ok ? 'ok' : 'bad'}">${i + 1}. ${ok ? 'Correta' : 'Revisar'} • ${q.topic} / ${q.concept}</summary>
        <p><b>Pergunta:</b> ${q.question}</p>
        <p><b>Sua resposta:</b> ${a === undefined ? 'Não respondida' : q.options[a]}</p>
        <p><b>Resposta correta:</b> ${q.options[q.answer]}</p>
        <p>${q.explanation}</p>
        <p><b>Alternativas:</b></p>
        <ul>
          ${q.options.map((o, j) => `<li><b>${o}:</b> ${j === q.answer ? 'É a resposta correta porque ' + q.explanation : (OPTION_GUIDE[o] || 'não atende diretamente ao requisito principal do enunciado.')}</li>`).join('')}
        </ul>
        <p class="tip">💡 ${q.tip}</p>
      </details>
    `;
  }).join('');

  const hist = JSON.parse(localStorage.getItem('ai901-history') || '[]');
  hist.unshift({
    date: new Date().toISOString(),
    pct,
    scaled,
    correct,
    total: state.questions.length,
    mode
  });
  localStorage.setItem('ai901-history', JSON.stringify(hist.slice(0, 10)));
}

function closeResult() {
  $('#resultModal').classList.add('hidden');
  $('#reviewSection').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restart() {
  location.reload();
}

window.addEventListener('DOMContentLoaded', () => {
  const topicCounts = {};
  QUESTION_BANK.forEach(q => {
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  });

  Object.entries(topicCounts).forEach(([topicName, count]) => {
    $('#topic').insertAdjacentHTML('beforeend', `<option value="${topicName}">${topicName} (${count})</option>`);
  });

  $('#topic').addEventListener('change', () => {
    if (mode === 'practice') {
      updateQuestionCountOptions();
    }
  });

  const h = JSON.parse(localStorage.getItem('ai901-history') || '[]');
  if (h[0]) {
    $('#last').textContent = `Último resultado: ${h[0].pct}% • ${h[0].correct}/${h[0].total} acertos`;
  }

  setMode('practice');
});
