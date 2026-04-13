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
const PAYTABLE={J:[0,0,0,0,0,0.01,0.03,0.05,0.1,0.19,0.35,0.61,0.96,1.48,2.26,3.31,4.52,6.26,8.53,11.48,15.66],Q:[0,0,0,0,0,0.02,0.05,0.09,0.17,0.35,0.73,1.22,1.91,3.13,4.52,6.96,9.57,13.22,17.75,24.01,32.19],K:[0,0,0,0,0,0.03,0.06,0.12,0.24,0.49,0.96,1.65,2.78,4.35,6.61,9.57,13.57,18.97,25.58,34.8,46.28],A:[0,0,0,0,0,0.05,0.09,0.17,0.35,0.73,1.48,2.61,4.35,6.61,9.92,14.79,20.71,28.88,39.67,52.9,70.99],alieno:[0,0,0,0,0,0.24,0.45,0.87,1.74,3.48,7.31,12.88,20.53,33.06,51.16,75.86,108.92,156.95,223.07,314.07,446.31],astronauta:[0,0,0,0,0,0.42,0.73,1.48,2.96,5.92,11.83,20.53,33.06,52.9,80.91,122.32,173.48,247.95,347.13,495.9,694.26],buco_nero:[0,0,0,0,0,0.52,0.87,1.74,3.48,6.96,13.05,20.88,31.32,48.72,74.82,113.1,165.3,234.9,330.6,469.8,661.2],supernova:[0,0,0,0,0,0.26,0.44,0.87,1.74,3.83,7.83,12.18,19.14,30.45,46.98,69.6,100.05,143.55,203.58,287.1,407.16],antigravita:[0,0,0,0,0,0.35,0.61,1.22,2.44,4.87,9.57,14.79,22.62,35.67,54.81,81.78,117.45,168.78,239.25,337.56,478.5],tesseract:[0,0,0,0,0,0.31,0.52,1.04,2.09,4.35,8.7,13.92,20.88,33.06,50.46,75.69,108.75,156.6,221.85,313.2,443.7]};
const ALL_VISUAL_SYMS=[...REGULAR_SYMS,...EXTRA_SYMS,SCATTER_SYM];