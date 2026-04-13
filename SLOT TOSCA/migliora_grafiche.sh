#!/bin/bash
# ============================================================
# SCRIPT PER MIGLIORARE LE GRAFICHE DELLA SLOT "IRISH ELVES"
# Usa Nano Banana (Gemini CLI) per rigenerare ogni asset
# ============================================================
#
# PREREQUISITI:
#   npm install -g @google/gemini-cli
#   gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
#   export NANOBANANA_API_KEY="la-tua-chiave-api"
#
# UTILIZZO:
#   cd nella cartella della slot (dove si trova la cartella img/)
#   chmod +x migliora_grafiche.sh
#   ./migliora_grafiche.sh
#
# NOTA: ogni comando genera 3 varianti cosi puoi scegliere la migliore.
#       Le immagini generate vanno in ./nanobanana-output/
#       Dopo aver scelto, copia manualmente la migliore in img/
# ============================================================

echo "=== MIGLIORAMENTO GRAFICHE SLOT IRISH ELVES ==="
echo ""

# --- 1. BACKGROUND ---
echo "[1/12] Miglioramento Background..."
gemini --yolo "/edit img/background.png 'Enhance this Irish landscape background for a premium slot game. Add more atmospheric depth: brighter aurora borealis with vivid green and purple swirls, more detailed stone circle with Celtic carvings, misty rolling green hills with volumetric fog, richer grass textures, scattered magical fireflies and golden sparkles floating in the air, starry night sky with nebula details. Keep the mystical Celtic atmosphere. Professional digital painting quality, 4K detail level. No text, no UI elements' --count=3"

# --- 2. BLUE MUSHROOM ---
echo "[2/12] Miglioramento Blue Mushroom..."
gemini --yolo "/edit img/blueMushroom.png 'Enhance this magical blue mushroom slot symbol. Add richer bioluminescent glow effects, more detailed star patterns on the cap with tiny constellations, crystalline translucent edges on the cap rim, more detailed silver Celtic engravings on the stem, magical blue particle effects floating around it, deeper color gradients from royal blue to sapphire. Sharper details, professional slot game quality, transparent background. No text' --count=3"

# --- 3. RED MUSHROOM ---
echo "[3/12] Miglioramento Red Mushroom..."
gemini --yolo "/edit img/redMushroom.png 'Enhance this enchanted red mushroom slot symbol. Make the red cap more vibrant with golden spots that glow, add detailed Celtic vine patterns growing around the stem, tiny magical green and gold particles floating around it, richer earth tones on the stem with moss details, dewdrops on the cap catching light. More polished and detailed, professional premium slot game quality, transparent background. No text' --count=3"

# --- 4. CELTIC KNOT ---
echo "[4/12] Miglioramento Celtic Knot..."
gemini --yolo "/edit img/celticKnot.png 'Enhance this Celtic knot slot symbol dramatically. Make the metallic interweaving bands more defined with polished gold and aged bronze textures, add a glowing emerald green gemstone in the center, intricate filigree details along each band, subtle magical green energy flowing through the knot pattern, light reflections and specular highlights on the metal. Much more premium and detailed look, professional slot game quality, transparent background. No text' --count=3"

# --- 5. CRYSTAL BELL ---
echo "[5/12] Miglioramento Crystal Bell..."
gemini --yolo "/edit img/crystalBell.png 'Enhance this crystal bell slot symbol. Make the crystal more translucent with rainbow prismatic light refractions, add detailed silver Celtic engravings on the band around the bell, magical purple and blue aurora-like glow emanating from inside, tiny ice crystal formations on the surface, sharper faceted edges catching light. More premium crystalline look, professional slot game quality, transparent background. No text' --count=3"

# --- 6. GREEN ACORN ---
echo "[6/12] Miglioramento Green Acorn..."
gemini --yolo "/edit img/greenAcorn.png 'Enhance this magical green acorn slot symbol. Make the emerald gemstone inside more brilliant with inner light glow, add more detailed silver Celtic filigree cap with tiny shamrock patterns, magical green energy wisps curling around it, richer color from deep emerald to bright lime green, light refractions through the crystal acorn body. More premium jewel-like quality, professional slot game quality, transparent background. No text' --count=3"

