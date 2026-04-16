


/* All symbols now loaded from simboli/ folder via IMG_SYMS */

/* J = Dark Asteroid (lowest), Q = Red Meteor, K = Blue Crystal, A = Gold Crystal (highest low) */

/* antigravita = Purple energy, buco_nero = Black hole, supernova = Gold explosion, tesseract = Green cube */




function buildPool(){const pool=[];for(const[sym,wt]of Object.entries(WEIGHTS))for(let i=0;i<Math.round(wt*10);i++)pool.push(sym);return pool;}
let pool=buildPool();
function rndSym(){let sym;do{sym=pool[Math.floor(Math.random()*pool.length)];}while(S.bannedSym&&sym===S.bannedSym);return sym;}

function initGrid(){const gridEl=document.getElementById('grid');gridEl.innerHTML='';for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const d=document.createElement('div');d.className='cell';d.id=`c${r}_${c}`;d.innerHTML='<div class="sw"></div>';d.style.setProperty('--sym-delay',(Math.random()*3).toFixed(2)+'s');gridEl.appendChild(d);}}

function renderSymbol(key){if(!key)return '';if(key==='wild')return `<img src="simboli/wild.png" alt="wild" draggable="false">`;if(key==='scatter')return `<img src="simboli/freespin.png" alt="Free Spin" draggable="false" style="width:100%;height:100%;object-fit:contain">`;if(IMG_SYMS[key])return `<img src="simboli/${IMG_SYMS[key]}" alt="${key}" draggable="false">`;return SVG[key]||'';}

function fillGrid(anim=false){S.grid=[];S.cellMult=[];S.extraSpawned=false;let extraSym=null,extraPos=[-1,-1];if(Math.random()<S.extraDropRate/100){extraSym=pickExtraSymbol();if(extraSym){if(extraSym==='buco_nero'){extraPos=[Math.floor(ROWS/2),Math.floor(COLS/2)];}else{extraPos=[Math.floor(Math.random()*ROWS),Math.floor(Math.random()*COLS)];}S.extraSpawned=true;}}/* Scatter placement: random positions, forced count or random based on rate */const scatterPositions=new Set();if(S.forceScatter>0){while(scatterPositions.size<S.forceScatter){const sr=Math.floor(Math.random()*ROWS),sc=Math.floor(Math.random()*COLS);if(!(sr===extraPos[0]&&sc===extraPos[1]))scatterPositions.add(`${sr},${sc}`);}S.forceScatter=0;}else{for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(r===extraPos[0]&&c===extraPos[1])continue;if(Math.random()<S.scatterRate/(ROWS*COLS*2))scatterPositions.add(`${r},${c}`);}}for(let r=0;r<ROWS;r++){S.grid[r]=[];S.cellMult[r]=[];for(let c=0;c<COLS;c++){if(r===extraPos[0]&&c===extraPos[1]&&extraSym)S.grid[r][c]=extraSym;else if(scatterPositions.has(`${r},${c}`))S.grid[r][c]='scatter';else S.grid[r][c]=rndSym();S.cellMult[r][c]=1;}}if(anim){shuffleReveal();}else{renderFullGrid(false);}}


function shuffleReveal(){
  /* Phase 1: Dissolve all cells (no particles) */
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const cell=document.getElementById(`c${r}_${c}`);
    cell.className='cell grav-dissolving';
  }

  /* After dissolve, set cells to blank shuffle state */
  setTimeout(()=>{
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const cell=document.getElementById(`c${r}_${c}`);
      cell.className='cell grav-shuffling';
    }

    /* Phase 2: Column-by-column reform (no suspense) */
    const colDelay=(window._designColDelay||250)/S.speedMult;
    const rowDelay=45/S.speedMult;

    for(let c=0;c<COLS;c++){
      const baseDelay=c*colDelay;

      for(let r=0;r<ROWS;r++){
        const delay=baseDelay+r*rowDelay;
        setTimeout(()=>{
          if(r===0)SFX.reelTick(c);
          if(r===ROWS-1)SFX.reelStopThud(c);
          const cell=document.getElementById(`c${r}_${c}`);
          /* Set final symbol and reform */
          const sw=cell.querySelector('.sw');
          sw.innerHTML=renderSymbol(S.grid[r][c]);
          cell.className='cell grav-reforming';
          const k=S.grid[r][c];
          if(k&&(HIGH_SYMS.includes(k)||EXTRA_SYMS.includes(k)))cell.classList.add('sym-high');if(k&&REGULAR_SYMS.includes(k))cell.classList.add('sym-low');if(k==='scatter')cell.classList.add('sym-scatter');if(k&&EXTRA_SYMS.includes(k))cell.classList.add('bonus-spawn');
          const m=S.cellMult[r][c];
          if(m>=2){
            if(m===2)cell.classList.add('mult-2');
            else if(m===3)cell.classList.add('mult-3');
            else cell.classList.add('mult-4plus');
            const badge=document.createElement('div');
            badge.className='cell-mult-badge';badge.textContent='×'+m;cell.appendChild(badge);
          }
          setTimeout(()=>{cell.classList.remove('grav-reforming');},400/S.speedMult);
        },delay);
      }
    }
  },280/S.speedMult);
}

function pickExtraSymbol(){const rates=EXTRA_SYMS.map(sym=>({sym,rate:S.extraRates[sym]}));const total=rates.reduce((s,r)=>s+r.rate,0);if(total<=0)return null;let r=Math.random()*total,sum=0;for(const{sym,rate}of rates){sum+=rate;if(r<sum)return sym;}return rates[0].sym;}

function renderFullGrid(anim=false){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)renderCell(r,c,anim);}

function renderCell(r,c,anim=false){const cell=document.getElementById(`c${r}_${c}`);if(!cell)return;const k=S.grid[r][c];const sw=cell.querySelector('.sw');sw.innerHTML=renderSymbol(k);cell.className='cell';/* Remove old badges */
const oldBadge=cell.querySelector('.cell-mult-badge');if(oldBadge)oldBadge.remove();
const oldWild=cell.querySelector('.wild-mult-badge');if(oldWild)oldWild.remove();
const oldWLabel=cell.querySelector('.wild-label');if(oldWLabel)oldWLabel.remove();
if(k==='wild'){cell.classList.add('wild-cell');const wb=document.createElement('div');wb.className='wild-mult-badge';wb.textContent='×'+S.cellMult[r][c];cell.appendChild(wb);return;}
if(k&&(HIGH_SYMS.includes(k)||EXTRA_SYMS.includes(k)))cell.classList.add('sym-high');if(k&&REGULAR_SYMS.includes(k))cell.classList.add('sym-low');if(k==='scatter')cell.classList.add('sym-scatter');const m=S.cellMult[r][c];if(m>=2){if(m===2)cell.classList.add('mult-2');else if(m===3)cell.classList.add('mult-3');else cell.classList.add('mult-4plus');const badge=document.createElement('div');badge.className='cell-mult-badge';badge.textContent='×'+m;cell.appendChild(badge);}if(anim){cell.classList.add('falling');const delay=c*0.04+r*0.025;const dur=(0.7+r*0.04)/S.speedMult;cell.style.setProperty('--fall-dur',dur+'s');sw.style.animationDelay=delay+'s';sw.style.animationDuration=dur+'s';setTimeout(()=>{cell.classList.remove('falling');sw.style.animationDelay='';sw.style.animationDuration='';},Math.round((delay+dur)*1000)+100);}}

function findClusters(){
  /*  Wild-aware cluster detection:
      1. BFS each non-wild/non-extra/non-scatter symbol, treating wilds as passable (same sym).
         This means a wild between two groups of the same symbol merges them into one cluster.
      2. Track which wilds were used. A wild can belong to multiple clusters (one per symbol type).
  */
  const vis=Array.from({length:ROWS},()=>Array(COLS).fill(null));/* null=unvisited, string=sym that claimed it */
  const rawClusters=[];

  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const g=S.grid[r][c];
    if(!g||g==='wild'||EXTRA_SYMS.includes(g)||g==='scatter')continue;
    if(vis[r][c]===g)continue;/* already part of a cluster of this sym */
    const sym=g;
    const cells=[];const queue=[[r,c]];
    const localVis=new Set();localVis.add(`${r},${c}`);
    while(queue.length){
      const[cr,cc]=queue.shift();
      cells.push([cr,cc]);
      for(const[nr,nc]of[[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]]){
        if(nr<0||nr>=ROWS||nc<0||nc>=COLS)continue;
        const key=`${nr},${nc}`;
        if(localVis.has(key))continue;
        const ng=S.grid[nr][nc];
        if(ng===sym||ng==='wild'){
          localVis.add(key);
          queue.push([nr,nc]);
        }
      }
    }
    /* Mark non-wild cells as visited for this sym so we don't re-BFS them */
    for(const[cr,cc]of cells){
      if(S.grid[cr][cc]===sym)vis[cr][cc]=sym;
    }
    rawClusters.push({sym,cells,sz:cells.length});
  }

  /* Deduplicate: wilds may appear in multiple clusters of different symbols — that's correct.
     But if two clusters of the SAME symbol somehow overlap (shouldn't with BFS above), merge them. */
  return rawClusters.filter(cl=>cl.sz>=S.minCl);
}

function calcPay(clusters){let total=0;for(const cl of clusters){const pt=PAYTABLE[cl.sym];if(!pt)continue;const idx=Math.min(cl.sz,pt.length-1);const basePay=pt[idx];if(basePay<=0)continue;/* Wild multiplier: product of ALL wild cellMults in the cluster (each wild multiplies) */let wildMult=1;cl.cells.forEach(([r,c])=>{if(S.grid[r][c]==='wild'&&S.cellMult[r][c]>1)wildMult*=S.cellMult[r][c];});/* Cascade multiplier: average of non-wild cell multipliers */let cascMult=0;let normCount=0;cl.cells.forEach(([r,c])=>{if(S.grid[r][c]!=='wild'){cascMult+=S.cellMult[r][c];normCount++;}});const avgCasc=normCount>0?cascMult/normCount:1;const rawPay=basePay*S.bet*avgCasc*wildMult;const finalPay=Math.round(rawPay*100)/100;dLog(`  → ${cl.sym} ×${cl.sz}: base=${basePay} wild=×${wildMult} casc=×${avgCasc.toFixed(1)} = ${finalPay}`,'info');total+=finalPay;}return Math.round(total*100)/100;}

const dly=ms=>new Promise(r=>setTimeout(r,Math.max(10,ms/S.speedMult)));
const fmt=n=>{const r=Math.round(n*100)/100;return r%1===0?r.toLocaleString('it-IT'):r.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2});};
function updBal(){
  const el=document.getElementById('balance');
  const oldVal=parseFloat(el.textContent.replace(/\./g,'').replace(',','.'))||0;
  const newVal=Math.round(S.bal*100)/100;
  el.textContent=fmt(newVal);
  if(newVal>oldVal){el.classList.add('val-up');setTimeout(()=>el.classList.remove('val-up'),400);}
  else if(newVal<oldVal){el.classList.add('val-down');setTimeout(()=>el.classList.remove('val-down'),400);}
}

/* ── SPIN WIN PANEL (main win counter) ── */
function updSpinWinPanel(val){
  const el=document.getElementById('spinWinPanelAmount');
  if(!el)return;
  const v=Math.round((typeof val==='number'?val:S.spinWin)*100)/100;
  el.textContent=v>0?fmt(v):'0';
  /* Pulse animation on update */
  if(v>0){el.style.animation='none';void el.offsetHeight;el.style.animation='winCountPulse 0.15s ease-in-out 3 alternate';}
}

/* Arrotonda un moltiplicatore al numero intero più vicino che sia multiplo di 2 o di 5.
   Sequenza accettata: 1,2,4,5,6,8,10,12,14,15,16,18,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,...
   Usata SOLO per il display: la matematica usa il valore raw per non alterare il RTP. */
function niceMult(x){
  if(!isFinite(x)||x<=1)return 1;
  const nice=new Set([1]);
  for(let i=2;i<=1000;i+=2)nice.add(i);
  for(let i=5;i<=1000;i+=5)nice.add(i);
  const arr=[...nice].sort((a,b)=>a-b);
  let best=arr[0],dmin=Infinity;
  for(const c of arr){const d=Math.abs(c-x);if(d<dmin){dmin=d;best=c;}}
  return best;
}

/* ── STATUS PANEL (sinistra) — mostra bonus attivo o FS rimanenti ── */
function setGridStatus(text,mode){
  const el=document.getElementById('statusPanelVal');
  const panel=document.getElementById('statusPanel');
  if(!el||!panel)return;
  el.textContent=text||'PRONTO';
  panel.classList.remove('status-bonus','status-freespin','status-idle');
  panel.classList.add('status-'+(mode||'idle'));
}

/* ── PREMIUM STATE TRANSITIONS ── */
function setGridState(state){
  const gf=document.getElementById('gridFrame');
  const led=document.getElementById('ledBorder');
  const sb=document.getElementById('spinBtn');
  const nebula = document.querySelector('.bg-nebula-pulse');
  const gridGlow = document.querySelector('.grid-glow');
  if(!gf)return;
  gf.classList.remove('state-idle','state-spinning','state-winning','state-bonus');
  if(led)led.classList.remove('led-idle','led-spin','led-win','led-bonus');
  if(sb)sb.classList.remove('spinning-state','win-state');
  if (nebula) {
    nebula.classList.remove('state-idle','state-spinning','state-winning','state-bonus');
    nebula.classList.add('state-' + state);
  }
  if (gridGlow) {
    gridGlow.classList.remove('state-idle','state-spinning','state-winning','state-bonus');
    gridGlow.classList.add('state-' + state);
  }
  switch(state){
    case 'idle':gf.classList.add('state-idle');if(led)led.classList.add('led-idle');
      /* aggiorna status panel solo se non siamo in FS */
      if((S.freeSpins|0)<=0)setGridStatus('SPIN NORMALE','idle');
      /* Se la polvere era piena durante lo spin, adesso trigghera il bonus */
      if(S.dustFullPending&&!S.spinning){
        S.dustFullPending=false;
        setTimeout(()=>{if(typeof triggerRandomDustBonus==='function')triggerRandomDustBonus();},250);
      }
      break;
    case 'spinning':gf.classList.add('state-spinning');if(led)led.classList.add('led-spin');if(sb)sb.classList.add('spinning-state');
      if((S.freeSpins|0)<=0)setGridStatus('SPIN NORMALE','idle');
      break;
    case 'winning':gf.classList.add('state-winning');if(led)led.classList.add('led-win');if(sb)sb.classList.add('win-state');break;
    case 'bonus':gf.classList.add('state-bonus');if(led)led.classList.add('led-bonus');break;
  }
}

/* ── PREMIUM WIN COUNTER WITH COINS ── */
function spawnWinCoins(targetEl,count){
  if(!targetEl)return;
  const rect=targetEl.getBoundingClientRect();
  const targetX=rect.left+rect.width/2;
  const targetY=rect.top+rect.height/2;
  const gridRect=document.getElementById('gridFrame').getBoundingClientRect();
  const startX=gridRect.left+gridRect.width/2;
  const startY=gridRect.top+gridRect.height/2;
  const numCoins=Math.min(count||8,15);
  for(let i=0;i<numCoins;i++){
    const coin=document.createElement('div');
    coin.className='win-coin';
    const offX=(Math.random()-0.5)*200;
    const offY=(Math.random()-0.5)*200;
    const midX=startX+offX;
    const midY=startY+offY;
    coin.style.left=startX+'px';
    coin.style.top=startY+'px';
    document.body.appendChild(coin);
    const delay=i*60;
    const dur=600+Math.random()*300;
    setTimeout(()=>{
      coin.style.transition=`left ${dur}ms cubic-bezier(.2,0,.3,1),top ${dur}ms cubic-bezier(.2,0,.3,1),opacity ${dur}ms`;
      coin.style.left=midX+'px';
      coin.style.top=midY+'px';
      setTimeout(()=>{
        coin.style.transition=`left ${dur*0.6}ms ease-in,top ${dur*0.6}ms ease-in,opacity ${dur*0.6}ms`;
        coin.style.left=targetX+'px';
        coin.style.top=targetY+'px';
        coin.style.opacity='0';
        setTimeout(()=>{
          coin.remove();
          /* Flash the target */
          targetEl.classList.add('win-amount-flash');
          setTimeout(()=>targetEl.classList.remove('win-amount-flash'),300);
        },dur*0.6);
      },dur);
    },delay);
  }
}

/* ── REACTIVE BACKGROUND EFFECTS ── */
function triggerBgFlash(type){
  const flash=document.getElementById('bgFlash');
  if(!flash)return;
  flash.className='bg-flash '+type;
  /* Force reflow to restart animation */
  void flash.offsetWidth;
  flash.className='bg-flash '+type;
}

function triggerShockwave(){
  const sw=document.createElement('div');
  sw.className='bg-shockwave';
  document.getElementById('app').appendChild(sw);
  setTimeout(()=>sw.remove(),1100);
}

function triggerBgShift(level){
  const bg=document.querySelector('.bg-layer');
  const nebula=document.querySelector('.bg-nebula');
  if(!bg)return;
  if(level==='mega'){
    bg.classList.add('mega-shift');
    if(nebula)nebula.classList.add('pulse-win');
    triggerShockwave();
    setTimeout(()=>{bg.classList.remove('mega-shift');if(nebula)nebula.classList.remove('pulse-win');},2000);
  }else if(level==='big'){
    bg.classList.add('win-shift');
    if(nebula)nebula.classList.add('pulse-win');
    triggerShockwave();
    setTimeout(()=>{bg.classList.remove('win-shift');if(nebula)nebula.classList.remove('pulse-win');},1500);
  }else{
    bg.classList.add('win-shift');
    setTimeout(()=>bg.classList.remove('win-shift'),800);
  }
}

function showWin(t){const d=document.getElementById('winDisplay');d.textContent=t;d.classList.add('visible');SFX.bigWin();}
function hideWin(){document.getElementById('winDisplay').classList.remove('visible');}
function showBigWinPopup(title,amount){
  /* FIX 2026-04-15: cleanup di popup precedente se ancora visibile (evita sovrapposizioni e flash) */
  const overlay=document.getElementById('bigWinOverlay');
  const titleEl=document.getElementById('bigWinTitle');
  const amountEl=document.getElementById('bigWinAmount');
  const particlesEl=document.getElementById('bigWinParticles');
  /* Pulisci particelle vecchie che possono essere rimaste da un popup ancora in corso */
  particlesEl.innerHTML='';
  /* Rimuovi shockwave vecchie non ancora cancellate */
  document.querySelectorAll('.win-shockwave').forEach(el=>el.remove());
  /* Trigger shockwave */
  const sw = document.createElement('div');
  sw.className = 'win-shockwave';
  document.body.appendChild(sw);
  setTimeout(() => sw.remove(), 1000);

  titleEl.textContent=title;
  /* Importo mostrato subito (no flash a "0") */
  amountEl.textContent=fmt(Math.round(amount*100)/100);
  overlay.classList.add('visible');
  /* Spawn particles */
  const colors=['#ffd700','#ff6600','#00d0ff','#ff00aa','#00ff88','#8040ff'];
  const numSparks=window._designPopupParticles||30;
  for(let i=0;i<numSparks;i++){
    const spark=document.createElement('div');
    spark.className='bw-spark';
    const color=colors[Math.floor(Math.random()*colors.length)];
    const angle=Math.random()*Math.PI*2;
    const dist=100+Math.random()*200;
    spark.style.cssText=`
      left:${45+Math.random()*10}%;top:${45+Math.random()*10}%;
      background:${color};box-shadow:0 0 8px ${color};
      --spark-x:${Math.cos(angle)*dist}px;--spark-y:${Math.sin(angle)*dist}px;
      animation-delay:${Math.random()*0.5}s;animation-duration:${1+Math.random()*1}s;
    `;
    particlesEl.appendChild(spark);
  }
  /* Importo già scritto all'inizio (count-up rimosso per evitare confusione). */
  /* Auto-hide after popup duration */
  const popupDur=window._designPopupDuration||1920;
  setTimeout(()=>{overlay.classList.remove('visible');},popupDur);
}

/* ══════════════════════════════════════════════ */

/* Negozio Cosmico rimosso 2026-04-15 — ogni acquisto passa ora per il pannello Buy Bonus (BONUS_COST_MULT). */
function showToast(message, type='info', duration=3000){
  const container=document.getElementById('toastContainer');
  if(!container)return;
  const icons={info:'💠',win:'🏆',bonus:'⚡',cascade:'🔥',freespin:'🌀'};
  const toast=document.createElement('div');
  toast.className='toast toast-'+type;
  toast.innerHTML='<span class="toast-icon">'+(icons[type]||'💠')+'</span><span>'+message+'</span>';
  container.appendChild(toast);
  requestAnimationFrame(()=>requestAnimationFrame(()=>toast.classList.add('show')));
  setTimeout(()=>{
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(()=>toast.remove(),400);
  },duration);
}

/* ── COLLAPSIBLE SIDE PANELS ── */
function toggleSidePanel(side){
  const panel=document.querySelector(side==='l'?'.side-panel-l':'.side-panel-r');
  const btn=document.getElementById(side==='l'?'togglePanelL':'togglePanelR');
  if(!panel)return;
  const isCollapsed=panel.classList.toggle('collapsed');
  if(btn){
    if(side==='l') btn.textContent=isCollapsed?'▶':'◀';
    else btn.textContent=isCollapsed?'◀':'▶';
  }
  SFX.click();
}

/* ── BOTTOM SHEET MENU ── */
const bsState={autoSpins:0,autoWinStop:0,autoBalStop:0,autoFsStop:false,autoRemaining:0,history:[]};

function openBsMenu(){
  document.getElementById('bsOverlay').classList.add('visible');
  bsShowGrid();
  updateBsStats();
}
function closeBsMenu(){
  document.getElementById('bsOverlay').classList.remove('visible');
  bsShowGrid();
}

function bsShowGrid(){
  document.getElementById('bsGrid').style.display='grid';
  document.getElementById('bsBack').classList.remove('visible');
  document.getElementById('bsContentArea').classList.remove('active');
}

function bsOpenSection(section){
  document.getElementById('bsGrid').style.display='none';
  document.getElementById('bsBack').classList.add('visible');
  const content=document.getElementById('bsContentArea');
  content.classList.add('active');
  content.querySelectorAll('.bs-page').forEach(p=>p.classList.remove('active'));
  const pageMap={settings:'bsSettings',autoplay:'bsAutoplay',history:'bsHistory',stats:'bsStats',paytable:'bsPaytable'};
  if(section==='tutorial'){
    closeBsMenu();
    setTimeout(startTutorial,400);
    return;
  }
  const page=document.getElementById(pageMap[section]);
  if(page)page.classList.add('active');
  if(section==='paytable'&&typeof buildPaytable==='function')buildPaytable();
  if(section==='stats')updateBsStats();
  if(section==='history')renderBsHistory();
}

function updateBsVol(){
  const v=parseInt(document.getElementById('bsVolMaster').value);
  document.getElementById('bsVolMasterVal').textContent=v+'%';
  SFX.setVol(v/100);
}

function toggleBsSfx(){
  const btn=document.getElementById('bsSfxToggle');
  const on=SFX.toggle();
  btn.classList.toggle('on',on);
  const sndBtn=document.getElementById('btnSound');
  if(sndBtn)sndBtn.classList.toggle('active',on);
}

function toggleBsBgm(){
  const on=SFX.bgmToggle();
  document.getElementById('bsBgmToggle').classList.toggle('on',on);
}

function setBsSpeed(mult){
  S.speedMult=mult;S.turbo=mult>1;
  document.getElementById('bsSpeedNorm').classList.toggle('selected',mult===1);
  document.getElementById('bsSpeedTurbo').classList.toggle('selected',mult>1);
  const turboBtn=document.getElementById('btnTurbo');
  if(turboBtn)turboBtn.classList.toggle('active',S.turbo);
}

function setBsAutoSpins(n){
  bsState.autoSpins=n;
  document.querySelectorAll('#bsAutoplay .bs-auto-grid .bs-auto-btn').forEach(b=>{
    b.classList.toggle('selected',parseInt(b.textContent)===n);
  });
}

function updateBsAutoWinStop(){
  const v=parseInt(document.getElementById('bsAutoWinStop').value);
  bsState.autoWinStop=v;
  document.getElementById('bsAutoWinStopVal').textContent=v>0?fmt(v):'OFF';
}

function updateBsAutoBalStop(){
  const v=parseInt(document.getElementById('bsAutoBalStop').value);
  bsState.autoBalStop=v;
  document.getElementById('bsAutoBalStopVal').textContent=v>0?fmt(v):'OFF';
}

function toggleBsAutoFs(){
  bsState.autoFsStop=!bsState.autoFsStop;
  document.getElementById('bsAutoFsStop').classList.toggle('on',bsState.autoFsStop);
}

function startBsAutoplay(){
  if(bsState.autoSpins<=0)return;
  bsState.autoRemaining=bsState.autoSpins;
  S.auto=true;
  document.getElementById('btnAuto').classList.add('active');
  closeBsMenu();
  if(!S.spinning)spin();
}

function checkAutoplayStop(){
  if(!S.auto)return false;
  bsState.autoRemaining--;
  if(bsState.autoRemaining<=0){S.auto=false;document.getElementById('btnAuto').classList.remove('active');return true;}
  if(bsState.autoWinStop>0&&S.spinWin>=bsState.autoWinStop){S.auto=false;document.getElementById('btnAuto').classList.remove('active');return true;}
  if(bsState.autoBalStop>0&&S.bal<=bsState.autoBalStop){S.auto=false;document.getElementById('btnAuto').classList.remove('active');return true;}
  return false;
}

function addHistory(spinNum,bet,win,cascades){
  bsState.history.unshift({n:spinNum,bet:bet,win:win,casc:cascades,time:Date.now()});
  if(bsState.history.length>100)bsState.history.pop();
}

