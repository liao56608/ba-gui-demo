/* ============================================================
   Unicorn+ RF System — shared JS helpers + dialog builders
   Dialogs mirror the real *Dialog.java classes found in
   com.peninsulalaser.dialog — fields reproduced from source.
   ============================================================ */

/* ---------- Theme persistence ---------- */
const THEME_KEY  = 'proto_theme';
const COLORS_KEY = 'proto_colors';

function loadColors() {
  try { return JSON.parse(localStorage.getItem(COLORS_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveColors(c) { localStorage.setItem(COLORS_KEY, JSON.stringify(c)); }

function applyAppearance() {
  const c = loadColors();
  const root = document.documentElement;
  if (c.primary)     root.style.setProperty('--primary', c.primary);
  if (c.primaryDark) root.style.setProperty('--primary-dark', c.primaryDark);
  const lang = localStorage.getItem('proto_lang') || 'en';
  document.documentElement.lang = lang;
}
applyAppearance();

/* ---------- Toast (mirrors HToast) ---------- */
let _toastTimer;
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('is-show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('is-show'), 2400);
}

/* ---------- Modal framework (AlertDialog) ----------
   CSS classes: .modal-overlay > .modal-box > .modal-title / .modal-body / .modal-actions > .modal-btn(.secondary) */
function openModal(title, bodyHTML, opts) {
  opts = opts || {};
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'appModal';
  const actions = opts.hideActions ? '' : `
    <div class="modal-actions">
      <button class="modal-btn secondary" data-act="cancel">${opts.cancelText || 'Cancel'}</button>
      <button class="modal-btn" data-act="ok">${opts.okText || 'OK'}</button>
    </div>`;
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true">
      ${title ? '<h3 class="modal-title">' + title + '</h3>' : ''}
      <div class="modal-body">${bodyHTML}</div>
      ${actions}
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-open'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.dataset.act === 'cancel') {
      if (opts.onCancel) opts.onCancel();
      closeModal();
    }
  });
  const okBtn = overlay.querySelector('[data-act="ok"]');
  if (okBtn && opts.onOk) okBtn.addEventListener('click', opts.onOk);
  if (opts.onRender) opts.onRender(overlay);
  return overlay;
}

function closeModal() {
  const m = document.getElementById('appModal');
  if (m) { m.classList.remove('is-open'); setTimeout(() => m.remove(), 160); }
}

function confirmDialog(title, msg, onYes) {
  openModal(title, '<p class="modal-text">' + msg + '</p>', {
    okText: 'Confirm', cancelText: 'Cancel',
    onOk: () => { closeModal(); onYes(); }
  });
}

/* ============================================================
   APP-SPECIFIC DIALOG BUILDERS
   Each mirrors a real *Dialog.java in com.peninsulalaser.dialog
   ============================================================ */

/* ---------- LangDialog (dialog_lang.xml) ---------- */
function openLangDialog(onPick) {
  const body = `
    <div class="lang-row">
      <button class="lang-btn" data-lang="en">English</button>
      <button class="lang-btn" data-lang="cn">中文<br>(简体)</button>
    </div>`;
  openModal('Language', body, {
    hideActions: true,
    onRender: (ov) => {
      const cur = localStorage.getItem('proto_lang') || 'en';
      ov.querySelectorAll('.lang-btn').forEach(b => {
        if (b.dataset.lang === cur) b.classList.add('is-sel');
        b.addEventListener('click', () => {
          ov.querySelectorAll('.lang-btn').forEach(x => x.classList.remove('is-sel'));
          b.classList.add('is-sel');
          localStorage.setItem('proto_lang', b.dataset.lang);
          showToast(b.dataset.lang === 'cn' ? '语言已切换' : 'Language set to English');
          setTimeout(() => { closeModal(); if (onPick) onPick(b.dataset.lang); }, 600);
        });
      });
    }
  });
}

/* ---------- SoundDialog (dialog_sound.xml) ---------- */
function openSoundDialog() {
  const body = `
    <div class="vol-section">
      <div class="vol-section-head">
        <span class="vol-section-label">Start up Sound</span>
        <label class="vol-toggle"><input type="checkbox" id="sndOnoff" checked> <span>On/Off</span></label>
      </div>
    </div>
    <div class="vol-section">
      <div class="vol-section-head">
        <span class="vol-section-label">Alarm Volume</span>
        <span class="vol-section-val" id="alarmVal">60</span>
      </div>
      <input type="range" class="vol-slider" id="alarmVol" min="0" max="100" value="60">
      <div style="text-align:right;margin-top:8px"><button class="vol-default-btn" data-def="alarm">Default</button></div>
    </div>
    <div class="vol-section">
      <div class="vol-section-head">
        <span class="vol-section-label">Operate Volume</span>
        <span class="vol-section-val" id="opVal">40</span>
      </div>
      <input type="range" class="vol-slider" id="opVol" min="0" max="100" value="40">
      <div style="text-align:right;margin-top:8px"><button class="vol-default-btn" data-def="op">Default</button></div>
    </div>
    <div class="vol-section">
      <div class="vol-section-head">
        <span class="vol-section-label">Brightness</span>
        <span class="vol-section-val" id="briVal">80</span>
      </div>
      <input type="range" class="vol-slider" id="briVol" min="0" max="100" value="80">
      <div style="text-align:right;margin-top:8px"><button class="vol-default-btn" data-def="bri">Default</button></div>
    </div>`;
  openModal('Volume', body, {
    okText: 'OK', cancelText: 'Cancel',
    onRender: (ov) => {
      const defs = { alarm: 60, op: 40, bri: 80 };
      const map = { alarm: ['alarmVol', 'alarmVal'], op: ['opVol', 'opVal'], bri: ['briVol', 'briVal'] };
      Object.keys(map).forEach(k => {
        const [sliderId, valId] = map[k];
        const sl = ov.querySelector('#' + sliderId);
        const vl = ov.querySelector('#' + valId);
        sl.addEventListener('input', () => vl.textContent = sl.value);
      });
      ov.querySelectorAll('.vol-default-btn').forEach(b => {
        b.addEventListener('click', () => {
          const k = b.dataset.def;
          const [sliderId, valId] = map[k];
          ov.querySelector('#' + sliderId).value = defs[k];
          ov.querySelector('#' + valId).textContent = defs[k];
        });
      });
    },
    onOk: () => { closeModal(); showToast('Saved successfully'); }
  });
}

/* ---------- VersionDialog (dialog_version.xml) ---------- */
function openVersionDialog() {
  const body = `
    <div class="ver-info">
      <div class="ver-info-title">System Release Version</div>
      <div class="ver-info-row">Core Board Software Version: 02.00.01</div>
      <div class="ver-info-row">Power Board Software Version: 01.05</div>
      <div class="ver-info-row">MicroRF Handpiece Software Version: 03.12</div>
      <div class="ver-progress hidden" id="verProgress"><div class="ver-progress-bar" id="verBar" style="width:0%"></div></div>
      <div class="ver-info-row" id="verTip">Already on latest version</div>
    </div>`;
  openModal('Upgrade', body, {
    okText: 'Check', cancelText: 'Close',
    onRender: (ov) => {
      ov.querySelector('#verTip').textContent = 'Checking for updates...';
      setTimeout(() => {
        ov.querySelector('#verTip').textContent = 'Already on latest version';
      }, 1200);
    },
    onOk: () => {
      const bar = document.getElementById('verBar');
      const prog = document.getElementById('verProgress');
      const tip = document.getElementById('verTip');
      if (bar) {
        prog.classList.remove('hidden');
        tip.textContent = 'Downloading...';
        let p = 0;
        const iv = setInterval(() => {
          p += 10;
          bar.style.width = p + '%';
          if (p >= 100) {
            clearInterval(iv);
            tip.textContent = 'Already on latest version';
            setTimeout(() => { closeModal(); showToast('Already on latest version'); }, 800);
          }
        }, 200);
      }
    }
  });
}

/* ---------- PswDialog (dialog_password2.xml) ----------
   Numeric keypad 0-9 + Cancel + Done. Routes to engineer activities.
   Mirrors PswDialog.passwordIsCorrect() — multiple passwords map to
   different target activities. */
function openPswDialog(onCode) {
  let pwd = '';
  const MAX = 8;
  const dotsHTML = () => Array.from({length: MAX}, (_, i) =>
    `<span class="keypad-dot ${i < pwd.length ? 'is-on' : ''}"></span>`).join('');
  const body = `
    <div class="keypad">
      <div class="keypad-display">
        <div class="keypad-dots" id="kpDots">${dotsHTML()}</div>
        <button class="keypad-clear" id="kpClear" title="Clear">⌫</button>
      </div>
      <div class="keypad-grid" id="kpGrid">
        ${[7,8,9,4,5,6,1,2,3].map(n => `<button class="keypad-key" data-k="${n}">${n}</button>`).join('')}
      </div>
      <div class="keypad-row">
        <button class="keypad-btn keypad-btn-cancel" id="kpCancel">Cancel</button>
        <button class="keypad-key" data-k="0">0</button>
        <button class="keypad-btn keypad-btn-done" id="kpDone">Confirm</button>
      </div>
      <div class="keypad-msg" id="kpMsg">Any 8-digit number will pass in this demo GUI. </div>
    </div>`;
  openModal('Enter Password', body, { hideActions: true,
    onRender: (ov) => {
      const upd = () => { ov.querySelector('#kpDots').innerHTML = dotsHTML(); };
      ov.querySelectorAll('[data-k]').forEach(b => {
        b.addEventListener('click', () => {
          if (pwd.length >= MAX) return;
          pwd += b.dataset.k;
          upd();
        });
      });
      ov.querySelector('#kpClear').addEventListener('click', () => {
        pwd = pwd.slice(0, -1); upd();
      });
      ov.querySelector('#kpCancel').addEventListener('click', closeModal);
      ov.querySelector('#kpDone').addEventListener('click', () => {
        if (!pwd) { ov.querySelector('#kpMsg').textContent = 'Input is Empty'; return; }
        if (onCode) {
          const result = onCode(pwd, ov.querySelector('#kpMsg'));
          if (result === false) {
            ov.querySelector('#kpMsg').textContent = 'Password incorrect';
          }
        } else { closeModal(); showToast('Password accepted'); }
      });
    }
  });
}

/* ---------- PumpSettingDialog (dialog_pump_setting.xml) ----------
   Two views: level select (Low/Medium/High) + edit (mmHg steppers).
   Note: MicrorfActivity has its own inline pump dialog — this is
   the modal-based version used by other potential callers. */
function openPumpDialog() {
  let level = 'Medium';
  const vals = { Low: 50, Medium: 75, High: 90 };
  const body = `
    <div id="pumpSel">
      <div class="pump-levels-modal">
        <button class="pump-level-modal" data-lvl="Low">Low</button>
        <button class="pump-level-modal is-sel" data-lvl="Medium">Medium</button>
        <button class="pump-level-modal" data-lvl="High">High</button>
      </div>
      <div class="modal-actions">
        <button class="modal-btn secondary" id="pumpEdit">Edit</button>
        <button class="modal-btn" id="pumpOk">OK</button>
      </div>
    </div>
    <div id="pumpEditView" class="hidden">
      <div class="pump-edit-row-modal"><span class="pump-edit-label">Low</span>
        <div class="pump-stepper-modal"><button class="pump-stepper-btn" data-pk="Low" data-d="-5">−</button>
        <span class="pump-stepper-val" id="pvLow">50</span><span class="pump-stepper-unit">mmHg</span>
        <button class="pump-stepper-btn" data-pk="Low" data-d="5">+</button></div>
      </div>
      <div class="pump-edit-row-modal"><span class="pump-edit-label">Medium</span>
        <div class="pump-stepper-modal"><button class="pump-stepper-btn" data-pk="Medium" data-d="-5">−</button>
        <span class="pump-stepper-val" id="pvMedium">75</span><span class="pump-stepper-unit">mmHg</span>
        <button class="pump-stepper-btn" data-pk="Medium" data-d="5">+</button></div>
      </div>
      <div class="pump-edit-row-modal"><span class="pump-edit-label">High</span>
        <div class="pump-stepper-modal"><button class="pump-stepper-btn" data-pk="High" data-d="-5">−</button>
        <span class="pump-stepper-val" id="pvHigh">90</span><span class="pump-stepper-unit">mmHg</span>
        <button class="pump-stepper-btn" data-pk="High" data-d="5">+</button></div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn secondary" id="pumpReset">Reset</button>
        <button class="modal-btn" id="pumpBack">OK</button>
      </div>
    </div>`;
  openModal('Vacuum Level', body, { hideActions: true,
    onRender: (ov) => {
      ov.querySelectorAll('[data-lvl]').forEach(b => {
        b.addEventListener('click', () => {
          ov.querySelectorAll('[data-lvl]').forEach(x => x.classList.remove('is-sel'));
          b.classList.add('is-sel'); level = b.dataset.lvl;
        });
      });
      ov.querySelector('#pumpEdit').addEventListener('click', () => {
        ov.querySelector('#pumpSel').classList.add('hidden');
        ov.querySelector('#pumpEditView').classList.remove('hidden');
      });
      ov.querySelector('#pumpBack').addEventListener('click', () => {
        ov.querySelector('#pumpEditView').classList.add('hidden');
        ov.querySelector('#pumpSel').classList.remove('hidden');
      });
      ov.querySelector('#pumpReset').addEventListener('click', () => {
        vals.Low = 50; vals.Medium = 75; vals.High = 90;
        ov.querySelector('#pvLow').textContent = 50;
        ov.querySelector('#pvMedium').textContent = 75;
        ov.querySelector('#pvHigh').textContent = 90;
      });
      ov.querySelectorAll('[data-pk]').forEach(b => {
        b.addEventListener('click', () => {
          const k = b.dataset.pk; const d = parseInt(b.dataset.d);
          vals[k] = Math.max(10, Math.min(100, vals[k] + d));
          ov.querySelector('#pv' + k).textContent = vals[k];
        });
      });
      ov.querySelector('#pumpOk').addEventListener('click', () => {
        closeModal(); showToast('Vacuum level: ' + level + ' (' + vals[level] + ' mmHg)');
      });
    }
  });
}

/* ---------- MemoryNameDialog (dialog_memory_name.xml) ---------- */
function openMemoryNameDialog(onConfirm) {
  const body = `
    <input type="text" class="modal-input" id="memName" placeholder="Profile name" maxlength="20">
    <div class="modal-msg hidden" id="memHint">Name cannot be empty</div>`;
  openModal('Edit Name', body, {
    okText: 'OK', cancelText: 'Cancel',
    onRender: (ov) => { setTimeout(() => ov.querySelector('#memName').focus(), 100); },
    onOk: () => {
      const name = document.getElementById('memName').value.trim();
      if (!name) {
        document.getElementById('memHint').classList.remove('hidden');
        return;
      }
      closeModal();
      if (onConfirm) onConfirm(name);
    }
  });
}

/* ---------- AuthDialog (dialog_auth.xml) ---------- */
function openAuthDialog() {
  const qrSvg = `<svg viewBox="0 0 90 90"><rect width="90" height="90" fill="#fff"/><g fill="#000">
    <rect x="6" y="6" width="24" height="24"/><rect x="12" y="12" width="12" height="12" fill="#fff"/>
    <rect x="60" y="6" width="24" height="24"/><rect x="66" y="12" width="12" height="12" fill="#fff"/>
    <rect x="6" y="60" width="24" height="24"/><rect x="12" y="66" width="12" height="12" fill="#fff"/>
    <rect x="36" y="6" width="6" height="6"/><rect x="48" y="6" width="6" height="6"/>
    <rect x="36" y="18" width="6" height="6"/><rect x="42" y="30" width="6" height="6"/>
    <rect x="60" y="42" width="6" height="6"/><rect x="72" y="42" width="6" height="6"/>
    <rect x="36" y="48" width="6" height="6"/><rect x="48" y="48" width="12" height="12"/>
    <rect x="66" y="60" width="6" height="6"/><rect x="78" y="66" width="6" height="6"/>
    <rect x="36" y="66" width="6" height="6"/><rect x="42" y="78" width="6" height="6"/>
    <rect x="54" y="72" width="6" height="6"/><rect x="66" y="78" width="6" height="6"/>
    <rect x="78" y="78" width="6" height="6"/></g></svg>`;
  const body = `
    <div class="ver-info-title">Genuine device verify Process</div>
    <div class="auth-qr-row">
      <div><div class="auth-qr">${qrSvg}</div><div class="auth-step">① Peninsula Medical<br>WeChat Public Account</div></div>
      <div><div class="auth-qr">${qrSvg}</div><div class="auth-step">② Scan QR Code to<br>Verify Authenticity</div></div>
    </div>
    <p class="modal-text" style="font-size:13px">① Please scan to follow Peninsula Medical WeChat Official Account.<br>② Click "Verification System", select "Equipment Verification" to check authenticity</p>`;
  openModal('', body, { okText: 'Close',
    onOk: () => closeModal()
  });
}

/* ---------- LockDialog (dialog_lock.xml) ---------- */
function openLockDialog() {
  const body = `
    <p class="modal-text" style="font-size:18px;color:#10ae27">Device Self-check</p>
    <p class="modal-text">Device Detecting<br>Please wait...</p>
    <div class="modal-actions">
      <button class="modal-btn" id="lockWlan">CHECK</button>
    </div>`;
  openModal('', body, { hideActions: true,
    onRender: (ov) => {
      ov.querySelector('#lockWlan').addEventListener('click', () => {
        showToast('Opening Wi-Fi settings...');
        setTimeout(() => {
          const texts = ov.querySelectorAll('.modal-text');
          if (texts[1]) texts[1].textContent = 'Network connected';
        }, 1500);
      });
    }
  });
}

/* ---------- DisassemblyDialog (dialog_disassembly.xml) ---------- */
function openDisassemblyDialog(onConfirm) {
  const body = `
    <p class="modal-text" style="font-size:18px;color:#10ae27">Device Self-check</p>
    <p class="modal-text">Device Authorization Detecting<br>Please wait...</p>
    <div class="modal-actions">
      <button class="modal-btn" id="disOk">Confirm</button>
    </div>`;
  openModal('', body, { hideActions: true,
    onRender: (ov) => {
      ov.querySelector('#disOk').addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
        else showToast('Authorization confirmed');
      });
    }
  });
}