# --- 7. POT OF GOLD ---
echo "[7/12] Miglioramento Pot of Gold..."
gemini --yolo "/edit img/potOfGold.png 'Enhance this pot of gold slot symbol. Make the Celtic bronze pot more detailed with sharper runic inscriptions that glow faintly blue, pile of gold coins overflowing more dramatically with individual coin details visible, add golden light rays emanating upward from the coins, richer metallic textures on the pot with patina details, tiny shamrocks scattered among the coins. More premium and magical look, professional slot game quality, transparent background. No text' --count=3"

# --- 8. WILD SYMBOL ---
echo "[8/12] Miglioramento Wild Symbol..."
gemini --yolo "/edit img/wild.png 'Enhance this four-leaf clover Wild slot symbol. Make the golden circular frame more ornate with detailed Celtic knotwork engravings, the shamrock more vibrant with a brilliant emerald glow and golden veins in each leaf, add radiant golden light burst behind the shamrock, more sparkle and magical particle effects, richer green-to-gold color gradient. The WILD text should be more elegant with a golden embossed look. Premium quality, professional slot game symbol, transparent background' --count=3"

# --- 9. BONUS SYMBOL ---
echo "[9/12] Miglioramento Bonus Symbol..."
gemini --yolo "/edit img/bonus.png 'Enhance this Celtic star Bonus slot symbol. Make the golden star frame more intricate with finer Celtic knotwork, add a glowing emerald center with the B letter more ornate and golden, richer metallic gold textures with light reflections, magical green sparkles around the edges, more depth and dimension. The BONUS text should be more elegant. Premium quality, professional slot game symbol, transparent background. Larger and more detailed' --count=3"

# --- 10. LEPRECHAUN ---
echo "[10/12] Miglioramento Leprechaun..."
gemini --yolo "/edit img/leprechaun.png 'Enhance this leprechaun character for a premium slot game. More detailed facial features with a friendlier expression, richer green coat with visible fabric texture and golden button details, more detailed top hat with a glowing shamrock buckle, the beer mug should have foam with golden sparkles, the money bag should overflow with glowing coins, add magical golden dust particles around his feet among the coins. More polished character art, professional slot game quality, transparent background. No text' --count=3"

# --- 11. FRAME / GRIGLIA ---
echo "[11/12] Miglioramento Frame della Slot..."
gemini --yolo "/edit img/frame.png 'Enhance this slot machine frame border. Make the golden Celtic frame more ornate with detailed knotwork corners, richer aged gold metallic texture with subtle patina, add small emerald gemstones at each corner, more depth with beveled edges and shadows, Celtic vine patterns along the borders, the inner area should remain dark and transparent for the reels. Premium quality frame, professional slot game UI, transparent inner area' --count=3"

# --- 12. SLOT BACKGROUND (UI) ---
echo "[12/12] Miglioramento Slot BG (UI completo)..."
gemini --yolo "/edit img/slot_bg.png 'Enhance this complete slot machine UI background. Make the golden Celtic frame more premium with detailed ornate knotwork, richer metallic textures on all UI elements, the pot of gold decoration should be more detailed, the control panel at the bottom should have more polished buttons with Celtic engravings, add subtle green magical glow effects around the frame edges, more depth and dimension overall. Professional premium slot game UI quality. Keep the same layout and proportions' --count=3"

echo ""
echo "=== COMPLETATO ==="
echo "Le immagini generate sono in ./nanobanana-output/"
echo "Scegli le migliori varianti e copiale nella cartella img/"
echo ""
echo "SUGGERIMENTO: per ulteriori ritocchi su una variante specifica, usa:"
echo "  gemini --yolo \"/edit nanobanana-output/NOME_FILE.png 'la tua modifica'\""
