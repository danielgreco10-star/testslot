# Cyber Alien Slot — Math Audit & Tuning Applicato

**Data:** 15 aprile 2026 (rev. 2 — target 93–94% su tutti i Buy Bonus)
**Verifica finale:** 600.000 spin post-applicazione (tuning 2026-04-15 r1)
**Risultato:** RTP 94.01% base game invariato, Buy Bonus ora tutti a **93.4–93.5% RTP pagato**.

## Revisione r2 (2026-04-15) — sommario modifiche

Obiettivo: portare tutti i Buy Bonus su una fascia omogenea **93–94% RTP** e fissare
il costo del **Free Spin** a **100× bet** (richiesta utente).

Per bilanciare il costo FS aumentato ~11× senza toccare il RTP del base game,
è stato introdotto un **buyBoost** interno a `triggerFreeSpins`:

- `S.fsBought` viene settato a `true` solo dal click su `buyFreeSpin`.
- In `triggerFreeSpins`, se `fsBought && !jackpotMode` → `buyBoost = 11.85`, applicato
  a `fsMult` iniziale (1.5→17.775) e allo step (0.7→8.295).
- EV bought FS: 7.893× → 93.5× bet → RTP paid 93.5% sul costo 100×.
- Trigger naturali (3+ scatter), Space Spin (jackpotMode) e Bonus Max NON sono boostati
  → RTP totale del base game resta 94.01%.

### Prezzi rivisti r2

| Bonus | r1 cost | r1 RTP | **r2 cost** | **r2 RTP** |
|---|---|---|---|---|
| buco_nero | 15× | 90.3% | **14.5×** | 93.4% |
| supernova | 11× | 92.6% | **10.9×** | 93.4% |
| antigravita | 34× | 89.4% | **32.5×** | 93.5% |
| tesseract | 9× | 92.9% | **8.95×** | 93.4% |
| superBonus | 69× | 90.6% | **66.9×** | 93.5% |
| bonusMax | 78× | 90.2% | **75.25×** | 93.5% |
| spaceSpin | 18× | 91.4% | **17.6×** | 93.5% |
| **freeSpin** | 9× | 87.7% | **100×** + buyBoost ×11.85 | 93.5% |

Margine house 6.5% su tutti i Buy Bonus (in linea con Pragmatic/Nolimit/Push).

---

## r1 baseline (2026-04 originale) — riferimento storico

---

## 1 · Cosa è stato modificato

### `config.js` — paytable ricalibrata

| Simbolo | Scaling vs originale | Motivo |
|---|---|---|
| J, Q, K, A, alieno, astronauta | × **0.80** | compensa il boost Free Spin |
| buco_nero | × **0.75** | EV trigger 17→14 (leggero taglio) |
| supernova | × **1.00** (invariata) | meccanismo upgrade+wild identico a BH, EV ~10× |
| antigravita | × **0.22** | era dominante a 38× EV, ora ~30× (più uniforme) |
| tesseract | × **1.00** (coin boost altrove) | vedi sotto |

### `main.js` — modifiche feature

1. **Free Spin multiplier** (riga 1220):
   - Prima: `fsMult=jackpotMode?5:1; step +=0.5` (avg su 10 spin = 3.75×)
   - Ora: `fsMult=jackpotMode?8:1.5; step +=0.7` (avg 5.7× standard, 13.5× jackpot)
   - Effetto: FreeSpin più sporadici ma più **grossi** (EV passato da 5.7 → 7.9)
   - Space Spin (jackpot): EV da ~10 → 16.5× (raddoppiato)

2. **Tesseract coin multipliers** (riga 702):
   - Coin mults: 0.23–2.3 → **0.30–2.99** (×1.3)
   - Max win coin: 57.5 → **74.75**
   - Effetto: EV Tesseract ~10× (più uniforme con gli altri)

3. **Prezzi Buy Bonus** (riga 2349 `BONUS_COST_MULT`):

| Bonus | Prima | Ora | Riduzione | RTP pagato |
|---|---|---|---|---|
| buco_nero | 75× | **15×** | −80% | 90.3% |
| supernova | 75× | **11×** | −85% | 92.6% |
| antigravita | 100× | **34×** | −66% | 89.4% |
| tesseract | 65× | **9×** | −86% | 92.9% |
| **freeSpin** | 235× | **9×** | −96% | 87.7% |
| **spaceSpin** | 1000× | **18×** | −98% | 91.4% |
| **superBonus** | 240× | **69×** | −71% | 90.6% |
| **bonusMax** | 600× | **78×** | −87% | 90.2% |

Tutti i Buy Bonus ora ritornano al player **87–93%** del loro costo in media (il margine house 7–13% è in linea con Pragmatic/Nolimit/Push).

---

## 2 · Numeri baseline verificati (600.000 spin)

| Metrica | Valore |
|---|---|
| **RTP totale** | **94.01%** ✓ target centrato |
| RTP base game | 73.58% |
| RTP Free Spins | 11.31% (era 7.83% — potenziato) |
| RTP Bonus Extras | 9.12% (era 7.14% — bilanciato) |
| Hit rate | 65.4% |
| Std-dev (volatilità) | 9.76 |
| Max win | 1249× bet |

EV per trigger bonus (migliorato bilanciamento):

| Bonus | EV per trigger |
|---|---|
| buco_nero | 13.6× |
| supernova | 10.2× |
| antigravita | 30.4× |
| tesseract | 8.4× |

Lo squilibrio Antigravità (10× più potente di Supernova) è stato ridotto a ~3× (più armonioso).

---

## 3 · Filosofia applicata

Come richiesto:

- **Bonus extras (BH, SN, AG, TS)** = funzioni **piccole e frequenti** a prezzo basso (9–34× bet). Prezzi ora accessibili per buy ricorrenti senza svuotare il saldo.
- **Free Spin / Space Spin / Super Bonus / Bonus Max** = eventi **sporadici ma grossi** grazie al multiplier FS potenziato (1.5→step 0.7 invece di 1→step 0.5) e al jackpot boost (start 8× invece di 5×). I prezzi sono più contenuti ma la resa del bonus stesso è maggiore.

---

## 4 · File di strumenti

Rimasti nella cartella `outputs/` per rigiri futuri:

- `sim_core2.js` — engine di simulazione fedele (include meccanismo SN upgrade+wild 2-5 come nel codice vero, e parametri FS tunabili).
- `sim_final.js` — lancia la verifica finale (post-applicazione).
- `sim_verify.log` — output della verifica 600k.

Per rigirare: `node sim_final.js` (dalla cartella outputs).

---

## 5 · Note residue (opzionali)

1. **Volatilità:** resta sul livello "media" (std 9.76). Per "alta tipo Pragmatic" si può in futuro alzare `minCluster` da 5 → 6 nel state.js (riduce vincite 0.01–1× e concentra il budget sui big-hit).
2. **Antigravità EV 30×** resta leggermente sopra gli altri (10–14). Se vuoi uniformarla del tutto, riduci il paytable antigravita al ×0.15 invece di ×0.22 — ma il suo prezzo 34× è già calibrato sull'EV attuale quindi non è urgente.
3. **Supernova e Buco Nero** hanno ora meccaniche quasi identiche (upgrade+wild 2-5); se vuoi differenziarli visivamente/meccanicamente (es. SN rimuove davvero un simbolo), si può rivedere `triggerSupernova` — richiede test dedicato.