/* ---------- CommonDialog (dialog_common.xml) ---------- */
function openCommonDialog(msg) {
  const body = `
    <p class="modal-text" style="display:flex;align-items:center;gap:12px;justify-content:center;font-size:18px;color:#ff6020">
      <svg viewBox="0 0 24 24" style="width:32px;height:32px;fill:#ff6020;flex-shrink:0"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
      ${msg}
    </p>`;
  openModal('', body, { okText: 'OK',
    onOk: () => closeModal()
  });
}

/* ============================================================
   DATA MODELS (in-memory, for same-screen navigation)
   ============================================================ */

/* Memory / saved-profile model — mirrors MemoryActivity.
   Keyed by source activity ('artist' | 'microrf' | 'pureplus'). */
const MemoryStore = {
  data: {
    artist: [
      { id: 1, name: 'Face Lifting A', power: 9, time: 30, depth: 0 },
      { id: 2, name: 'Neck Treatment', power: 7, time: 25, depth: 0 },
      { id: 3, name: 'Eye Area Care', power: 5, time: 15, depth: 0 },
    ],
    microrf: [
      { id: 1, name: 'Deep RF Pro', power: 15, time: 0, depth: 2.5 },
      { id: 2, name: 'Body Contour', power: 18, time: 0, depth: 3.0 },
    ],
    pureplus: [
      { id: 1, name: 'Pure Plus Default', power: 10, time: 30, depth: 0 },
    ]
  },
  list(src) { return this.data[src] || []; },
  add(src, obj) {
    const arr = this.data[src] || (this.data[src] = []);
    const id = arr.length ? Math.max(...arr.map(m => m.id)) + 1 : 1;
    const item = {
      id,
      name: obj.name || 'Untitled',
      power: obj.power || 0,
      time: obj.time || 0,
      depth: obj.depth || 0,
      temp: obj.temp || 40
    };
    arr.push(item);
    return item;
  },
  update(src, id, updates) {
    const arr = this.data[src];
    if (!arr) return;
    const idx = arr.findIndex(m => m.id === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...updates };
    }
  },
  remove(src, id) {
    const arr = this.data[src];
    if (arr) this.data[src] = arr.filter(m => m.id !== id);
  },
  delete(src, id) { this.remove(src, id); }
};

