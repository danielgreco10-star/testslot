const SVG={};
const IMG_SYMS={
  J:'asteroide.png',
  Q:'cristallo_blu.png',
  K:'meteora_rossa.png',
  A:'cristallo_oro.png',
  alieno:'alieno.png',
  astronauta:'astronauta.png',
  buco_nero:'buco_nero.png',
  supernova:'supernova.png',
  antigravita:'antigravita.png',
  tesseract:'tesseract.png'
};
const ROWS=7,COLS=7,BETS=[1,5,10,50];
const REGULAR_SYMS=['J','Q','K','A','alieno','astronauta'];
const EXTRA_SYMS=['buco_nero','supernova','antigravita','tesseract'];
const SCATTER_SYM='scatter';
const LOW_SYMS=['J','Q','K','A'];
const HIGH_SYMS=['alieno','astronauta'];
const WEIGHTS={J:28,Q:18,K:16,A:14,alieno:10,astronauta:8};
/* Paytable ricalibrata 2026-04 (verificata con 600k spin, RTP 94.01%, Buy Bonus 93.4–93.5%):
   · Regular (J,Q,K,A,alieno,astronauta) ×0.80 per compensare potenziamento FS
   · buco_nero  ×0.75 (EV trigger ~14×)
   · supernova  ×1.00 (meccanismo upgrade+wild 2-5, EV trigger ~10×)
   · antigravita×0.22 (EV trigger ~30×, riduce dominanza da 38× originale)
   · tesseract  ×1.00 (coin boost ×1.3 applicato in triggerTesseract, EV ~8×) */
const PAYTABLE={J:[0,0,0,0,0,0.01,0.02,0.04,0.08,0.15,0.28,0.49,0.77,1.18,1.81,2.65,3.62,5.01,6.82,9.18,12.53],Q:[0,0,0,0,0,0.02,0.04,0.07,0.14,0.28,0.58,0.98,1.53,2.5,3.62,5.57,7.66,10.58,14.2,19.21,25.75],K:[0,0,0,0,0,0.02,0.05,0.1,0.19,0.39,0.77,1.32,2.22,3.48,5.29,7.66,10.86,15.18,20.46,27.84,37.02],A:[0,0,0,0,0,0.04,0.07,0.14,0.28,0.58,1.18,2.09,3.48,5.29,7.94,11.83,16.57,23.1,31.74,42.32,56.79],alieno:[0,0,0,0,0,0.19,0.36,0.7,1.39,2.78,5.85,10.3,16.42,26.45,40.93,60.69,87.14,125.56,178.46,251.26,357.05],astronauta:[0,0,0,0,0,0.34,0.58,1.18,2.37,4.74,9.46,16.42,26.45,42.32,64.73,97.86,138.78,198.36,277.7,396.72,555.41],buco_nero:[0,0,0,0,0,0.39,0.65,1.31,2.61,5.22,9.79,15.66,23.49,36.54,56.11,84.82,123.98,176.18,247.95,352.35,495.9],supernova:[0,0,0,0,0,0.26,0.44,0.87,1.74,3.83,7.83,12.18,19.14,30.45,46.98,69.6,100.05,143.55,203.58,287.1,407.16],antigravita:[0,0,0,0,0,0.08,0.13,0.27,0.54,1.07,2.11,3.25,4.98,7.85,12.06,17.99,25.84,37.13,52.64,74.26,105.27],tesseract:[0,0,0,0,0,0.31,0.52,1.04,2.09,4.35,8.7,13.92,20.88,33.06,50.46,75.69,108.75,156.6,221.85,313.2,443.7]};
const ALL_VISUAL_SYMS=[...REGULAR_SYMS,...EXTRA_SYMS,SCATTER_SYM];
