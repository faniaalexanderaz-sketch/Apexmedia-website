#!/bin/bash
# Scarica il font SF Pro dal sito Apple e copia i 4 pesi usati dal video in assets/fonts (serve 7z).
# I file del font non sono nel repo: senza di loro il video usa Inter Display come riserva.
set -e
T=$(mktemp -d); cd "$T"
curl -sSL -o SF-Pro.dmg https://devimages-cdn.apple.com/design/resources/download/SF-Pro.dmg
7z x -y SF-Pro.dmg -oD >/dev/null; 7z x -y D/SFProFonts.pkg -oP >/dev/null; 7z x -y "P/Payload~" -oQ >/dev/null
DEST="$(dirname "$(readlink -f "$0")")/../assets/fonts"
for w in Regular Medium Semibold Bold; do cp "Q/Library/Fonts/SF-Pro-Display-$w.otf" "$DEST/"; done
echo "ok: $DEST"
