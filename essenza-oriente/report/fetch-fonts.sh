#!/usr/bin/env bash
# Scarica i font CJK (Noto Sans SC) necessari alla versione cinese del report.
# I .woff2 latini (Inter) sono già versionati in assets/fonts/.
set -e
D="$(dirname "$0")/assets/fonts"
curl -sS "https://fonts.gstatic.com/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYw.ttf" -o "$D/notosanssc-400.ttf"
curl -sS "https://fonts.gstatic.com/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaGzjCnYw.ttf" -o "$D/notosanssc-700.ttf"
echo "Font CJK scaricati in $D"