function renderBsHistory(){
  const body=document.getElementById('bsHistoryBody');
  const empty=document.getElementById('bsHistoryEmpty');
  if(bsState.history.length===0){body.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  body.innerHTML=bsState.history.slice(0,50).map(h=>{
    const cls=h.win>0?'win-row':'loss-row';
    return `<tr class="${cls}"><td>${h.n}</td><td>${fmt(h.bet)}</td><td>${h.win>0?'+'+fmt(Math.round(h.win*100)/100):'-'}</td><td>${h.casc}</td></tr>`;
  }).join('');
}

function updateBsStats(){
  const el=id=>document.getElementById(id);
  el('bsStatSpins').textContent=fmt(S.spins);
  el('bsStatHits').textContent=fmt(S.hits);
  el('bsStatWon').textContent=fmt(Math.round(S.won*100)/100);
  el('bsStatWagered').textContent=fmt(Math.round(S.wagered*100)/100);
  el('bsStatMaxWin').textContent=fmt(Math.round(S.maxW*100)/100);
  el('bsStatMaxCasc').textContent=S.maxC;
  el('bsStatRtp').textContent=S.wagered>0?((S.won/S.wagered)*100).toFixed(1)+'%':'0%';
  el('bsStatHitRate').textContent=S.spins>0?((S.hits/S.spins)*100).toFixed(1)+'%':'0%';
}

function buildPaytable(){
  const gridEl=document.getElementById('bsPaytableGrid');
  const rulesEl=document.getElementById('bsPaytableRules');
  gridEl.innerHTML='';

  const symbols=['J','Q','K','A','alieno','astronauta','buco_nero','supernova','antigravita','tesseract'];
  const specialSyms=['buco_nero','supernova','antigravita','tesseract'];
  const symbolNames={J:'Gemma Marrone',Q:'Gemma Blu',K:'Gemma Rossa',A:'Gemma Oro',alieno:'UFO',astronauta:'B',buco_nero:'Buco Nero',supernova:'Supernova',antigravita:'Antigravità',tesseract:'Tesseract'};

  symbols.forEach(sym=>{
    const isSpecial=specialSyms.includes(sym);
    const card=document.createElement('div');
    card.className='paytable-card'+(isSpecial?' pt-special':'');

    const symEl=document.createElement('div');
    symEl.className='pt-sym';
    symEl.innerHTML=renderSymbol(sym);
    card.appendChild(symEl);

    const nameEl=document.createElement('div');
    nameEl.className='pt-name';
    nameEl.textContent=symbolNames[sym];
    card.appendChild(nameEl);

    const paysEl=document.createElement('div');
    paysEl.className='pt-pays';
    const pays=PAYTABLE[sym];
    let payHtml='';
    for(let i=5;i<=12;i++){
      if(pays[i]>0){
        payHtml+=`<span>×${i}: ${pays[i]}x</span>`;
      }
    }
    paysEl.innerHTML=payHtml||'<span>bonus</span>';
    card.appendChild(paysEl);

    gridEl.appendChild(card);
  });

  rulesEl.innerHTML=`
    <h4>Regole di Gioco</h4>
    <div>
      <strong>Cluster (Gruppi):</strong> Minimo 5 simboli adiacenti dello stesso tipo per vincere.<br>
      <strong>Cascata:</strong> Dopo una vincita, i simboli scompaiono e scendono nuovi simboli. Ogni cascata aumenta il moltiplicatore di ×1.<br>
      <strong>Wild:</strong> Sostituisce qualsiasi simbolo standard. Il suo valore di moltiplicazione si applica al cluster.<br>
      <strong>Scatter (Free Spin):</strong> 3+ scattered in qualsiasi posizione attiva 10+ Free Spin con moltiplicatori aumentati.<br>
      <strong>Bonus:</strong> I simboli speciali (Buco Nero, Supernova, Antigravità, Tesseract) attivano meccaniche bonus uniche con win moltiplicati.
    </div>
  `;
}

function updateMultiplierStats(){const el=document.getElementById('multiplierStats');if(!el)return;const counts={};for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const m=S.cellMult[r][c];counts[m]=(counts[m]||0)+1;}let html='';for(let m=1;m<=4;m++){const c=counts[m]||0;html+=`×${m}: ${c}<br>`;}el.innerHTML=html;}

function updDust(amount){
  S.dust=Math.min(S.dustMax,Math.max(0,S.dust+amount));
  const pct=Math.round(S.dust/S.dustMax*100);
  /* Update vertical bar */
  const barFill=document.getElementById('dustBarFill');
  if(barFill)barFill.style.height=pct+'%';
  const barPct=document.getElementById('dustBarPct');
  if(barPct)barPct.textContent=pct+'%';
  const barWrap=document.getElementById('dustBarWrap');
  if(barWrap){if(pct>=100)barWrap.classList.add('dust-bar-full');else barWrap.classList.remove('dust-bar-full');}
  /* Update old gauge too (for stats) */
  const gaugeFill=document.getElementById('dustGaugeFill');
  if(gaugeFill)gaugeFill.style.strokeDashoffset=(100-pct);
  const dustCount=document.getElementById('dustCount');
  if(dustCount)dustCount.textContent=pct;
  const pctEl=document.getElementById('dustPct');if(pctEl)pctEl.textContent=pct+'%';
  const statDust=document.getElementById('statDust');if(statDust)statDust.textContent=pct+'%';
  if(amount>0)SFX.dustGain();
  if(S.dust>=S.dustMax){
    SFX.dustFull();
    dLog('POLVERE COSMICA PIENA! Bonus in arrivo...','win');
    S.dustPending=true;
    /* Se siamo in uno spin attivo (o in bonus feature), rinvia l'animazione
       alla fine dello spin per non sovrapporre le animazioni. Il trigger differito
       viene gestito dentro setGridState('idle'). */
    if(S.spinning||S.freeSpins>0){
      S.dustFullPending=true;
    }else{
      triggerRandomDustBonus();
    }
  }
}
/* Spawn flying dust particles from cell positions to the dust gauge */
function spawnDustParticles(cells,count){
  const gauge=document.getElementById('dustBarFill');
  if(!gauge||!cells||!cells.length)return;
  const gRect=gauge.getBoundingClientRect();
  const gx=gRect.left+gRect.width/2;
  const gy=gRect.top+gRect.height/2;
  const total=Math.min(count||cells.length,12);
  for(let i=0;i<total;i++){
    const ci=i%cells.length;
    const[r,c]=cells[ci];
    const cellEl=document.getElementById(`c${r}_${c}`);
    if(!cellEl)continue;
    const cRect=cellEl.getBoundingClientRect();
    const cx=cRect.left+cRect.width/2;
    const cy=cRect.top+cRect.height/2;
    const p=document.createElement('div');
    p.className='dust-fly';
    p.style.left=cx+'px';p.style.top=cy+'px';
    /* Random size and hue shift */
    const sz=4+Math.random()*4;
    p.style.width=sz+'px';p.style.height=sz+'px';
    document.body.appendChild(p);
    setTimeout(()=>{
      p.classList.add('animate');
      p.style.left=gx+'px';p.style.top=gy+'px';
    },i*60+10);
    setTimeout(()=>{
      p.remove();
      /* Pulse the gauge on arrival */
      gauge.style.filter='brightness(1.4) drop-shadow(0 0 10px rgba(168,85,247,0.6))';
      setTimeout(()=>{gauge.style.filter='';},200);
    },i*60+750);
  }
}

/* ── RANDOM DUST BONUS with cinematic reveal ── */
async function triggerRandomDustBonus(){
  const bonusOptions=[
    {sym:'buco_nero',weight:30,name:'BUCO NERO',color:'#cc44ff',icon:'simboli/buco_nero.png'},
    {sym:'supernova',weight:25,name:'SUPERNOVA',color:'#ffd700',icon:'simboli/supernova.png'},
    {sym:'antigravita',weight:25,name:'ANTIGRAVITÀ',color:'#8b5cf6',icon:'simboli/antigravita.png'},
    {sym:'tesseract',weight:20,name:'TESSERACT',color:'#00ff88',icon:'simboli/tesseract.png'}
  ];
  const totalW=bonusOptions.reduce((s,b)=>s+b.weight,0);
  let rnd=Math.random()*totalW,sum=0,chosen=bonusOptions[0];
  for(const b of bonusOptions){sum+=b.weight;if(rnd<=sum){chosen=b;break;}}

  /* ── Cinematic reveal overlay ── */
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,10,0);z-index:70;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 0.5s,background 0.8s;pointer-events:none;font-family:Orbitron,monospace';
  document.body.appendChild(ov);
  await dly(50);ov.style.opacity='1';ov.style.background='rgba(0,0,10,0.9)';

  /* Phase 1: Cosmic energy build */
  const energyRing=document.createElement('div');
  energyRing.style.cssText='width:120px;height:120px;border-radius:50%;border:3px solid rgba(168,85,247,0.6);box-shadow:0 0 40px rgba(168,85,247,0.4),inset 0 0 30px rgba(168,85,247,0.2);animation:dustRevealSpin 1s linear infinite;position:relative';
  ov.appendChild(energyRing);
  if(SFX.dustFull)SFX.dustFull();
  await dly(1200);

  /* Phase 2: Flash + icon reveal */
  ov.style.background='rgba(255,255,255,0.15)';
  await dly(100);
  ov.style.background='rgba(0,0,10,0.92)';
  energyRing.remove();

  const iconEl=document.createElement('img');
  iconEl.src=chosen.icon;
  iconEl.style.cssText='width:clamp(80px,12vw,140px);height:clamp(80px,12vw,140px);object-fit:contain;filter:drop-shadow(0 0 30px '+chosen.color+') drop-shadow(0 0 60px '+chosen.color+'40);transform:scale(0);transition:transform 0.6s cubic-bezier(0.2,0.8,0.3,1);margin-bottom:16px';
  ov.appendChild(iconEl);
  await dly(50);iconEl.style.transform='scale(1)';
  if(SFX.bonusBuy)SFX.bonusBuy();

  const nameEl=document.createElement('div');
  nameEl.style.cssText='font-size:clamp(20px,3.5vw,38px);font-weight:900;color:'+chosen.color+';text-shadow:0 0 20px '+chosen.color+',0 0 50px '+chosen.color+'60;letter-spacing:4px;opacity:0;transition:opacity 0.4s;margin-top:8px';
  nameEl.textContent=chosen.name;
  ov.appendChild(nameEl);
  await dly(200);nameEl.style.opacity='1';
  await dly(2000);

  /* Phase 3: Fade out */
  ov.style.opacity='0';
  await dly(500);
  ov.remove();

  /* Apply the bonus */
  S.dustChosenBonus=chosen.sym;
  S.dustPending=false;
  S.dust=0;
  updDust(0);
  dLog(`Polvere Cosmica → ${chosen.name}!`,'win');
  /* Trigger the chosen bonus on next spin */
  S.forceExtra=chosen.sym;
  S.bonusSpin=true;
  setTimeout(()=>spin(),600);
}

function chooseDustBonus(sym){
  S.dustChosenBonus=sym;
  S.dustPending=false;
  S.dust=0;
  updDust(0);
  document.getElementById('dustChoiceOverlay').classList.remove('visible');
  dLog(`Bonus scelto dalla polvere: ${sym}`,'win');
  /* Trigger the chosen bonus on next spin */
  S.forceExtra=sym;
  S.bonusSpin=true;
  setTimeout(()=>spin(),600);
}
async function triggerTesseract(){
  setGridStatus('TESSERACT','bonus');
  /* Find tesseract cell */
  let tr=-1,tc=-1;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='tesseract'){tr=r;tc=c;}
  if(tr<0)return;

  /* Flash the tesseract cell */
  const tCell=document.getElementById(`c${tr}_${tc}`);
  tCell.style.transition='all 0.5s';
  tCell.style.boxShadow='0 0 40px rgba(60,120,255,0.8),inset 0 0 30px rgba(40,80,200,0.5)';
  tCell.style.borderColor='rgba(80,140,255,0.9)';
  await dly(800);

  /* Determine 3x3 sub-grid centered on tesseract (clamped to grid bounds) */
  let startR=Math.max(0,Math.min(ROWS-3,tr-1));
  let startC=Math.max(0,Math.min(COLS-3,tc-1));

  /* Coin multipliers — ridotti ×3.5 (era ×5.5) per contenere l'effetto expand+landing (rev. 2026-04-15) */
  const COIN_MULTS=[0.81,1.23,1.61,2.03,2.42,3.22,4.03,4.83,6.44,8.05];
  const MAX_WIN_MULT=201.25; /* rare jackpot coin (57.5×3.5) */
  const MAX_WIN_CHANCE=0.005; /* 0.5% of coins are max win */

  /* Token types: peso expand alzato (7→22) per creare più aspettativa di crescita griglia
     e hype, landing resta basso (0.07) per non esplodere il payout (rev. 2026-04-15). */
  const TOKEN_TYPES=[
    {type:'coin',weight:65,icon:'<img src="simboli/tesseract_gettone.png" style="width:70%;height:70%;object-fit:contain;filter:drop-shadow(0 0 6px rgba(255,215,0,0.6))">',color:'#ffd700'},
    {type:'expand',weight:22,icon:'<img src="simboli/tesseract_expand.png" style="width:70%;height:70%;object-fit:contain;filter:drop-shadow(0 0 6px rgba(0,255,100,0.6))">',color:'#00ff88'},
    {type:'collect',weight:13,icon:'<img src="simboli/tesseract_collect.png" style="width:70%;height:70%;object-fit:contain;filter:drop-shadow(0 0 6px rgba(255,100,255,0.6))">',color:'#ff66ff'}
  ];
  let tessGridFull=false;/* set true when no more expand possible */
  function pickToken(){
    if(S.forceToken){const ft=TOKEN_TYPES.find(t=>t.type===S.forceToken);if(ft){S.forceToken=null;return ft;}}
    const pool=tessGridFull?TOKEN_TYPES.filter(t=>t.type!=='expand'):TOKEN_TYPES;
    const total=pool.reduce((s,t)=>s+t.weight,0);
    let r=Math.random()*total,sum=0;
    for(const t of pool){sum+=t.weight;if(r<sum)return t;}
    return pool[0];
  }

  /* Setup initial 3x3 sub-grid cells */
  let tessCells=[];
  function setupCell(r,c){
    const el=document.getElementById(`c${r}_${c}`);
    /* Se la cella era un wild con moltiplicatore > 1, memorizza il mult per ripristinarlo a fine Tesseract */
    const prevSym=(S.grid[r]&&S.grid[r][c])||null;
    const prevMult=(S.cellMult[r]&&S.cellMult[r][c])||1;
    const preservedWildMult=(prevSym==='wild'&&prevMult>1)?prevMult:0;
    /* FIX bug visivo: rimuovi residui dei wild generati dai bonus (BH/SN/AG) e dai moltiplicatori.
       Senza questo l'immagine wild + badge resterebbero sotto il token Tesseract. */
    el.classList.remove('wild-cell','bh-upgraded','sym-high','sym-low','sym-scatter','mult-2','mult-3','mult-4plus','falling','anti-cluster-hl','scatter-hl','bonus-spawn');
    const oldWildBadge=el.querySelector('.wild-mult-badge');if(oldWildBadge)oldWildBadge.remove();
    const oldMultBadge=el.querySelector('.cell-mult-badge');if(oldMultBadge)oldMultBadge.remove();
    el.classList.add('tess-inline-cell','tess-empty');
    el.querySelector('.sw').innerHTML='';
    const tc={r,c,el,filled:false,value:0,tokenType:null,preservedWildMult};
    tessCells.push(tc);
    return tc;
  }
  for(let r=startR;r<startR+3;r++){
    for(let c=startC;c<startC+3;c++){
      setupCell(r,c);
    }
  }

  /* Use persistent win display ABOVE the grid */
  const totalEl=document.getElementById('spinWinPanel');
  updSpinWinPanel(S.spinWin);

  /* Add spins counter BELOW the sub-grid */
  const counterEl=document.createElement('div');
  counterEl.className='tess-spins-counter';
  counterEl.textContent='SPIN: 3';
  document.getElementById('gridFrame').appendChild(counterEl);

  await dly(600);

  /* ── COIN DROP LOOP ── */
  let spinsLeft=3;
  let tessTotal=0;
  const maxSpins=50;/* safety cap */
  let totalSpinsCount=0;

  while(spinsLeft>0&&totalSpinsCount<maxSpins){
    totalSpinsCount++;
    spinsLeft--;
    counterEl.textContent=`SPIN: ${spinsLeft}`;

    /* Find empty cells */
    const emptyCells=tessCells.filter(tc=>!tc.filled);
    if(emptyCells.length===0)break;

    /* Spin animation on all empty cells — slower for hype */
    for(const tc of emptyCells){
      tc.el.classList.remove('tess-empty');
      tc.el.classList.add('tess-spinning');
      const sw=tc.el.querySelector('.sw');
      tc._spinIv=setInterval(()=>{
        const tok=pickToken();
        if(tok.type==='coin'){
          const prevMult=Math.random()<0.03?MAX_WIN_MULT:COIN_MULTS[Math.floor(Math.random()*COIN_MULTS.length)];
          const rVal=Math.round(S.bet*prevMult*100)/100;
          const prevIsMax=prevMult===MAX_WIN_MULT;
          if(prevIsMax){
            sw.innerHTML=`<div class="tess-inline-coin tess-maxwin"><div class="tess-coin">💎</div><div class="tess-inline-val">${fmt(rVal)}</div></div>`;
          }else{
            sw.innerHTML=`<div class="tess-inline-coin tess-token-coin"><div class="tess-coin">${tok.icon}</div><div class="tess-inline-val">${fmt(rVal)}</div></div>`;
          }
        }else{
          sw.innerHTML=`<div class="tess-inline-coin tess-token-${tok.type}"><div class="tess-coin">${tok.icon}</div></div>`;
        }
      },280);/* very slow spin interval for max hype */
    }
    SFX.tessSpinLoop();
    await dly(1000);/* longer spin duration */

    /* Near-miss dinamici (rev. 2026-04-15): ~18% chance, sceglie il token PIÙ UTILE in quel momento.
       - molti coin non ancora collectati → tease COLLECT
       - grid ancora piccola e landing scarso → tease EXPAND
       - altrimenti → tease MAX WIN coin */
    if(Math.random()<0.18&&emptyCells.length>0){
      const teaseCell=emptyCells[Math.floor(Math.random()*emptyCells.length)];
      clearInterval(teaseCell._spinIv);
      const teaseSw=teaseCell.el.querySelector('.sw');
      /* Scegli il tipo di tease in base al contesto */
      const pendingCoins=tessCells.filter(tc=>tc.filled&&tc.tokenType==='coin'&&tc.value>0).length;
      const pendingCoinsVal=tessCells.filter(tc=>tc.filled&&tc.tokenType==='coin').reduce((s,tc)=>s+(tc.value||0),0);
      let teaseType='maxwin';
      if(pendingCoins>=3&&pendingCoinsVal>S.bet*5)teaseType='collect';
      else if(tessCells.length<=12&&pendingCoins<=1)teaseType='expand';
      SFX.tessNearMiss();
      if(teaseType==='maxwin'){
        const teaseVal=fmt(Math.round(S.bet*MAX_WIN_MULT*100)/100);
        teaseSw.innerHTML=`<div class="tess-inline-coin tess-maxwin"><div class="tess-coin" style="color:#ff4444;font-size:clamp(14px,1.8vw,22px)">💎</div><div class="tess-inline-val" style="color:#ff4444;font-size:clamp(12px,1.5vw,18px)">${teaseVal}</div></div>`;
      }else if(teaseType==='collect'){
        teaseSw.innerHTML=`<div class="tess-inline-coin tess-token-collect"><div class="tess-coin" style="filter:drop-shadow(0 0 10px rgba(255,100,255,0.8))"><img src="simboli/tesseract_collect.png" style="width:100%;height:100%;object-fit:contain"></div></div>`;
      }else{/* expand */
        teaseSw.innerHTML=`<div class="tess-inline-coin tess-token-expand"><div class="tess-coin" style="filter:drop-shadow(0 0 10px rgba(0,255,100,0.8))"><img src="simboli/tesseract_expand.png" style="width:100%;height:100%;object-fit:contain"></div></div>`;
      }
      teaseCell.el.classList.remove('tess-spinning');
      teaseCell.el.style.transition='transform 0.4s ease-out';
      teaseCell.el.style.transform='scale(1.15)';
      teaseCell.el.style.filter='brightness(1.2)';
      await dly(800);/* hold più lungo per enfasi */
      /* Slide via slow */
      teaseSw.style.transition='transform 0.5s ease-in, opacity 0.5s ease-in';
      teaseSw.style.transform='translateY(100%)';
      teaseSw.style.opacity='0';
      await dly(550);
      teaseSw.style.transition='';teaseSw.style.transform='';teaseSw.style.opacity='';
      teaseCell.el.style.transition='';teaseCell.el.style.transform='';teaseCell.el.style.filter='';
      teaseCell.el.classList.add('tess-spinning');
      /* Restart spin on this cell */
      teaseCell._spinIv=setInterval(()=>{
        const tok=pickToken();
        if(tok.type==='coin'){
          const rVal=Math.round(S.bet*COIN_MULTS[Math.floor(Math.random()*COIN_MULTS.length)]*100)/100;
          teaseSw.innerHTML=`<div class="tess-inline-coin tess-token-coin"><div class="tess-coin">${tok.icon}</div><div class="tess-inline-val">${fmt(rVal)}</div></div>`;
        }else{
          teaseSw.innerHTML=`<div class="tess-inline-coin tess-token-${tok.type}"><div class="tess-coin">${tok.icon}</div></div>`;
        }
      },280);
      await dly(600);
    }

    /* Determine which empty cells land a token — resolve one by one, top-left to bottom-right */
    let landed=false;
    const landedTokens=[];
    /* Sort empty cells by row then column (top-left → bottom-right) */
    const sortedEmpty=[...emptyCells].sort((a,b)=>a.r!==b.r?a.r-b.r:a.c-b.c);
    for(const tc of sortedEmpty){
      const hits=S.forceToken?true:(Math.random()<0.07);/* drop rate 0.10→0.07 (rev. 2026-04-15) — sub-grid può crescere ma i drop sono più rari */
      clearInterval(tc._spinIv);

      if(hits){
        const tok=pickToken();
        tc.filled=true;
        tc.tokenType=tok.type;
        landed=true;
        const sw=tc.el.querySelector('.sw');

        if(tok.type==='coin'){
          const isMaxWin=S.forceMaxWin?((S.forceMaxWin=false),true):(Math.random()<MAX_WIN_CHANCE);
          const mult=isMaxWin?MAX_WIN_MULT:COIN_MULTS[Math.floor(Math.random()*COIN_MULTS.length)];
          const coinVal=Math.round(S.bet*mult*100)/100;
          tc.value=coinVal;
          /* NO immediate pay: coin sits on grid, paid once via collect o final tally. */
          if(isMaxWin){
            sw.innerHTML=`<div class="tess-inline-coin tess-maxwin"><div class="tess-coin">💎</div><div class="tess-inline-val">${fmt(coinVal)}</div></div>`;
            dLog(`Tesseract MAX WIN coin: ${fmt(coinVal)}!`,'win');SFX.tessMaxWin();
          }else{
            sw.innerHTML=`<div class="tess-inline-coin tess-token-coin"><div class="tess-coin"><img src="simboli/tesseract_gettone.png" style="width:100%;height:100%;object-fit:contain"></div><div class="tess-inline-val">${fmt(coinVal)}</div></div>`;
            SFX.tessCoinLand(coinVal);
          }
        }else if(tok.type==='expand'){
          tc.value=0;
          sw.innerHTML=`<div class="tess-inline-coin tess-token-expand"><div class="tess-coin"><img src="simboli/tesseract_expand.png" style="width:100%;height:100%;object-fit:contain"></div></div>`;
          SFX.tessExpandLand();landedTokens.push({type:'expand',tc});
        }else if(tok.type==='collect'){
          tc.value=0;
          sw.innerHTML=`<div class="tess-inline-coin tess-token-collect"><div class="tess-coin"><img src="simboli/tesseract_collect.png" style="width:100%;height:100%;object-fit:contain"></div></div>`;
          SFX.tessCollectLand();landedTokens.push({type:'collect',tc});
        }

        tc.el.classList.remove('tess-spinning');
        tc.el.classList.add('tess-glitching');
        setTimeout(()=>{tc.el.classList.remove('tess-glitching');},700);
        tc.el.classList.add('tess-landed');
        tc.el.classList.add(`tess-token-${tok.type}`);
      }else{
        tc.el.querySelector('.sw').innerHTML='';
        tc.el.classList.remove('tess-spinning');
        tc.el.classList.add('tess-empty');
      }
      /* Delay between each cell reveal — rallentato 3× sull'ultimo spin per massimizzare hype (rev. 2026-04-15) */
      const revealStep=spinsLeft<=1?650:220;
      await dly(revealStep);
    }

    /* Process special tokens */
    for(const lt of landedTokens){
      if(lt.type==='collect'){
        /* Collect: absorb all coin-type tokens, sum their values, free those cells */
        let collectSum=0;
        const coinCells=[];
        for(const tc of tessCells){
          if(tc.filled&&tc.tokenType==='coin'&&tc.value>0){
            collectSum+=tc.value;
            coinCells.push(tc);
            tc.el.classList.add('tess-collect-flash');
          }
        }
        if(collectSum>0){
          tessTotal+=collectSum;
          dLog(`Tesseract COLLECT: +${fmt(collectSum)} (assorbiti ${coinCells.length} gettoni)`,'win');SFX.tessCollectAbsorb();
          await dly(500);
          for(const tc of coinCells){
            tc.el.classList.remove('tess-collect-flash');
            tc.el.classList.add('tess-collect-absorb');
          }
          await dly(450);
          for(const tc of coinCells){
            tc.el.classList.remove('tess-collect-absorb','tess-landed');
            tc.el.classList.add('tess-empty');
            tc.el.querySelector('.sw').innerHTML='';
            tc.filled=false;
            tc.value=0;
            tc.tokenType=null;
          }
        }else{
          dLog('Tesseract COLLECT: nessun gettone da raccogliere','info');
        }
        /* Turn collect cell into blocked cell */
        lt.tc.el.classList.remove('tess-landed');
        lt.tc.el.classList.add('tess-blocked');
        lt.tc.el.querySelector('.sw').innerHTML='✕';
        lt.tc.tokenType='blocked';SFX.tessBlocked();
      }else if(lt.type==='expand'){
        /* Expand: add adjacent cells to the sub-grid */
        dLog('Tesseract EXPAND: griglia ampliata!','win');
        const currentSet=new Set(tessCells.map(tc=>`${tc.r},${tc.c}`));
        const newCellCoords=[];
        for(const tc of tessCells){
          for(const[nr,nc]of[[tc.r-1,tc.c],[tc.r+1,tc.c],[tc.r,tc.c-1],[tc.r,tc.c+1]]){
            if(nr<0||nr>=ROWS||nc<0||nc>=COLS)continue;
            const key=`${nr},${nc}`;
            if(!currentSet.has(key)){currentSet.add(key);newCellCoords.push([nr,nc]);}
          }
        }
        /* Add up to 4 new cells (senza cap — cresce naturalmente fino a 49) */
        const shuffledNew=[...newCellCoords].sort(()=>Math.random()-0.5).slice(0,4);
        for(const[nr,nc]of shuffledNew){
          setupCell(nr,nc);
        }
        await dly(300);
        /* Check if grid reached max size (all 49 cells) */
        const allCoords=new Set(tessCells.map(tc=>`${tc.r},${tc.c}`));
        let canExpand=false;
        for(const tc of tessCells){
          for(const[nr,nc]of[[tc.r-1,tc.c],[tc.r+1,tc.c],[tc.r,tc.c-1],[tc.r,tc.c+1]]){
            if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!allCoords.has(`${nr},${nc}`)){canExpand=true;break;}
          }
          if(canExpand)break;
        }
        if(!canExpand)tessGridFull=true;
        /* Turn expand cell into blocked cell */
        lt.tc.el.classList.remove('tess-landed');
        lt.tc.el.classList.add('tess-blocked');
        lt.tc.el.querySelector('.sw').innerHTML='✕';
        lt.tc.tokenType='blocked';SFX.tessBlocked();
      }
    }

    /* If any token landed, reset spins to 3 */
    if(landed){
      spinsLeft=3;
      counterEl.textContent=`SPIN: ${spinsLeft}`;
      counterEl.style.animation='none';
      void counterEl.offsetHeight;
      counterEl.style.animation='tessLand 0.4s ease-out forwards';
      SFX.tessSpinReset();
    }

    /* Update total display: tessTotal (collected) + pending coin values on grid */
    let pending=0;
    for(const tc of tessCells){if(tc.filled&&tc.tokenType==='coin'&&tc.value>0)pending+=tc.value;}
    updSpinWinPanel(S.spinWin+tessTotal+pending);

    /* Check if all filled */
    if(tessCells.every(tc=>tc.filled))break;

    await dly(700);
  }

  /* Final tally: coins rimasti non collectati vengono pagati ora (una sola volta) */
  let remainingCoins=0;
  for(const tc of tessCells){
    if(tc.filled&&tc.tokenType==='coin'&&tc.value>0){remainingCoins+=tc.value;tc.value=0;}
  }
  if(remainingCoins>0){
    tessTotal+=remainingCoins;
    dLog(`Tesseract fine bonus: +${fmt(remainingCoins)} (gettoni residui)`,'win');
  }
  SFX.tessEnd();
  dLog(`Tesseract totale: +${fmt(tessTotal)}`,'win');
  S.spinWin+=tessTotal;
  updSpinWinPanel(S.spinWin);
  await dly(1200);

  /* Cleanup: restore all affected cells.
     Se una cella era un wild con moltiplicatore > 1 prima di essere inglobata dal Tesseract,
     ripristiniamo il wild + mult (non si deve perdere). Altrimenti nuovo simbolo casuale. */
  counterEl.remove();
  tessGridFull=false;
  for(const tc of tessCells){
    tc.el.classList.remove('tess-inline-cell','tess-empty','tess-spinning','tess-landed','tess-collect-flash','tess-blocked','tess-token-coin','tess-token-expand','tess-token-collect','tess-glitching');
    tc.el.style.transition='';tc.el.style.boxShadow='';tc.el.style.borderColor='';
    if(tc._spinIv)clearInterval(tc._spinIv);
    if(tc.preservedWildMult>1){
      S.grid[tc.r][tc.c]='wild';
      S.cellMult[tc.r][tc.c]=tc.preservedWildMult;
    }else{
      S.grid[tc.r][tc.c]=rndSym();
      S.cellMult[tc.r][tc.c]=1;
    }
  }
  renderFullGrid(false);
  await dly(400);
}
async function triggerAntigravita(){
  setGridStatus('ANTIGRAVITÀ','bonus');
  /* Find antigravita cell */
  let ar=-1,ac=-1;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='antigravita'){ar=r;ac=c;}
  if(ar<0)return;

  /* Phase 1: Pulse the antigravita cell */
  const antiCell=document.getElementById(`c${ar}_${ac}`);
  antiCell.classList.add('anti-origin');
  await dly(600);

  /* Phase 2: Count each regular symbol and its positions */
  const symCount={};
  const symPositions={};
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(r===ar&&c===ac)continue;
    const s=S.grid[r][c];
    if(s&&REGULAR_SYMS.includes(s)){
      symCount[s]=(symCount[s]||0)+1;
      if(!symPositions[s])symPositions[s]=[];
      symPositions[s].push([r,c]);
    }
  }

  /* Find highest-value symbol that can form cluster of 5 (including antigravita as wild).
     antigravita counts as 1 wild, so we need at least 4 of a symbol.
     If none has 4, find highest with at least 3 (we convert 1 to reach 4 + antigravita = 5).
     Value order: astronauta > alieno > A > K > Q > J */
  const VALUE_ORDER=['astronauta','alieno','A','K','Q','J'];
  let bestSym=null;
  let clusterSize=5;
  for(const sym of VALUE_ORDER){
    const cnt=symCount[sym]||0;
    if(cnt>=4){bestSym=sym;clusterSize=Math.min(cnt+1,9);break;}/* +1 for antigravita-as-wild */
  }
  if(!bestSym){
    for(const sym of VALUE_ORDER){
      if((symCount[sym]||0)>=3){bestSym=sym;clusterSize=5;break;}
    }
  }
  if(!bestSym){antiCell.classList.remove('anti-origin');return;}

  const available=symCount[bestSym]||0;
  const slotsNeeded=clusterSize-1;/* -1 because antigravita takes center spot as wild */
  const toConvert=Math.max(0,slotsNeeded-available);

  dLog(`Antigravità: attrae ${SYM_NAMES[bestSym]||bestSym} (${available} presenti → cluster ${clusterSize} con wild)`,'win');

  /* Phase 3: Scan animation */
  for(let wave=0;wave<COLS;wave++){
    for(let r=0;r<ROWS;r++){
      document.getElementById(`c${r}_${wave}`).classList.add('anti-scan');
    }
    await dly(80);
    for(let r=0;r<ROWS;r++){
      document.getElementById(`c${r}_${wave}`).classList.remove('anti-scan');
    }
  }

  /* Phase 4: Highlight chosen symbol cells + LEVITATION */
  const targetPositions=symPositions[bestSym];
  for(const[tr,tc]of targetPositions){
    document.getElementById(`c${tr}_${tc}`).classList.add('anti-glow');
  }
  const nameLabel=document.createElement('div');
  nameLabel.className='anti-sym-label';
  nameLabel.textContent=`${SYM_NAMES[bestSym]||bestSym}`;
  antiCell.appendChild(nameLabel);
  await dly(800);
  /* Levitate target symbols one by one */
  for(const[tr,tc]of targetPositions){
    const cell=document.getElementById(`c${tr}_${tc}`);
    cell.classList.add('anti-levitate');
    await dly(100);
  }
  await dly(600);
  /* Float wobble while waiting */
  for(const[tr,tc]of targetPositions){
    const cell=document.getElementById(`c${tr}_${tc}`);
    cell.classList.remove('anti-levitate');
    cell.classList.add('anti-float');
  }
  await dly(900);
  nameLabel.remove();

  /* Phase 5: BFS from antigravita to find cluster zone (antigravita stays at center) */
  const visited=Array.from({length:ROWS},()=>Array(COLS).fill(false));
  const clusterPositions=[];/* includes antigravita position */
  const bfsQueue=[[ar,ac]];
  visited[ar][ac]=true;

  while(bfsQueue.length>0&&clusterPositions.length<clusterSize){
    const[cr,cc]=bfsQueue.shift();
    clusterPositions.push([cr,cc]);
    const neighbors=[[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]];
    neighbors.sort(()=>Math.random()-0.5);
    for(const[nr,nc]of neighbors){
      if(nr<0||nr>=ROWS||nc<0||nc>=COLS||visited[nr][nc])continue;
      visited[nr][nc]=true;
      bfsQueue.push([nr,nc]);
    }
  }

  /* Phase 6: Gravity pull - levitating symbols accelerate toward cluster zone */
  const clusterSet=new Set(clusterPositions.map(([r,c])=>`${r},${c}`));
  /* Non-antigravita slots in cluster that don't have bestSym */
  const needFill=clusterPositions.filter(([r,c])=>!(r===ar&&c===ac)&&S.grid[r][c]!==bestSym);
  /* bestSym cells outside cluster zone */
  const needMove=targetPositions.filter(([r,c])=>!clusterSet.has(`${r},${c}`));

  /* Stop float animation on all target cells before pulling */
  for(const[tr,tc]of targetPositions){
    document.getElementById(`c${tr}_${tc}`).classList.remove('anti-float','anti-levitate');
  }

  const swapCount=Math.min(needFill.length,needMove.length);
  /* Create all flyers first (symbols still floating) */
  const flyers=[];
  for(let i=0;i<swapCount;i++){
    const[fr,fc]=needMove[i];
    const[tr,tc]=needFill[i];
    const fromCell=document.getElementById(`c${fr}_${fc}`);
    const toCell=document.getElementById(`c${tr}_${tc}`);
    const fromRect=fromCell.getBoundingClientRect();
    const toRect=toCell.getBoundingClientRect();
    const flyer=document.createElement('div');
    flyer.className='anti-pull-flyer';
    flyer.innerHTML=renderSymbol(bestSym);
    flyer.style.cssText=`left:${fromRect.left}px;top:${fromRect.top-15}px;width:${fromRect.width}px;height:${fromRect.height}px;border-radius:6px;overflow:hidden;box-shadow:0 0 15px rgba(150,0,255,0.4);`;
    const flyerImg=flyer.querySelector('img');
    if(flyerImg)flyerImg.style.cssText='width:100%;height:100%;object-fit:cover;';
    document.body.appendChild(flyer);
    fromCell.classList.add('anti-fade-out');
    flyers.push({flyer,fromCell,toRect,fr,fc,tr:needFill[i][0],tc:needFill[i][1]});
  }
  await dly(200);
  /* Pull all simultaneously with acceleration (cubic-bezier .55,.06,.68,.19 = ease-in strong) */
  SFX.antigravitaFly();
  for(const f of flyers){
    f.flyer.classList.add('pulling');
    void f.flyer.offsetHeight;
    f.flyer.style.left=f.toRect.left+'px';
    f.flyer.style.top=f.toRect.top+'px';
    f.flyer.style.boxShadow='0 0 30px rgba(150,0,255,0.8)';
    f.flyer.style.transform='scale(0.85)';
  }
  await dly(650);
  /* Swap grid data and cleanup */
  for(const f of flyers){
    const tmpSym=S.grid[f.fr][f.fc];const tmpMult=S.cellMult[f.fr][f.fc];
    S.grid[f.fr][f.fc]=S.grid[f.tr][f.tc];S.cellMult[f.fr][f.fc]=S.cellMult[f.tr][f.tc];
    S.grid[f.tr][f.tc]=tmpSym;S.cellMult[f.tr][f.tc]=tmpMult;
    f.flyer.remove();
    f.fromCell.classList.remove('anti-fade-out','anti-float','anti-levitate');
  }
  await dly(300);

  /* Phase 7: Convert extra cells if needed */
  if(toConvert>0){
    let converted=0;
    for(const[cr,cc]of clusterPositions){
      if(converted>=toConvert)break;
      if(!(cr===ar&&cc===ac)&&S.grid[cr][cc]!==bestSym){
        document.getElementById(`c${cr}_${cc}`).classList.add('anti-convert');
        S.grid[cr][cc]=bestSym;
        S.cellMult[cr][cc]=1;
        converted++;
      }
    }
    await dly(500);
  }

  /* Phase 8: Transform antigravita into WILD (jolly) at center of cluster.
     wildMult = ceil(clusterSize × 0.6), min 2, max 6 — ricalibrato 2026-04-15
     per allineare EV ~20× (era 30×) al costo 20× bet (RTP fair ~100%). */
  SFX.antigravitaWild();
  S.grid[ar][ac]='wild';
  S.cellMult[ar][ac]=Math.max(2,Math.min(6,Math.ceil(clusterSize*0.6)));

  /* Re-render */
  renderFullGrid(false);
  await dly(300);

  /* Phase 9: Highlight the formed cluster */
  for(const[cr,cc]of clusterPositions){
    document.getElementById(`c${cr}_${cc}`).classList.add('anti-cluster-hl');
  }
  /* Mark antigravita cell as wild visually */
  const awCell=document.getElementById(`c${ar}_${ac}`);
  awCell.classList.add('wild-cell');
  await dly(1500);

  /* Cleanup visual classes (grid data stays: wild + bestSym cluster) */
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const cell=document.getElementById(`c${r}_${c}`);
    cell.classList.remove('anti-origin','anti-glow','anti-moving','anti-cluster-hl','anti-scan','anti-fade-out','anti-convert','anti-levitate','anti-float');
  }

  dLog(`Antigravità: cluster ${bestSym} ×${clusterSize} con Wild ×${clusterSize}!`,'win');
  await dly(300);
}

