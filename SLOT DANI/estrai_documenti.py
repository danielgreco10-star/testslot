#!/usr/bin/env python3
"""
Estrattore automatico dati da carte d'identità italiane (CIE).
Scansiona una cartella di immagini (JPG/PNG), usa OCR + parsing MRZ
per estrarre i dati e produce un file JSON pronto per il gestionale.

Uso:
    python3 estrai_documenti.py /percorso/cartella/immagini

Output:
    documenti_estratti.json (nella cartella delle immagini)
"""

import sys
import os
import re
import json
import datetime
from pathlib import Path

try:
    import pytesseract
    from PIL import Image, ImageEnhance, ImageFilter
except ImportError:
    print("Errore: installa le dipendenze con:")
    print("  pip install pytesseract Pillow")
    print("  Assicurati che Tesseract OCR sia installato sul sistema.")
    sys.exit(1)


# ─── Preprocessing immagine ───────────────────────────────────────────────

def preprocess_image(img, mode="standard"):
    """Migliora la qualità dell'immagine per l'OCR."""
    img = img.convert("L")

    if mode == "mrz":
        # Per MRZ: alto contrasto, binarizzazione aggressiva
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(3.0)
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(3.0)
        # Scala su
        w, h = img.size
        if w < 2000:
            ratio = 2500 / w
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        img = img.point(lambda x: 0 if x < 120 else 255, "1")
    else:
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(2.0)
        w, h = img.size
        if w < 1500:
            ratio = 2000 / w
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        img = img.point(lambda x: 0 if x < 140 else 255, "1")

    return img


# ─── Parser MRZ (Machine Readable Zone) ──────────────────────────────────

def parse_mrz(text):
    """
    Parsa la zona MRZ di una carta d'identità italiana (CIE).
    Formato MRZ della CIE (3 righe da 30 caratteri):
      Riga 1: I<ITA + numero documento + < + check digit + ...
      Riga 2: data nascita + sesso + data scadenza + nazionalità + ...
      Riga 3: cognome << nome

    Anche formati con C<ITA sono supportati.
    """
    result = {}

    # Pulizia: normalizza caratteri simili
    cleaned = text.upper()
    cleaned = cleaned.replace("«", "<").replace("»", "<")
    cleaned = cleaned.replace("{", "<").replace("}", "<")
    cleaned = cleaned.replace("(", "<").replace(")", "<")
    cleaned = cleaned.replace("[", "<").replace("]", "<")
    cleaned = cleaned.replace("K<", "<<")  # OCR confonde spesso K con <

    lines = cleaned.split("\n")
    mrz_lines = []

    for line in lines:
        # Cerca linee che sembrano MRZ (molti < e caratteri alfanumerici)
        stripped = re.sub(r"\s+", "", line)
        if len(stripped) >= 25 and stripped.count("<") >= 3:
            mrz_lines.append(stripped)
        # Anche linee che iniziano con pattern tipici CIE
        elif re.match(r"^[CI]<ITA", stripped):
            mrz_lines.append(stripped)
        elif re.match(r"^\d{6,7}[MF]\d{6,7}", stripped):
            mrz_lines.append(stripped)
        elif re.search(r"[A-Z]{2,}<<[A-Z]+", stripped):
            mrz_lines.append(stripped)

    if not mrz_lines:
        return result

    print(f"    MRZ trovate: {len(mrz_lines)} righe")
    for i, l in enumerate(mrz_lines):
        print(f"      [{i+1}] {l[:50]}")

    for line in mrz_lines:
        # Riga 1: documento - C<ITACA13371XW0<<<...
        doc_match = re.search(r"[CI]<ITA([A-Z]{2}\d{5,7}[A-Z0-9]{0,3})", line)
        if doc_match:
            result["numero_documento"] = doc_match.group(1)

        # Riga 2: date - 0302014M3502011ITA...
        # Formato: YYMMDD + check + M/F + YYMMDD + check + ITA
        date_match = re.search(r"(\d{6})\d([MF])(\d{6})\d", line)
        if date_match:
            birth_raw = date_match.group(1)
            sex = date_match.group(2)
            expiry_raw = date_match.group(3)

            # Parsa data nascita (YYMMDD)
            try:
                yy, mm, dd = int(birth_raw[:2]), int(birth_raw[2:4]), int(birth_raw[4:6])
                year = 2000 + yy if yy < 50 else 1900 + yy
                result["data_nascita"] = f"{year:04d}-{mm:02d}-{dd:02d}"
                result["sesso"] = sex
            except:
                pass

            # Parsa data scadenza (YYMMDD)
            try:
                yy, mm, dd = int(expiry_raw[:2]), int(expiry_raw[2:4]), int(expiry_raw[4:6])
                year = 2000 + yy if yy < 50 else 1900 + yy
                result["data_scadenza"] = f"{year:04d}-{mm:02d}-{dd:02d}"
            except:
                pass

        # Riga 3: nome - TREVISAN<<ALEX<<<...
        name_match = re.search(r"([A-Z]{2,})<<([A-Z]{2,})", line)
        if name_match:
            # Verifica che non sia il codice paese
            surname = name_match.group(1)
            given = name_match.group(2)
            # Ignora se sembra un codice (ITA, ITACA ecc)
            if len(surname) > 3 and surname not in ("ITACA", "ITALIA"):
                result["cognome"] = surname.replace("<", " ").strip()
                result["nome"] = given.replace("<", " ").strip()

    return result


