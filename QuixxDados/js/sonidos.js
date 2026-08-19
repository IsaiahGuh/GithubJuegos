// ===== SONIDOS (sintetizados, sin archivos externos) — mismo motor que Yatzy =====
var audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { return null; }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}
function primeAudio() { getAudioCtx(); }
function playTone(freq, start, duration, type, peak) {
    type = type || 'sine';
    peak = (peak != null) ? peak : 0.16;
    var ctx = getAudioCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    var t0 = ctx.currentTime + start;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
}

// ===== EVENTOS DEL JUEGO =====
function sfxButton() { playTone(720, 0, 0.05, 'square', 0.05); }
function sfxMark() { playTone(660, 0, 0.11, 'triangle', 0.14); playTone(880, 0.07, 0.14, 'triangle', 0.11); }
function sfxCandado() { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { playTone(f, i * 0.1, 0.22, 'triangle', 0.15); }); }
function sfxFalla() { playTone(300, 0, 0.14, 'sawtooth', 0.1); playTone(210, 0.08, 0.18, 'sawtooth', 0.09); }
function sfxUndo() { playTone(260, 0, 0.1, 'sawtooth', 0.08); playTone(180, 0.05, 0.12, 'sawtooth', 0.07); }
function sfxTurnEnd() { playTone(340, 0, 0.12, 'sine', 0.09); playTone(230, 0.09, 0.18, 'sine', 0.07); }
function sfxSteal() { playTone(988, 0, 0.08, 'triangle', 0.13); playTone(1318, 0.06, 0.1, 'triangle', 0.14); }
function sfxJoin() { playTone(440, 0, 0.08, 'sine', 0.11); playTone(660, 0.06, 0.1, 'sine', 0.13); }
function sfxNotice() { playTone(430, 0, 0.16, 'sine', 0.08); }
function sfxWin() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) { playTone(f, i * 0.12, 0.3, 'triangle', 0.15); }); }
function sfxLose() { [440, 370, 294].forEach(function (f, i) { playTone(f, i * 0.14, 0.28, 'sawtooth', 0.13); }); }
function sfxReminder() { playTone(430, 0, 0.35, 'sine', 0.06); }

// ===== ANIMACIONES DE CELDAS (pop / shake, igual que Yatzy) =====
function triggerPop(elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.classList.remove('pop-anim');
    void el.offsetWidth;
    el.classList.add('pop-anim');
}
function triggerShake(elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.classList.remove('shake-anim');
    void el.offsetWidth;
    el.classList.add('shake-anim');
}