/* ── SCATTER & FREE SPIN ── */
function countScatters(){
  let count=0;
  const positions=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(S.grid[r][c]==='scatter'){count++;positions.push([r,c]);}
  }
  return{count,positions};
}

async function triggerFreeSpins(numSpins){
  /* Announce free spins */
  const announce=document.getElementById('fsAnnounce');
  document.getElementById('fsAnnounceCount').textContent=numSpins;
  announce.classList.add('visible');
  await dly(1500);
  announce.classList.remove('visible');
  await dly(400);

  /* Show free spin banner */
  S.freeSpins=numSpins;
  showToast('Free Spin attivati! ×'+S.freeSpins,'freespin',4000);
  S.freeSpinTotal=0;
  const banner=document.getElementById('fsBanner');
  const fsCountEl=document.getElementById('fsCount');
  banner.classList.add('visible');
  fsCountEl.textContent=S.freeSpins;
  document.getElementById('app').classList.add('free-spin-mode');
  document.getElementById('fsMult').classList.add('visible');

  /* Run free spins with growing multiplier.
     Standard natural trigger: start=1.5 step=+0.7 (avg ~5.35 su 10 spin, EV ~7.9× bet).
     Jackpot (Space Spin): start=8 step=+0.7 (avg ~13.5).
     BOUGHT FS (S.fsBought=true): buyBoost=11.85 applicato a start e step per portare
       EV a ~93.5× bet = RTP 93.5% sul costo 100× del Buy Bonus.
       Non applicato a jackpotMode (spaceSpin ha il suo prezzo). */
  const buyBoost=(S.fsBought&&!S.jackpotMode)?11.85:1;
  let fsMult=(S.jackpotMode?8:1.5)*buyBoost;
  const fsStep=0.7*buyBoost;
  while(S.freeSpins>0){
    S.freeSpins--;
    fsCountEl.textContent=S.freeSpins;
    /* Status panel: Free Spin rimanenti (incluso quello corrente) */
    setGridStatus('FREE SPIN: '+(S.freeSpins+1),'freespin');
    fsMult+=fsStep;/* growing multiplier (matematica invariata) */
    const fsMultEl=document.getElementById('fsMultVal');
    /* Display arrotondato al multiplo di 2 o 5 più vicino (la matematica usa fsMult raw) */
    fsMultEl.textContent='×'+niceMult(fsMult);
    fsMultEl.classList.add('fs-mult-bump');
    /* Color escalation based on multiplier level */
    fsMultEl.classList.remove('mult-low','mult-mid','mult-high');
    if(fsMult>=8)fsMultEl.classList.add('mult-high');
    else if(fsMult>=4)fsMultEl.classList.add('mult-mid');
    else fsMultEl.classList.add('mult-low');
    setTimeout(()=>fsMultEl.classList.remove('fs-mult-bump'),900);
    /* HYPE FS: pausa iniziale focalizzata sul moltiplicatore prima di riempire la griglia */
    await dly(S.speedMult>1?500:750);
    const countdownEl=document.getElementById('fsCountdown');
    countdownEl.textContent=S.freeSpins;
    countdownEl.classList.add('visible');
    setTimeout(()=>countdownEl.classList.remove('visible'),600);
    SFX.freeSpinTick();

    /* Fill grid fresh for each free spin — cascate rallentate per più hype */
    S.extraSpawned=false;
    fillGrid(true);
    await dly(S.speedMult>1?3200:5000);

    /* Check for more scatters during free spins (retrigger) */
    const sc=countScatters();
    if(sc.count>=3){
      const extraFS=sc.count>=5?15:10;
      S.freeSpins+=extraFS;
      fsCountEl.textContent=S.freeSpins;
      dLog(`Retrigger! +${extraFS} free spin!`,'win');
      /* Highlight scatters */
      for(const[sr,scc]of sc.positions){
        document.getElementById(`c${sr}_${scc}`).classList.add('scatter-hl');
      }
      await dly(1500);
      for(const[sr,scc]of sc.positions){
        document.getElementById(`c${sr}_${scc}`).classList.remove('scatter-hl');
      }
      /* Scatters stay in grid as permanent symbols */
      renderFullGrid(false);
    }else{
      /* Scatters stay in grid as permanent symbols */
    }

    /* SUPER BONUS: force one of the chosen extras each free spin */
    if(S.superBonusActive){
      const sbExtras=S.superBonusChosenExtras||['buco_nero','supernova','antigravita','tesseract'];
      const sbSym=sbExtras[Math.floor(Math.random()*sbExtras.length)];
      /* Place it on a random empty cell */
      const emptyCells=[];
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
        if(REGULAR_SYMS.includes(S.grid[r][c]))emptyCells.push([r,c]);
      }
      if(emptyCells.length>0){
        const[er,ec]=emptyCells[Math.floor(Math.random()*emptyCells.length)];
        S.grid[er][ec]=sbSym;
        renderCell(er,ec,false);
        await dly(300);
      }
    }

    /* Check extras (buco_nero, supernova, antigravita, tesseract) */
    let hasBH=false;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='buco_nero')hasBH=true;
    if(hasBH){SFX.bucoNero();await triggerBlackHole();await cascadeGrid();await runFeatureCascadeLoop(fsMult);S.bannedSym=null;S.snSlowCascade=false;}
    let hasSN=false;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='supernova')hasSN=true;
    if(hasSN){SFX.supernova();await triggerSupernova();await cascadeGrid();await runFeatureCascadeLoop(fsMult);}
    let hasAnti=false;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='antigravita')hasAnti=true;
    if(hasAnti){SFX.antigravita();await triggerAntigravita();await cascadeGrid();await runFeatureCascadeLoop(fsMult);}
    let hasTess=false;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='tesseract')hasTess=true;
    if(hasTess){SFX.tesseractOpen();await triggerTesseract();await cascadeGrid();await runFeatureCascadeLoop(fsMult);}

    /* Cascade loop */
    while(true){
      const clusters=findClusters();
      if(!clusters.length)break;
      const basePay=calcPay(clusters);
      /* Space Spin (jackpotMode) applica un multiplier casuale globale estratto all'inizio
         per bilanciare il prezzo 1000×. Memorizzato in S.spaceMult (default 1). */
      const spaceMult=(S.jackpotMode&&S.spaceMult)?S.spaceMult:1;
      const pay=basePay*fsMult*spaceMult;/* Apply growing multiplier + space multiplier */
      clusters.forEach(cl=>{
        cl.cells.forEach(([r,c])=>{S.cellMult[r][c]++;});
        const dv=DUST_VALUES[cl.sym]||0;
        if(dv>0){const cascMult=Math.max(1,S.cascLvl);const symBonus=(cl.sym==='astronauta'?3:cl.sym==='alieno'?2:1);const dustGain=Math.max(1,Math.round(dv*cl.sz*0.5*cascMult*symBonus));updDust(dustGain);dLog(`Polvere +${dustGain} (${cl.sym}${cascMult>1?' ×'+cascMult+'casc':''}${symBonus>1?' ×'+symBonus+'sym':''})`,'info');}
      });
      S.spinWin+=pay;
      S.freeSpinTotal+=pay;
      document.getElementById('winAmount').textContent=fmt(Math.round(S.spinWin*100)/100);
      updSpinWinPanel(S.spinWin);
      {const _swd=document.getElementById('spinWinDisplay');if(_swd)_swd.textContent=fmt(Math.round(S.spinWin*100)/100);};
      dLog(`Free Spin Cascata: +${basePay.toFixed(2)} ×${fsMult} = +${pay.toFixed(2)}`,'casc');
      await highlightWins(clusters);
      await destroyClusters(clusters);
      await cascadeGrid();
      await dly(300);
    }

    /* Clean up wilds/tesseract */
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      if(S.grid[r][c]==='wild'||S.grid[r][c]==='tesseract'){S.grid[r][c]=rndSym();S.cellMult[r][c]=1;}
    }
    renderFullGrid(false);

    await dly(S.turbo?200:400);
  }

  /* Free spins ended */
  banner.classList.remove('visible');
  document.getElementById('app').classList.remove('free-spin-mode');
  document.getElementById('fsMult').classList.remove('visible');
  setGridStatus('SPIN NORMALE','idle');
  S.superBonusActive=false;
  S.jackpotMode=false;
  S.fsBought=false;
  dLog(`Free Spin terminati! Totale: +${fmt(Math.round(S.freeSpinTotal*100)/100)}`,'win');
  if(S.freeSpinTotal>0){
    showWin(`FREE SPIN!\n+${fmt(Math.round(S.freeSpinTotal*100)/100)}`);
    await dly(2000);
  }
}

function initDustParticles(){const container=document.getElementById('dustParticles')||document.getElementById('cosmicDust');if(!container)return;for(let i=0;i<8;i++){const p=document.createElement('div');p.className='dust-particle';p.style.left=Math.random()*90+5+'%';p.style.bottom=Math.random()*30+'%';p.style.animationDelay=Math.random()*3+'s';p.style.animationDuration=(2+Math.random()*2)+'s';container.appendChild(p);}}

function dLog(msg,cls=''){const log=document.getElementById('devLog');const entry=document.createElement('div');entry.className=`dev-log-entry log-${cls}`;entry.textContent=new Date().toLocaleTimeString()+' '+msg;log.insertBefore(entry,log.firstChild);while(log.children.length>100)log.removeChild(log.lastChild);}

function updDev(){document.getElementById('statSpins').textContent=S.spins;document.getElementById('statWagered').textContent=fmt(Math.round(S.wagered*100)/100);document.getElementById('statWon').textContent=fmt(Math.round(S.won*100)/100);document.getElementById('statHits').textContent=S.hits;document.getElementById('statMaxW').textContent=fmt(Math.round(S.maxW*100)/100);document.getElementById('statMaxC').textContent=S.maxC;const avgC=S.spins>0?(S.totC/S.spins).toFixed(2):'0';document.getElementById('statAvgC').textContent=avgC;const rtp=S.wagered>0?((S.won/S.wagered)*100).toFixed(2):'0';document.getElementById('statRTP').textContent=rtp+'%';}

async function highlightWins(clusters){
  /* Add neon border effect (controllable from editor) */
  const useNeon=window._designWinNeon!==0;
  clusters.forEach(cl=>cl.cells.forEach(([r,c])=>{
    const cell=document.getElementById(`c${r}_${c}`);
    cell.classList.add('win-hl','win-burst');
    if(useNeon)cell.classList.add('win-neon');
  }));
  await dly(700);
  clusters.forEach(cl=>cl.cells.forEach(([r,c])=>{
    const cell=document.getElementById(`c${r}_${c}`);
    cell.classList.remove('win-hl','win-neon','win-burst');
    cell.classList.add('win-paid');
  }));
  await dly(200);
}

async function destroyClusters(clusters){const set=new Set();clusters.forEach(cl=>cl.cells.forEach(([r,c])=>set.add(`${r},${c}`)));for(const k of set){const[r,c]=k.split(',').map(Number);/* Wild cells are permanent - don't destroy them */if(S.grid[r][c]==='wild')continue;document.getElementById(`c${r}_${c}`).classList.add('destroying');}await dly(350);for(const k of set){const[r,c]=k.split(',').map(Number);if(S.grid[r][c]==='wild')continue;S.grid[r][c]=null;}}

async function cascadeGrid(){
  /* Step 1: For each column, compute how many rows each symbol needs to drop */
  const animDist=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  const newSyms=[];/* tracks {r,c} for brand new symbols */
  for(let c=0;c<COLS;c++){
    /* Compact the column in data */
    const col=[];const colMults=[];const colOldR=[];
    for(let r=ROWS-1;r>=0;r--){
      if(S.grid[r][c]!==null){col.push(S.grid[r][c]);colMults.push(S.cellMult[r][c]);colOldR.push(r);}
    }
    const emptyCount=ROWS-col.length;
    for(let r=ROWS-1;r>=0;r--){
      const idx=ROWS-1-r;
      if(idx<col.length){
        S.grid[r][c]=col[idx];
        S.cellMult[r][c]=colMults[idx];
        animDist[r][c] = r - colOldR[idx];
      } else {
        S.grid[r][c]=maybeSpawnExtra(r,c);
        S.cellMult[r][c]=1;
        newSyms.push({r,c,dist:emptyCount});
      }
    }
  }

  /* Step 2: Animate existing symbols sliding down */
  const isSlow=S.snSlowCascade;
  const wildPositions=[];
  if(isSlow){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='wild')wildPositions.push([r,c]);}

  /* Apply slide-down transform to cells that need to move */
  for(let c=0;c<COLS;c++){
    for(let r=ROWS-1;r>=0;r--){
      const dist=animDist[r][c];
      if(dist>0){
        const cell=document.getElementById(`c${r}_${c}`);
        const sw=cell.querySelector('.sw');
        /* Instantly offset upward by dist rows (no transition yet) */
        sw.style.transition='none';
        sw.style.transform=`translateY(-${dist*100}%)`;
      }
    }
  }

  /* Render all cells with final data (no anim flag) */
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const cell=document.getElementById(`c${r}_${c}`);
    const k=S.grid[r][c];
    const sw=cell.querySelector('.sw');
    const isNew=newSyms.some(n=>n.r===r&&n.c===c);
    /* For new cells, set them above viewport */
    if(isNew){
      const nd=newSyms.find(n=>n.r===r&&n.c===c);
      sw.innerHTML=renderSymbol(k);
      sw.style.transition='none';
      sw.style.transform=`translateY(-${(nd.dist+r+1)*100}%)`;
    }else{
      sw.innerHTML=renderSymbol(k);
    }
    /* Reset class and re-add badges */
    cell.className='cell';
    const oldBadge=cell.querySelector('.cell-mult-badge');if(oldBadge)oldBadge.remove();
    const oldWild=cell.querySelector('.wild-mult-badge');if(oldWild)oldWild.remove();
    const oldWLabel=cell.querySelector('.wild-label');if(oldWLabel)oldWLabel.remove();
    if(k==='wild'){
      cell.classList.add('wild-cell');
      const wb=document.createElement('div');wb.className='wild-mult-badge';wb.textContent='×'+S.cellMult[r][c];cell.appendChild(wb);
    }else{
      if(k&&(HIGH_SYMS.includes(k)||EXTRA_SYMS.includes(k)))cell.classList.add('sym-high');
      const m=S.cellMult[r][c];
      if(m>=2){if(m===2)cell.classList.add('mult-2');else if(m===3)cell.classList.add('mult-3');else cell.classList.add('mult-4plus');const badge=document.createElement('div');badge.className='cell-mult-badge';badge.textContent='×'+m;cell.appendChild(badge);}
    }
    /* Wild proximity glow for slow cascade */
    if(isSlow&&(isNew||animDist[r][c]>0)){
      for(const[wr,wc]of wildPositions){
        const d=Math.abs(r-wr)+Math.abs(c-wc);
        if(d<=2){cell.classList.add('sn-wild-proximity');cell.style.setProperty('--prox-intensity',d===1?'1':'0.5');break;}
      }
    }
  }

  /* Allow overflow on cells and grid so sliding is visible */
  const gridEl=document.getElementById('grid');
  const gridFrame=document.getElementById('gridFrame');
  gridEl.style.overflow='visible';
  gridFrame.style.overflow='visible';
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    document.getElementById(`c${r}_${c}`).style.overflow='visible';
  }

  /* Force reflow then animate to translateY(0) with bounce physics */
  void document.body.offsetHeight;

  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const cell=document.getElementById(`c${r}_${c}`);
    const sw=cell.querySelector('.sw');
    const dist=animDist[r][c];
    const isNew=newSyms.some(n=>n.r===r&&n.c===c);
    if(dist>0||isNew){
      const dur=isSlow?(0.75+(r*0.04)):(0.3+(r*0.015));
      const del=isSlow?(c*0.08):(c*0.012);
      /* Bounce easing: overshoot then settle */
      sw.style.transition=`transform ${dur}s cubic-bezier(.22,1.2,.36,1) ${del}s`;
      sw.style.transform='translateY(0)';
      /* Add a squash-stretch micro-animation on land */
      const totalDelay=(del+dur)*1000;
      setTimeout(()=>{
        sw.style.transition='transform 0.08s cubic-bezier(.36,.07,.19,.97)';
        sw.style.transform='translateY(0) scaleY(0.92) scaleX(1.06)';
        setTimeout(()=>{
          sw.style.transition='transform 0.06s cubic-bezier(.36,.07,.19,.97)';
          sw.style.transform='translateY(0) scaleY(1.04) scaleX(0.97)';
          setTimeout(()=>{
            sw.style.transition='transform 0.05s ease-out';
            sw.style.transform='translateY(0) scaleY(1) scaleX(1)';
          },60);
        },80);
      },totalDelay-80);
    }
  }

  /* Wait for cascade + bounce animation to complete */
  const waitTime=isSlow?1100:(window._designCascadeWait||650);
  await dly(waitTime);

  /* Restore overflow and clean up */
  gridEl.style.overflow='';
  gridFrame.style.overflow='';
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const cell=document.getElementById(`c${r}_${c}`);
    cell.style.overflow='';
    const sw=cell.querySelector('.sw');
    sw.style.transition='';
    sw.style.transform='';
    cell.classList.remove('sn-wild-proximity');
    cell.style.removeProperty('--prox-intensity');
  }
}

