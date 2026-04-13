/* ══════════════════════════════════════════════
   AUDIO ENGINE — Web Audio API Synthesizer
   ══════════════════════════════════════════════ */
const SFX=(function(){
  let ctx=null,master=null,enabled=true,vol=0.35,bgmPlaying=false,bgmNodes=[];
  function init(){
    if(ctx)return;
    ctx=new(window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();
    master.gain.value=vol;
    master.connect(ctx.destination);
  }
  function ensure(){if(!ctx)init();if(ctx.state==='suspended')ctx.resume();}
  function g(v){const n=ctx.createGain();n.gain.value=v;n.connect(master);return n;}
  function osc(type,freq,dur,gainVal,detune){
    if(!enabled)return;ensure();
    const o=ctx.createOscillator(),gn=g(gainVal||0.15);
    o.type=type;o.frequency.value=freq;if(detune)o.detune.value=detune;
    o.connect(gn);o.start(ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.stop(ctx.currentTime+dur+0.05);
  }
  function noise(dur,gainVal,filterFreq){
    if(!enabled)return;ensure();
    const buf=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource();src.buffer=buf;
    const flt=ctx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=filterFreq||2000;flt.Q.value=0.7;
    const gn=g(gainVal||0.08);
    src.connect(flt);flt.connect(gn);src.start(ctx.currentTime);src.stop(ctx.currentTime+dur);
  }
  function chord(freqs,dur,gainEach,type){
    freqs.forEach(f=>osc(type||'sine',f,dur,gainEach||0.08));
  }
  function sweep(startFreq,endFreq,dur,gainVal){
    if(!enabled)return;ensure();
    const o=ctx.createOscillator(),gn=g(gainVal||0.06);
    o.type='sawtooth';o.frequency.setValueAtTime(startFreq,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(endFreq,ctx.currentTime+dur);
    o.connect(gn);o.start(ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.stop(ctx.currentTime+dur+0.05);
  }
  function metalHit(freq,dur){
    if(!enabled)return;ensure();
    const o=ctx.createOscillator(),o2=ctx.createOscillator();
    const gn=g(0.06);
    o.type='square';o.frequency.value=freq;o.detune.value=7;
    o2.type='sine';o2.frequency.value=freq*2.4;
    o.connect(gn);o2.connect(gn);
    o.start(ctx.currentTime);o2.start(ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.stop(ctx.currentTime+dur+0.02);o2.stop(ctx.currentTime+dur+0.02);
  }

  return{
    toggle(){enabled=!enabled;return enabled;},
    isOn(){return enabled;},
    setVol(v){vol=v;if(master)master.gain.value=v;},

    /* ── UI ── */
    click(){osc('sine',900,0.05,0.08);osc('sine',1400,0.03,0.05);noise(0.02,0.02,8000);},
    betChange(){osc('triangle',650,0.07,0.07);osc('sine',1000,0.05,0.04);metalHit(450,0.04);},

    /* ── SPIN START ── */
    spinStart(){
      if(!enabled)return;ensure();
      /* Cinematic whoosh + deep bass + layered sweep */
      noise(0.4,0.1,4500);
      sweep(80,700,0.45,0.09);
      osc('sine',60,0.35,0.07);osc('sine',120,0.25,0.05);
      osc('triangle',200,0.15,0.04);
      setTimeout(()=>{noise(0.15,0.05,7000);osc('sine',400,0.1,0.03);},120);
      setTimeout(()=>metalHit(250,0.05),250);
    },
    /* ── SPIN MAGGIORATO ── */
    spinMagg(){
      if(!enabled)return;ensure();
      sweep(150,1400,0.55,0.1);
      noise(0.45,0.1,5500);
      osc('sine',300,0.3,0.08);osc('sine',600,0.25,0.06);osc('sine',900,0.15,0.04);
      metalHit(900,0.12);
      setTimeout(()=>{chord([600,900,1200],0.2,0.05,'triangle');},200);
    },

    /* ── REEL SOUNDS ── */
    reelTick(col){
      if(!enabled)return;ensure();
      const pitch=380+col*45;
      metalHit(pitch,0.07);
      osc('triangle',pitch*1.3,0.04,0.025);
      osc('sine',pitch*0.5,0.03,0.02);
    },
    reelStopping(){
      if(!enabled)return;ensure();
      for(let i=0;i<4;i++)setTimeout(()=>{metalHit(500-i*60,0.06);noise(0.02,0.02,4000);},i*55);
    },
    suspenseTension(){/* removed */},
    suspenseResolve(){/* removed */},

    /* ── SYMBOL LAND ── */
    symbolLand(){metalHit(320,0.07);noise(0.03,0.03,5500);osc('sine',180,0.04,0.02);},
    symbolReveal(){osc('sine',900,0.04,0.03);osc('triangle',1300,0.02,0.02);},

    /* ── CASCADE ── */
    cascadeStart(level){
      if(!enabled)return;ensure();
      const base=420+level*90;
      osc('sine',base,0.18,0.1);
      osc('sine',base*1.25,0.14,0.07);
      osc('triangle',base*0.5,0.2,0.04);
      noise(0.12,0.06,5500);
      metalHit(base*0.8,0.06);
      /* Rising pitch per cascade level */
      if(level>0)setTimeout(()=>sweep(base,base*1.5,0.15,0.04),50);
    },
    cascadeClear(){
      if(!enabled)return;ensure();
      noise(0.18,0.1,6500);
      osc('sine',850,0.1,0.06);
      osc('sine',1100,0.08,0.05);
      osc('triangle',600,0.12,0.03);
    },

    /* ── CLUSTER WIN ── */
    clusterWin(size){
      if(!enabled)return;ensure();
      const base=520;
      for(let i=0;i<Math.min(size,10);i++){
        setTimeout(()=>{osc('sine',base+i*55,0.12,0.06);if(i%2===0)osc('triangle',base+i*80,0.08,0.03);},i*25);
      }
      if(size>=6)setTimeout(()=>noise(0.1,0.04,6000),size*25);
    },

    /* ── WIN CELEBRATIONS ── */
    smallWin(){
      if(!enabled)return;ensure();
      chord([523,659,784],0.25,0.07,'sine');
      osc('triangle',1047,0.15,0.04);
      metalHit(400,0.04);
    },
    bigWin(){
      if(!enabled)return;ensure();
      const notes=[523,659,784,1047,784,1047,1318];
      notes.forEach((f,i)=>setTimeout(()=>{osc('sine',f,0.35,0.1);osc('triangle',f*1.5,0.2,0.04);},i*110));
      setTimeout(()=>noise(0.35,0.07,4500),180);
      setTimeout(()=>chord([1047,1318,1568],0.3,0.06,'sine'),notes.length*110);
    },
    megaWin(){
      if(!enabled)return;ensure();
      const notes=[392,523,659,784,1047,1318,1568,2093];
      notes.forEach((f,i)=>setTimeout(()=>{osc('sine',f,0.45,0.12);osc('sine',f*1.5,0.3,0.05);osc('triangle',f*0.75,0.25,0.03);},i*140));
      setTimeout(()=>noise(0.6,0.09,3500),350);
      setTimeout(()=>{chord([1568,2093,2637],0.5,0.08,'sine');noise(0.3,0.06,7000);},notes.length*140);
    },
    noWin(){osc('sine',280,0.22,0.035);osc('sine',180,0.3,0.025);},

    /* ── BONUS TRIGGERS ── */
    bonusAlert(){
      if(!enabled)return;ensure();
      for(let i=0;i<6;i++)setTimeout(()=>{osc('square',850+i*130,0.15,0.07);osc('sine',600+i*100,0.1,0.04);},i*70);
      noise(0.35,0.1,5500);
    },
    bonusBuy(){
      if(!enabled)return;ensure();
      /* Confirmation sound for bonus purchase */
      chord([523,784,1047],0.2,0.08,'sine');
      metalHit(700,0.08);
      setTimeout(()=>{osc('sine',1200,0.15,0.06);osc('sine',1500,0.1,0.05);},100);
    },
    bucoNero(){
      if(!enabled)return;ensure();
      /* Deep rumble + suction + gravitational pull */
      osc('sawtooth',45,1.8,0.14);osc('sawtooth',65,1.4,0.1);
      noise(1.2,0.11,500);
      sweep(450,35,1.4,0.09);
      osc('sine',30,0.8,0.06);
      setTimeout(()=>{osc('sine',90,0.9,0.1);noise(0.6,0.07,250);sweep(300,50,0.5,0.05);},350);
      setTimeout(()=>{sweep(180,50,0.7,0.06);osc('sawtooth',40,0.5,0.06);},750);
    },
    supernovaCharge(){
      if(!enabled)return;ensure();
      sweep(80,2200,0.9,0.07);
      osc('sine',180,0.7,0.05);
      noise(0.4,0.04,3000);
      for(let i=0;i<5;i++)setTimeout(()=>osc('sine',200+i*300,0.12,0.04),i*140);
    },
    supernova(){
      if(!enabled)return;ensure();
      /* Bright explosion with shockwave + layered impact */
      noise(1.0,0.2,9500);noise(0.5,0.12,2000);noise(0.3,0.08,500);
      osc('sawtooth',180,0.6,0.1);
      sweep(500,3500,0.35,0.08);
      const flash=[800,1200,1600,2000,2500,3000,3500,4000];
      flash.forEach((f,i)=>setTimeout(()=>{osc('sine',f,0.1,0.045);metalHit(f*0.5,0.05);},i*45));
      setTimeout(()=>{noise(0.7,0.08,4500);osc('sine',300,0.3,0.04);},280);
    },
    supernovaRemove(){
      if(!enabled)return;ensure();
      metalHit(650,0.1);noise(0.08,0.05,7500);
      osc('sine',1000,0.05,0.03);
    },
    antigravita(){
      if(!enabled)return;ensure();
      /* Gravitational pull whoosh + magnetic hum + resonance */
      sweep(900,180,0.8,0.08);
      osc('sine',110,0.9,0.06);osc('sine',165,0.7,0.05);osc('triangle',220,0.5,0.03);
      noise(0.55,0.08,2200);
      for(let i=0;i<10;i++)setTimeout(()=>osc('triangle',650-i*45,0.1,0.035),i*50);
    },
    antigravitaFly(){
      if(!enabled)return;ensure();
      sweep(280,900,0.22,0.05);osc('sine',550,0.1,0.04);
      noise(0.05,0.03,6000);
    },
    antigravitaWild(){
      if(!enabled)return;ensure();
      chord([400,600,800,1200],0.45,0.08,'sine');
      noise(0.35,0.06,5500);metalHit(1100,0.14);
      setTimeout(()=>osc('sine',1600,0.2,0.05),150);
    },
    tesseractOpen(){
      if(!enabled)return;ensure();
      /* Dimensional rift opening with warping sound + deeper layers */
      sweep(60,550,1.2,0.08);osc('sine',130,1.2,0.06);
      osc('sawtooth',80,0.8,0.04);
      noise(0.7,0.08,1600);
      const warp=[130,180,260,380,530,720,1000,1350];
      warp.forEach((f,i)=>setTimeout(()=>{osc('sine',f,0.25,0.055);osc('triangle',f*1.5,0.15,0.025);},i*110));
      setTimeout(()=>{sweep(180,900,0.5,0.05);noise(0.3,0.04,3500);},550);
    },

    /* ── TESSERACT COIN DROP ── */
    tessSpinLoop(){
      if(!enabled)return;ensure();
      /* Subtle reel whir */
      noise(0.3,0.04,3500);
      osc('triangle',180,0.3,0.03);
    },
    tessCoinLand(value){
      if(!enabled)return;ensure();
      const pitch=400+Math.min(value,500);
      osc('sine',pitch,0.15,0.1);
      osc('triangle',pitch*1.5,0.1,0.06);
      noise(0.05,0.05,6000);
    },
    tessExpandLand(){
      if(!enabled)return;ensure();
      /* Expanding whoosh */
      for(let i=0;i<4;i++)setTimeout(()=>{osc('sine',500+i*100,0.2,0.08);noise(0.08,0.05,4000);},i*80);
    },
    tessCollectLand(){
      if(!enabled)return;ensure();
      /* Magnetic pull */
      osc('sine',600,0.3,0.1);osc('sine',900,0.2,0.08);
      noise(0.2,0.06,5000);
    },
    tessCollectAbsorb(){
      if(!enabled)return;ensure();
      /* Coins being sucked in */
      for(let i=0;i<6;i++)setTimeout(()=>osc('sine',800-i*80,0.1,0.06),i*60);
      noise(0.4,0.08,3000);
    },
    tessMaxWin(){
      if(!enabled)return;ensure();
      /* Epic jackpot fanfare */
      const fanfare=[523,659,784,1047,1318,1568,1047,1568,2093];
      fanfare.forEach((f,i)=>setTimeout(()=>{osc('sine',f,0.4,0.14);osc('sine',f*0.5,0.5,0.06);},i*130));
      setTimeout(()=>noise(0.8,0.1,4000),300);
    },
    tessNearMiss(){
      if(!enabled)return;ensure();
      /* Teasing rise then fall */
      const rise=[400,500,600,700,800,900,1000];
      rise.forEach((f,i)=>setTimeout(()=>osc('sine',f,0.12,0.07),i*80));
      setTimeout(()=>{osc('sine',400,0.3,0.08);osc('sine',300,0.35,0.06);},rise.length*80);
    },
    tessBlocked(){osc('triangle',200,0.12,0.06);osc('triangle',150,0.15,0.04);},
    tessSpinReset(){
      if(!enabled)return;ensure();
      osc('sine',600,0.1,0.08);osc('sine',800,0.08,0.06);osc('sine',1000,0.06,0.05);
    },
    tessEnd(){
      if(!enabled)return;ensure();
      chord([523,659,784,1047],0.5,0.1,'sine');
      noise(0.3,0.06,2000);
    },
    tessEmpty(){osc('sine',250,0.15,0.04);},

    /* ── SCATTER / FREE SPINS ── */
    scatterLand(){
      if(!enabled)return;ensure();
      osc('sine',1200,0.2,0.12);osc('sine',1500,0.15,0.08);osc('sine',1800,0.1,0.06);
      noise(0.15,0.06,7000);
    },
    freeSpinStart(){
      if(!enabled)return;ensure();
      const notes=[392,494,587,659,784,880,1047];
      notes.forEach((f,i)=>setTimeout(()=>{osc('sine',f,0.35,0.1);osc('triangle',f*2,0.2,0.04);},i*120));
      noise(0.5,0.08,4000);
    },
    freeSpinTick(){osc('sine',700,0.08,0.06);osc('triangle',1050,0.06,0.04);},

    /* ── DUST BAR ── */
    dustGain(){
      if(!enabled)return;ensure();
      osc('sine',700+Math.random()*300,0.1,0.05);osc('triangle',1100+Math.random()*200,0.06,0.03);
      noise(0.03,0.02,9000);
    },
    dustFull(){
      if(!enabled)return;ensure();
      const fanfare=[659,784,1047,1318,1568];
      fanfare.forEach((f,i)=>setTimeout(()=>{osc('sine',f,0.3,0.1);osc('triangle',f*1.5,0.15,0.04);},i*100));
      setTimeout(()=>{noise(0.4,0.08,5000);chord([1047,1318,1568],0.4,0.08,'sine');},500);
    },
    dustChoose(){osc('sine',900,0.12,0.08);osc('sine',1200,0.08,0.06);metalHit(700,0.06);},

    /* ── AMBIENT / LOOP ── */
    ambientPulse(){
      if(!enabled)return;ensure();
      osc('sine',80,2,0.02);osc('sine',120,1.5,0.015);
    },
    /* ── BACKGROUND MUSIC - Ambient Sci-Fi ── */
    bgmStart(){
      if(!enabled||bgmPlaying)return;ensure();bgmPlaying=true;
      /* Layer 1: Deep bass drone */
      const bass=ctx.createOscillator();
      const bassG=ctx.createGain();
      bass.type='sine';bass.frequency.value=55;
      bassG.gain.value=0.025;
      bass.connect(bassG);bassG.connect(master);bass.start();
      bgmNodes.push(bass,bassG);
      /* Layer 2: Pad with slow LFO */
      const pad=ctx.createOscillator();
      const pad2=ctx.createOscillator();
      const padG=ctx.createGain();
      const lfo=ctx.createOscillator();
      const lfoG=ctx.createGain();
      pad.type='sine';pad.frequency.value=220;
      pad2.type='sine';pad2.frequency.value=330;pad2.detune.value=5;
      lfo.type='sine';lfo.frequency.value=0.15;
      lfoG.gain.value=8;
      lfo.connect(lfoG);lfoG.connect(pad.frequency);lfoG.connect(pad2.frequency);
      padG.gain.value=0.012;
      pad.connect(padG);pad2.connect(padG);padG.connect(master);
      pad.start();pad2.start();lfo.start();
      bgmNodes.push(pad,pad2,padG,lfo,lfoG);
      /* Layer 3: Filtered noise for space ambience */
      const bufLen=ctx.sampleRate*4;
      const nBuf=ctx.createBuffer(1,bufLen,ctx.sampleRate);
      const nData=nBuf.getChannelData(0);
      for(let i=0;i<bufLen;i++)nData[i]=(Math.random()*2-1)*0.5;
      const nSrc=ctx.createBufferSource();nSrc.buffer=nBuf;nSrc.loop=true;
      const nFlt=ctx.createBiquadFilter();nFlt.type='bandpass';nFlt.frequency.value=800;nFlt.Q.value=2;
      const nLfo=ctx.createOscillator();const nLfoG=ctx.createGain();
      nLfo.type='sine';nLfo.frequency.value=0.08;nLfoG.gain.value=400;
      nLfo.connect(nLfoG);nLfoG.connect(nFlt.frequency);
      const nGain=ctx.createGain();nGain.gain.value=0.015;
      nSrc.connect(nFlt);nFlt.connect(nGain);nGain.connect(master);
      nSrc.start();nLfo.start();
      bgmNodes.push(nSrc,nFlt,nLfo,nLfoG,nGain);
      /* Layer 4: Subtle high shimmer */
      const shim=ctx.createOscillator();
      const shim2=ctx.createOscillator();
      const shimG=ctx.createGain();
      const shimLfo=ctx.createOscillator();
      const shimLfoG=ctx.createGain();
      shim.type='sine';shim.frequency.value=1760;
      shim2.type='sine';shim2.frequency.value=2640;shim2.detune.value=3;
      shimLfo.type='sine';shimLfo.frequency.value=0.2;
      shimLfoG.gain.value=0.005;
      shimLfo.connect(shimLfoG);
      shimG.gain.value=0.004;
      shim.connect(shimG);shim2.connect(shimG);shimG.connect(master);
      shim.start();shim2.start();shimLfo.start();
      bgmNodes.push(shim,shim2,shimG,shimLfo,shimLfoG);
    },
    bgmStop(){
      bgmPlaying=false;
      bgmNodes.forEach(n=>{try{if(n.stop)n.stop();n.disconnect();}catch(e){}});
      bgmNodes=[];
    },
    bgmToggle(){
      if(bgmPlaying)this.bgmStop();else this.bgmStart();
      return bgmPlaying;
    },
    isBgmOn(){return bgmPlaying;},
    /* ── REEL STOP THUD - per column ── */
    reelStopThud(col){
      if(!enabled)return;ensure();
      const pitch=180+col*35;
      osc('sine',pitch,0.14,0.08);
      osc('sine',pitch*0.5,0.08,0.04);
      noise(0.05,0.04,3500);
      metalHit(pitch*0.75,0.06);
      /* Subtle bass thump */
      osc('sine',60,0.06,0.05);
    },

    /* ── SPACE SPIN ── */
    spaceSpinIntro(){
      if(!enabled)return;ensure();
      /* Deep cosmic drone + dimensional rift + sparkle cascade */
      osc('sawtooth',35,2.2,0.12);osc('sine',70,1.8,0.09);
      sweep(50,800,1.5,0.07);sweep(200,2000,1.2,0.04);
      noise(0.6,0.06,3000);
      const sparkle=[2400,2800,3200,3600,4000,4400];
      sparkle.forEach((f,i)=>setTimeout(()=>osc('sine',f,0.12,0.035),i*150));
      setTimeout(()=>{osc('triangle',180,0.9,0.06);sweep(80,600,0.9,0.05);},600);
    },
    spaceSpinCharge(){
      if(!enabled)return;ensure();
      /* Teleport zap — phase shift + electric crackle */
      sweep(2000,100,0.3,0.1);sweep(100,2000,0.25,0.08);
      osc('square',800,0.15,0.06);osc('sine',1200,0.1,0.04);
      noise(0.15,0.09,2000);
      setTimeout(()=>{osc('sine',600,0.08,0.03);osc('triangle',300,0.1,0.04);},100);
    },
    spaceSpinReveal(){
      if(!enabled)return;ensure();
      /* Massive cosmic impact + dimensional shatter */
      noise(1.0,0.2,8000);noise(0.6,0.14,1500);
      osc('sawtooth',50,1.5,0.15);osc('sine',100,1.0,0.1);
      sweep(50,2000,1.2,0.08);sweep(2000,50,0.8,0.06);
      for(let i=0;i<8;i++)setTimeout(()=>osc('sine',800+i*200,0.15,0.04),i*50);
      setTimeout(()=>{sweep(100,3000,0.6,0.05);noise(0.3,0.08,2000);},300);
    },
  };
})();