# ─── Pattern regex per campi testuali ─────────────────────────────────────

PATTERNS = {
    "cognome": [
        r"(?:COGNOME|SURNAME)[S:\s/]*\n?\s*([A-Z][A-ZÀÈÉÌÒÙa-z'\- ]{1,30})",
        r"COGNOME[S:\s/]*([A-Z]{2,})",
    ],
    "nome": [
        r"(?:NOME|NAME)[S:\s/]*\n?\s*([A-Z][A-ZÀÈÉÌÒÙa-z'\- ]{1,30})",
        r"(?<!COG)NOME[S:\s/]*([A-Z]{2,})",
    ],
    "data_nascita": [
        r"(?:NATO|NASCITA|BORN|DATA DI NASCITA|BIRTH|DATE OF BIRTH?)[:\s/]*(\d{1,2}[\./\-]\d{1,2}[\./\-]\d{2,4})",
    ],
    "numero_documento": [
        r"\b([A-Z]{2}\d{5}[A-Z]{2})\b",  # CIE: CA12345AB
        r"\b([A-Z]{2}\d{5,7}[A-Z]{0,2})\b",
    ],
    "data_emissione": [
        r"(?:EMISSIONE|RILASCIO|ISSUED|ISSUING)[:\s/]*(\d{1,2}[\./\-]\d{1,2}[\./\-]\d{2,4})",
    ],
    "data_scadenza": [
        r"(?:SCADENZA|EXPIRY|VALID)[:\s/]*(\d{1,2}[\./\-]\d{1,2}[\./\-]\d{2,4})",
    ],
    "codice_fiscale": [
        r"\b([A-Z]{6}\d{2}[A-EHLMPRST]\d{2}[A-Z]\d{3}[A-Z])\b",
    ],
    "ente_emittente": [
        r"(?:COMUNE|MUNICIPALITY)[:\s/]*\n?\s*([A-ZÀÈÉÌÒÙa-zàèéìòù\s'\-]{3,})",
        r"RIVIGNANO[A-Z\s\-]*TEOR",
    ],
    "comune": [
        r"(?:COMUNE|MUNICIPALITY)[:\s/]*([A-Z][A-Za-zÀÈÉÌÒÙàèéìòù\s'\-]+)",
    ],
}


def normalize_date(date_str):
    """Converte vari formati data in YYYY-MM-DD."""
    if not date_str:
        return ""
    date_str = date_str.strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}$", date_str):
        return date_str
    formats = ["%d/%m/%Y", "%d.%m.%Y", "%d-%m-%Y", "%d/%m/%y", "%d.%m.%y", "%d-%m-%y"]
    for fmt in formats:
        try:
            d = datetime.datetime.strptime(date_str, fmt)
            if d.year < 100:
                d = d.replace(year=d.year + 2000 if d.year < 50 else d.year + 1900)
            return d.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return date_str


def extract_field(text, field_name):
    """Cerca un campo nel testo usando i pattern regex."""
    patterns = PATTERNS.get(field_name, [])
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            value = match.group(1).strip() if match.lastindex else match.group(0).strip()
            value = re.sub(r"\s+", " ", value).strip(" .,;:-")
            if value and len(value) > 1:
                return value
    return ""


def process_image(image_path):
    """Processa una singola immagine di carta d'identità."""
    print(f"  Elaborazione: {os.path.basename(image_path)}")

    try:
        img = Image.open(image_path)
    except Exception as e:
        print(f"    ⚠ Errore apertura immagine: {e}")
        return None

    # OCR multipasso: standard + MRZ-ottimizzato
    all_text = ""

    for mode in ["standard", "mrz"]:
        img_processed = preprocess_image(img, mode)
        for psm in ["6", "4", "3"]:
            try:
                text = pytesseract.image_to_string(
                    img_processed, lang="eng",
                    config=f"--psm {psm} --oem 3"
                )
                all_text += "\n" + text
            except Exception:
                pass

    # Prova anche immagine originale
    try:
        text = pytesseract.image_to_string(img, lang="eng", config="--psm 6")
        all_text += "\n" + text
    except:
        pass

    if not all_text.strip():
        print("    ⚠ Nessun testo rilevato")
        return None

    print(f"    Testo rilevato ({len(all_text)} caratteri)")

    # 1. Prima prova parsing MRZ (più affidabile)
    mrz_data = parse_mrz(all_text)

    # 2. Poi estrai con regex dal testo
    doc = {
        "nome": mrz_data.get("nome", "") or extract_field(all_text, "nome"),
        "cognome": mrz_data.get("cognome", "") or extract_field(all_text, "cognome"),
        "dataNascita": mrz_data.get("data_nascita", "") or normalize_date(extract_field(all_text, "data_nascita")),
        "codiceFiscale": extract_field(all_text, "codice_fiscale").upper(),
        "tipoDocumento": "Carta d'identità",
        "numeroDocumento": (mrz_data.get("numero_documento", "") or extract_field(all_text, "numero_documento")).upper(),
        "dataEmissione": normalize_date(extract_field(all_text, "data_emissione")),
        "dataScadenza": mrz_data.get("data_scadenza", "") or normalize_date(extract_field(all_text, "data_scadenza")),
        "enteEmittente": extract_field(all_text, "ente_emittente") or extract_field(all_text, "comune"),
        "fileOrigine": os.path.basename(image_path),
    }

    # Valida
    has_data = any([doc["nome"], doc["cognome"], doc["numeroDocumento"], doc["codiceFiscale"]])
    if not has_data:
        print("    ⚠ Nessun dato utile estratto")
        return None

    # Segnala campi trovati/mancanti
    found = [k for k in ["nome", "cognome", "dataScadenza", "numeroDocumento", "codiceFiscale"] if doc.get(k)]
    missing = [k for k in ["nome", "cognome", "dataScadenza", "numeroDocumento"] if not doc.get(k)]
    print(f"    ✓ Trovati: {', '.join(found)}")
    if missing:
        print(f"    ⚠ Mancanti: {', '.join(missing)}")

    return doc