function maybeSpawnExtra(r,c){if(!S.extraSpawned&&Math.random()<(S.extraDropRate/100)/(ROWS*COLS)){const sym=pickExtraSymbol();if(sym){S.extraSpawned=true;return sym;}}return rndSym();}

function genForceWin(){S.grid=[];S.cellMult=[];for(let r=0;r<ROWS;r++){S.grid[r]=[];S.cellMult[r]=[];for(let c=0;c<COLS;c++){S.grid[r][c]=null;S.cellMult[r][c]=1;}}for(let i=0;i<9;i++){const r=Math.floor(Math.random()*ROWS);const c=Math.floor(Math.random()*COLS);S.grid[r][c]='alieno';}for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(S.grid[r][c]===null)S.grid[r][c]=rndSym();}renderFullGrid(true);}


function genForcedBlackHole(){S.grid=[];S.cellMult=[];for(let r=0;r<ROWS;r++){S.grid[r]=[];S.cellMult[r]=[];for(let c=0;c<COLS;c++){S.grid[r][c]=null;S.cellMult[r][c]=1;}}const cr=Math.floor(ROWS/2),cc=Math.floor(COLS/2);S.grid[cr][cc]='buco_nero';for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(S.grid[r][c]===null)S.grid[r][c]=rndSym();}renderFullGrid(true);}

const UPGRADE_MAP={J:'Q',Q:'K',K:'A',A:'alieno',alieno:'astronauta'};
const SYM_NAMES={J:'Gemma Marrone',Q:'Gemma Blu',K:'Gemma Rossa',A:'Gemma Oro',alieno:'UFO',astronauta:'Astronauta'};
const BH_UPGRADE_SYMS=['J','Q','K','A','alieno'];
const BH_UPGRADE_WEIGHTS={J:35,Q:28,K:22,A:12,alieno:3};

function bhWeightedPick(){
  const total=BH_UPGRADE_SYMS.reduce((s,sym)=>s+BH_UPGRADE_WEIGHTS[sym],0);
  let r=Math.random()*total,sum=0;
  for(let i=0;i<BH_UPGRADE_SYMS.length;i++){
    sum+=BH_UPGRADE_WEIGHTS[BH_UPGRADE_SYMS[i]];
    if(r<sum)return i;
  }
  return 0;
}

async function triggerBlackHole(){
  setGridStatus('BUCO NERO','bonus');
  const bhCells=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='buco_nero')bhCells.push([r,c]);
  if(bhCells.length===0)return;
  const[bhR,bhC]=bhCells[0];
  const bhCell=document.getElementById(`c${bhR}_${bhC}`);

  /* Phase 1: Buco Nero pulses intensely */
  bhCell.classList.add('blackhole-origin');
  SFX.bucoNero();
  await dly(600);

  /* Phase 2: Find which regular symbols are on the grid */
  const symCount={};
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const s=S.grid[r][c];
    if(s&&REGULAR_SYMS.includes(s)){symCount[s]=(symCount[s]||0)+1;}
  }
  const presentSyms=REGULAR_SYMS.filter(s=>symCount[s]>0);
  if(presentSyms.length===0){bhCell.classList.remove('blackhole-origin');return;}

  /* Determine target: simbolo PIÙ COMUNE sulla griglia (garantisce removedCount alto
     e wild ×N di impatto; prima era random e poteva rimuovere anche solo 1 cella). */
  presentSyms.sort((a,b)=>symCount[b]-symCount[a]);
  const targetSym=presentSyms[0];
  const chosenIdx=0;

  /* Phase 3: Grid-based roulette - highlight all cells of each symbol type in turn */
  /* Build map of cells per symbol type */
  const symCellsMap={};
  for(const sym of presentSyms)symCellsMap[sym]=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const s=S.grid[r][c];
    if(s&&symCellsMap[s])symCellsMap[s].push([r,c]);
  }

  /* Cinematic Roulette: cycle through symbol types with dramatic slowdown */
  const totalCycles=5;
  const totalSteps=totalCycles*presentSyms.length+chosenIdx;
  let currentType=-1;
  let prevCells=[];

  for(let step=0;step<=totalSteps;step++){
    /* Remove previous highlight */
    for(const[pr,pc]of prevCells){
      document.getElementById(`c${pr}_${pc}`).classList.remove('sn-reveal');
    }
    currentType=(currentType+1)%presentSyms.length;
    const litSym=presentSyms[currentType];
    const litCells=symCellsMap[litSym]||[];
    /* Add highlight to all cells of this symbol type */
    for(const[lr,lc]of litCells){
      document.getElementById(`c${lr}_${lc}`).classList.add('sn-reveal');
    }
    prevCells=litCells;
    /* Cinematic easing: fast start → dramatic deceleration at end */
    const progress=step/totalSteps;
    const remaining=totalSteps-step;
    let delay;
    if(remaining<=3){
      /* Final 3 steps: very dramatic pauses with increasing suspense */
      delay=remaining===0?0:remaining===1?800:remaining===2?600:500;
    }else if(remaining<=6){
      /* Near-final: heavy slowdown */
      delay=250+Math.pow(1-remaining/6,2)*350;
    }else{
      /* Normal acceleration curve */
      delay=45+Math.pow(progress,2.5)*300;
    }
    await dly(delay);
  }

  /* Phase 4: Lock — dramatic pause then reveal with golden flash */
  await dly(600);
  for(const[pr,pc]of prevCells){
    const el=document.getElementById(`c${pr}_${pc}`);
    el.classList.remove('sn-reveal');
    el.classList.add('sn-suspense-dim');
  }
  await dly(300);
  for(const[pr,pc]of prevCells){
    document.getElementById(`c${pr}_${pc}`).classList.remove('sn-suspense-dim');
  }

  const targetCells=symCellsMap[targetSym]||[];
  for(const[tr,tc]of targetCells){
    document.getElementById(`c${tr}_${tc}`).classList.add('sn-reveal');
  }
  await dly(1400);

  /* Phase 5: Multi-wave shockwave burst with cell shake */
  const rect=bhCell.getBoundingClientRect();
  const cx=rect.left+rect.width/2;
  const cy=rect.top+rect.height/2;
  /* Screen flash */
  const flash=document.createElement('div');
  flash.className='sn-screen-flash';
  document.body.appendChild(flash);
  setTimeout(()=>flash.remove(),700);
  /* 3 shockwave rings */
  const waves=[];
  for(let w=0;w<3;w++){
    const wave=document.createElement('div');
    wave.className='sn-shockwave'+(w===1?' wave2':w===2?' wave3':'');
    wave.style.left=cx+'px';
    wave.style.top=cy+'px';
    document.body.appendChild(wave);
    waves.push(wave);
  }
  /* Radial cell shake: cells shake based on distance from buco_nero */
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(r===bhR&&c===bhC)continue;
    const dist=Math.abs(r-bhR)+Math.abs(c-bhC);
    const cell=document.getElementById(`c${r}_${c}`);
    setTimeout(()=>{cell.classList.add('sn-shake');setTimeout(()=>cell.classList.remove('sn-shake'),450);},dist*60);
  }
  await dly(500);

  /* Phase 6: Shine then vanish */
  for(const[tr,tc]of targetCells){
    const cell=document.getElementById(`c${tr}_${tc}`);
    cell.classList.remove('sn-reveal');
    cell.classList.add('sn-target');
  }
  await dly(1500);
  waves.forEach(w=>w.remove());

  /* Phase 7: Remove vanished symbols */
  const removedCount=targetCells.length;
  /* Floor wild multiplier: min ×4 anche se removedCount è basso, così il wild
     è sempre percepito come boost. Max capping tenuto su removedCount reale. */
  const wildMult=Math.max(4,removedCount);
  for(const[tr,tc]of targetCells){
    S.grid[tr][tc]=null;
    const cell=document.getElementById(`c${tr}_${tc}`);
    cell.classList.remove('sn-target');
    cell.querySelector('.sw').innerHTML='';
  }

  /* Phase 8: Transform buco_nero into WILD */
  S.grid[bhR][bhC]='wild';
  S.cellMult[bhR][bhC]=wildMult;
  bhCell.classList.remove('blackhole-origin');
  bhCell.className='cell wild-cell';
  const sw=bhCell.querySelector('.sw');
  sw.innerHTML=renderSymbol('wild');
  const multBadge=document.createElement('div');
  multBadge.className='wild-mult-badge';
  multBadge.textContent='×'+wildMult;
  bhCell.appendChild(multBadge);

  /* Phase 9: Big central multiplier display */
  const multOverlay=document.getElementById('snMultOverlay');
  const multText=document.getElementById('snMultText');
  multText.textContent='×'+wildMult;
  multText.style.animation='none';
  void multText.offsetHeight;
  multText.style.animation='snMultAppear 0.6s cubic-bezier(.34,1.56,.64,1) forwards';
  multOverlay.classList.add('visible');
  await dly(2200);
  multOverlay.classList.remove('visible');
  await dly(500);
  multText.textContent='';
  multText.style.animation='none';

  /* Set banned symbol so it won't fall during cascade */
  S.bannedSym=targetSym;
  S.snSlowCascade=true;

  dLog(`Buco Nero: rimossi ${removedCount} ${SYM_NAMES[targetSym]||targetSym} → Wild ×${wildMult}`,'win');
  await dly(300);
}

async function triggerSupernova(){
  setGridStatus('SUPERNOVA','bonus');
  /* Find the single central supernova */
  const snCells=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='supernova')snCells.push([r,c]);
  if(snCells.length===0)return;

  /* Supernova — no cost (RTP balanced via paytable scaling) */
  dLog(`Supernova attivato!`,'info');

  /* Phase 1: Pulse the single central supernova */
  const[snR,snC]=snCells[0];
  const snCell=document.getElementById(`c${snR}_${snC}`);
  snCell.classList.add('sn-origin');
  await dly(600);

  /* Phase 2: Expand sn into overlay */
  const gridEl=document.querySelector('.grid-frame');
  const cellRect=snCell.getBoundingClientRect();
  const gridRect=gridEl.getBoundingClientRect();
  const centerX=gridRect.left+gridRect.width/2-cellRect.width/2;
  const centerY=gridRect.top+gridRect.height/2-cellRect.height/2;

  const flyer=document.createElement('div');
  flyer.className='bh-flying';
  flyer.style.width=cellRect.width+'px';
  flyer.style.height=cellRect.height+'px';
  flyer.style.left=cellRect.left+'px';
  flyer.style.top=cellRect.top+'px';
  flyer.innerHTML=renderSymbol('supernova');
  const flyerImg=flyer.querySelector('img');
  if(flyerImg)flyerImg.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:50%;';
  document.body.appendChild(flyer);

  snCell.querySelector('.sw').style.opacity='0';
  snCell.classList.remove('sn-origin');

  await dly(30);
  flyer.style.left=centerX+'px';
  flyer.style.top=centerY+'px';
  flyer.style.width=(cellRect.width*1.6)+'px';
  flyer.style.height=(cellRect.height*1.6)+'px';
  flyer.style.boxShadow='0 0 50px rgba(150,0,255,0.8),0 0 100px rgba(100,0,200,0.4)';
  await dly(1400);

  flyer.style.opacity='0';
  flyer.style.transform='scale(2)';
  flyer.style.transition='all 0.4s ease-in';

  const overlay=document.getElementById('bhOverlay');
  const optionsDiv=document.getElementById('bhOptions');
  const resultLabel=document.getElementById('bhResult');
  const vortexIcon=document.getElementById('bhVortexIcon');
  /* FIX 2026-04-15: riuso dello stesso overlay del Buco Nero ma con titolo SUPERNOVA */
  const titleEl=document.getElementById('bhTitle');
  const subtitleEl=document.getElementById('bhSubtitle');
  if(titleEl)titleEl.textContent='SUPERNOVA';
  if(subtitleEl)subtitleEl.textContent='Esplosione cosmica: simbolo da potenziare';
  optionsDiv.innerHTML='';
  resultLabel.textContent='';
  resultLabel.classList.remove('visible');
  vortexIcon.innerHTML=renderSymbol('supernova');

  overlay.classList.add('visible');
  await dly(500);
  flyer.remove();

  /* Phase 3: Build option cards - 5 symbols including alieno */
  const optEls=[];
  for(const sym of BH_UPGRADE_SYMS){
    const el=document.createElement('div');
    el.className='bh-option';
    el.innerHTML=renderSymbol(sym)+'<div class="bh-sym-label">'+(SYM_NAMES[sym]||sym)+'</div>';
    el.dataset.sym=sym;
    optionsDiv.appendChild(el);
    optEls.push(el);
  }
  await dly(300);

  /* Phase 4: Roulette with RTP-weighted result */
  const chosenIdx=bhWeightedPick();
  const totalCycles=4;
  const totalSteps=totalCycles*BH_UPGRADE_SYMS.length+chosenIdx;
  let current=-1;

  for(let step=0;step<=totalSteps;step++){
    current=(current+1)%BH_UPGRADE_SYMS.length;
    optEls.forEach((el,i)=>{
      el.classList.toggle('bh-lit',i===current);
    });
    const progress=step/totalSteps;
    const delay=50+Math.pow(progress,3)*450;
    await dly(delay);
  }

  /* Phase 5: Lock chosen symbol */
  optEls[chosenIdx].classList.remove('bh-lit');
  optEls[chosenIdx].classList.add('bh-chosen');
  const chosenSym=BH_UPGRADE_SYMS[chosenIdx];
  const upgradedTo=UPGRADE_MAP[chosenSym];

  await dly(600);
  resultLabel.innerHTML=`<span style="color:#cc44ff">${SYM_NAMES[chosenSym]}</span> &#10140; <span style="color:#ffd700">${SYM_NAMES[upgradedTo]}</span>`;
  resultLabel.classList.add('visible');
  await dly(750);

  /* Phase 6: Close overlay */
  overlay.classList.remove('visible');
  await dly(500);

  /* Phase 7: SUCTION ANIMATION - chosen symbols get sucked toward the supernova center */
  const suctionCells=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(S.grid[r][c]===chosenSym) suctionCells.push([r,c]);
  }

  if(suctionCells.length>0){
    /* Create flying clones that get sucked to center */
    const flyClones=[];
    for(const[sr,sc] of suctionCells){
      const srcCell=document.getElementById(`c${sr}_${sc}`);
      const srcRect=srcCell.getBoundingClientRect();
      const clone=document.createElement('div');
      clone.className='bh-suction-clone';
      clone.style.width=srcRect.width+'px';
      clone.style.height=srcRect.height+'px';
      clone.style.left=srcRect.left+'px';
      clone.style.top=srcRect.top+'px';
      clone.innerHTML=renderSymbol(chosenSym);
      const cImg=clone.querySelector('img');
      if(cImg)cImg.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:8px;';
      document.body.appendChild(clone);
      flyClones.push(clone);
      /* Hide original cell content */
      srcCell.querySelector('.sw').style.opacity='0';
    }

    /* Pulse the supernova center as attractor */
    snCell.classList.add('sn-origin');
    snCell.querySelector('.sw').style.opacity='1';
    snCell.querySelector('.sw').innerHTML=renderSymbol('supernova');

    await dly(200);

    /* Animate all clones toward supernova center with spiral suction */
    const snNewRect=snCell.getBoundingClientRect();
    const targetX=snNewRect.left+snNewRect.width/2;
    const targetY=snNewRect.top+snNewRect.height/2;

    for(const clone of flyClones){
      const cloneRect=clone.getBoundingClientRect();
      const cloneCX=cloneRect.left+cloneRect.width/2;
      const cloneCY=cloneRect.top+cloneRect.height/2;
      clone.style.setProperty('--suction-tx',(targetX-cloneCX)+'px');
      clone.style.setProperty('--suction-ty',(targetY-cloneCY)+'px');
      clone.classList.add('bh-sucking');
    }

    /* Wait for suction animation to complete */
    await dly(1200);

    /* Remove clones */
    for(const clone of flyClones) clone.remove();
    snCell.classList.remove('sn-origin');

    /* Flash supernova on each absorbed symbol */
    snCell.classList.add('bh-absorb-flash');
    await dly(400);
    snCell.classList.remove('bh-absorb-flash');

    /* Phase 8: Replace sucked symbols with upgraded versions */
    for(const[sr,sc] of suctionCells){
      S.grid[sr][sc]=upgradedTo;
    }

    /* Staggered reveal of upgraded symbols */
    for(let i=0;i<suctionCells.length;i++){
      const[ur,uc]=suctionCells[i];
      const cell=document.getElementById(`c${ur}_${uc}`);
      const sw=cell.querySelector('.sw');
      sw.innerHTML=renderSymbol(upgradedTo);
      sw.style.opacity='1';
      cell.classList.add('bh-upgraded');
      await dly(80);
    }

    dLog(`Supernova: ${SYM_NAMES[chosenSym]} → ${SYM_NAMES[upgradedTo]} (${suctionCells.length} celle)`,'win');
    await dly(900);
    for(const[ur,uc]of suctionCells)document.getElementById(`c${ur}_${uc}`).classList.remove('bh-upgraded');
  }

  /* Phase 9: Supernova becomes a Wild with fixed multiplier 2x-5x */
  const snWildMult=[2,3,4,5][Math.floor(Math.random()*4)];
  for(const[sr,sc]of snCells){
    S.grid[sr][sc]='wild';
    S.cellMult[sr][sc]=snWildMult;
    const c2=document.getElementById(`c${sr}_${sc}`);
    const sw2=c2.querySelector('.sw');
    sw2.innerHTML=renderSymbol('wild');
    sw2.style.opacity='1';
    c2.className='cell wild-cell';
    /* Wild mult badge */
    const wb=document.createElement('div');wb.className='wild-mult-badge';wb.textContent='×'+snWildMult;c2.appendChild(wb);
    /* Flash animation */
    c2.classList.add('bh-upgraded');
    c2.style.boxShadow='inset 0 0 30px rgba(255,215,0,0.8), 0 0 50px rgba(255,215,0,0.5)';
  }
  dLog(`Supernova → WILD ×${snWildMult}!`,'win');
  await dly(1200);
  for(const[sr,sc]of snCells){
    const c2=document.getElementById(`c${sr}_${sc}`);
    c2.classList.remove('bh-upgraded');
    c2.style.boxShadow='';
  }
}

/* ── FEATURE CASCADE LOOP — pays clusters immediately after each feature activation ── */
async function runFeatureCascadeLoop(fsMult){
  fsMult=fsMult||1;
  while(true){
    const clusters=findClusters();
    if(!clusters.length)break;
    const basePay=calcPay(clusters);
    const pay=basePay*fsMult;
    S.spinWin+=pay;
    if(fsMult>1)S.freeSpinTotal+=pay;
    clusters.forEach(cl=>{
      cl.cells.forEach(([r,c])=>{S.cellMult[r][c]++;});
      const dv=DUST_VALUES[cl.sym]||0;
      if(dv>0){
        const cascMult=Math.max(1,S.cascLvl);
        const symBonus=(cl.sym==='astronauta'?3:cl.sym==='alieno'?2:1);
        const dustGain=Math.max(1,Math.round(dv*cl.sz*0.5*cascMult*symBonus));
        if(typeof spawnDustParticles==='function')spawnDustParticles(cl.cells,Math.min(dustGain,8));
        updDust(dustGain);
        dLog(`Polvere +${dustGain} (${cl.sym}${cascMult>1?' ×'+cascMult+'casc':''}${symBonus>1?' ×'+symBonus+'sym':''})`,'info');
      }
    });
    document.getElementById('winAmount').textContent=fmt(Math.round(S.spinWin*100)/100);
    document.getElementById('winAmount').parentElement.classList.add('win-counting');
    updSpinWinPanel(S.spinWin);
    document.getElementById('cascadeOverlay').textContent='Cascata '+(S.cascLvl+1);
    document.getElementById('cascadeOverlay').classList.add('visible');
    const cnEl=document.getElementById('cascadeNum');
    if(cnEl)cnEl.textContent=S.cascLvl+1;
    {const _swd=document.getElementById('spinWinDisplay');if(_swd)_swd.textContent=fmt(Math.round(S.spinWin*100)/100);}
    if(typeof updateMultiplierStats==='function')updateMultiplierStats();
    dLog('Cascata '+(S.cascLvl+1)+': +'+pay.toFixed(2),'casc');
    SFX.cascadeStart(S.cascLvl);
    if(typeof triggerBgFlash==='function')triggerBgFlash('cascade-flash');
    SFX.clusterWin(clusters.reduce((s,c)=>s+c.sz,0));
    await highlightWins(clusters);
    await destroyClusters(clusters);
    await cascadeGrid();
    S.cascLvl++;
    showToast('Cascata Livello '+S.cascLvl+'!','cascade',2500);
    await dly(150);
  }
}

function genForceExtra(sym){S.grid=[];S.cellMult=[];for(let r=0;r<ROWS;r++){S.grid[r]=[];S.cellMult[r]=[];for(let c=0;c<COLS;c++){S.grid[r][c]=null;S.cellMult[r][c]=1;}}let er,ec;if(sym==='buco_nero'||sym==='tesseract'){er=Math.floor(ROWS/2);ec=Math.floor(COLS/2);}else{er=Math.floor(Math.random()*ROWS);ec=Math.floor(Math.random()*COLS);}S.grid[er][ec]=sym;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(S.grid[r][c]===null)S.grid[r][c]=rndSym();}S.extraSpawned=true;renderFullGrid(true);}

async function spin(){if(S.spinning)return;const ripple=document.createElement('div');ripple.className='spin-ripple';document.getElementById('spinBtn').appendChild(ripple);setTimeout(()=>ripple.remove(),800);if(S.spinMagg>0)SFX.spinMagg();else SFX.spinStart();const tb=S.bet;const isBonusSpin=S.bonusSpin;S.bonusSpin=false;const maggiMult=S.spinMagg>0?S.spinMagg:1;const realCost=Math.round(tb*maggiMult*100)/100;if(!isBonusSpin&&S.bal<realCost){showWin('CREDITO\nINSUFFICIENTE');setTimeout(hideWin,1500);S.spinMagg=0;return;}S.spinning=true;document.getElementById('spinBtn').classList.add('is-spinning');S.spinWin=0;S.cascLvl=0;setGridState('spinning');document.getElementById('spinBtn').disabled=true;document.getElementById('winAmount').textContent='0';updSpinWinPanel(0);hideWin();document.getElementById('cascadeOverlay').classList.remove('visible');if(!isBonusSpin){S.bal-=realCost;S.wagered+=realCost;}/* Spin maggiorato: increase bonus/scatter chance */if(S.spinMagg>0&&!S.forceExtra&&!S.forceScatter){const bInfo=BOOST_MULTS.find(b=>b.mult===S.activeBoostMult);const bonusChance=bInfo?bInfo.bonusChance:0.15;if(Math.random()<bonusChance){const bonuses=['buco_nero','supernova','antigravita','tesseract'];S.forceExtra=bonuses[Math.floor(Math.random()*bonuses.length)];}}S.spinMagg=0;S.activeBoostMult=0;S.spins++;updBal();updateBoostPanel();if(S.gridPreloaded){S.gridPreloaded=false;shuffleReveal();}else if(S.forceBH){genForcedBlackHole();S.forceBH=false;}else if(S.forceW){genForceWin();S.forceW=false;}else if(S.forceExtra){genForceExtra(S.forceExtra);S.forceExtra=null;}else{fillGrid(true);}await dly(S.speedMult>1?2200:3500);/* Check scatters */const scRes=countScatters();if(scRes.count>=3){for(const[sr,sc]of scRes.positions){document.getElementById(`c${sr}_${sc}`).classList.add('scatter-hl');}await dly(800);for(const[sr,sc]of scRes.positions){document.getElementById(`c${sr}_${sc}`).classList.remove('scatter-hl');}renderFullGrid(false);const fsCount=scRes.count>=5?15:10;SFX.freeSpinStart();await triggerFreeSpins(fsCount);}else{/* Scatters stay in grid as permanent symbols */}let hasBH=false;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='buco_nero')hasBH=true;if(hasBH){setGridState('bonus');SFX.bucoNero();showToast('Bonus Attivato!','bonus',3500);await triggerBlackHole();await cascadeGrid();await runFeatureCascadeLoop();S.bannedSym=null;S.snSlowCascade=false;}let hasSN=false;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='supernova')hasSN=true;if(hasSN){setGridState('bonus');SFX.supernova();await triggerSupernova();await cascadeGrid();await runFeatureCascadeLoop();}let hasAnti=false;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='antigravita')hasAnti=true;if(hasAnti){setGridState('bonus');SFX.antigravita();await triggerAntigravita();await cascadeGrid();await runFeatureCascadeLoop();}let hasTess=false;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(S.grid[r][c]==='tesseract')hasTess=true;if(hasTess){setGridState('bonus');SFX.tesseractOpen();await triggerTesseract();await cascadeGrid();await runFeatureCascadeLoop();}while(true){const clusters=findClusters();if(!clusters.length)break;const pay=calcPay(clusters);S.spinWin+=pay;clusters.forEach(cl=>{cl.cells.forEach(([r,c])=>{S.cellMult[r][c]++;});const dv=DUST_VALUES[cl.sym]||0;if(dv>0){const cascMult=Math.max(1,S.cascLvl);const symBonus=(cl.sym==='astronauta'?3:cl.sym==='alieno'?2:1);const dustGain=Math.max(1,Math.round(dv*cl.sz*0.5*cascMult*symBonus));spawnDustParticles(cl.cells,Math.min(dustGain,8));updDust(dustGain);dLog(`Polvere +${dustGain} (${cl.sym}${cascMult>1?' ×'+cascMult+'casc':''}${symBonus>1?' ×'+symBonus+'sym':''})`,'info');}});document.getElementById('winAmount').textContent=fmt(Math.round(S.spinWin*100)/100);document.getElementById('winAmount').parentElement.classList.add('win-counting');updSpinWinPanel(S.spinWin);document.getElementById('cascadeOverlay').textContent=`Cascata ${S.cascLvl+1}`;document.getElementById('cascadeOverlay').classList.add('visible');const cnEl=document.getElementById('cascadeNum');if(cnEl)cnEl.textContent=S.cascLvl+1;{const _swd=document.getElementById('spinWinDisplay');if(_swd)_swd.textContent=fmt(Math.round(S.spinWin*100)/100);};updateMultiplierStats();dLog(`Cascata ${S.cascLvl+1}: +${pay.toFixed(2)}`,'casc');SFX.cascadeStart(S.cascLvl);triggerBgFlash('cascade-flash');SFX.clusterWin(clusters.reduce((s,c)=>s+c.sz,0));await highlightWins(clusters);await destroyClusters(clusters);await cascadeGrid();S.cascLvl++;showToast('Cascata Livello '+S.cascLvl+'!','cascade',2500);await dly(150);}/* Clean up any wild/tesseract cells remaining after cascades */for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(S.grid[r][c]==='wild'||S.grid[r][c]==='tesseract'){S.grid[r][c]=rndSym();S.cellMult[r][c]=1;}}renderFullGrid(false);document.getElementById('cascadeOverlay').classList.remove('visible');if(S.spinWin>0){S.bal+=S.spinWin;S.won+=S.spinWin;S.hits++;if(S.spinWin>S.maxW)S.maxW=S.spinWin;updBal();const wr=S.spinWin/tb;setGridState('winning');spawnWinCoins(document.getElementById('winAmount'),Math.min(Math.ceil(wr),15));if(wr>=50){SFX.megaWin();showBigWinPopup('MEGA WIN!',S.spinWin);triggerBgFlash('mega-flash');triggerBgShift('mega');}else if(wr>=20){SFX.bigWin();showBigWinPopup('BIG WIN!',S.spinWin);triggerBgFlash('win-flash');triggerBgShift('big');}else if(wr>=8){SFX.smallWin();showWin('GRANDE!\n'+fmt(Math.round(S.spinWin*100)/100));triggerBgFlash('win-flash');triggerBgShift('small');}else{SFX.smallWin();}dLog(`Spin #${S.spins}: +${S.spinWin.toFixed(2)} (${wr.toFixed(1)}x)`,'win');addHistory(S.spins,tb,S.spinWin,S.cascLvl);}else{SFX.noWin();dLog(`Spin #${S.spins}: nessuna vincita`,'info');addHistory(S.spins,tb,0,S.cascLvl);}if(S.cascLvl>S.maxC)S.maxC=S.cascLvl;S.totC+=S.cascLvl;updDev();document.getElementById('winAmount').parentElement.classList.remove('win-counting');S.spinning=false;S.superBonusActive=false;S.jackpotMode=false;S.gridPreloaded=false;document.getElementById('spinBtn').classList.remove('is-spinning');setGridState('idle');document.getElementById('spinBtn').disabled=false;updateBonusBtns();updateBoostPanel();if(S.auto&&S.bal>=S.bet*COLS&&!checkAutoplayStop()){await dly(S.turbo?200:500);hideWin();spin();}else{S.auto=false;bsState.autoRemaining=0;document.getElementById('btnAuto').classList.remove('active');setTimeout(hideWin,2000);}}