/* Handpiece model — mirrors the device's handler map. */
const HandlerStore = {
  handlers: [
    { id: 7, name: 'MicroRF', connected: true, model: 'MicroRF-80' },
    { id: 8, name: 'Artist', connected: true, model: 'Artist-PRO' },
    { id: 16, name: 'Pure+', connected: true, model: 'PurePlus-V2' },
  ]
};

/* ============================================================
   Standby/Start state machine — mirrors the StandBy→Ready→Running flow.
   Accepts an options object with element IDs:
   { btnRun, standbySlide, standbyThumb, readySlide, readyThumb, textStandby, textTreat, bottomMsg }
   ============================================================ */
function makeStandbyController(opts) {
  const btnRun       = document.getElementById(opts.btnRun);
  const standbySlide = document.getElementById(opts.standbySlide);
  const standbyThumb = document.getElementById(opts.standbyThumb);
  const readySlide   = document.getElementById(opts.readySlide);
  const readyThumb   = document.getElementById(opts.readyThumb);
  const textStandby  = document.getElementById(opts.textStandby);
  const textTreat    = document.getElementById(opts.textTreat);
  const bottomMsg    = document.getElementById(opts.bottomMsg);

  if (!btnRun) return;

  let state = 'idle'; // idle | standby | ready | running

  function setState(s) {
    state = s;

    // Toggle slide/thumb visibility
    if (standbySlide) standbySlide.classList.toggle('hidden', s !== 'standby');
    if (standbyThumb) standbyThumb.classList.toggle('hidden', s !== 'standby');
    if (readySlide)   readySlide.classList.toggle('hidden', s !== 'ready' && s !== 'running');
    if (readyThumb)   readyThumb.classList.toggle('hidden', s !== 'ready' && s !== 'running');

    // Toggle button text
    if (btnRun) {
      if (s === 'idle')          btnRun.textContent = 'StandBy';
      else if (s === 'standby')  btnRun.textContent = 'StandBy';
      else if (s === 'ready')    btnRun.textContent = 'Start';
      else if (s === 'running')  btnRun.textContent = 'Stop';
    }

    // Toggle labels
    if (textStandby) textStandby.classList.toggle('hidden', s === 'running');
    if (textTreat)   textTreat.classList.toggle('hidden', s === 'idle' || s === 'standby');

    // Update bottom message
    if (bottomMsg) {
      const msgs = {
        idle:     'Please Press STANDBY Button',
        standby:  'System Ready — Slide to Start',
        ready:    'Please Press START Button',
        running:  'System Running...'
      };
      bottomMsg.textContent = msgs[s] || '';
    }
  }

  btnRun.addEventListener('click', () => {
    if (state === 'idle')         setState('standby');
    else if (state === 'standby') setState('ready');
    else if (state === 'ready')   setState('running');
    else                          setState('idle');
  });

  // Allow sliding the standby thumb to advance to ready
  if (standbyThumb) {
    standbyThumb.addEventListener('click', () => {
      if (state === 'standby') setState('ready');
    });
  }
  // Allow sliding the ready thumb to start running
  if (readyThumb) {
    readyThumb.addEventListener('click', () => {
      if (state === 'ready') setState('running');
    });
  }

  setState('idle');
  return { setState, getState: () => state };
}

/* ============================================================
   Stepper helper — wires +/- buttons to a value display.
   Positional args: wireStepper(minusId, plusId, valId, min, max, step, init, decimals?)
   ============================================================ */
function wireStepper(minusId, plusId, valId, min, max, step, init, decimals) {
  const minus = document.getElementById(minusId);
  const plus  = document.getElementById(plusId);
  const val   = document.getElementById(valId);
  if (!minus || !plus || !val) return;

  min = (typeof min === 'number') ? min : 0;
  max = (typeof max === 'number') ? max : 999;
  step = (typeof step === 'number') ? step : 1;
  decimals = (typeof decimals === 'number') ? decimals : 0;

  let cur = (typeof init === 'number') ? init : (parseFloat(val.textContent) || min);

  function fmt(v) {
    if (decimals > 0) return v.toFixed(decimals);
    return String(Math.round(v));
  }
  function upd() { val.textContent = fmt(cur); }

  minus.addEventListener('click', () => {
    cur = Math.max(min, cur - step);
    upd();
  });
  plus.addEventListener('click', () => {
    cur = Math.min(max, cur + step);
    upd();
  });

  upd();
  return { get: () => cur, set: (v) => { cur = v; upd(); } };
}
