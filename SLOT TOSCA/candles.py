import requests, csv, os

symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT']
rows = []
for s in symbols:
    r = requests.get('https://api.binance.com/api/v3/klines',
                     params={'symbol': s, 'interval': '5m', 'limit': 500},
                     timeout=10).json()
    for k in r:
        rows.append([s.replace('USDT',''), int(k[0]), float(k[1]), float(k[4]),
                     'UP' if float(k[4])>float(k[1]) else ('DOWN' if float(k[4])<float(k[1]) else 'FLAT')])

out = os.path.join(os.path.expanduser('~'), 'Desktop', 'candles_5m_4assets.csv')
with open(out, 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['asset','ts_ms','open','close','dir'])
    w.writerows(rows)

up = sum(1 for r in rows if r[4]=='UP')
dn = sum(1 for r in rows if r[4]=='DOWN')
fl = sum(1 for r in rows if r[4]=='FLAT')
print(f'Totale: {len(rows)} candele | Verdi: {up} ({up/len(rows)*100:.1f}%) | Rosse: {dn} ({dn/len(rows)*100:.1f}%) | Flat: {fl}')
for s in ['BTC','ETH','SOL','XRP']:
    sr = [r for r in rows if r[0]==s]
    su = sum(1 for r in sr if r[4]=='UP')
    sd = sum(1 for r in sr if r[4]=='DOWN')
    print(f'  {s}: {su} verdi ({su/len(sr)*100:.1f}%) | {sd} rosse ({sd/len(sr)*100:.1f}%)')
print(f'CSV salvato: {out}')