function updBet(d){SFX.betChange();const idx=BETS.indexOf(S.bet);const newIdx=Math.max(0,Math.min(BETS.length-1,idx+d));S.bet=BETS[newIdx];document.getElementById('betVal').textContent=S.bet;if(typeof updateBonusPrices==='function')updateBonusPrices();if(typeof updateSpinMaggButtons==='function')updateSpinMaggButtons();}

initGrid();

/* ══════════════════════════════════════════════
   PREMIUM ENGINE — Particles, LED, Hover, Wins
   ══════════════════════════════════════════════ */

/* ── COSMIC DUST PARTICLE SYSTEM ── */
(function initCosmicDust(){
  const container=document.getElementById('cosmicDust');
  if(!container)return;
  const colors=['cp-blue','cp-purple','cp-gold'];
  function spawnParticle(){
    const p=document.createElement('div');
    const col=colors[Math.floor(Math.random()*colors.length)];
    const size=1+Math.random()*2.5;
    p.className='cosmic-particle '+col;
    p.style.width=size+'px';
    p.style.height=size+'px';
    p.style.left=Math.random()*100+'%';
    p.style.bottom=Math.random()*30+'%';
    const dur=3+Math.random()*5;
    p.style.animation=`dustDrift ${dur}s ease-in-out forwards`;
    container.appendChild(p);
    setTimeout(()=>p.remove(),(dur*1000)+100);
  }
  setInterval(spawnParticle,400);
  for(let i=0;i<8;i++)setTimeout(spawnParticle,i*200);
})();

/* ── LED BORDER CONTROLLER ── */
const LED={
  el:document.getElementById('ledBorder'),
  set(state){if(!this.el)return;this.el.className='grid-led-border led-'+state;},
  idle(){this.set('idle');},
  spin(){this.set('spin');},
  win(){this.set('win');},
  bigwin(){this.set('bigwin');},
  bonus(){this.set('bonus');}
};

/* ── GRID SHAKE ── */
function shakeGrid(level){
  const gf=document.getElementById('gridFrame');
  const cls='shake-'+level;
  gf.classList.remove('shake-sm','shake-md','shake-lg');
  void gf.offsetHeight;
  gf.classList.add(cls);
  setTimeout(()=>gf.classList.remove(cls),level==='lg'?700:level==='md'?500:300);
}

/* ── HOVER TOOLTIP SYSTEM ── */
const SYM_TOOLTIPS={J:'Gemma Marrone — 0.01x–15.66x',Q:'Gemma Blu — 0.02x–32.19x',K:'Gemma Rossa — 0.03x–46.28x',A:'Gemma Oro — 0.05x–70.99x',alieno:'UFO — 0.24x–446x',astronauta:'B — 0.42x–694x',buco_nero:'Buco Nero — 0.52x–661x',supernova:'Supernova — 0.26x–407x',antigravita:'Antigravità — 0.35x–478x',tesseract:'Tesseract — 0.31x–443x',wild:'WILD — Jolly',scatter:'Free Spin'};
function addTooltips(){
  document.querySelectorAll('.cell').forEach((cell)=>{
    cell.addEventListener('mouseenter',function(){
      if(this.querySelector('.cell-tooltip'))return;
      const id=this.id;
      const m=id.match(/c(\d+)_(\d+)/);
      if(!m)return;
      const r=parseInt(m[1]),c=parseInt(m[2]);
      const sym=S.grid[r]&&S.grid[r][c];
      if(!sym||!SYM_TOOLTIPS[sym])return;
      const tip=document.createElement('div');
      tip.className='cell-tooltip';
      tip.textContent=SYM_TOOLTIPS[sym];
      this.appendChild(tip);
    });
    cell.addEventListener('mouseleave',function(){
      const tip=this.querySelector('.cell-tooltip');
      if(tip)tip.remove();
    });
  });
}

/* ── WIN PARTICLE EXPLOSION ── */
function spawnWinParticles(x,y,count,type){
  const colors=['wp-gold','wp-white','wp-red'];
  for(let i=0;i<count;i++){
    const p=document.createElement('div');
    const col=type==='mega'?colors[Math.floor(Math.random()*3)]:colors[Math.floor(Math.random()*2)];
    const sz=3+Math.random()*5;
    p.className='win-particle '+col;
    p.style.width=sz+'px';
    p.style.height=sz+'px';
    p.style.left=x+'px';
    p.style.top=y+'px';
    const angle=Math.random()*Math.PI*2;
    const speed=80+Math.random()*200;
    const dx=Math.cos(angle)*speed;
    const dy=Math.sin(angle)*speed;
    const dur=0.6+Math.random()*0.8;
    p.style.transition=`all ${dur}s cubic-bezier(.25,.46,.45,.94)`;
    document.body.appendChild(p);
    void p.offsetHeight;
    p.style.left=(x+dx)+'px';
    p.style.top=(y+dy)+'px';
    p.style.opacity='0';
    p.style.transform=`scale(0.2)`;
    setTimeout(()=>p.remove(),(dur*1000)+100);
  }
}

/* ── ANIMATED WIN COUNTER ── */
/* ── EPIC WIN CELEBRATION SYSTEM ── */
let _winCoinInterval=null;
let _winCountInterval=null;
function showPremiumWin(amount,label,type){
  const frame=document.getElementById('winFrame');
  const levelLabel=document.getElementById('winLevelLabel');
  const amountDisplay=document.getElementById('winAmountDisplay');

  /* Determine win level: big < mega < ultra  (colossal rimosso 2026-04-15 — si sovrapponeva a mega) */
  const betRatio=amount/S.bet;
  let level='big';
  if(betRatio>=50)level='ultra';
  else if(betRatio>=20)level='mega';

  /* Frame class */
  frame.className='win-premium-frame visible '+level;

  /* Level label with escalation */
  const levelNames={big:'BIG WIN!',mega:'MEGA WIN!',ultra:'ULTRA WIN!',colossal:'COLOSSAL WIN!'};
  const levelClasses={big:'win-level-big',mega:'win-level-mega',ultra:'win-level-ultra',colossal:'win-level-colossal'};
  levelLabel.className='win-level-label '+levelClasses[level];
  levelLabel.textContent=levelNames[level];
  setTimeout(()=>levelLabel.classList.add('visible'),100);

  /* Importo mostrato subito (count-up rimosso: evita confusione durante l'animazione). */
  if(_winCountInterval)cancelAnimationFrame(_winCountInterval);
  _winCountInterval=null;
  amountDisplay.textContent=fmt(Math.round(amount*100)/100);
  amountDisplay.style.animation='valFlash 0.3s ease-out';

  /* Coin rain */
  const coinEmojis=['🪙','💰','⭐','✦','◆'];
  const coinCount=level==='ultra'?35:level==='mega'?25:15;
  let coinsSpawned=0;
  _winCoinInterval=setInterval(()=>{
    if(coinsSpawned>=coinCount){clearInterval(_winCoinInterval);_winCoinInterval=null;return;}
    const coin=document.createElement('div');
    coin.className='win-coin';
    coin.textContent=coinEmojis[Math.floor(Math.random()*coinEmojis.length)];
    coin.style.left=Math.random()*90+5+'%';
    coin.style.top='-40px';
    coin.style.animationDuration=(2+Math.random()*1.5)+'s';
    coin.style.animationDelay=(Math.random()*0.3)+'s';
    document.body.appendChild(coin);
    setTimeout(()=>coin.remove(),4000);
    coinsSpawned++;
  },80);

  /* Particles from center */
  const cx=window.innerWidth/2;
  const cy=window.innerHeight/2;
  const pCount=level==='ultra'?60:level==='mega'?40:25;
  spawnWinParticles(cx,cy,pCount,level);
  setTimeout(()=>spawnWinParticles(cx,cy,Math.round(pCount*0.6),level),500);
  if(level==='ultra')setTimeout(()=>spawnWinParticles(cx,cy,Math.round(pCount*0.4),level),1000);

  /* Screen shake proportional to level */
  const shakeMap={big:'sm',mega:'md',ultra:'lg'};
  shakeGrid(shakeMap[level]);

  /* LED */
  LED.bigwin();
}
function hidePremiumWin(){
  const frame=document.getElementById('winFrame');
  frame.className='win-premium-frame';
  const levelLabel=document.getElementById('winLevelLabel');
  levelLabel.classList.remove('visible');
  document.getElementById('winAmountDisplay').textContent='0';
  document.getElementById('winAmountDisplay').style.animation='';
  if(_winCoinInterval){clearInterval(_winCoinInterval);_winCoinInterval=null;}
  if(_winCountInterval){cancelAnimationFrame(_winCountInterval);_winCountInterval=null;}
  LED.idle();
}

/* ── HIGHLIGHT WINS WITH UNIQUE SYMBOL ANIMATIONS ── */
const _origHighlightWins=typeof highlightWins==='function'?highlightWins:null;

fillGrid();
updBal();
buildPaytable();

/* Post-init: add tooltips & override highlight */
setTimeout(()=>{
  addTooltips();
},200);

/* ── Patch showWin to use premium system ── */
const _origShowWin=showWin;
showWin=function(t){
  _origShowWin(t);
  const lines=t.split('\n');
  const label=lines[0]||'';
  /* FIX 2026-04-15: prima il regex rimuoveva il punto decimale (es. "+12.34" → 1234)
     causando premium win level sballato. Ora preserva il decimale con parseFloat. */
  const amountStr=(lines[1]||'0').replace(/[^\d.]/g,'');
  const amount=parseFloat(amountStr)||0;
  if(amount>0){
    showPremiumWin(amount,label,'auto');/* level auto-detected by bet ratio */
  }
};
const _origHideWin=hideWin;
hideWin=function(){_origHideWin();hidePremiumWin();};

/* ── Patch spin for LED states ── */
const _origSpin=spin;
spin=async function(){
  LED.spin();
  await _origSpin();
  LED.idle();
};

/* ── Patch highlightWins for unique win animations ── */
if(_origHighlightWins){
  highlightWins=async function(clusters){
    /* Add symbol-specific win class */
    clusters.forEach(cl=>{
      cl.cells.forEach(([r,c])=>{
        const sym=S.grid[r][c];
        const cell=document.getElementById(`c${r}_${c}`);
        if(sym&&sym!=='wild')cell.classList.add('win-'+sym);
      });
    });
    /* Shake on cascade */
    if(S.cascLvl>=2)shakeGrid('sm');
    if(S.cascLvl>=5)shakeGrid('md');
    LED.win();
    /* Spawn particles at first cluster */
    if(clusters.length>0&&clusters[0].cells.length>0){
      const[pr,pc]=clusters[0].cells[0];
      const pCell=document.getElementById(`c${pr}_${pc}`);
      if(pCell){
        const rect=pCell.getBoundingClientRect();
        spawnWinParticles(rect.left+rect.width/2,rect.top+rect.height/2,clusters[0].cells.length*3,'small');
      }
    }
    await _origHighlightWins(clusters);
    /* Cleanup win classes */
    clusters.forEach(cl=>{
      cl.cells.forEach(([r,c])=>{
        const cell=document.getElementById(`c${r}_${c}`);
        cell.className=cell.className.replace(/\bwin-\S+/g,'').trim();
      });
    });
  };
}
updateMultiplierStats();
initDustParticles();

document.getElementById('spinBtn').addEventListener('click',()=>{SFX.click();});
document.getElementById('betUp').addEventListener('click',()=>updBet(1));
document.getElementById('betDown').addEventListener('click',()=>updBet(-1));
document.getElementById('btnTurbo').addEventListener('click',function(){S.turbo=!S.turbo;S.speedMult=S.turbo?2.5:1;this.classList.toggle('active');});
document.getElementById('btnAuto').addEventListener('click',function(){S.auto=!S.auto;this.classList.toggle('active');});
/* Spin Boost Panel — sotto la griglia */
S.activeBoostMult=0;
const BOOST_MULTS=[{id:'boostBtn125',costId:'boostCost125',mult:1.25,bonusChance:0.15}];
function updateBoostPanel(){
  BOOST_MULTS.forEach(b=>{
    const btn=document.getElementById(b.id);
    const costEl=document.getElementById(b.costId);
    if(!btn||!costEl)return;
    const cost=Math.round(S.bet*b.mult*100)/100;
    costEl.textContent=fmt(cost);
    const isActive=S.activeBoostMult===b.mult;
    btn.classList.toggle('active',isActive);
    btn.classList.toggle('disabled',S.spinning||S.bal<cost);
  });
  /* Also update old ring if present */
  const ring=document.getElementById('spinRingMagg');
  if(ring)ring.style.display='none';
}
function updateSpinMaggButtons(){updateBoostPanel();}
BOOST_MULTS.forEach(b=>{
  const btn=document.getElementById(b.id);
  if(!btn)return;
  btn.addEventListener('click',function(){
    SFX.click();
    if(S.activeBoostMult===b.mult){
      /* Deselect */
      S.activeBoostMult=0;S.spinMagg=0;
    }else{
      /* Select this boost */
      S.activeBoostMult=b.mult;S.spinMagg=b.mult;
    }
    updateBoostPanel();
  });
});
updateBoostPanel();
/* Neon burst on spin click */
const _origSpinClick=document.getElementById('spinBtn');
_origSpinClick.addEventListener('click',function(){
  this.classList.add('neon-burst');
  setTimeout(()=>this.classList.remove('neon-burst'),500);
});
document.getElementById('btnSound').addEventListener('click',function(){
  const on=SFX.toggle();this.classList.toggle('active',on);
  const w2=this.querySelector('#soundWave2');if(w2)w2.style.display=on?'':'none';
  SFX.click();
});
/* Paytable */
document.getElementById('btnPaytable').addEventListener('click',function(){
  document.getElementById('paytableOverlay').classList.toggle('visible');
});
document.getElementById('ptClose').addEventListener('click',function(){
  document.getElementById('paytableOverlay').classList.remove('visible');
});
document.getElementById('paytableOverlay').addEventListener('click',function(e){
  if(e.target===this)this.classList.remove('visible');
});
document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();spin();}if(e.key==='t'||e.key==='T'){S.turbo=!S.turbo;document.getElementById('btnTurbo').classList.toggle('active');}});
/* Dropdown menu toggle */
document.getElementById('btnMenuDrop').addEventListener('click',function(e){
  e.stopPropagation();
  document.getElementById('dockDropdown').classList.toggle('open');
});
document.addEventListener('click',function(){document.getElementById('dockDropdown').classList.remove('open');});

const devPanel=document.getElementById('devPanel');
document.getElementById('devToggle').addEventListener('click',()=>{devPanel.classList.toggle('visible');});
document.getElementById('speedSlider').addEventListener('input',e=>{S.speedMult=parseFloat(e.target.value);});
document.getElementById('volSlider').addEventListener('input',e=>{SFX.setVol(parseInt(e.target.value)/100);});
document.getElementById('extraRateSlider').addEventListener('input',e=>{S.extraDropRate=parseFloat(e.target.value);});
document.getElementById('rBuco').addEventListener('input',e=>{S.extraRates.buco_nero=parseFloat(e.target.value);});
document.getElementById('rSuper').addEventListener('input',e=>{S.extraRates.supernova=parseFloat(e.target.value);});
document.getElementById('rGravi').addEventListener('input',e=>{S.extraRates.antigravita=parseFloat(e.target.value);});
document.getElementById('rTess').addEventListener('input',e=>{S.extraRates.tesseract=parseFloat(e.target.value);});
document.getElementById('btnForceWin').addEventListener('click',()=>{S.forceW=true;spin();});
document.getElementById('btnForceBH').addEventListener('click',()=>{S.forceBH=true;spin();});
document.getElementById('btnAdd10k').addEventListener('click',()=>{S.bal+=1000;updBal();});
document.getElementById('btnReset').addEventListener('click',()=>{S.spins=0;S.wagered=0;S.won=0;S.hits=0;S.maxW=0;S.maxC=0;S.totC=0;updDev();});
document.getElementById('btnSim100').addEventListener('click',async()=>{for(let i=0;i<100;i++){S.forceW=Math.random()<0.3;await spin();if(S.spinning)await dly(500);}});
document.getElementById('btnForceBuco').addEventListener('click',()=>{S.forceExtra='buco_nero';spin();});
document.getElementById('btnForceSuper').addEventListener('click',()=>{S.forceExtra='supernova';spin();});
document.getElementById('btnForceAnti').addEventListener('click',()=>{S.forceExtra='antigravita';spin();});
document.getElementById('btnForceTess').addEventListener('click',()=>{S.forceExtra='tesseract';spin();});
document.getElementById('btnForceExpand').addEventListener('click',()=>{S.forceExtra='tesseract';S.forceToken='expand';spin();});
document.getElementById('btnForceCollect').addEventListener('click',()=>{S.forceExtra='tesseract';S.forceToken='collect';spin();});
document.getElementById('btnForceMaxWin').addEventListener('click',()=>{S.forceExtra='tesseract';S.forceToken='coin';S.forceMaxWin=true;spin();});
document.getElementById('btnForceScatter3').addEventListener('click',()=>{S.forceScatter=3;spin();});
document.getElementById('btnForceScatter5').addEventListener('click',()=>{S.forceScatter=5;spin();});
document.getElementById('btnForceFreeSpins').addEventListener('click',async()=>{if(!S.spinning)await triggerFreeSpins(10);});
document.getElementById('btnDustFill').addEventListener('click',()=>{updDust(S.dustMax-S.dust);});
document.getElementById('btnDustReset').addEventListener('click',()=>{S.dust=0;updDust(0);});

/* ── DRAWER TOGGLE (legacy — bonus is now floating bar) ── */
function toggleDrawer(){}

/* ── HUD AMBIENT PARTICLES ── */
function initHudParticles(containerId,count,color){
  const container=document.getElementById(containerId);
  if(!container)return;
  for(let i=0;i<count;i++){
    const p=document.createElement('div');
    p.className='hud-particle';
    p.style.left=Math.random()*90+5+'%';
    p.style.bottom=Math.random()*60+10+'%';
    p.style.animationDelay=(Math.random()*4).toFixed(1)+'s';
    p.style.animationDuration=(3+Math.random()*3).toFixed(1)+'s';
    if(color)p.style.background=color;
    container.appendChild(p);
  }
}
initHudParticles('hudParticles',10);
initHudParticles('bonusParticles',8,'rgba(120,0,255,0.3)');

/* ── BONUS PURCHASE MENU ── */
function updateBonusBtns(){
  const costMap={buyBuco:'buco_nero',buySuper:'supernova',buyAnti:'antigravita',buyTess:'tesseract',buySuperBonus:'superBonus',buyFreeSpin:'freeSpin',buySpaceSpin:'spaceSpin'};
  document.querySelectorAll('.bsp-item').forEach(btn=>{
    const key=costMap[btn.id];
    if(key&&typeof getBonusCost==='function'){
      const cost=getBonusCost(key);
      const dis=S.spinning||S.bal<cost;
      btn.classList.toggle('disabled',dis);
    }else{
      btn.classList.toggle('disabled',S.spinning);
    }
  });
  if(typeof updateBonusPrices==='function')updateBonusPrices();
}
/* Bonus costs as multipliers of current bet.
   Ricalibrati 2026-04-15: target RTP pagato 93–94% per TUTTI i bonus.
   Formula: cost = EV_medio / 0.935 (margine house ~6.5%, in linea con Pragmatic/Nolimit).

   FREE SPIN: prezzo forzato a 100× (richiesta utente). Per bilanciare,
   quando S.fsBought=true triggerFreeSpins applica un buyBoost ×11.85 su start+step
   del fsMult interno. EV bought FS = 7.893 × 11.85 ≈ 93.5× bet → RTP 93.5%.
   Il boost NON tocca i trigger naturali (3+ scatter in base game) né la fase FS
   di spaceSpin (jackpotMode). */
/* Prezzi Buy Bonus (2026-04-15 rev. 7):
   prezzi uniformati a RTP ~92-93% per i mini bonus.
   · supernova:     11× (EV 10.18 → RTP ~93%)
   · buco_nero:     15× (EV 13.55 → RTP ~90%)
   · antigravita:   22× (EV 20.18 → RTP ~92% — wildMult ricalibrato)
   · tesseract:     50× (EV ~46 con drop 0.20 + coin ×7.2 → RTP ~92%)
   · freeSpin:     100× (EV 93.5 con buyBoost ×11.85 → RTP 93.5%)
   · superBonus:   200× (EV ~77 → RTP ~38% — conservato come scelta utente)
   · spaceSpin:   1000× (EV ~884 con spaceMult medio ×3.7 → RTP ~88%) */
const BONUS_COST_MULT={supernova:11,buco_nero:15,antigravita:22,tesseract:50,freeSpin:100,superBonus:200,spaceSpin:1000};
function getBonusCost(key){return Math.round(S.bet*BONUS_COST_MULT[key]*100)/100;}
function updateBonusPrices(){
  const fmt=cost=>`${cost}×`;
  const update=(id,key)=>{const el=document.querySelector('#'+id+' .bsp-cost');if(el)el.textContent=fmt(getBonusCost(key));};
  update('buyBuco','buco_nero');update('buySuper','supernova');update('buyAnti','antigravita');update('buyTess','tesseract');
  update('buySuperBonus','superBonus');update('buyFreeSpin','freeSpin');update('buySpaceSpin','spaceSpin');
}
function buySideBonus(extraSym,costKey){
  const cost=getBonusCost(costKey);
  if(S.spinning||S.bal<cost)return;
  S.bal-=cost;
  S.wagered+=cost;
  updBal();
  if(SFX.bonusBuy)SFX.bonusBuy();else SFX.click();
  dLog(`Bonus acquistato: ${extraSym} (${cost} crediti)`,'info');
  S.forceExtra=extraSym;
  S.bonusSpin=true;
  spin();
}
document.getElementById('buyBuco').addEventListener('click',function(){buySideBonus('buco_nero','buco_nero');});
document.getElementById('buySuper').addEventListener('click',function(){buySideBonus('supernova','supernova');});
document.getElementById('buyAnti').addEventListener('click',function(){buySideBonus('antigravita','antigravita');});
document.getElementById('buyTess').addEventListener('click',function(){buySideBonus('tesseract','tesseract');});

/* ── FREE SPIN CLASSICI (10 giri) — prezzo 100× bet, RTP ~93.5% via buyBoost ── */
document.getElementById('buyFreeSpin').addEventListener('click',async function(){
  const cost=getBonusCost('freeSpin');
  if(S.spinning||S.bal<cost)return;
  S.bal-=cost;S.wagered+=cost;updBal();if(SFX.bonusBuy)SFX.bonusBuy();else SFX.click();
  dLog('FREE SPIN: 3 scatter forzati sulla griglia!','freespin');
  /* Force 3 scatters on the grid — spin will detect them and trigger free spins.
     fsBought=true attiva buyBoost ×11.85 dentro triggerFreeSpins per bilanciare il costo 100×. */
  S.fsBought=true;
  S.forceScatter=3;
  S.bonusSpin=true;
  await spin();
});
/* ── SUPER BONUS: ALL 4 BONUSES + FREE SPIN (evento massimo, prezzo alto) ── */
document.getElementById('buySuperBonus').addEventListener('click',async function(){
  const cost=getBonusCost('superBonus');
  if(S.spinning||S.bal<cost)return;
  S.bal-=cost;S.wagered+=cost;updBal();if(SFX.bonusBuy)SFX.bonusBuy();else SFX.click();
  dLog('SUPER BONUS: Tutti i 4 bonus + Free Spin!','win');
  const allBonuses=['buco_nero','supernova','antigravita','tesseract'];
  /* Intro overlay epica */
  const sbOverlay=document.createElement('div');
  sbOverlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;z-index:62;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;pointer-events:none';
  const sbFlash=document.createElement('div');
  sbFlash.style.cssText='position:absolute;inset:0;background:radial-gradient(circle,rgba(255,0,0,0.5),rgba(200,0,0,0.2),rgba(0,0,0,0.9));animation:none';
  sbOverlay.appendChild(sbFlash);
  const sbTitle=document.createElement('div');
  sbTitle.style.cssText='position:relative;z-index:2;font-family:Orbitron,monospace;font-size:clamp(28px,5vw,52px);font-weight:900;color:#ff2200;text-shadow:0 0 30px rgba(255,0,0,0.8),0 0 60px rgba(255,0,0,0.4),0 0 100px rgba(200,0,0,0.3);letter-spacing:5px;animation:jackpotTitlePulse 0.5s ease-in-out infinite alternate';
  sbTitle.textContent='★ SUPER BONUS ★';
  sbOverlay.appendChild(sbTitle);
  const sbSub=document.createElement('div');
  sbSub.style.cssText='position:relative;z-index:2;font-family:Orbitron,monospace;font-size:clamp(12px,1.5vw,18px);color:#ffd700;text-shadow:0 0 15px rgba(255,215,0,0.6);margin-top:12px;letter-spacing:2px;opacity:0;transition:opacity 0.5s';
  sbSub.textContent='Tutti i Bonus + Free Spin!';
  sbOverlay.appendChild(sbSub);
  const iconsRow=document.createElement('div');
  iconsRow.style.cssText='display:flex;gap:10px;margin-top:20px;opacity:0;transition:opacity 0.5s 0.5s';
  ['buco_nero','supernova','antigravita','tesseract','freespin'].forEach(sym=>{
    const ic=document.createElement('img');
    ic.src='simboli/'+sym+'.png';
    ic.style.cssText='width:45px;height:45px;object-fit:contain;border-radius:8px;border:2px solid rgba(255,215,0,0.6);box-shadow:0 0 15px rgba(255,180,50,0.3)';
    iconsRow.appendChild(ic);
  });
  sbOverlay.appendChild(iconsRow);
  document.body.appendChild(sbOverlay);
  await dly(50);sbOverlay.style.opacity='1';
  document.body.style.animation='jackpotShake 0.15s ease-in-out 6';
  await dly(800);
  sbSub.style.opacity='1';iconsRow.style.opacity='1';
  await dly(2200);
  document.body.style.animation='';
  sbOverlay.style.opacity='0';
  await dly(500);
  sbOverlay.remove();
  /* STEP 1: One spin with ALL 4 bonuses on the grid */
  S.jackpotMode=true;
  showToast('FASE 1: Tutti i bonus!','win',3000);
  S.grid=[];S.cellMult=[];
  for(let r=0;r<ROWS;r++){S.grid[r]=[];S.cellMult[r]=[];for(let c=0;c<COLS;c++){S.grid[r][c]=rndSym();S.cellMult[r][c]=1;}}
  const positions=[[1,1],[1,5],[5,1],[5,5]];
  allBonuses.forEach((sym,i)=>{const[pr,pc]=positions[i];S.grid[pr][pc]=sym;});
  S.extraSpawned=true;S.bonusSpin=true;
  S.gridPreloaded=true;
  await spin();
  /* STEP 2: Free Spins */
  await dly(600);
  showToast('FASE 2: Free Spin!','freespin',3000);
  S.forceScatter=3;
  S.bonusSpin=true;
  await spin();
  showToast('SUPER BONUS completato!','win',3000);
});

