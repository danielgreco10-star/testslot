const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  let log = '';
  const pushLog = msg => { log += msg + '\n'; console.log(msg); };
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => pushLog('DEBUG: ' + msg.text()));
    page.on('pageerror', err => pushLog('PAGE ERROR: ' + err.stack));

    await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/cyber-alien-slot.html');
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
      window.TRACE_LOG = [];
      const origDLog = window.dLog;
      window.dLog = (m,c) => { window.TRACE_LOG.push(m); if(origDLog) origDLog(m,c); };
      S.forceW = true; // force a win!
    });

    pushLog('SPINNING...');
    await page.click('#spinBtn');
    
    await page.waitForTimeout(7000); // Wait for casc to finish
    
    const state = await page.evaluate(() => {
      return {
        spinning: S.spinning,
        cascLvl: S.cascLvl,
        bal: S.bal,
        spinWin: S.spinWin,
        trace: window.TRACE_LOG
      };
    });
    
    pushLog('STATE AFTER SPIN: ' + JSON.stringify(state, null, 2));
    
    await browser.close();
  } catch (e) {
    pushLog('SCRIPT ERROR: ' + e.stack);
  }
  
  fs.writeFileSync('test.log', log);
})();
