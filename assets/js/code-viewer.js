(() => {
  const projectStatus = document.querySelector('.status');
  if (projectStatus) {
    [...projectStatus.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.remove();
    });
    projectStatus.append(' Complete');
  }

  const modal = document.getElementById('floating-code-modal');
  const codeElement = document.getElementById('floating-code-content');
  const codeScroll = document.getElementById('floating-code-scroll');
  const codeLines = document.getElementById('floating-code-lines');
  const minimap = document.getElementById('floating-code-minimap');
  const fileName = document.getElementById('floating-code-file');
  const githubLink = document.getElementById('floating-code-github');
  const copyButton = document.getElementById('floating-code-copy');
  const lineButton = document.getElementById('floating-code-line');

  if (!modal || !codeElement || !codeScroll || !codeLines || !minimap || !fileName || !githubLink) return;

  const repo = 'jujushmaterial/TCAD-pMOS-process-optimization';
  const cache = new Map();
  let currentPath = '';
  let currentCode = '';
  let minimapViewport = null;
  let dragging = false;
  let dragOffset = 0;

  const keywordTokens = new Set([
    'set','proc','foreach','for','if','elseif','else','return','puts','lappend','incr',
    'File','Electrode','Physics','Mobility','Recombination','Math','Solve','Coupled',
    'Quasistationary','Goal','Plot','Current','Output','EffectiveIntrinsicDensity','SRH',
    'NewCurrentPrefix','DoZero','Material','Region','Device','System'
  ]);
  const commandTokens = new Set([
    'deposit','etch','mask','implant','diffuse','struct','contact','region','init','line',
    'pdbSet','layers','get_variable_data','format','expr','abs','llength','lindex',
    'create_plot','select_plots','set_plot_prop','set_axis_prop','set_legend_prop',
    'load_file','create_curve','set_curve_prop','ft_scalar'
  ]);
  const propertyTokens = new Set([
    'material','type','thickness','location','spacing','name','left','right','dose','energy',
    'temperature','Voltage','Workfunction','InitialStep','Increment','MinStep','MaxStep',
    'Iterations','concentration','field','slice','angle','segments','point','replace','bottom','Grid'
  ]);

  const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  const tokenPattern = /"[^"\n]*"|@[A-Za-z0-9_|]+@|\$[A-Za-z_][A-Za-z0-9_]*|\b(?:0x[0-9A-Fa-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|\b[A-Za-z_][A-Za-z0-9_]*\b/g;

  const findCommentIndex = (line) => {
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      if (line[i] === '"' && line[i - 1] !== '\\') quoted = !quoted;
      if (line[i] === '#' && !quoted) return i;
    }
    return -1;
  };

  const tokenClass = (token) => {
    if (token.startsWith('"')) return 'tok-string';
    if (token.startsWith('@') || token.startsWith('$')) return 'tok-variable';
    if (/^(?:0x[0-9A-Fa-f]+|\d)/.test(token)) return 'tok-number';
    if (keywordTokens.has(token)) return 'tok-keyword';
    if (commandTokens.has(token)) return 'tok-command';
    if (propertyTokens.has(token)) return 'tok-property';
    return '';
  };

  const highlightPart = (line) => {
    let output = '';
    let last = 0;
    for (const match of line.matchAll(tokenPattern)) {
      const index = match.index ?? 0;
      const token = match[0];
      output += escapeHtml(line.slice(last, index));
      const cls = tokenClass(token);
      output += cls ? `<span class="${cls}">${escapeHtml(token)}</span>` : escapeHtml(token);
      last = index + token.length;
    }
    return output + escapeHtml(line.slice(last));
  };

  const highlightLine = (line) => {
    const comment = findCommentIndex(line);
    if (comment < 0) return highlightPart(line);
    return `${highlightPart(line.slice(0, comment))}<span class="tok-comment">${escapeHtml(line.slice(comment))}</span>`;
  };

  const minimapClass = (line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) return 'floating-mini-line comment';
    if (/^(deposit|etch|mask|implant|diffuse|struct|contact|region|init|line|create_|load_file|set_curve_prop)/.test(trimmed)) {
      return 'floating-mini-line command';
    }
    return 'floating-mini-line';
  };

  const syncMinimap = () => {
    if (!minimapViewport) return;
    const h = minimap.clientHeight;
    const scrollHeight = codeScroll.scrollHeight;
    const clientHeight = codeScroll.clientHeight;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    const viewportHeight = maxScroll === 0 ? h : Math.max(28, h * (clientHeight / scrollHeight));
    const maxTop = Math.max(0, h - viewportHeight);
    const ratio = maxScroll === 0 ? 0 : codeScroll.scrollTop / maxScroll;
    minimapViewport.style.height = `${viewportHeight}px`;
    minimapViewport.style.top = `${maxTop * ratio}px`;
  };

  const renderMinimap = (code) => {
    const lines = code.split('\n');
    minimap.innerHTML = '<div class="floating-minimap-lines"></div><div class="floating-minimap-viewport"></div>';
    const lineBox = minimap.querySelector('.floating-minimap-lines');
    minimapViewport = minimap.querySelector('.floating-minimap-viewport');
    lineBox.innerHTML = lines.map((line, index) => {
      const width = Math.max(8, Math.min(96, line.trim().length * 1.55));
      const top = lines.length > 1 ? (index / (lines.length - 1)) * 100 : 0;
      return `<span class="${minimapClass(line)}" style="top:${top}%;width:${width}%"></span>`;
    }).join('');
    requestAnimationFrame(syncMinimap);
  };

  const renderCode = (code) => {
    currentCode = code;
    const lines = code.split('\n');
    codeElement.innerHTML = lines.map(highlightLine).join('\n');
    codeLines.textContent = lines.map((_, i) => i + 1).join('\n');
    codeScroll.scrollTop = 0;
    codeScroll.scrollLeft = 0;
    codeLines.scrollTop = 0;
    renderMinimap(code);
  };

  const rawUrl = (path) => `https://raw.githubusercontent.com/${repo}/main/${path}`;
  const githubUrl = (path) => `https://github.com/${repo}/blob/main/${path}`;

  const loadCode = async (path) => {
    if (cache.has(path)) return cache.get(path);
    const response = await fetch(rawUrl(path), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const code = await response.text();
    cache.set(path, code);
    return code;
  };

  const showFile = async (path, title) => {
    currentPath = path;
    fileName.textContent = title || path.split('/').pop();
    githubLink.href = githubUrl(path);
    codeElement.innerHTML = '<span class="code-loading">Loading full source file…</span>';
    codeLines.textContent = '';
    minimap.innerHTML = '';
    try {
      const code = await loadCode(path);
      if (currentPath !== path) return;
      renderCode(code);
    } catch (error) {
      currentCode = '';
      codeElement.textContent = `전체 코드를 불러오지 못했습니다. GitHub 버튼으로 원본 파일을 확인해 주세요.\n\n${error.message}`;
    }
  };

  const openModal = (button) => {
    const path = button.dataset.codeFile;
    if (!path) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('floating-code-open');
    showFile(path, button.dataset.codeTitle);
    setTimeout(() => document.querySelector('.floating-code-close')?.focus(), 20);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('floating-code-open');
  };

  const goToLine = () => {
    const lineCount = Math.max(1, currentCode.split('\n').length);
    const answer = window.prompt(`이동할 줄 번호를 입력하세요. (1–${lineCount})`, '1');
    if (answer === null) return;
    const requested = Number.parseInt(answer, 10);
    if (!Number.isFinite(requested)) return;
    const line = Math.max(1, Math.min(lineCount, requested));
    const lineHeight = parseFloat(getComputedStyle(codeScroll).lineHeight) || 23;
    codeScroll.scrollTop = (line - 1) * lineHeight;
    codeScroll.focus();
  };

  const scrollFromMinimap = (clientY, offset = 0) => {
    if (!minimapViewport) return;
    const rect = minimap.getBoundingClientRect();
    const viewportHeight = minimapViewport.offsetHeight;
    const maxTop = Math.max(0, rect.height - viewportHeight);
    const top = Math.max(0, Math.min(maxTop, clientY - rect.top - offset));
    const ratio = maxTop === 0 ? 0 : top / maxTop;
    const maxScroll = Math.max(0, codeScroll.scrollHeight - codeScroll.clientHeight);
    codeScroll.scrollTop = ratio * maxScroll;
  };

  minimap.addEventListener('pointerdown', (event) => {
    if (!minimapViewport) return;
    event.preventDefault();
    const viewportRect = minimapViewport.getBoundingClientRect();
    const inside = event.clientY >= viewportRect.top && event.clientY <= viewportRect.bottom;
    dragOffset = inside ? event.clientY - viewportRect.top : minimapViewport.offsetHeight / 2;
    dragging = true;
    minimap.setPointerCapture?.(event.pointerId);
    scrollFromMinimap(event.clientY, dragOffset);
  });
  minimap.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    event.preventDefault();
    scrollFromMinimap(event.clientY, dragOffset);
  });
  const stopDrag = (event) => {
    dragging = false;
    if (event?.pointerId !== undefined) minimap.releasePointerCapture?.(event.pointerId);
  };
  minimap.addEventListener('pointerup', stopDrag);
  minimap.addEventListener('pointercancel', stopDrag);

  codeScroll.addEventListener('scroll', () => {
    codeLines.scrollTop = codeScroll.scrollTop;
    syncMinimap();
  });

  document.querySelectorAll('[data-code-file]').forEach((button) => {
    button.addEventListener('click', () => openModal(button));
  });
  document.querySelectorAll('[data-floating-code-close]').forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  lineButton?.addEventListener('click', goToLine);
  copyButton?.addEventListener('click', async () => {
    if (!currentCode) return;
    try {
      await navigator.clipboard.writeText(currentCode);
      copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1100);
    } catch {
      copyButton.textContent = 'Copy failed';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1100);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeModal();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'g') {
      event.preventDefault();
      goToLine();
    }
  });
})();