/* Bonus Max rimosso 2026-04-15 */
S.jackpotMode=false;
/* ── SPACE SPIN: NORMAL SPIN → UFO LASERS → GIANT SYMBOL 3×3 → 6×6 ── */
document.getElementById('buySpaceSpin').addEventListener('click',async function(){
  const cost=getBonusCost('spaceSpin');
  if(S.spinning||S.bal<cost)return;
  S.bal-=cost;S.wagered+=cost;updBal();
  if(SFX.bonusBuy)SFX.bonusBuy();
  dLog('SPACE SPIN attivato!','win');

  /* Pick random high symbol for the giant */
  const giantSyms=['astronauta','alieno','A','K'];
  const chosenSym=giantSyms[Math.floor(Math.random()*giantSyms.length)];

  /* Determine giant size: weighted random 3×3(50%) 4×4(25%) 5×5(15%) 6×6(10%) */
  const rr=Math.random();
  const giantSize=rr<0.50?3:rr<0.75?4:rr<0.90?5:6;
  const isMaxWin=giantSize===6;

  /* ── SPACE MULTIPLIER — estrazione casuale pesata per bilanciare il costo 1000× ──
     EV nominal giant pay ≈ 239× bet. Con avg spaceMult ≈ 3.7 → EV ≈ 884× → RTP ~88%.
     Distribuzione (peso / mult): 300×1, 350×2, 200×3, 100×5, 30×10, 15×25, 4×100, 1×500 */
  const SPACE_MULTS=[
    {v:1,w:300},{v:2,w:350},{v:3,w:200},{v:5,w:100},
    {v:10,w:30},{v:25,w:15},{v:100,w:4},{v:500,w:1}
  ];
  const totalW=SPACE_MULTS.reduce((s,m)=>s+m.w,0);
  let pick=Math.random()*totalW, spaceMult=1;
  for(const m of SPACE_MULTS){pick-=m.w;if(pick<=0){spaceMult=m.v;break;}}
  S.spaceMult=spaceMult;

  /* Aggiorna il pannello Moltiplicatore con il valore Space Spin */
  const ssFsMultEl=document.getElementById('fsMultVal');
  if(ssFsMultEl){
    ssFsMultEl.textContent='×'+spaceMult;
    ssFsMultEl.classList.remove('mult-low','mult-mid','mult-high');
    if(spaceMult>=25)ssFsMultEl.classList.add('mult-high');
    else if(spaceMult>=5)ssFsMultEl.classList.add('mult-mid');
    else ssFsMultEl.classList.add('mult-low');
    ssFsMultEl.classList.add('fs-mult-bump');
    setTimeout(()=>ssFsMultEl.classList.remove('fs-mult-bump'),900);
  }
  const ssFsMultBox=document.getElementById('fsMult');
  if(ssFsMultBox)ssFsMultBox.classList.add('visible');
  /* Reset della vincita visualizzata */
  updSpinWinPanel(0);
  S.spinWin=0;
  setGridStatus('SPACE SPIN','bonus');

  dLog(`Space Spin: ${SYM_NAMES[chosenSym]||chosenSym} ${giantSize}×${giantSize}${isMaxWin?' MAX WIN!':''} · MULT ×${spaceMult}`,'win');

  /* ── PHASE 0: Hype overlay + multiplier reveal ── */
  const ssOv=document.createElement('div');
  ssOv.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,15,0.88);z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 0.4s;font-family:Orbitron,monospace;pointer-events:none';
  const ssTitle=document.createElement('div');
  ssTitle.style.cssText='font-size:clamp(24px,4vw,44px);font-weight:900;color:rgba(100,220,255,0.95);text-shadow:0 0 30px rgba(0,200,255,0.7),0 0 60px rgba(168,85,247,0.4);letter-spacing:4px;margin-bottom:24px';
  ssTitle.textContent='✦ SPACE SPIN ✦';
  ssOv.appendChild(ssTitle);
  /* Multiplier reveal */
  const multLabel=document.createElement('div');
  multLabel.style.cssText='font-size:clamp(11px,1.3vw,15px);color:rgba(200,220,255,0.7);letter-spacing:3px;margin-bottom:6px';
  multLabel.textContent='MOLTIPLICATORE';
  ssOv.appendChild(multLabel);
  const multColor=spaceMult>=100?'#ffd700':spaceMult>=25?'#ff8c66':spaceMult>=10?'#66ff88':spaceMult>=5?'#66d0ff':'#aaa';
  const multBig=document.createElement('div');
  multBig.style.cssText='font-size:clamp(40px,8vw,90px);font-weight:900;color:'+multColor+';text-shadow:0 0 30px '+multColor+',0 0 60px '+multColor+'80;letter-spacing:3px;opacity:0;transform:scale(0.4);transition:opacity 0.4s,transform 0.5s cubic-bezier(.34,1.56,.64,1)';
  multBig.textContent='×'+spaceMult;
  ssOv.appendChild(multBig);
  document.body.appendChild(ssOv);
  await dly(50);ssOv.style.opacity='1';
  if(SFX.spaceSpinIntro)SFX.spaceSpinIntro();
  await dly(500);
  multBig.style.opacity='1';multBig.style.transform='scale(1.1)';
  if(spaceMult>=25&&SFX.bigWin)SFX.bigWin();
  else if(SFX.reelTick)SFX.reelTick(3);
  await dly(900);
  multBig.style.transform='scale(1)';
  await dly(700);
  ssOv.style.opacity='0';await dly(400);ssOv.remove();

  /* ── PHASE 1: Normal spin ── */
  S.bonusSpin=true;
  await spin();
  await dly(600);

  /* ── PHASE 2: UFO teleports in ── */
  const gridEl=document.getElementById('grid');
  const gridRect=gridEl.getBoundingClientRect();

  const ufo=document.createElement('div');
  ufo.className='ss-ufo';
  ufo.textContent='🛸';
  /* Start at random position near grid */
  const startX=gridRect.left+Math.random()*gridRect.width*0.6;
  const startY=gridRect.top-60;
  ufo.style.left=startX+'px';
  ufo.style.top=startY+'px';
  document.body.appendChild(ufo);

  /* Teleport-in flash */
  const flash0=document.createElement('div');
  flash0.className='ss-teleport-flash';
  flash0.style.left=(startX-10)+'px';
  flash0.style.top=(startY-10)+'px';
  document.body.appendChild(flash0);
  setTimeout(()=>flash0.remove(),500);

  ufo.classList.add('ss-ufo-teleport-in');
  if(SFX.spaceSpinCharge)SFX.spaceSpinCharge();
  await dly(600);
  ufo.classList.remove('ss-ufo-teleport-in');

  /* Giant area: centered on the grid */
  const gr=Math.floor((ROWS-giantSize)/2);
  const gc=Math.floor((COLS-giantSize)/2);
  const targetCells=[];
  for(let r=gr;r<gr+giantSize;r++)for(let c=gc;c<gc+giantSize;c++)targetCells.push([r,c]);

  /* ── PHASE 3: UFO teleports to 4 positions, shooting lasers ── */
  const telePositions=[
    {x:gridRect.left-20, y:gridRect.top-50},
    {x:gridRect.right-40, y:gridRect.top-50},
    {x:gridRect.left+gridRect.width*0.3, y:gridRect.top-60},
    {x:gridRect.left+gridRect.width*0.7, y:gridRect.top-55}
  ];

  let hitCellIdx=0;
  const cellsPerTele=Math.ceil(targetCells.length/telePositions.length);

  for(let tp=0;tp<telePositions.length;tp++){
    const pos=telePositions[tp];

    /* Teleport animation */
    ufo.classList.add('ss-ufo-teleport');
    await dly(180);
    ufo.style.left=pos.x+'px';
    ufo.style.top=pos.y+'px';

    /* Flash at new position */
    const flash=document.createElement('div');
    flash.className='ss-teleport-flash';
    flash.style.left=(pos.x-10)+'px';
    flash.style.top=(pos.y-10)+'px';
    document.body.appendChild(flash);
    setTimeout(()=>flash.remove(),500);

    await dly(200);
    ufo.classList.remove('ss-ufo-teleport');

    /* Fire lasers at this batch of cells */
    const batchEnd=Math.min(hitCellIdx+cellsPerTele,targetCells.length);
    const lasers=[];
    for(let ci=hitCellIdx;ci<batchEnd;ci++){
      const [r,c]=targetCells[ci];
      const cellEl=document.getElementById(`c${r}_${c}`);
      const cr=cellEl.getBoundingClientRect();
      const laser=document.createElement('div');
      laser.className='ss-laser';
      const lx=cr.left+cr.width/2-2;
      const ly=pos.y+50;
      const lh=cr.top+cr.height/2-ly;
      laser.style.left=lx+'px';
      laser.style.top=ly+'px';
      laser.style.height=Math.max(0,lh)+'px';
      document.body.appendChild(laser);
      lasers.push(laser);
      requestAnimationFrame(()=>laser.classList.add('active'));
      cellEl.classList.add('ss-hit');
    }
    if(SFX.reelTick)SFX.reelTick(tp);
    await dly(250);
    lasers.forEach(l=>{l.classList.remove('active');l.style.opacity='0';});
    await dly(80);
    lasers.forEach(l=>l.remove());
    hitCellIdx=batchEnd;
  }

  /* ── PHASE 4: UFO teleports to center, orbits briefly ── */
  const centerX=gridRect.left+gridRect.width/2-30;
  const centerY=gridRect.top-55;
  ufo.classList.add('ss-ufo-teleport');
  await dly(180);
  ufo.style.left=centerX+'px';
  ufo.style.top=centerY+'px';
  const flashC=document.createElement('div');
  flashC.className='ss-teleport-flash';
  flashC.style.left=(centerX-10)+'px';
  flashC.style.top=(centerY-10)+'px';
  document.body.appendChild(flashC);
  setTimeout(()=>flashC.remove(),500);
  await dly(200);
  ufo.classList.remove('ss-ufo-teleport');
  ufo.classList.add('ss-ufo-orbit');
  await dly(800);
  ufo.classList.remove('ss-ufo-orbit');

  /* Merge animation: target cells dissolve */
  targetCells.forEach(([r,c])=>{
    const cellEl=document.getElementById(`c${r}_${c}`);
    cellEl.classList.remove('ss-hit');
    cellEl.classList.add('ss-merging');
  });
  if(SFX.spaceSpinCharge)SFX.spaceSpinCharge();
  await dly(900);

  /* Void out ALL cells, clear their contents */
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const cellEl=document.getElementById(`c${r}_${c}`);
    cellEl.classList.remove('ss-merging','ss-hit');
    cellEl.classList.add('ss-void');
    cellEl.querySelector('.sw').innerHTML='';
  }
  await dly(400);

  /* ── PHASE 5: Single giant symbol overlay spanning the whole area ── */
  /* Calculate position of the giant area relative to the grid */
  const topLeftCell=document.getElementById(`c${gr}_${gc}`);
  const botRightCell=document.getElementById(`c${gr+giantSize-1}_${gc+giantSize-1}`);
  const tlRect=topLeftCell.getBoundingClientRect();
  const brRect=botRightCell.getBoundingClientRect();
  const gridRect2=gridEl.getBoundingClientRect();

  /* Create the giant overlay inside the grid */
  const giantOv=document.createElement('div');
  giantOv.className='ss-giant-overlay';
  giantOv.style.left=(tlRect.left-gridRect2.left)+'px';
  giantOv.style.top=(tlRect.top-gridRect2.top)+'px';
  giantOv.style.width=(brRect.right-tlRect.left)+'px';
  giantOv.style.height=(brRect.bottom-tlRect.top)+'px';
  giantOv.innerHTML=renderSymbol(chosenSym);
  gridEl.style.position='relative';
  gridEl.appendChild(giantOv);

  /* Mark underlying cells as giant in state */
  const spiralCells=[];
  for(let r=gr;r<gr+giantSize;r++)for(let c=gc;c<gc+giantSize;c++){
    S.grid[r][c]=chosenSym;
    S.cellMult[r][c]=1;
    spiralCells.push([r,c]);
    const cellEl=document.getElementById(`c${r}_${c}`);
    cellEl.classList.remove('ss-void');
    cellEl.classList.add('ss-giant');
  }

  /* Animate the overlay appearing */
  await dly(50);
  giantOv.classList.add('visible');
  if(SFX.spaceSpinReveal)SFX.spaceSpinReveal();
  await dly(700);

  /* ── PHASE 6: Size announcement ── */
  const sizeLabel=document.createElement('div');
  sizeLabel.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:75;font-family:Orbitron,monospace;font-size:clamp(30px,5vw,60px);font-weight:900;color:'+(isMaxWin?'#ffd700':'#00ddff')+';text-shadow:0 0 30px '+(isMaxWin?'rgba(255,215,0,0.8)':'rgba(0,200,255,0.7)')+',0 0 60px '+(isMaxWin?'rgba(255,150,0,0.4)':'rgba(0,150,255,0.3)')+';letter-spacing:5px;opacity:0;transition:opacity 0.3s,transform 0.5s;pointer-events:none';
  sizeLabel.textContent=isMaxWin?'★ MAX WIN ★':`${giantSize}×${giantSize}`;
  document.body.appendChild(sizeLabel);
  await dly(50);
  sizeLabel.style.opacity='1';sizeLabel.style.transform='translate(-50%,-50%) scale(1.15)';
  if(isMaxWin&&SFX.megaWin)SFX.megaWin();
  else if(SFX.bigWin)SFX.bigWin();

  /* Screen shake for big sizes */
  if(giantSize>=4)document.body.style.animation='jackpotShake 0.12s ease-in-out '+(giantSize>=5?8:4);
  await dly(2200);
  document.body.style.animation='';
  sizeLabel.style.opacity='0';
  await dly(300);sizeLabel.remove();

  /* ── PHASE 7: UFO exits ── */
  ufo.classList.remove('ss-ufo-orbit');
  ufo.style.transition='none';
  ufo.classList.add('ss-ufo-exit');
  await dly(900);
  ufo.remove();

  /* ── PHASE 8: Calculate giant win payout ── */
  const giantCount=giantSize*giantSize;
  const clusters=[{sym:chosenSym,sz:giantCount,cells:spiralCells.map(([r,c])=>[r,c])}];
  const basePay=calcPay(clusters);
  const ssMultiplier=3;
  /* Applica il multiplier casuale estratto all'inizio del Space Spin */
  const pay=basePay*ssMultiplier*(S.spaceMult||1);
  S.spinWin=pay;
  /* Aggiorna i pannelli vincita (numerico principale + pannello "VINCITA") */
  document.getElementById('winAmount').textContent=fmt(Math.round(pay*100)/100);
  updSpinWinPanel(pay);
  const _swd=document.getElementById('spinWinDisplay');if(_swd)_swd.textContent=fmt(Math.round(pay*100)/100);
  /* Reset dopo l'uso */
  S.spaceMult=0;

  if(pay>0){
    S.bal+=pay;S.won+=pay;S.hits++;
    if(pay>S.maxW)S.maxW=pay;
    updBal();
    const wr=pay/S.bet;
    setGridState('winning');
    if(wr>=50){showBigWinPopup('MEGA WIN!',pay);}
    else if(wr>=20){showBigWinPopup('BIG WIN!',pay);}
    else{showWin('SPACE WIN x3!\n+'+fmt(Math.round(pay*100)/100));}
    dLog(`Space Spin: ${giantSize}×${giantSize} ${SYM_NAMES[chosenSym]||chosenSym} x10 = +${fmt(Math.round(pay*100)/100)}`,'win');
    addHistory(S.spins,S.bet,pay,0);
  }
  S.spins++;updDev();
  await dly(2500);

  /* ── PHASE 9: Clean up — remove giant overlay, restore grid ── */
  const oldOv=gridEl.querySelector('.ss-giant-overlay');
  if(oldOv){oldOv.classList.remove('visible');await dly(400);oldOv.remove();}
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const cell=document.getElementById(`c${r}_${c}`);
    cell.classList.remove('ss-void','ss-giant','ss-merging','ss-hit');
    S.grid[r][c]=rndSym();S.cellMult[r][c]=1;
  }
  renderFullGrid(false);
  hideWin();

  S.spinning=false;
  document.getElementById('spinBtn').classList.remove('is-spinning');
  document.getElementById('spinBtn').disabled=false;
  /* Ripristina pannello moltiplicatore e stato default */
  const ssEndMultEl=document.getElementById('fsMultVal');
  if(ssEndMultEl){
    ssEndMultEl.textContent='×1';
    ssEndMultEl.classList.remove('mult-low','mult-mid','mult-high');
  }
  const ssEndMultBox=document.getElementById('fsMult');
  if(ssEndMultBox)ssEndMultBox.classList.remove('visible');
  setGridState('idle');
  updateBonusBtns();
});

/* Jackpot CSS animations injected */
const jackpotStyle=document.createElement('style');
jackpotStyle.textContent=`
@keyframes jackpotTitlePulse{0%{transform:scale(1);filter:brightness(1)}100%{transform:scale(1.05);filter:brightness(1.3)}}
@keyframes jackpotShake{0%{transform:translate(0,0)}25%{transform:translate(-4px,2px)}50%{transform:translate(4px,-3px)}75%{transform:translate(-3px,3px)}100%{transform:translate(0,0)}}
`;
document.head.appendChild(jackpotStyle);

/* Update bonus buttons on balance/state changes */
const origUpdBal=updBal;
updBal=function(){origUpdBal();updateBonusBtns();if(typeof updateSpinMaggButtons==='function')updateSpinMaggButtons();};
updateBonusBtns();if(typeof updateSpinMaggButtons==='function')updateSpinMaggButtons();

