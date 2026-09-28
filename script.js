(function(){
  const exprLine = document.getElementById('exprLine');
  const mainLine = document.getElementById('mainLine');
  const historyList = document.getElementById('historyList');
  const flagDeg = document.getElementById('flagDeg');
  const flagRad = document.getElementById('flagRad');
  const flagInv = document.getElementById('flagInv');
  const flagM = document.getElementById('flagM');
  const sciKeys = document.getElementById('sciKeys');
 
  let expr = '';        // full expression being built (raw, uses JS-ish tokens)
  let display = '0';     // what shows big
  let justEvaluated = false;
  let memory = 0;
  let ans = 0;
  let isRad = false;
  let isInv = false;
  let history = [];
 
  const fmt = n => {
    if (!isFinite(n)) return 'Error';
    if (Math.abs(n) < 1e-12) n = 0;
    let s = parseFloat(n.toPrecision(12)).toString();
    return s;
  };
 
  function updateDisplay(){
    mainLine.textContent = display;
    exprLine.textContent = expr.length ? expr.replace(/\*/g,'×').replace(/\//g,'÷') : '\u00A0';
    flagM.classList.toggle('on', memory !== 0);
    flagInv.classList.toggle('on', isInv);
    flagDeg.classList.toggle('on', !isRad);
    flagRad.classList.toggle('on', isRad);
  }
 
  function pushHistory(e, r){
    history.push({e, r});
    if (history.length > 30) history.shift();
    renderHistory();
  }
 
  function renderHistory(){
    if (!history.length){
      historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
      return;
    }
    historyList.innerHTML = history.map((h,i) =>
      `<div class="history-item" data-idx="${i}">
         <span class="expr">${h.e.replace(/\*/g,'×').replace(/\//g,'÷')}</span>
         <span class="res">= ${h.r}</span>
       </div>`
    ).join('');
  }
 
  historyList.addEventListener('click', (ev) => {
    const item = ev.target.closest('.history-item');
    if (!item) return;
    const idx = +item.dataset.idx;
    display = history[idx].r;
    expr = '';
    justEvaluated = true;
    updateDisplay();
  });
 
  document.getElementById('clearHistory').addEventListener('click', () => {
    history = [];
    renderHistory();
  });
 
  function appendToken(t){
    if (justEvaluated){
      // start fresh unless the token continues an operation
      if (/^[+\-*/^]$/.test(t)){
        expr = display;
      } else {
        expr = '';
        display = '0';
      }
      justEvaluated = false;
    }
    expr += t;
  }
 
  function inputDigit(d){
    if (justEvaluated){ expr = ''; display = '0'; justEvaluated = false; }
    if (display === '0' || display === 'Error') display = d;
    else display += d;
    expr += d;
    updateDisplay();
  }
 
  function inputDecimal(){
    if (justEvaluated){ expr = ''; display = '0'; justEvaluated = false; }
    const parts = display.split(/[^0-9.]/);
    const last = parts[parts.length-1];
    if (last.includes('.')) return;
    display += display === '' ? '0.' : '.';
    expr += (expr === '' || /[+\-*/^(]$/.test(expr)) ? '0.' : '.';
    updateDisplay();
  }
 
  function inputOp(op){
    if (display === 'Error') return;
    appendToken(op);
    display = op === '*' ? '×' : op === '/' ? '÷' : op;
    updateDisplay();
    // restore expr display fully next update via exprLine; mainLine briefly shows operator
    setTimeout(()=>{ mainLine.textContent = expr.replace(/\*/g,'×').replace(/\//g,'÷').slice(-14) || '0'; }, 0);
  }
 
  function inputParen(p){
    if (justEvaluated){ expr=''; justEvaluated=false; }
    expr += p;
    updateDisplay();
    mainLine.textContent = expr || '0';
  }
 
  function backspace(){
    if (justEvaluated) return;
    expr = expr.slice(0,-1);
    display = expr.length ? expr : '0';
    updateDisplay();
  }
 
  function clearAll(){
    expr = '';
    display = '0';
    justEvaluated = false;
    updateDisplay();
  }
 
  function toggleSign(){
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')){ display = display.slice(1); }
    else { display = '-' + display; }
    // rebuild trailing numeric token in expr
    const m = expr.match(/(-?\d*\.?\d+)$/);
    if (m){
      const start = expr.length - m[0].length;
      const val = m[0];
      const negated = val.startsWith('-') ? val.slice(1) : '-'+val;
      expr = expr.slice(0,start) + negated;
    } else {
      expr = display;
    }
    updateDisplay();
  }
 
  function percent(){
    try{
      const val = evaluate(expr || display);
      const result = val/100;
      expr = fmt(result);
      display = expr;
      updateDisplay();
    }catch(e){ showError(); }
  }
 
  function factorial(n){
    if (n < 0 || Math.floor(n) !== n) return NaN;
    if (n > 170) return Infinity;
    let r = 1;
    for (let i=2;i<=n;i++) r*=i;
    return r;
  }
 
  function applyFn(name){
    try{
      let base = expr.length ? expr : display;
      let val = evaluate(base);
      let result;
      const angIn = x => isRad ? x : x * Math.PI/180;
      const angOut = x => isRad ? x : x * 180/Math.PI;
      switch(name){
        case 'sin': result = isInv ? angOut(Math.asin(val)) : Math.sin(angIn(val)); break;
        case 'cos': result = isInv ? angOut(Math.acos(val)) : Math.cos(angIn(val)); break;
        case 'tan': result = isInv ? angOut(Math.atan(val)) : Math.tan(angIn(val)); break;
        case 'ln': result = isInv ? Math.exp(val) : Math.log(val); break;
        case 'log': result = isInv ? Math.pow(10,val) : Math.log10(val); break;
        case 'sqrt': result = isInv ? val*val : Math.sqrt(val); break;
        case 'square': result = val*val; break;
        case 'fact': result = factorial(val); break;
        case 'inv1x': result = 1/val; break;
        default: result = val;
      }
      const label = (isInv && ['sin','cos','tan','ln','log','sqrt'].includes(name) ? name+'⁻¹' : name);
      const exprStr = `${label}(${fmt(val)})`;
      display = fmt(result);
      expr = display;
      ans = result;
      pushHistory(exprStr, display);
      justEvaluated = true;
      updateDisplay();
    }catch(e){ showError(); }
  }
 
  function insertConst(name){
    const v = name === 'pi' ? Math.PI : Math.E;
    if (justEvaluated){ expr=''; justEvaluated=false; }
    expr += v.toString();
    display = expr;
    updateDisplay();
  }
 
  function showError(){
    display = 'Error';
    expr = '';
    justEvaluated = true;
    updateDisplay();
  }
 
  // Safe-ish evaluator: only digits, operators, parens, decimal, ^
  function evaluate(str){
    if (!str || /[^0-9+\-*/().^eE\s]/.test(str)) {
      // allow scientific-notation e chars from constants
    }
    let s = str.replace(/\^/g, '**');
    // basic validation
    if (/[^0-9+\-*/().eE\s*]/.test(s)) throw new Error('bad');
    // eslint-disable-next-line no-new-func
    const val = Function('"use strict"; return (' + s + ')')();
    if (typeof val !== 'number' || !isFinite(val)) throw new Error('bad');
    return val;
  }
 
  function doEquals(){
    if (!expr.length) return;
    try{
      const result = evaluate(expr);
      const resultStr = fmt(result);
      pushHistory(expr, resultStr);
      ans = result;
      display = resultStr;
      expr = '';
      justEvaluated = true;
      updateDisplay();
    }catch(e){ showError(); }
  }
 
  function memAction(kind){
    try{
      const cur = parseFloat(display) || 0;
      if (kind === 'mc') memory = 0;
      else if (kind === 'mr'){ display = fmt(memory); expr = display; justEvaluated = true; }
      else if (kind === 'm+') memory += cur;
      else if (kind === 'm-') memory -= cur;
      updateDisplay();
    }catch(e){}
  }
 
  document.querySelectorAll('button.key').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      if (act === 'digit') inputDigit(btn.dataset.digit);
      else if (act === 'decimal') inputDecimal();
      else if (act === 'op') inputOp(btn.dataset.op);
      else if (act === 'paren') inputParen(btn.dataset.paren);
      else if (act === 'back') backspace();
      else if (act === 'clear') clearAll();
      else if (act === 'toggle-sign') toggleSign();
      else if (act === 'percent') percent();
      else if (act === 'equals') doEquals();
      else if (act === 'fn') applyFn(btn.dataset.fn);
      else if (act === 'const') insertConst(btn.dataset.const);
      else if (act === 'mem') memAction(btn.dataset.mem);
      else if (act === 'ans'){
        if (justEvaluated){ expr=''; justEvaluated=false; }
        expr += fmt(ans);
        display = expr;
        updateDisplay();
      }
      else if (act === 'inv'){
        isInv = !isInv;
        btn.classList.toggle('active', isInv);
        updateDisplay();
      }
      else if (act === 'deg-rad'){
        isRad = !isRad;
        btn.textContent = isRad ? 'Deg' : 'Rad';
        updateDisplay();
      }
    });
  });
 
  document.getElementById('modeBasic').addEventListener('click', () => {
    document.getElementById('modeBasic').classList.add('active');
    document.getElementById('modeSci').classList.remove('active');
    sciKeys.style.display = 'none';
  });
  document.getElementById('modeSci').addEventListener('click', () => {
    document.getElementById('modeSci').classList.add('active');
    document.getElementById('modeBasic').classList.remove('active');
    sciKeys.style.display = 'grid';
  });
 
  // keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9'){ inputDigit(e.key); return; }
    if (e.key === '.'){ inputDecimal(); return; }
    if (['+','-','*','/'].includes(e.key)){ inputOp(e.key); return; }
    if (e.key === '^'){ inputOp('^'); return; }
    if (e.key === '('||e.key===')'){ inputParen(e.key); return; }
    if (e.key === 'Enter' || e.key === '='){ e.preventDefault(); doEquals(); return; }
    if (e.key === 'Backspace'){ backspace(); return; }
    if (e.key === 'Escape'){ clearAll(); return; }
    if (e.key === '%'){ percent(); return; }
  });
 
  updateDisplay();
})();
 