def merge_documents(docs):
    """
    Unisce documenti che si riferiscono alla stessa persona
    (fronte e retro della stessa carta).
    """
    if len(docs) <= 1:
        return docs

    merged = []
    used = set()

    for i, doc1 in enumerate(docs):
        if i in used:
            continue
        best = dict(doc1)

        for j, doc2 in enumerate(docs):
            if j <= i or j in used:
                continue

            # Verifica se sono la stessa persona (stesso numero doc, o stesso CF, o stesso nome)
            same_doc = (
                (doc1.get("numeroDocumento") and doc1["numeroDocumento"] == doc2.get("numeroDocumento")) or
                (doc1.get("codiceFiscale") and doc1["codiceFiscale"] == doc2.get("codiceFiscale")) or
                (doc1.get("cognome") and doc2.get("cognome") and
                 doc1["cognome"].upper() == doc2["cognome"].upper() and
                 doc1.get("nome") and doc2.get("nome") and
                 doc1["nome"].upper() == doc2["nome"].upper())
            )

            if same_doc:
                # Unisci: prendi il valore non vuoto di ciascun campo
                for key in best:
                    if key == "fileOrigine":
                        best[key] = f"{doc1.get(key, '')}, {doc2.get(key, '')}"
                    elif not best.get(key) and doc2.get(key):
                        best[key] = doc2[key]
                used.add(j)

        merged.append(best)
        used.add(i)

    return merged


def main():
    if len(sys.argv) > 1:
        input_dir = sys.argv[1]
    else:
        print("Uso: python3 estrai_documenti.py /percorso/cartella/immagini")
        print("\nCerco nella cartella corrente...")
        input_dir = "."

    input_path = Path(input_dir)
    if not input_path.exists():
        print(f"Errore: la cartella '{input_dir}' non esiste.")
        sys.exit(1)

    extensions = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}
    images = sorted([
        f for f in input_path.iterdir()
        if f.is_file() and f.suffix.lower() in extensions
    ])

    if not images:
        print(f"Nessuna immagine trovata in: {input_dir}")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"  ESTRATTORE DOCUMENTI D'IDENTITÀ (CIE)")
    print(f"  Cartella: {input_path.resolve()}")
    print(f"  Immagini trovate: {len(images)}")
    print(f"{'='*60}\n")

    documents = []
    errors = []

    for i, img_path in enumerate(images, 1):
        print(f"\n[{i}/{len(images)}]", end="")
        result = process_image(str(img_path))
        if result:
            result["id"] = i
            documents.append(result)
        else:
            errors.append(str(img_path.name))

    # Unisci fronte/retro
    print(f"\n  Unione fronte/retro...")
    documents = merge_documents(documents)
    for i, doc in enumerate(documents, 1):
        doc["id"] = i

    # Salva
    output_file = input_path / "documenti_estratti.json"
    output_data = {
        "dataEstrazione": datetime.datetime.now().isoformat(),
        "totaleImmagini": len(images),
        "documentiEstratti": len(documents),
        "errori": errors,
        "documenti": documents,
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"  RISULTATI")
    print(f"  Persone identificate: {len(documents)}")
    if errors:
        print(f"  Errori: {len(errors)} file")
    print(f"  Output: {output_file}")
    print(f"{'='*60}\n")

    for doc in documents:
        nome_completo = f"{doc.get('cognome', '?')} {doc.get('nome', '?')}"
        scadenza = doc.get("dataScadenza", "N/D")
        cf = doc.get("codiceFiscale", "")
        print(f"  ✓ {nome_completo:<30} CF: {cf}  Scad: {scadenza}")

    print(f"\n  ➜ File JSON: {output_file}")


if __name__ == "__main__":
    main()