/* ── DESIGN EDITOR PANEL ── */
(function(){
  const dp=document.getElementById('designPanel');
  const dt=document.getElementById('designToggle');
  const dc=document.getElementById('designClose');
  dt.addEventListener('click',()=>dp.classList.toggle('visible'));
  dc.addEventListener('click',()=>dp.classList.remove('visible'));

  /* Section toggle */
  dp.querySelectorAll('.design-section-header').forEach(h=>{
    h.addEventListener('click',()=>h.parentElement.classList.toggle('open'));
  });

  /* Element references */
  const els={
    gameArea:document.querySelector('.game-area'),
    titleBar:document.querySelector('.title-bar'),
    titleH1:document.querySelector('.title-bar h1'),
    gridFrame:document.getElementById('gridFrame'),
    gridContainer:document.getElementById('grid'),
    sidePanels:document.querySelectorAll('.side-panel'),
    sidePanelL:document.querySelector('.side-panel-l'),
    sidePanelR:document.querySelector('.side-panel-r'),
    sideBoxes:document.querySelectorAll('.sp-box'),
    sideTitles:document.querySelectorAll('.sp-box-title'),
    dustBar:document.getElementById('dustGauge'),
    bottomBar:document.querySelector('.bottom-bar'),
    spinBtn:document.getElementById('spinBtn'),
    bonusIcons:document.querySelectorAll('.bonus-icon'),
    bonusBtns:document.querySelectorAll('.bonus-btn'),
    bonusMenu:document.getElementById('bonusDrawer'),
    balanceText:document.querySelector('#balance'),
    winText:document.querySelector('#winAmount'),
    cells:document.querySelectorAll('.cell'),
    spinWinPanel:document.getElementById('spinWinPanel'),
    tessCounter:document.querySelector('.tess-spins-counter'),
    spinMaggBtns:document.querySelectorAll('.spin-magg-btn'),
    spinMaggMults:document.querySelectorAll('.spin-magg-btn .sm-mult'),
    spinMaggCosts:document.querySelectorAll('.spin-magg-btn .sm-cost'),
  };

  function applyVal(target,prop,val){
    switch(target+'_'+prop){
      /* Layout */
      case 'gameArea_paddingLR': els.gameArea.style.paddingLeft=val+'%';els.gameArea.style.paddingRight=val+'%';return val+'%';
      case 'gameArea_gap': els.gameArea.style.gap=val+'%';return val+'%';
      case 'gameArea_paddingBottom': els.gameArea.style.paddingBottom=val+'px';return val+'px';
      case 'gameArea_offsetX': els.gameArea.style.transform='translate('+val+'px,'+(els.gameArea._oyVal||0)+'px)';els.gameArea._oxVal=+val;return val+'px';
      case 'gameArea_offsetY': els.gameArea.style.transform='translate('+(els.gameArea._oxVal||0)+'px,'+val+'px)';els.gameArea._oyVal=+val;return val+'px';
      /* Title */
      case 'titleBar_paddingV': if(els.titleBar){els.titleBar.style.paddingTop=val+'px';els.titleBar.style.paddingBottom=val+'px';}return val+'px';
      case 'titleH1_fontSize': if(els.titleH1)els.titleH1.style.fontSize=val+'px';return val+'px';
      case 'titleBar_visible': if(els.titleBar)els.titleBar.style.display=+val?'':'none';return +val?'Sì':'No';
      /* Grid */
      case 'gridContainer_gap': els.gridContainer.style.gap=val+'px';return val+'px';
      case 'gridContainer_padding': els.gridContainer.style.padding=val+'px';return val+'px';
      case 'gridFrame_border': els.gridFrame.style.borderWidth=val+'px';return val+'px';
      case 'gridFrame_borderRadius': els.gridFrame.style.borderRadius=val+'px';return val+'px';
      case 'gridFrame_maxH': els.gridFrame.style.maxHeight=val+'%';return val+'%';
      case 'gridFrame_offsetX':{els.gridFrame._oxVal=+val;els.gridFrame.style.transform='translate('+val+'px,'+(els.gridFrame._oyVal||0)+'px)';return val+'px';}
      case 'gridFrame_offsetY':{els.gridFrame._oyVal=+val;els.gridFrame.style.transform='translate('+(els.gridFrame._oxVal||0)+'px,'+val+'px)';return val+'px';}
      /* Cells */
      case 'cells_border': document.querySelectorAll('.cell').forEach(c=>c.style.borderWidth=val+'px');return val+'px';
      case 'cells_borderRadius': document.querySelectorAll('.cell').forEach(c=>c.style.borderRadius=val+'px');return val+'px';
      /* Side panels */
      case 'sidePanels_width': els.sidePanels.forEach(p=>p.style.minWidth=val+'px');return val+'px';
      case 'sidePanels_gap': els.sidePanels.forEach(p=>p.style.gap=val+'px');return val+'px';
      case 'sideBoxes_padding': els.sideBoxes.forEach(b=>b.style.padding=val+'px');return val+'px';
      case 'sidePanelL_visible': if(els.sidePanelL)els.sidePanelL.style.display=+val?'':'none';return +val?'Sì':'No';
      case 'sidePanelR_visible': if(els.sidePanelR)els.sidePanelR.style.display=+val?'':'none';return +val?'Sì':'No';
      /* Dust */
      case 'dustBar_height': els.dustBar.style.height=val+'px';return val+'px';
      /* Bottom bar */
      case 'bottomBar_paddingV': els.bottomBar.style.paddingTop=val+'px';els.bottomBar.style.paddingBottom=val+'px';return val+'px';
      case 'bottomBar_paddingH': els.bottomBar.style.paddingLeft=val+'px';els.bottomBar.style.paddingRight=val+'px';return val+'px';
      case 'bottomBar_minH': els.bottomBar.style.minHeight=val+'px';return val+'px';
      case 'bottomBar_offsetX':{const oyV=els.bottomBar._oyVal||0;els.bottomBar.style.transform='translateX(calc(-50% + '+val+'px)) translateY('+oyV+'px)';els.bottomBar._oxVal=+val;return val+'px';}
      case 'bottomBar_offsetY':{els.bottomBar._oyVal=+val;els.bottomBar.style.bottom=val+'px';return val+'px';}
      case 'bottomBar_width': els.bottomBar.style.maxWidth=val+'%';return val+'%';
      case 'bottomBar_borderRadius': els.bottomBar._br=+val;els.bottomBar.style.borderRadius=val+'px';return val+'px';
      case 'bottomBar_bgOpacity':{const op=(val/100)*0.35;els.bottomBar.style.background='rgba(5,8,20,'+op.toFixed(2)+')';return val+'%';}
      case 'bottomBar_borderTop': els.bottomBar.style.borderTopWidth=val+'px';return val+'px';
      case 'bottomBar_blur': els.bottomBar.style.backdropFilter=val>0?'blur('+val+'px)':'none';els.bottomBar.style.webkitBackdropFilter=val>0?'blur('+val+'px)':'none';return val+'px';
      /* Side panel L offsets */
      case 'sidePanelL_offsetX':{if(els.sidePanelL){els.sidePanelL._oxVal=+val;els.sidePanelL.style.transform='translate('+val+'px,'+(els.sidePanelL._oyVal||0)+'px)';}return val+'px';}
      case 'sidePanelL_offsetY':{if(els.sidePanelL){els.sidePanelL._oyVal=+val;els.sidePanelL.style.transform='translate('+(els.sidePanelL._oxVal||0)+'px,'+val+'px)';}return val+'px';}
      /* Bonus side panel */
      case 'bonusBar_iconSize': document.querySelectorAll('.bsp-icon').forEach(b=>{b.style.width=val+'px';b.style.height=val+'px';});return val+'px';
      case 'bonusBar_gap':{const bb=document.getElementById('bonusSidePanel');if(bb)bb.querySelectorAll('.bsp-list').forEach(l=>l.style.gap=val+'px');return val+'px';}
      case 'bonusBar_bgOpacity':{const bb=document.getElementById('bonusSidePanel');if(bb)bb.style.background='rgba(6,2,22,'+(val/100*0.85).toFixed(2)+')';return val+'%';}
      case 'bonusBar_offsetX':{const bb=document.getElementById('bonusSidePanel');if(bb){bb._oxVal=+val;bb.style.transform='translate('+val+'px,'+(bb._oyVal||0)+'px)';}return val+'px';}
      case 'bonusBar_offsetY':{const bb=document.getElementById('bonusSidePanel');if(bb){bb._oyVal=+val;bb.style.transform='translate('+(bb._oxVal||0)+'px,'+val+'px)';}return val+'px';}
      case 'bonusBar_visible':{const bb=document.getElementById('bonusSidePanel');if(bb)bb.style.display=+val?'flex':'none';return +val?'Sì':'No';}
      case 'bonusBar_imgScale':{document.querySelectorAll('.bsp-icon img').forEach(img=>{img.style.width=val+'%';img.style.height=val+'%';});return val+'%';}
      case 'bonusBar_iconRadius':{document.querySelectorAll('.bsp-icon').forEach(ic=>{ic.style.borderRadius=val+'%';});return val+'%';}
      case 'bonusBar_iconBorder':{document.querySelectorAll('.bsp-icon').forEach(ic=>{ic.style.borderWidth=val+'px';});return val+'px';}
      case 'bonusBar_itemRadius':{document.querySelectorAll('.bsp-item').forEach(it=>{it.style.borderRadius=val+'px';});return val+'px';}
      case 'bonusBar_itemPadding':{document.querySelectorAll('.bsp-item').forEach(it=>{it.style.padding=val+'px '+val+'px';});return val+'px';}
      /* Spin */
      case 'spinBtn_size': els.spinBtn.style.width=val+'px';els.spinBtn.style.height=val+'px';return val+'px';
      /* Fonts */
      case 'balanceText_fontSize': els.balanceText.style.fontSize=val+'px';return val+'px';
      case 'winText_fontSize': els.winText.style.fontSize=val+'px';return val+'px';
      case 'sideTitles_fontSize': els.sideTitles.forEach(t=>t.style.fontSize=val+'px');return val+'px';
      /* Spin Win Panel Display */
      case 'tessWin_top': if(els.spinWinPanel)els.spinWinPanel.style.top=val+'px';return val+'px';
      case 'tessWin_paddingH': if(els.spinWinPanel){els.spinWinPanel.style.paddingLeft=val+'px';els.spinWinPanel.style.paddingRight=val+'px';}return val+'px';
      case 'tessWin_paddingV': if(els.spinWinPanel){els.spinWinPanel.style.paddingTop=val+'px';els.spinWinPanel.style.paddingBottom=val+'px';}return val+'px';
      case 'tessWin_fontSize': if(els.spinWinPanel)els.spinWinPanel.style.fontSize=val+'px';return val+'px';
      case 'tessWin_borderRadius': if(els.spinWinPanel)els.spinWinPanel.style.borderRadius=val+'px';return val+'px';
      /* Tesseract Spin Counter */
      case 'tessCounter_bottom': if(els.tessCounter)els.tessCounter.style.bottom=val+'px';return val+'px';
      case 'tessCounter_paddingH': if(els.tessCounter){els.tessCounter.style.paddingLeft=val+'px';els.tessCounter.style.paddingRight=val+'px';}return val+'px';
      case 'tessCounter_paddingV': if(els.tessCounter){els.tessCounter.style.paddingTop=val+'px';els.tessCounter.style.paddingBottom=val+'px';}return val+'px';
      case 'tessCounter_fontSize': if(els.tessCounter)els.tessCounter.style.fontSize=val+'px';return val+'px';
      case 'tessCounter_borderRadius': if(els.tessCounter)els.tessCounter.style.borderRadius=val+'px';return val+'px';
      /* Spin Maggiorato */
      case 'spinMaggBtns_size': els.spinMaggBtns.forEach(b=>{b.style.width=val+'px';b.style.height=val+'px';});return val+'px';
      case 'spinMaggBtns_fontMult': els.spinMaggMults.forEach(s=>s.style.fontSize=val+'px');return val+'px';
      case 'spinMaggBtns_fontCost': els.spinMaggCosts.forEach(s=>s.style.fontSize=val+'px');return val+'px';
      case 'spinMaggBtns_border': els.spinMaggBtns.forEach(b=>b.style.borderWidth=val+'px');return val+'px';
      case 'spinMaggBtns_visible': els.spinMaggBtns.forEach(b=>b.style.display=+val?'':'none');return +val?'Sì':'No';
      /* Spin Animation */
      /* suspenseCols removed */
      case 'spinAnim_colDelay': window._designColDelay=parseInt(val);return val+'ms';
      /* Cascade speed */
      case 'spinAnim_cascadeWait': window._designCascadeWait=parseInt(val);return val+'ms';
      /* Win Feedback */
      case 'winFeedback_neonEnabled': window._designWinNeon=+val;return +val?'Sì':'No';
      case 'winFeedback_popupThreshold': window._designPopupThreshold=parseInt(val);return val+'x';
      case 'winFeedback_popupParticles': window._designPopupParticles=parseInt(val);return val;
      case 'winFeedback_popupDuration': window._designPopupDuration=parseInt(val);return val+'ms';
      /* Audio */
      case 'audio_masterVol': SFX.setVol(val/100);return val+'%';
      case 'audio_sfxEnabled':{const on=+val;if(on&&!SFX.isOn())SFX.toggle();if(!on&&SFX.isOn())SFX.toggle();return on?'Sì':'No';}
      case 'audio_bgmEnabled':{const on=+val;if(on&&!SFX.isBgmOn())SFX.bgmStart();if(!on&&SFX.isBgmOn())SFX.bgmStop();return on?'Sì':'No';}
      /* Bottom Sheet Menu */
      case 'bsMenu_maxH':{const sheet=document.querySelector('.bs-sheet');if(sheet)sheet.style.maxHeight=val+'vh';return val+'vh';}
      case 'bsMenu_borderRadius':{const sheet=document.querySelector('.bs-sheet');if(sheet)sheet.style.borderRadius=val+'px '+val+'px 0 0';return val+'px';}
      /* Big Win Popup */
      case 'bigWin_titleSize':{const t=document.querySelector('.big-win-title');if(t)t.style.fontSize=val+'px';return val+'px';}
      case 'bigWin_amountSize':{const a=document.querySelector('.big-win-amount');if(a)a.style.fontSize=val+'px';return val+'px';}
      /* Dynamic Background */
      case 'dynamicBg_starsVisible':{const el=document.querySelector('.starfield');if(el)el.style.display=+val?'':'none';return +val?'Sì':'No';}
      case 'dynamicBg_nebulaVisible':{const el=document.querySelector('.bg-nebula-pulse');if(el)el.style.display=+val?'':'none';return +val?'Sì':'No';}
      case 'dynamicBg_shootingStars': window._designShootingStars=+val;return +val?'Sì':'No';
      case 'dynamicBg_parallax': window._designParallax=+val;return +val?'Sì':'No';
      case 'dynamicBg_gridGlow':{const el=document.querySelector('.grid-glow');if(el)el.style.display=+val?'':'none';return +val?'Sì':'No';}
    }
    return val;
  }

  /* ── localStorage persistence ──
     STORAGE_KEY  → stato corrente modificato live (sovrascritto ad ogni slider input)
     PRESET_KEY   → preimpostazione salvata dall'utente, usata come fallback dopo Reset
                    e come default al primo caricamento se STORAGE_KEY è vuoto. */
  const STORAGE_KEY='cyberSlotDesignSettings';
  const PRESET_KEY ='cyberSlotDesignPreset';

  function saveAllSettings(){
    const settings={};
    dp.querySelectorAll('input[type="range"]').forEach(inp=>{
      const key=inp.dataset.target+'__'+inp.dataset.prop;
      settings[key]=inp.value;
    });
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(settings));}catch(e){}
  }

  function applySettingsObj(settings){
    if(!settings)return;
    dp.querySelectorAll('input[type="range"]').forEach(inp=>{
      const key=inp.dataset.target+'__'+inp.dataset.prop;
      if(key in settings){
        inp.value=settings[key];
        const display=applyVal(inp.dataset.target,inp.dataset.prop,parseFloat(inp.value));
        inp.nextElementSibling.textContent=display;
      }
    });
  }

  function loadAllSettings(){
    try{
      /* 1) Se esiste uno stato corrente → usalo */
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){applySettingsObj(JSON.parse(raw));return;}
      /* 2) Altrimenti prova il preset salvato dall'utente */
      const rawPre=localStorage.getItem(PRESET_KEY);
      if(rawPre){
        const pre=JSON.parse(rawPre);
        applySettingsObj(pre);
        /* promuovi il preset anche a stato corrente, così slider e localStorage sono allineati */
        try{localStorage.setItem(STORAGE_KEY,JSON.stringify(pre));}catch(e){}
      }
    }catch(e){}
  }

  /* Bind all sliders */
  dp.querySelectorAll('input[type="range"]').forEach(inp=>{
    const valSpan=inp.nextElementSibling;
    inp.addEventListener('input',()=>{
      const display=applyVal(inp.dataset.target,inp.dataset.prop,parseFloat(inp.value));
      valSpan.textContent=display;
      saveAllSettings();
    });
  });

  /* Load saved settings on startup */
  loadAllSettings();

  function wipeInlineStyles(){
    [els.gameArea,els.gridFrame,els.gridContainer,
     els.bottomBar,els.spinBtn,els.balanceText,els.winText,
     els.sidePanelL,document.getElementById('bonusSidePanel')].forEach(el=>{if(el){el.removeAttribute('style');el._oxVal=0;el._oyVal=0;el._br=0;}});
    [els.sidePanels,els.sideTitles].forEach(list=>{
      if(list&&list.forEach)list.forEach(el=>el.removeAttribute('style'));
    });
    document.querySelectorAll('.bsp-item').forEach(el=>el.removeAttribute('style'));
    document.querySelectorAll('.bsp-icon').forEach(el=>el.removeAttribute('style'));
    document.querySelectorAll('.cell').forEach(c=>c.removeAttribute('style'));
  }

  function resetSlidersToHtmlDefaults(){
    dp.querySelectorAll('input[type="range"]').forEach(inp=>{
      inp.value=inp.defaultValue;
      const display=applyVal(inp.dataset.target,inp.dataset.prop,parseFloat(inp.value));
      inp.nextElementSibling.textContent=display;
    });
  }

  /* Reset Tutto: ripristina il preset se salvato, altrimenti i default originali del codice */
  document.getElementById('designResetAll').addEventListener('click',()=>{
    wipeInlineStyles();
    resetSlidersToHtmlDefaults();
    try{localStorage.removeItem(STORAGE_KEY);}catch(e){}
    /* Se esiste un preset, riapplicalo subito */
    try{
      const rawPre=localStorage.getItem(PRESET_KEY);
      if(rawPre){
        const pre=JSON.parse(rawPre);
        applySettingsObj(pre);
        localStorage.setItem(STORAGE_KEY,JSON.stringify(pre));
      }
    }catch(e){}
  });

  /* Salva Preset: snapshot dello stato corrente come preimpostazione permanente */
  const savePresetBtn=document.getElementById('designSavePreset');
  if(savePresetBtn)savePresetBtn.addEventListener('click',()=>{
    const settings={};
    dp.querySelectorAll('input[type="range"]').forEach(inp=>{
      const key=inp.dataset.target+'__'+inp.dataset.prop;
      settings[key]=inp.value;
    });
    try{
      localStorage.setItem(PRESET_KEY,JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEY,JSON.stringify(settings));
      if(typeof showToast==='function')showToast('Preset salvato! Sarà riapplicato ad ogni apertura.','win',3000);
    }catch(e){
      if(typeof showToast==='function')showToast('Errore nel salvataggio preset.','info',2500);
    }
  });

  /* Cancella Preset: rimuove il preset e ripristina i default originali del codice */
  const clearPresetBtn=document.getElementById('designClearPreset');
  if(clearPresetBtn)clearPresetBtn.addEventListener('click',()=>{
    try{
      localStorage.removeItem(PRESET_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }catch(e){}
    wipeInlineStyles();
    resetSlidersToHtmlDefaults();
    if(typeof showToast==='function')showToast('Preset cancellato. Default originali ripristinati.','info',2500);
  });
})();

/* ══════════════════════════════════════════════════════
   PREMIUM PHASE 2 — Near-miss, Clusters, Particles,
   Shake, Background Reactivity, Count-up SFX
   ══════════════════════════════════════════════════════ */

/* ── 1. NEAR-MISS ANTICIPATION SYSTEM ── */
(function initNearMissSystem(){
  /* After grid fills & reveals, detect near-miss conditions
     and apply anticipation CSS classes to relevant cells */
  const _origFillGrid=fillGrid;
  fillGrid=function(anim){
    _origFillGrid(anim);
    if(!anim)return;
    /* Wait for reveal to complete, then check near-miss */
    const revealTime=(COLS*350+ROWS*130)/S.speedMult+800;
    setTimeout(()=>checkNearMiss(),revealTime);
  };

  function checkNearMiss(){
    if(!S.spinning)return;
    /* Count scatters on grid */
    let scatterCount=0;
    const scatterCells=[];
    const bonusCells=[];
    const bonusSyms=['buco_nero','supernova','antigravita','tesseract'];
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const sym=S.grid[r][c];
      if(sym==='scatter'){scatterCount++;scatterCells.push([r,c]);}
      if(bonusSyms.includes(sym))bonusCells.push([r,c]);
    }
    /* Near-miss: 2 scatters (need 3 for free spins) */
    if(scatterCount===2){
      scatterCells.forEach(([r,c])=>{
        const cell=document.getElementById(`c${r}_${c}`);
        if(cell){
          cell.classList.add('anticipation-scatter');
          SFX.anticipationTick&&SFX.anticipationTick();
          setTimeout(()=>cell.classList.remove('anticipation-scatter'),2500);
        }
      });
      /* Also tremble nearby empty columns */
      const scatterCols=new Set(scatterCells.map(([,c])=>c));
      for(let c=0;c<COLS;c++){
        if(scatterCols.has(c))continue;
        /* Make random cell in non-scatter columns tremble */
        const r=Math.floor(Math.random()*ROWS);
        const cell=document.getElementById(`c${r}_${c}`);
        if(cell){
          setTimeout(()=>{
            cell.classList.add('anticipation');
            setTimeout(()=>cell.classList.remove('anticipation'),1800);
          },300+Math.random()*500);
        }
      }
    }
    /* Bonus symbol anticipation: any bonus symbol gets glow */
    if(bonusCells.length>0){
      bonusCells.forEach(([r,c])=>{
        const cell=document.getElementById(`c${r}_${c}`);
        if(cell){
          cell.classList.add('anticipation');
          setTimeout(()=>cell.classList.remove('anticipation'),3000);
        }
      });
    }
  }
})();

