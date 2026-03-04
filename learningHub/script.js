// SECTION: State & helpers

// Learning path data model
const learningPathSections = [
    {
      id: 'ml-foundations',
      title: 'ML Foundations',
      metaElementId: 'ml-foundations-meta',
      listElementId: 'ml-foundations-list',
      items: [
        {
          id: 'linear-regression',
          title: 'Linear Regression & Loss',
          level: 'Core intuition',
          links: ['panel-ml-concepts'],
        },
        {
          id: 'classification-boundaries',
          title: 'Decision Boundaries & Margin',
          level: 'Core intuition',
          links: ['panel-ml-concepts'],
        },
        {
          id: 'gradient-descent',
          title: 'Gradient Descent & Optimization',
          level: 'Conceptual',
          links: [],
        },
      ],
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning & Transformers',
      metaElementId: 'deep-learning-meta',
      listElementId: 'deep-learning-list',
      items: [
        {
          id: 'neural-networks',
          title: 'Neural Networks & Non-linearity',
          level: 'Conceptual',
          links: [],
        },
        {
          id: 'attention-mechanism',
          title: 'Attention Mechanism',
          level: 'Key LLM building block',
          links: ['panel-llm-internals'],
        },
        {
          id: 'positional-encoding',
          title: 'Positional Encoding',
          level: 'Key LLM building block',
          links: ['panel-llm-internals'],
        },
      ],
    },
    {
      id: 'llm-practice',
      title: 'LLM Practice & Applications',
      metaElementId: 'llm-practice-meta',
      listElementId: 'llm-practice-list',
      items: [
        {
          id: 'tokenization-deep-dive',
          title: 'Tokenization & Vocabularies',
          level: 'Hands-on',
          links: ['panel-llm-internals'],
        },
        {
          id: 'prompting-patterns',
          title: 'Prompting Patterns & System Design',
          level: 'Practice',
          links: [],
        },
      ],
    },
  ];
  
  const STATUS = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    DONE: 'done',
  };
  
  function loadPathState() {
    try {
      const raw = window.localStorage.getItem('ml-llm-learning-path');
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }
  
  function savePathState(state) {
    try {
      window.localStorage.setItem('ml-llm-learning-path', JSON.stringify(state));
    } catch (_) {
      // ignore storage errors
    }
  }
  
  const pathState = loadPathState();
  
  function getItemStatus(id) {
    return pathState[id] || STATUS.NOT_STARTED;
  }
  
  function cycleStatus(current) {
    if (current === STATUS.NOT_STARTED) return STATUS.IN_PROGRESS;
    if (current === STATUS.IN_PROGRESS) return STATUS.DONE;
    return STATUS.NOT_STARTED;
  }
  
  function statusLabel(status) {
    switch (status) {
      case STATUS.IN_PROGRESS:
        return 'In progress';
      case STATUS.DONE:
        return 'Done';
      default:
        return 'Not started';
    }
  }
  
  // SECTION: Navigation
  
  function initNavigation() {
    const navButtons = document.querySelectorAll('.nav__item');
    const panels = document.querySelectorAll('.panel');
    const overviewButtons = document.querySelectorAll('[data-target]');
  
    function activatePanel(targetId) {
      const panelId = targetId.startsWith('panel-') ? targetId : `panel-${targetId}`;
  
      panels.forEach((panel) => {
        panel.classList.toggle('panel--active', panel.id === panelId);
      });
  
      navButtons.forEach((btn) => {
        const btnTarget = btn.getAttribute('data-target');
        btn.classList.toggle('nav__item--active', `panel-${btnTarget}` === panelId);
      });
  
      const main = document.getElementById('main-content');
      if (main) main.focus({ preventScroll: true });
    }
  
    overviewButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target) activatePanel(target);
      });
    });
  }
  
  // SECTION: Learning path UI
  
  function renderLearningPath() {
    let totalCount = 0;
    let completedCount = 0;
  
    learningPathSections.forEach((section) => {
      const listEl = document.getElementById(section.listElementId);
      const metaEl = document.getElementById(section.metaElementId);
      if (!listEl || !metaEl) return;
  
      listEl.innerHTML = '';
      let sectionDone = 0;
  
      section.items.forEach((item) => {
        const status = getItemStatus(item.id);
        const isDone = status === STATUS.DONE;
        if (isDone) sectionDone += 1;
  
        const li = document.createElement('li');
        li.className = 'path-item';
  
        const main = document.createElement('div');
        main.className = 'path-item__main';
  
        const title = document.createElement('p');
        title.className = 'path-item__title';
        title.textContent = item.title;
  
        const meta = document.createElement('p');
        meta.className = 'path-item__meta';
        const levelSpan = document.createElement('span');
        levelSpan.className = 'path-tag';
        levelSpan.textContent = item.level;
        meta.appendChild(levelSpan);
  
        if (item.links && item.links.length > 0) {
          item.links.forEach((panelId) => {
            const tag = document.createElement('button');
            tag.type = 'button';
            tag.className = 'path-tag';
            tag.textContent = 'Open demo';
            tag.dataset.target = panelId.replace('panel-', '');
            tag.addEventListener('click', () => {
              const navTarget = tag.dataset.target;
              if (!navTarget) return;
              const navButton = document.querySelector(`.nav__item[data-target="${navTarget}"]`);
              if (navButton) navButton.click();
            });
            meta.appendChild(tag);
          });
        }
  
        main.appendChild(title);
        main.appendChild(meta);
  
        const controls = document.createElement('div');
        controls.className = 'path-item__controls';
  
        const statusChip = document.createElement('span');
        statusChip.className = `path-status path-status--${status}`;
        statusChip.textContent = statusLabel(status);
  
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'path-progress-btn';
        button.textContent = 'Advance';
        button.addEventListener('click', () => {
          const next = cycleStatus(statusChip.dataset.status || status);
          pathState[item.id] = next;
          savePathState(pathState);
          renderLearningPath();
          updateSnapshot();
        });
  
        statusChip.dataset.status = status;
        controls.appendChild(statusChip);
        controls.appendChild(button);
  
        li.appendChild(main);
        li.appendChild(controls);
        listEl.appendChild(li);
  
        totalCount += 1;
        if (isDone) completedCount += 1;
      });
  
      metaEl.textContent = `${sectionDone}/${section.items.length} complete`;
    });
  
    return { totalCount, completedCount };
  }
  
  // SECTION: Overview snapshot
  
  function updateSnapshot() {
    const { totalCount, completedCount } = renderLearningPath();
    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  
    const completionText = document.getElementById('snapshot-completion');
    const ring = document.getElementById('snapshot-ring');
    const breakdown = document.getElementById('snapshot-breakdown');
  
    if (!completionText || !ring || !breakdown) return;
  
    completionText.textContent = `${percentage}% complete`;
    ring.textContent = `${percentage}%`;
  
    const deg = (percentage / 100) * 360;
    ring.parentElement.style.background = `conic-gradient(var(--accent-strong) 0deg ${deg}deg, rgba(15,23,42,1) ${deg}deg 360deg)`;
  
    breakdown.innerHTML = '';
    learningPathSections.forEach((section) => {
      const done = section.items.filter((item) => getItemStatus(item.id) === STATUS.DONE).length;
      const li = document.createElement('li');
      li.innerHTML = `<span>${section.title}</span><span>${done}/${section.items.length}</span>`;
      breakdown.appendChild(li);
    });
  }
  
  // SECTION: ML Visualizations (Chart.js)
  
  function generateNoisyRegressionData(trueW = 1.7, trueB = -1.0, count = 24) {
    const xs = [];
    const ys = [];
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * 8; // roughly -4 to 4
      const noise = (Math.random() - 0.5) * 2.2;
      const y = trueW * x + trueB + noise;
      xs.push(x);
      ys.push(y);
    }
    return { xs, ys };
  }
  
  function meanSquaredError(xs, ys, w, b) {
    let sum = 0;
    for (let i = 0; i < xs.length; i += 1) {
      const pred = w * xs[i] + b;
      const diff = pred - ys[i];
      sum += diff * diff;
    }
    return sum / xs.length;
  }
  
  function initRegressionDemo() {
    const ctx = document.getElementById('regressionChart');
    if (!ctx || !window.Chart) return;
  
    const { xs, ys } = generateNoisyRegressionData();
  
    const slopeSlider = document.getElementById('slopeSlider');
    const interceptSlider = document.getElementById('interceptSlider');
    const slopeValue = document.getElementById('slopeValue');
    const interceptValue = document.getElementById('interceptValue');
    const lossEl = document.getElementById('regressionLoss');
  
    function getParams() {
      const w = parseFloat(slopeSlider.value);
      const b = parseFloat(interceptSlider.value);
      return { w, b };
    }
  
    function computeLinePoints(w, b) {
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const x1 = minX - 0.5;
      const x2 = maxX + 0.5;
      return {
        xs: [x1, x2],
        ys: [w * x1 + b, w * x2 + b],
      };
    }
  
    const { w: initialW, b: initialB } = getParams();
    const linePoints = computeLinePoints(initialW, initialB);
  
    const regressionChart = new window.Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Data points',
            data: xs.map((x, i) => ({ x, y: ys[i] })),
            backgroundColor: 'rgba(248, 250, 252, 0.85)',
            pointRadius: 4,
            pointHoverRadius: 5,
          },
          {
            label: 'Your line',
            type: 'line',
            data: linePoints.xs.map((x, i) => ({ x, y: linePoints.ys[i] })),
            borderColor: 'rgba(249, 115, 22, 1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(30, 64, 175, 0.4)' },
            ticks: { color: '#9ca3af' },
          },
          y: {
            grid: { color: 'rgba(30, 64, 175, 0.4)' },
            ticks: { color: '#9ca3af' },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  
    function updateRegression() {
      const { w, b } = getParams();
      slopeValue.textContent = w.toFixed(1);
      interceptValue.textContent = b.toFixed(1);
  
      const mse = meanSquaredError(xs, ys, w, b);
      lossEl.textContent = mse.toFixed(2);
  
      const newLine = computeLinePoints(w, b);
      regressionChart.data.datasets[1].data = newLine.xs.map((x, i) => ({ x, y: newLine.ys[i] }));
      regressionChart.update('none');
    }
  
    slopeSlider.addEventListener('input', updateRegression);
    interceptSlider.addEventListener('input', updateRegression);
    updateRegression();
  }
  
  function generateBoundaryDataset(count = 40) {
    const points = [];
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 6;
      const label = x * 0.8 + y * -0.6 + (Math.random() - 0.5) * 1.2 > 0 ? 1 : 0;
      points.push({ x, y, label });
    }
    return points;
  }
  
  function initBoundaryDemo() {
    const ctx = document.getElementById('boundaryChart');
    if (!ctx || !window.Chart) return;
  
    const points = generateBoundaryDataset();
    const angleSlider = document.getElementById('boundaryAngle');
    const biasSlider = document.getElementById('boundaryBias');
    const angleValue = document.getElementById('boundaryAngleValue');
    const biasValue = document.getElementById('boundaryBiasValue');
    const accuracyEl = document.getElementById('boundaryAccuracy');
  
    function predictLabel(x, y, angleDeg, bias) {
      const radians = (angleDeg * Math.PI) / 180;
      const w1 = Math.cos(radians);
      const w2 = Math.sin(radians);
      const score = w1 * x + w2 * y + bias;
      return score >= 0 ? 1 : 0;
    }
  
    function computeAccuracy(angleDeg, bias) {
      let correct = 0;
      points.forEach((p) => {
        if (predictLabel(p.x, p.y, angleDeg, bias) === p.label) correct += 1;
      });
      return (correct / points.length) * 100;
    }
  
    const boundaryChart = new window.Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Class 0',
            data: points.filter((p) => p.label === 0).map((p) => ({ x: p.x, y: p.y })),
            backgroundColor: 'rgba(96, 165, 250, 0.9)',
            pointRadius: 4,
          },
          {
            label: 'Class 1',
            data: points.filter((p) => p.label === 1).map((p) => ({ x: p.x, y: p.y })),
            backgroundColor: 'rgba(52, 211, 153, 0.95)',
            pointRadius: 4,
          },
          {
            label: 'Boundary',
            type: 'line',
            data: [],
            borderColor: 'rgba(248, 250, 252, 0.9)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            min: -4,
            max: 4,
            grid: { color: 'rgba(30, 64, 175, 0.4)' },
            ticks: { color: '#9ca3af' },
          },
          y: {
            min: -4,
            max: 4,
            grid: { color: 'rgba(30, 64, 175, 0.4)' },
            ticks: { color: '#9ca3af' },
          },
        },
      },
    });
  
    function updateBoundary() {
      const angle = parseFloat(angleSlider.value);
      const bias = parseFloat(biasSlider.value);
      angleValue.textContent = `${angle.toFixed(0)}°`;
      biasValue.textContent = bias.toFixed(1);
  
      const radians = (angle * Math.PI) / 180;
      const w1 = Math.cos(radians);
      const w2 = Math.sin(radians);
  
      const x1 = -4;
      const x2 = 4;
      const y1 = -((w1 * x1 + bias) / w2);
      const y2 = -((w1 * x2 + bias) / w2);
  
      boundaryChart.data.datasets[2].data = [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ];
  
      const accuracy = computeAccuracy(angle, bias);
      accuracyEl.textContent = `${accuracy.toFixed(0)}%`;
      boundaryChart.update('none');
    }
  
    angleSlider.addEventListener('input', updateBoundary);
    biasSlider.addEventListener('input', updateBoundary);
    updateBoundary();
  }
  
  // SECTION: LLM internals demos
  
  // Simple toy tokenizer based on common subwords
  const toyVocab = [
    'trans',
    'form',
    'er',
    'learn',
    'ing',
    'model',
    'neural',
    'net',
    'work',
    'token',
    '##ization',
    'attend',
    'tion',
    'pos',
    'ition',
    'al',
    'encode',
    'ing',
    'data',
    '##set',
  ];
  
  function tokenizeText(text) {
    const clean = text.trim();
    if (!clean) return [];
  
    const words = clean.split(/\s+/);
    const tokens = [];
  
    words.forEach((word) => {
      let lower = word.toLowerCase();
      let pieces = [];
  
      while (lower.length > 0) {
        let matched = null;
        let matchedLen = 0;
        for (let vocabIndex = 0; vocabIndex < toyVocab.length; vocabIndex += 1) {
          const piece = toyVocab[vocabIndex];
          const core = piece.replace('##', '');
          if (core.length <= matchedLen) continue;
          if (lower.startsWith(core)) {
            matched = { piece, idx: vocabIndex };
            matchedLen = core.length;
          }
        }
        if (!matched) {
          pieces.push({ token: lower[0], id: 1000 + lower.charCodeAt(0) });
          lower = lower.slice(1);
        } else {
          pieces.push({ token: matched.piece, id: matched.idx + 10 });
          lower = lower.slice(matchedLen);
        }
      }
  
      tokens.push(...pieces);
    });
  
    return tokens;
  }
  
  function initTokenizationDemo() {
    const input = document.getElementById('tokenInput');
    const output = document.getElementById('tokenOutput');
    if (!input || !output) return;
  
    function render() {
      const tokens = tokenizeText(input.value || 'Transformers changed NLP.');
      output.innerHTML = '';
      tokens.forEach((t) => {
        const chip = document.createElement('div');
        chip.className = 'token-chip';
        const spanToken = document.createElement('span');
        spanToken.textContent = t.token;
        const spanId = document.createElement('span');
        spanId.className = 'token-chip__id';
        spanId.textContent = `#${t.id}`;
        chip.appendChild(spanToken);
        chip.appendChild(spanId);
        output.appendChild(chip);
      });
    }
  
    input.addEventListener('input', render);
    render();
  }
  
  function initAttentionDemo() {
    const sentenceEl = document.getElementById('attentionSentence');
    const gridEl = document.getElementById('attentionGrid');
    if (!sentenceEl || !gridEl) return;
  
    const text = sentenceEl.textContent.trim();
    const words = text.split(/\s+/);
  
    sentenceEl.textContent = '';
    const wordSpans = words.map((word, index) => {
      const span = document.createElement('button');
      span.type = 'button';
      span.className = 'attention__word';
      span.textContent = word.replace(/\.$/, '');
      span.dataset.index = String(index);
      sentenceEl.appendChild(span);
      if (index < words.length - 1) {
        const space = document.createTextNode(' ');
        sentenceEl.appendChild(space);
      }
      return span;
    });
  
    const n = words.length;
    const baseMatrix = [];
    for (let i = 0; i < n; i += 1) {
      baseMatrix[i] = [];
      for (let j = 0; j < n; j += 1) {
        const distance = Math.abs(i - j);
        const val = Math.exp(-distance);
        baseMatrix[i][j] = val;
      }
    }
  
    function renderMatrix(focusIndex = 0) {
      gridEl.innerHTML = '';
  
      const row = document.createElement('div');
      row.className = 'attention-row';
  
      for (let j = 0; j < n; j += 1) {
        const cell = document.createElement('div');
        cell.className = 'attention-cell';
        const heat = document.createElement('div');
        heat.className = 'attention-cell__heat';
        const value = baseMatrix[focusIndex][j];
        heat.style.opacity = String(0.2 + 0.8 * (value / baseMatrix[focusIndex][focusIndex]));
        cell.appendChild(heat);
        row.appendChild(cell);
      }
  
      gridEl.appendChild(row);
    }
  
    wordSpans.forEach((span, idx) => {
      span.addEventListener('click', () => {
        wordSpans.forEach((s) => s.classList.remove('attention__word--active'));
        span.classList.add('attention__word--active');
        renderMatrix(idx);
      });
    });
  
    if (wordSpans[0]) wordSpans[0].classList.add('attention__word--active');
    renderMatrix(0);
  }
  
  function initPositionalEncodingDemo() {
    const slider = document.getElementById('positionCount');
    const valueEl = document.getElementById('positionCountValue');
    const gridEl = document.getElementById('positionsGrid');
    if (!slider || !valueEl || !gridEl) return;
  
    function render() {
      const count = parseInt(slider.value, 10);
      valueEl.textContent = String(count);
      gridEl.innerHTML = '';
  
      const rows = 4;
      for (let r = 0; r < rows; r += 1) {
        const rowEl = document.createElement('div');
        rowEl.className = 'positions-row';
        for (let p = 0; p < count; p += 1) {
          const cell = document.createElement('div');
          cell.className = 'positions-cell';
          const freq = r + 1;
          const val = (Math.sin(p / freq) + 1) / 2;
          cell.style.opacity = String(0.15 + 0.85 * val);
          rowEl.appendChild(cell);
        }
        gridEl.appendChild(rowEl);
      }
    }
  
    slider.addEventListener('input', render);
    render();
  }
  
  // SECTION: Bootstrapping
  
  window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderLearningPath();
    updateSnapshot();
    initRegressionDemo();
    initBoundaryDemo();
    initTokenizationDemo();
    initAttentionDemo();
    initPositionalEncodingDemo();
  });