/* ── Add anticipation tick SFX ── */
SFX.anticipationTick=function(){
  if(!SFX.isOn())return;
  /* Rising tension tone */
  const ctx=new(window.AudioContext||window.webkitAudioContext)();
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.type='sine';o.frequency.setValueAtTime(600,ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200,ctx.currentTime+0.4);
  g.gain.setValueAtTime(0.06,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
  o.connect(g);g.connect(ctx.destination);
  o.start(ctx.currentTime);o.stop(ctx.currentTime+0.55);
};
SFX.countTick=function(){
  if(!SFX.isOn())return;
  const ctx=new(window.AudioContext||window.webkitAudioContext)();
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.type='triangle';o.frequency.value=1800+Math.random()*400;
  g.gain.setValueAtTime(0.04,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.06);
  o.connect(g);g.connect(ctx.destination);
  o.start(ctx.currentTime);o.stop(ctx.currentTime+0.08);
};
SFX.countCoin=function(){
  if(!SFX.isOn())return;
  const ctx=new(window.AudioContext||window.webkitAudioContext)();
  const o=ctx.createOscillator();const o2=ctx.createOscillator();
  const g=ctx.createGain();
  o.type='sine';o.frequency.value=2400;
  o2.type='sine';o2.frequency.value=3600;
  g.gain.setValueAtTime(0.05,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.12);
  o.connect(g);o2.connect(g);g.connect(ctx.destination);
  o.start(ctx.currentTime);o2.start(ctx.currentTime);
  o.stop(ctx.currentTime+0.15);o2.stop(ctx.currentTime+0.15);
};

/* ── 2. LUMINOUS CLUSTER CONNECTION LINES ── */
(function initClusterLines(){
  /* Create SVG overlay inside gridFrame */
  const gridFrame=document.getElementById('gridFrame');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id='clusterSvg';
  svg.setAttribute('style','position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:15;overflow:visible');
  gridFrame.appendChild(svg);

  /* Add SVG glow filter */
  svg.innerHTML=`<defs>
    <filter id="clusterGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>`;

  function drawClusterLines(clusters){
    /* Clear old lines */
    svg.querySelectorAll('line,circle').forEach(el=>el.remove());
    if(!clusters||!clusters.length)return;

    const gridEl=document.getElementById('grid');
    const gridRect=gridFrame.getBoundingClientRect();

    clusters.forEach((cl,ci)=>{
      const hue=(ci*60+200)%360;
      const color=`hsl(${hue},100%,70%)`;
      const colorGlow=`hsl(${hue},100%,50%)`;

      /* Build adjacency: connect each cell to its cluster neighbors */
      const cellSet=new Set(cl.cells.map(([r,c])=>`${r},${c}`));

      cl.cells.forEach(([r,c])=>{
        const cell=document.getElementById(`c${r}_${c}`);
        if(!cell)return;
        const rect=cell.getBoundingClientRect();
        const cx=rect.left+rect.width/2-gridRect.left;
        const cy=rect.top+rect.height/2-gridRect.top;

        /* Draw node dot */
        const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
        dot.setAttribute('cx',cx);dot.setAttribute('cy',cy);dot.setAttribute('r','3');
        dot.setAttribute('fill',color);dot.setAttribute('opacity','0.8');
        dot.setAttribute('filter','url(#clusterGlow)');
        dot.classList.add('cluster-node');
        svg.appendChild(dot);

        /* Connect to right and bottom neighbors (avoid duplicate lines) */
        [[r,c+1],[r+1,c],[r+1,c+1],[r+1,c-1]].forEach(([nr,nc])=>{
          if(cellSet.has(`${nr},${nc}`)){
            const nCell=document.getElementById(`c${nr}_${nc}`);
            if(!nCell)return;
            const nRect=nCell.getBoundingClientRect();
            const nx=nRect.left+nRect.width/2-gridRect.left;
            const ny=nRect.top+nRect.height/2-gridRect.top;

            const line=document.createElementNS('http://www.w3.org/2000/svg','line');
            line.setAttribute('x1',cx);line.setAttribute('y1',cy);
            line.setAttribute('x2',nx);line.setAttribute('y2',ny);
            line.setAttribute('stroke',color);
            line.setAttribute('stroke-width','2');
            line.setAttribute('opacity','0');
            line.setAttribute('filter','url(#clusterGlow)');
            line.classList.add('cluster-line');
            svg.appendChild(line);

            /* Animate in */
            requestAnimationFrame(()=>{
              line.style.transition='opacity 0.3s ease-in';
              line.setAttribute('opacity','0.7');
            });
          }
        });
      });
    });

    /* Pulse animation via CSS class toggle */
    setTimeout(()=>{
      svg.querySelectorAll('.cluster-line').forEach(l=>{
        l.style.transition='opacity 0.4s';
        l.setAttribute('opacity','0.4');
      });
      setTimeout(()=>{
        svg.querySelectorAll('.cluster-line').forEach(l=>l.setAttribute('opacity','0.7'));
      },400);
    },600);
  }

  function clearClusterLines(){
    svg.querySelectorAll('line,circle').forEach(el=>{
      el.style.transition='opacity 0.3s';
      el.setAttribute('opacity','0');
      setTimeout(()=>el.remove(),350);
    });
  }

  /* Hook into highlightWins */
  const _prevHighlightWins=highlightWins;
  highlightWins=async function(clusters){
    drawClusterLines(clusters);
    await _prevHighlightWins(clusters);
    clearClusterLines();
  };
})();

/* ── 3. COUNT-UP SOUND TICKS IN PREMIUM WIN ── */
(function patchCountUpSFX(){
  const _origShowPremiumWin=showPremiumWin;
  showPremiumWin=function(amount,label,type){
    _origShowPremiumWin(amount,label,type);
    /* Add sound ticks during count-up */
    const betRatio=amount/S.bet;
    let level='big';
    if(betRatio>=50)level='ultra';
    else if(betRatio>=20)level='mega';
    const duration=level==='ultra'?2500:level==='mega'?2000:1500;
    const tickInterval=level==='ultra'?80:level==='mega'?100:120;
    let tickCount=0;
    const maxTicks=Math.floor(duration/tickInterval);
    const sfxInterval=setInterval(()=>{
      tickCount++;
      if(tickCount>=maxTicks){
        clearInterval(sfxInterval);
        SFX.countCoin();/* Final coin sound */
        return;
      }
      /* Alternate tick and coin for satisfying audio */
      if(tickCount%4===0)SFX.countCoin();
      else SFX.countTick();
    },tickInterval);
    /* Store interval for cleanup */
    window._winSfxInterval=sfxInterval;
  };
  const _origHidePremiumWin=hidePremiumWin;
  hidePremiumWin=function(){
    if(window._winSfxInterval){clearInterval(window._winSfxInterval);window._winSfxInterval=null;}
    _origHidePremiumWin();
  };
})();

/* ── 4. AMBIENT PARTICLE SYSTEM ── */
(function initAmbientParticles(){
  /* Multi-type reactive particle spawner */
  const types={
    star:{emoji:'✦',minSize:8,maxSize:14,speed:[0.3,0.8],opacity:[0.2,0.5],drift:true},
    dust:{emoji:'·',minSize:3,maxSize:6,speed:[0.1,0.4],opacity:[0.15,0.35],drift:true},
    sparkle:{emoji:'✧',minSize:10,maxSize:16,speed:[0.5,1.2],opacity:[0.3,0.6],drift:false}
  };
  let particles=[];
  let gameState='idle';/* idle, spin, win, bonus, cascade */
  const canvas=document.createElement('div');
  canvas.id='ambientParticles';
  canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden';
  document.getElementById('app').prepend(canvas);

  function spawnParticle(typeKey){
    const t=types[typeKey];
    const p=document.createElement('div');
    const size=t.minSize+Math.random()*(t.maxSize-t.minSize);
    const startX=Math.random()*100;
    const startY=100+Math.random()*10;/* Start below viewport */
    const speed=t.speed[0]+Math.random()*(t.speed[1]-t.speed[0]);
    const op=t.opacity[0]+Math.random()*(t.opacity[1]-t.opacity[0]);
    const dur=20/speed+Math.random()*10;

    p.textContent=t.emoji;
    p.style.cssText=`position:absolute;left:${startX}%;bottom:-20px;font-size:${size}px;opacity:${op};
      color:rgba(180,200,255,0.8);pointer-events:none;will-change:transform;
      transition:opacity 1s;`;

    /* Reactive color shift */
    if(gameState==='win')p.style.color='rgba(255,215,0,0.7)';
    else if(gameState==='bonus')p.style.color='rgba(180,50,255,0.7)';
    else if(gameState==='cascade')p.style.color='rgba(0,255,200,0.6)';

    canvas.appendChild(p);
    particles.push({el:p,x:startX,y:0,speed,drift:t.drift,dur,age:0});

    setTimeout(()=>{
      if(p.parentNode)p.remove();
      particles=particles.filter(pp=>pp.el!==p);
    },dur*1000);
  }

  /* Animation loop */
  let lastTime=0;
  function tick(now){
    const dt=(now-lastTime)/1000;
    lastTime=now;
    particles.forEach(p=>{
      p.y+=p.speed*dt*60;
      let driftX=0;
      if(p.drift)driftX=Math.sin(now*0.001+p.x)*0.3;
      p.el.style.transform=`translateY(-${p.y}px) translateX(${driftX*20}px)`;
      p.age+=dt;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(t=>{lastTime=t;requestAnimationFrame(tick);});

  /* Spawn rates based on state */
  const rateMap={idle:1500,spin:800,win:300,bonus:400,cascade:500};
  let spawnTimer=null;
  function updateSpawnRate(){
    if(spawnTimer)clearInterval(spawnTimer);
    const rate=rateMap[gameState]||1500;
    spawnTimer=setInterval(()=>{
      const typeKeys=Object.keys(types);
      /* More sparkles during win/bonus states */
      let chosen;
      if(gameState==='win'||gameState==='bonus'){
        chosen=Math.random()<0.4?'sparkle':Math.random()<0.6?'star':'dust';
      }else{
        chosen=Math.random()<0.1?'sparkle':Math.random()<0.5?'star':'dust';
      }
      spawnParticle(chosen);
    },rate);
  }
  updateSpawnRate();

  /* Expose state setter */
  window.setAmbientState=function(state){
    if(state===gameState)return;
    gameState=state;
    updateSpawnRate();
  };

  /* Burst effect for big moments */
  window.ambientBurst=function(count,type){
    for(let i=0;i<count;i++){
      setTimeout(()=>spawnParticle(type||'sparkle'),i*50);
    }
  };
})();

/* ── 5. SCREEN SHAKE INTEGRATION ── */
(function patchShakeIntegration(){
  /* Patch cascade to shake on higher cascades */
  const _prevCascadeGrid=cascadeGrid;
  cascadeGrid=async function(){
    await _prevCascadeGrid();
    /* Shake on cascade level 3+ */
    if(S.cascLvl>=6)shakeGrid('md');
    else if(S.cascLvl>=3)shakeGrid('sm');
  };

  /* Also shake when bonus symbols trigger — patch each directly */
  if(typeof triggerBlackHole==='function'){
    const _origBH=triggerBlackHole;
    triggerBlackHole=async function(){shakeGrid('md');window.ambientBurst&&window.ambientBurst(10,'sparkle');return await _origBH.apply(this,arguments);};
  }
  if(typeof triggerSupernova==='function'){
    const _origSN=triggerSupernova;
    triggerSupernova=async function(){shakeGrid('md');window.ambientBurst&&window.ambientBurst(10,'sparkle');return await _origSN.apply(this,arguments);};
  }
  if(typeof triggerAntigravita==='function'){
    const _origAG=triggerAntigravita;
    triggerAntigravita=async function(){shakeGrid('sm');window.ambientBurst&&window.ambientBurst(8,'star');return await _origAG.apply(this,arguments);};
  }
  if(typeof triggerTesseract==='function'){
    const _origTS=triggerTesseract;
    triggerTesseract=async function(){shakeGrid('md');window.ambientBurst&&window.ambientBurst(10,'sparkle');return await _origTS.apply(this,arguments);};
  }
})();

/* ── 6. BACKGROUND REACTIVITY JS ── */
(function initBgReactivity(){
  const app=document.getElementById('app');

  function setBgState(state){
    app.classList.remove('bg-react-win','bg-react-bonus','bg-react-cascade');
    if(state)app.classList.add('bg-react-'+state);
  }

  /* Patch spin for bg states */
  const _prevSpin2=spin;
  spin=async function(){
    setBgState(null);
    window.setAmbientState&&window.setAmbientState('spin');
    await _prevSpin2();
    setBgState(null);
    window.setAmbientState&&window.setAmbientState('idle');
  };

  /* Patch highlightWins for bg-react-win + cascade */
  const _prevHL=highlightWins;
  highlightWins=async function(clusters){
    setBgState(S.cascLvl>=1?'cascade':'win');
    window.setAmbientState&&window.setAmbientState(S.cascLvl>=1?'cascade':'win');
    await _prevHL(clusters);
  };

  /* Patch showWin for bg-react-win + ambient burst */
  const _prevShowWin2=showWin;
  showWin=function(t){
    _prevShowWin2(t);
    const lines=t.split('\n');
    const amountStr=(lines[1]||'0').replace(/[^\d]/g,'');
    const amount=parseInt(amountStr)||0;
    if(amount>0){
      setBgState('win');
      window.setAmbientState&&window.setAmbientState('win');
      const ratio=amount/S.bet;
      if(ratio>=50)window.ambientBurst&&window.ambientBurst(20,'sparkle');
      else if(ratio>=20)window.ambientBurst&&window.ambientBurst(12,'sparkle');
      else window.ambientBurst&&window.ambientBurst(6,'star');
    }
  };

  /* Patch hideWin to clear bg state */
  const _prevHideWin2=hideWin;
  hideWin=function(){
    _prevHideWin2();
    setBgState(null);
    window.setAmbientState&&window.setAmbientState('idle');
  };

  /* Detect bonus modes */
  const _prevTriggerFS=typeof triggerFreeSpins==='function'?triggerFreeSpins:null;
  if(_prevTriggerFS){
    triggerFreeSpins=async function(n){
      setBgState('bonus');
      window.setAmbientState&&window.setAmbientState('bonus');
      window.ambientBurst&&window.ambientBurst(15,'sparkle');
      const result=await _prevTriggerFS(n);
      setBgState(null);
      window.setAmbientState&&window.setAmbientState('idle');
      return result;
    };
  }
})();

/* ── CSS injection for cluster lines + ambient particles ── */
(function injectPremiumCSS(){
  const style=document.createElement('style');
  style.textContent=`
    #clusterSvg line{stroke-linecap:round}
    #clusterSvg .cluster-node{animation:clusterPulse 0.8s ease-in-out infinite alternate}
    @keyframes clusterPulse{0%{r:3;opacity:0.6}100%{r:5;opacity:1}}
    #ambientParticles{mix-blend-mode:screen}
    .bg-react-win #ambientParticles{filter:brightness(1.3)}
    .bg-react-bonus #ambientParticles{filter:hue-rotate(40deg) brightness(0.8)}
    .bg-react-cascade #ambientParticles{filter:hue-rotate(-30deg) brightness(1.1)}
  `;
  document.head.appendChild(style);
})();

/* ── TUTORIAL SYSTEM ── */
const TUT_STEPS=[
  {el:'gridFrame', title:'La Griglia 7×7', text:'Qui appaiono i simboli. Trova cluster di 5+ simboli uguali connessi per vincere!', pos:'right'},
  {el:'spinBtn', title:'Pulsante Spin', text:'Premi per far girare i rulli. Ogni spin costa la puntata selezionata.', pos:'top'},
  {el:'balance', title:'Il Tuo Saldo', text:'Mostra il tuo credito attuale. Vinci per aumentarlo!', pos:'top'},
  {el:'betVal', title:'Puntata', text:'Usa + e − per regolare la puntata prima di ogni spin.', pos:'top'},
  {el:null, title:'Cascate', text:'Quando vinci, i simboli esplodono e nuovi cadono dall\'alto. Cascate multiple = vincite multiple!', pos:'center'},
  {el:null, title:'Buon Divertimento!', text:'Ora sei pronto a giocare. Cerca i simboli Wild (jolly) e Scatter (bonus) per premi speciali!', pos:'center'}
];
let tutStep=-1;

function startTutorial(){
  tutStep=0;
  document.getElementById('tutOverlay').classList.add('active');
  showTutStep();
}

function showTutStep(){
  const step=TUT_STEPS[tutStep];
  const hl=document.getElementById('tutHighlight');
  const tt=document.getElementById('tutTooltip');
  tt.classList.remove('show');
  
  setTimeout(()=>{
    if(step.el){
      const target=document.getElementById(step.el);
      if(target){
        const r=target.getBoundingClientRect();
        hl.style.display='block';
        hl.style.left=(r.left-6)+'px';
        hl.style.top=(r.top-6)+'px';
        hl.style.width=(r.width+12)+'px';
        hl.style.height=(r.height+12)+'px';
      }
    } else {
      hl.style.display='none';
    }
    
    /* Build tooltip content */
    let dots='';
    for(let i=0;i<TUT_STEPS.length;i++){
      dots+='<div class="tut-dot'+(i<tutStep?' done':'')+(i===tutStep?' active':'')+'"></div>';
    }
    
    const isLast=tutStep===TUT_STEPS.length-1;
    const isFirst=tutStep===0;
    tt.innerHTML='<h3>'+step.title+'</h3><p>'+step.text+'</p><div class="tut-nav">'
      +(isFirst?'':'<button class="tut-btn" onclick="tutPrev()">Indietro</button>')
      +'<button class="tut-btn tut-btn-primary" onclick="'+(isLast?'endTutorial()':'tutNext()')+'">'+(isLast?'Inizia a Giocare!':'Avanti')+'</button>'
      +'</div><div class="tut-progress">'+dots+'</div>';
    
    /* Position tooltip */
    if(step.el && step.pos!=='center'){
      const target=document.getElementById(step.el);
      if(target){
        const r=target.getBoundingClientRect();
        if(step.pos==='right'){
          tt.style.left=(r.right+20)+'px';
          tt.style.top=(r.top+r.height/2-80)+'px';
        } else if(step.pos==='top'){
          tt.style.left=(r.left+r.width/2-160)+'px';
          tt.style.top=(r.top-180)+'px';
        } else if(step.pos==='bottom'){
          tt.style.left=(r.left+r.width/2-160)+'px';
          tt.style.top=(r.bottom+20)+'px';
        }
      }
    } else {
      tt.style.left='50%';
      tt.style.top='50%';
      tt.style.transform='translate(-50%,-50%)';
    }
    
    tt.classList.add('show');
  },100);
}

function tutNext(){if(tutStep<TUT_STEPS.length-1){tutStep++;showTutStep();}}
function tutPrev(){if(tutStep>0){tutStep--;showTutStep();}}
function endTutorial(){
  document.getElementById('tutOverlay').classList.remove('active');
  document.getElementById('tutTooltip').classList.remove('show');
  tutStep=-1;
  localStorage.setItem('cyberSlotTutDone','1');
}

/* Tutorial is available from the settings menu - no auto-start */

/* Parallax mouse tracking */
document.addEventListener('mousemove', (e) => {
  if(window._designParallax===0) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 100;
  const y = (e.clientY / window.innerHeight - 0.5) * 100;
  document.documentElement.style.setProperty('--mouse-x', x + 'px');
  document.documentElement.style.setProperty('--mouse-y', y + 'px');
});

/* Shooting stars spawner */
function spawnShootingStar() {
  if(window._designShootingStars===0) return;
  const star = document.createElement('div');
  star.className = 'shooting-star active';
  star.style.top = Math.random() * 40 + '%';
  star.style.left = Math.random() * 60 + '%';
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 2000);
}
setInterval(() => { if (Math.random() < 0.3) spawnShootingStar(); }, 4000);
/* ── EXPOSE GLOBALS FOR HTML ONCLICK ── */
window.buildPool = buildPool;
window.rndSym = rndSym;
window.initGrid = initGrid;
window.renderSymbol = renderSymbol;
window.fillGrid = fillGrid;
window.shuffleReveal = shuffleReveal;
window.pickExtraSymbol = pickExtraSymbol;
window.renderFullGrid = renderFullGrid;
window.renderCell = renderCell;
window.findClusters = findClusters;
window.calcPay = calcPay;
window.updBal = updBal;
window.updSpinWinPanel = updSpinWinPanel;
window.setGridState = setGridState;
window.spawnWinCoins = spawnWinCoins;
window.triggerBgFlash = triggerBgFlash;
window.triggerShockwave = triggerShockwave;
window.triggerBgShift = triggerBgShift;
window.showWin = showWin;
window.hideWin = hideWin;
window.showBigWinPopup = showBigWinPopup;
window.showToast = showToast;

/* ══════════════════════════════════════════════════════
   TEST BONUS PANEL — motore headless per simulare N spin di una funzione
   ══════════════════════════════════════════════════════ */
function openTestBonus(){
  const ov=document.getElementById('testBonusOverlay');
  if(ov)ov.classList.add('active');
}
function closeTestBonus(){
  const ov=document.getElementById('testBonusOverlay');
  if(ov)ov.classList.remove('active');
}
function clearBonusTestLog(){
  const log=document.getElementById('tbLog');
  if(log)log.innerHTML='<div class="tb-log-placeholder">Clicca "Avvia Test" per iniziare.</div>';
  const stats=['tbStatSpins','tbStatCost','tbStatWin','tbStatEV','tbStatMax','tbStatHit','tbStatRtp'];
  stats.forEach(id=>{const el=document.getElementById(id);if(el)el.textContent= id==='tbStatRtp'?'—':'0';});
}

/* ── Utility headless: genera griglia random con i WEIGHTS correnti ── */
function _tbRndSym(pool){return pool[Math.floor(Math.random()*pool.length)];}
function _tbBuildPool(){
  const pool=[];
  for(const[sym,wt]of Object.entries(WEIGHTS))for(let i=0;i<Math.round(wt*10);i++)pool.push(sym);
  return pool;
}
function _tbNewGrid(pool){
  const g=[],m=[];
  for(let r=0;r<ROWS;r++){g[r]=[];m[r]=[];for(let c=0;c<COLS;c++){g[r][c]=_tbRndSym(pool);m[r][c]=1;}}
  return{g,m};
}
function _tbFindClusters(grid,minCl){
  const vis=Array.from({length:ROWS},()=>Array(COLS).fill(null));
  const clusters=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const s=grid[r][c];
    if(!s||s==='wild'||EXTRA_SYMS.includes(s)||s==='scatter')continue;
    if(vis[r][c]===s)continue;
    const cells=[],q=[[r,c]],lv=new Set([r+','+c]);
    while(q.length){
      const[cr,cc]=q.shift();cells.push([cr,cc]);
      for(const[nr,nc]of[[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]]){
        if(nr<0||nr>=ROWS||nc<0||nc>=COLS)continue;
        const k=nr+','+nc;if(lv.has(k))continue;
        const ng=grid[nr][nc];
        if(ng===s||ng==='wild'){lv.add(k);q.push([nr,nc]);}
      }
    }
    for(const[cr,cc]of cells)if(grid[cr][cc]===s)vis[cr][cc]=s;
    if(cells.length>=minCl)clusters.push({sym:s,cells,sz:cells.length});
  }
  return clusters;
}
function _tbCalcPay(clusters,grid,cellMult,bet){
  let total=0;
  for(const cl of clusters){
    const pt=PAYTABLE[cl.sym];if(!pt)continue;
    const idx=Math.min(cl.sz,pt.length-1);
    const basePay=pt[idx];
    let wildMult=1;cl.cells.forEach(([r,c])=>{if(grid[r][c]==='wild'&&cellMult[r][c]>1)wildMult*=cellMult[r][c];});
    let cascSum=0,normCount=0;
    cl.cells.forEach(([r,c])=>{if(grid[r][c]!=='wild'){cascSum+=cellMult[r][c];normCount++;}});
    const avgCasc=normCount>0?cascSum/normCount:1;
    total+=basePay*bet*avgCasc*wildMult;
  }
  return total;
}
function _tbCascade(grid,cellMult,pool){
  for(let c=0;c<COLS;c++){
    const col=[],colM=[];
    for(let r=ROWS-1;r>=0;r--)if(grid[r][c]!==null){col.push(grid[r][c]);colM.push(cellMult[r][c]);}
    for(let r=ROWS-1;r>=0;r--){
      const i=ROWS-1-r;
      if(i<col.length){grid[r][c]=col[i];cellMult[r][c]=colM[i];}
      else{grid[r][c]=_tbRndSym(pool);cellMult[r][c]=1;}
    }
  }
}
function _tbRunCascades(grid,cellMult,pool,bet,minCl){
  let total=0;
  while(true){
    const cls=_tbFindClusters(grid,minCl);
    if(!cls.length)break;
    total+=_tbCalcPay(cls,grid,cellMult,bet);
    cls.forEach(cl=>cl.cells.forEach(([r,c])=>{cellMult[r][c]++;if(grid[r][c]!=='wild')grid[r][c]=null;}));
    _tbCascade(grid,cellMult,pool);
  }
  return total;
}

/* ── Simula un singolo attivazione di bonus ── */
function _tbSimBonus(bonusType,bet,pool){
  const minCl=S.minCl||5;
  /* Helper per eseguire un upgrade-bonus (BH / SN): wild mult 2-5 */
  function upgradeBonus(){
    const{g,m}=_tbNewGrid(pool);
    const BH_UPGRADE_SYMS=['J','Q','K','A','alieno'];
    const BH_UPGRADE_WEIGHTS={J:35,Q:28,K:22,A:12,alieno:3};
    const UPGRADE_MAP={J:'Q',Q:'K',K:'A',A:'alieno',alieno:'astronauta'};
    const tot=Object.values(BH_UPGRADE_WEIGHTS).reduce((a,b)=>a+b,0);
    let rv=Math.random()*tot,sm=0,chosen='J';
    for(const s of BH_UPGRADE_SYMS){sm+=BH_UPGRADE_WEIGHTS[s];if(rv<sm){chosen=s;break;}}
    const upTo=UPGRADE_MAP[chosen];
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(g[r][c]===chosen)g[r][c]=upTo;
    const wr=Math.floor(Math.random()*ROWS),wc=Math.floor(Math.random()*COLS);
    g[wr][wc]='wild';m[wr][wc]=[2,3,4,5][Math.floor(Math.random()*4)];
    return _tbRunCascades(g,m,pool,bet,minCl);
  }
  if(bonusType==='buco_nero'||bonusType==='supernova')return upgradeBonus();
  if(bonusType==='antigravita'){
    const{g,m}=_tbNewGrid(pool);
    const VALUE_ORDER=['astronauta','alieno','A','K','Q','J'];
    const cnt={};for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const s=g[r][c];if(s&&REGULAR_SYMS.includes(s))cnt[s]=(cnt[s]||0)+1;}
    let best=null,size=5;
    for(const s of VALUE_ORDER){if((cnt[s]||0)>=4){best=s;size=Math.min((cnt[s]||0)+1,9);break;}}
    if(!best)for(const s of VALUE_ORDER){if((cnt[s]||0)>=3){best=s;size=5;break;}}
    if(!best)return 0;
    const ar=Math.floor(Math.random()*ROWS),ac=Math.floor(Math.random()*COLS);
    const visited=new Set([ar+','+ac]);const pos=[[ar,ac]];const bfs=[[ar,ac]];
    while(bfs.length&&pos.length<size){
      const[cr,cc]=bfs.shift();
      for(const[nr,nc]of[[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]]){
        if(nr<0||nr>=ROWS||nc<0||nc>=COLS)continue;
        const k=nr+','+nc;if(visited.has(k))continue;visited.add(k);bfs.push([nr,nc]);pos.push([nr,nc]);
        if(pos.length>=size)break;
      }
    }
    for(const[cr,cc]of pos){if(cr===ar&&cc===ac)continue;g[cr][cc]=best;m[cr][cc]=1;}
    g[ar][ac]='wild';m[ar][ac]=Math.max(2,Math.min(6,Math.ceil(size*0.6)));
    return _tbRunCascades(g,m,pool,bet,minCl);
  }
  if(bonusType==='tesseract'){
    const COIN_MULTS=[1.66,2.52,3.31,4.18,4.97,6.62,8.28,9.94,13.25,16.56];
    const MAX_WIN_MULT=414;
    const TOKEN_WEIGHTS={coin:75,expand:18,collect:7};
    const totalW=TOKEN_WEIGHTS.coin+TOKEN_WEIGHTS.expand+TOKEN_WEIGHTS.collect;
    function pickTok(){const r=Math.random()*totalW;let s=0;for(const k of['coin','expand','collect']){s+=TOKEN_WEIGHTS[k];if(r<s)return k;}return 'coin';}
    let total=0,spinsLeft=3,subCells=9,visibleCoins=[];
    while(spinsLeft>0){
      let landed=false;
      for(let i=0;i<subCells;i++){
        if(Math.random()<0.15){
          landed=true;const t=pickTok();
          if(t==='coin'){
            const isMax=Math.random()<0.03;
            const v=isMax?MAX_WIN_MULT*bet:COIN_MULTS[Math.floor(Math.random()*COIN_MULTS.length)]*bet;
            visibleCoins.push(v);total+=v;
          } else if(t==='expand'){subCells=Math.min(49,subCells+2);}
          else if(t==='collect'){let sum=visibleCoins.reduce((a,b)=>a+b,0);total+=sum;visibleCoins=[];}
        }
      }
      if(landed)spinsLeft=3;else spinsLeft--;
    }
    return total;
  }
  if(bonusType==='freeSpin'||bonusType==='superBonus'){
    /* Free Spin BOUGHT: fsMult start = 1.5 × 11.85 = 17.775, step = 0.7 × 11.85 = 8.295, 10 spin */
    const isSuper=(bonusType==='superBonus');
    let total=0;
    if(isSuper){
      /* 4 bonus + Free Spin naturale (non boostato) */
      total+=upgradeBonus();/* BH */
      total+=upgradeBonus();/* SN */
      total+=_tbSimBonus('antigravita',bet,pool);
      total+=_tbSimBonus('tesseract',bet,pool);
      /* Natural FS: 10 spin, fsMult 1.5 step 0.7 */
      let fsMult=1.5;
      for(let fs=0;fs<10;fs++){fsMult+=0.7;const{g,m}=_tbNewGrid(pool);total+=_tbRunCascades(g,m,pool,bet,minCl)*fsMult;}
      return total;
    }
    /* Bought FS */
    let fsMult=1.5*11.85;const fsStep=0.7*11.85;
    for(let fs=0;fs<10;fs++){fsMult+=fsStep;const{g,m}=_tbNewGrid(pool);total+=_tbRunCascades(g,m,pool,bet,minCl)*fsMult;}
    return total;
  }
  if(bonusType==='spaceSpin'){
    /* Space Spin: giant size + spaceMult random. Pay = paytable[sym][giantSize²] × 3 × spaceMult */
    const SPACE_MULTS=[{v:1,w:300},{v:2,w:350},{v:3,w:200},{v:5,w:100},{v:10,w:30},{v:25,w:15},{v:100,w:4},{v:500,w:1}];
    const totW=SPACE_MULTS.reduce((s,m)=>s+m.w,0);
    let pk=Math.random()*totW,spM=1;
    for(const m of SPACE_MULTS){pk-=m.w;if(pk<=0){spM=m.v;break;}}
    const giantSyms=['astronauta','alieno','A','K'];
    const chosen=giantSyms[Math.floor(Math.random()*giantSyms.length)];
    const rr=Math.random();
    const giantSize=rr<0.50?3:rr<0.75?4:rr<0.90?5:6;
    const pt=PAYTABLE[chosen];
    const idx=Math.min(giantSize*giantSize,pt.length-1);
    return pt[idx]*bet*3*spM;
  }
  return 0;
}

/* ── Run N spin del bonus scelto, aggiornando log e stats in batch ── */
async function runBonusTest(){
  const typeEl=document.getElementById('tbBonusType');
  const nEl=document.getElementById('tbNumSpins');
  const logEl=document.getElementById('tbLog');
  const btnEl=document.getElementById('tbRunBtn');
  const type=typeEl.value;
  const N=Math.max(1,Math.min(10000,parseInt(nEl.value)||100));
  const bet=1;/* normalizzato a 1× bet per leggibilità */
  const pool=_tbBuildPool();
  const costMult=BONUS_COST_MULT[type]||0;

  btnEl.disabled=true;btnEl.textContent='…';
  logEl.innerHTML='';
  let totalWin=0,maxWin=0,hits=0;
  const t0=performance.now();

  for(let i=0;i<N;i++){
    const win=_tbSimBonus(type,bet,pool);
    totalWin+=win;
    if(win>0)hits++;
    if(win>maxWin)maxWin=win;
    const winX=win/bet;
    const cls=winX>=50?'huge':winX>=10?'big':winX>0?'win':'miss';
    const line=document.createElement('div');
    line.className='tb-log-line '+cls;
    line.textContent=`#${String(i+1).padStart(String(N).length)}  ${win===0?'—':'+'+winX.toFixed(2)+'× bet'}`;
    logEl.appendChild(line);
    /* Aggiorna stats live ogni 10 spin o alla fine */
    if((i+1)%10===0||i===N-1){
      const avg=totalWin/(i+1);
      const rtp=costMult>0?(avg/costMult*100):0;
      document.getElementById('tbStatSpins').textContent=(i+1)+'/'+N;
      document.getElementById('tbStatCost').textContent=fmt(Math.round(costMult*(i+1)*100)/100)+'×';
      document.getElementById('tbStatWin').textContent=fmt(Math.round(totalWin*100)/100)+'×';
      document.getElementById('tbStatEV').textContent=avg.toFixed(2)+'×';
      document.getElementById('tbStatMax').textContent=maxWin.toFixed(2)+'×';
      document.getElementById('tbStatHit').textContent=(hits/(i+1)*100).toFixed(1)+'%';
      document.getElementById('tbStatRtp').textContent=costMult>0?rtp.toFixed(1)+'%':'—';
      logEl.scrollTop=logEl.scrollHeight;
      /* yield al browser ogni 100 spin per non bloccare la UI */
      if((i+1)%100===0)await new Promise(r=>setTimeout(r,0));
    }
  }

  const elapsed=((performance.now()-t0)/1000).toFixed(2);
  const avg=totalWin/N;
  const rtp=costMult>0?(avg/costMult*100):0;
  const summary=document.createElement('div');
  summary.className='tb-log-summary';
  summary.innerHTML=`✓ ${N} spin in ${elapsed}s · EV=${avg.toFixed(2)}× · Max=${maxWin.toFixed(2)}× · Hit=${(hits/N*100).toFixed(1)}%${costMult>0?' · RTP pagato='+rtp.toFixed(1)+'%':''}`;
  logEl.appendChild(summary);
  logEl.scrollTop=logEl.scrollHeight;

  btnEl.disabled=false;btnEl.textContent='▶ Avvia Test';
}

window.openTestBonus=openTestBonus;
window.closeTestBonus=closeTestBonus;
window.runBonusTest=runBonusTest;
window.clearBonusTestLog=clearBonusTestLog;

/* ══════════════════════════════════════════════════════
   CHEAT MODE — integrato nel dev-panel esistente (bottone ⚙ in basso a destra)
   ══════════════════════════════════════════════════════ */
function cheatStatus(msg){
  const el=document.getElementById('cheatStatus');if(el)el.textContent=msg;
}
function cheatAddBalance(amt){
  S.bal+=amt;updBal();
  cheatStatus('Saldo +'+amt+' → totale '+S.bal);
  if(typeof showToast==='function')showToast('+'+amt+' crediti','win',2000);
}
function cheatSetBalance(v){
  S.bal=v;updBal();
  cheatStatus('Saldo impostato a '+v);
}
function cheatForceWin(){
  S.forceW=true;
  cheatStatus('Prossimo spin: forza vincita garantita.');
  if(typeof showToast==='function')showToast('Forza Win attivato','cascade',2000);
}
function cheatForceMaxWin(){
  S.forceMaxWin=true;S.forceW=true;
  cheatStatus('Prossimo spin: tentativo MAX WIN.');
  if(typeof showToast==='function')showToast('Forza MAX WIN','bonus',2000);
}
function cheatForceScatter(n){
  S.forceScatter=n;
  cheatStatus('Prossimo spin: '+n+' scatter forzati ('+(n>=5?15:10)+' FS).');
  if(typeof showToast==='function')showToast(n+' Scatter forzati','freespin',2000);
}
function cheatForceExtra(sym){
  S.forceExtra=sym;
  cheatStatus('Prossimo spin: bonus '+sym+' forzato.');
  if(typeof showToast==='function')showToast('Bonus '+sym+' forzato','bonus',2000);
}
function cheatDust(action){
  if(action==='fill'){if(typeof updDust==='function')updDust(S.dustMax-S.dust);cheatStatus('Polvere al 100% — il bonus partirà a fine spin.');}
  else if(action==='half'){S.dust=Math.floor(S.dustMax/2);if(typeof updDust==='function')updDust(0);cheatStatus('Polvere al 50%.');}
  else if(action==='reset'){S.dust=0;S.dustFullPending=false;if(typeof updDust==='function')updDust(0);cheatStatus('Polvere azzerata.');}
}
function cheatToggleTurbo(){
  S.turbo=!S.turbo;S.speedMult=S.turbo?2:1;
  cheatStatus('Turbo: '+(S.turbo?'ON (×2)':'OFF'));
}
function cheatResetStats(){
  S.spins=0;S.wagered=0;S.won=0;S.hits=0;S.maxW=0;S.maxC=0;S.totC=0;
  if(typeof updDev==='function')updDev();
  cheatStatus('Statistiche azzerate.');
}
function cheatClearBonusFlags(){
  S.forceW=false;S.forceBH=false;S.forceExtra=null;S.forceScatter=0;S.forceToken=null;S.forceMaxWin=false;S.fsBought=false;
  cheatStatus('Tutti i flag forzati sono stati puliti.');
}

window.cheatAddBalance=cheatAddBalance;
window.cheatSetBalance=cheatSetBalance;
window.cheatForceWin=cheatForceWin;
window.cheatForceMaxWin=cheatForceMaxWin;
window.cheatForceScatter=cheatForceScatter;
window.cheatForceExtra=cheatForceExtra;
window.cheatDust=cheatDust;
window.cheatToggleTurbo=cheatToggleTurbo;
window.cheatResetStats=cheatResetStats;
window.cheatClearBonusFlags=cheatClearBonusFlags;

window.toggleSidePanel = toggleSidePanel;
window.openBsMenu = openBsMenu;
window.closeBsMenu = closeBsMenu;
window.bsShowGrid = bsShowGrid;
window.bsOpenSection = bsOpenSection;
window.updateBsVol = updateBsVol;
window.toggleBsSfx = toggleBsSfx;
window.toggleBsBgm = toggleBsBgm;
window.setBsSpeed = setBsSpeed;
window.setBsAutoSpins = setBsAutoSpins;
window.updateBsAutoWinStop = updateBsAutoWinStop;
window.updateBsAutoBalStop = updateBsAutoBalStop;
window.toggleBsAutoFs = toggleBsAutoFs;
window.startBsAutoplay = startBsAutoplay;
window.checkAutoplayStop = checkAutoplayStop;
window.addHistory = addHistory;
window.renderBsHistory = renderBsHistory;
window.updateBsStats = updateBsStats;
window.buildPaytable = buildPaytable;
window.updateMultiplierStats = updateMultiplierStats;
window.updDust = updDust;
window.spawnDustParticles = spawnDustParticles;
window.chooseDustBonus = chooseDustBonus;
window.countScatters = countScatters;
window.initDustParticles = initDustParticles;
window.dLog = dLog;
window.updDev = updDev;
window.maybeSpawnExtra = maybeSpawnExtra;
window.genForceWin = genForceWin;
window.genForcedBlackHole = genForcedBlackHole;
window.bhWeightedPick = bhWeightedPick;
window.genForceExtra = genForceExtra;
window.updBet = updBet;
window.shakeGrid = shakeGrid;
window.addTooltips = addTooltips;
window.spawnWinParticles = spawnWinParticles;
window.showPremiumWin = showPremiumWin;
window.hidePremiumWin = hidePremiumWin;
window.updateBoostPanel = updateBoostPanel;
window.updateSpinMaggButtons = updateSpinMaggButtons;
window.toggleDrawer = toggleDrawer;
window.initHudParticles = initHudParticles;
window.updateBonusBtns = updateBonusBtns;
window.getBonusCost = getBonusCost;
window.updateBonusPrices = updateBonusPrices;
window.startTutorial = startTutorial;
window.showTutStep = showTutStep;
window.tutNext = tutNext;
window.tutPrev = tutPrev;
window.endTutorial = endTutorial;
window.spawnShootingStar = spawnShootingStar;
