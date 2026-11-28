# flat motion-graphics bar: menu board, espresso machine, barista, cups and steam (SVG + GSAP helpers)
from salon import INK, CORAL, TEAL, SUN, CREAM, NAVY, SKIN1, SKIN2, HAIR1
BOARD = '#2f3e46'; WOOD = '#8d5524'; COFFEE = '#6f4e37'; CREMA = '#d4a373'; CHALK = '#f1f1e6'

def board(p, n=40, x=90, y=230, w=900, h=820, title='MENÙ'):
    rows = n // 2
    items = ''
    for k in range(n):
        c, r = k % 2, k // 2
        ww = [210, 170, 240, 190, 150, 230, 200, 180, 220, 160][(k * 7) % 10]
        ix = 60 + c * 410; iy = 170 + r * ((h - 210) / rows)
        items += (f'<g id="{p}-i{k}"><rect x="{ix}" y="{iy:.0f}" width="{ww}" height="{max(10, (h - 210) / rows * 0.42):.0f}" rx="6" fill="{CHALK}" opacity="0.85"/>'
                  f'<rect x="{ix + 300}" y="{iy:.0f}" width="60" height="{max(10, (h - 210) / rows * 0.42):.0f}" rx="6" fill="{SUN}" opacity="0.9"/></g>')
    return (f'<svg id="{p}-bd" viewBox="0 0 {w} {h}" width="{w}" height="{h}" style="position:absolute;left:{x}px;top:{y}px;overflow:visible" data-layout-allow-overlap>'
            f'<rect x="0" y="0" width="{w}" height="{h}" rx="34" fill="{WOOD}" stroke="{INK}" stroke-width="10"/>'
            f'<rect x="30" y="30" width="{w - 60}" height="{h - 60}" rx="18" fill="{BOARD}" stroke="{INK}" stroke-width="6"/>'
            f'<text x="{w / 2}" y="125" text-anchor="middle" font-family="SF Pro Display" font-weight="700" font-size="78" fill="{CHALK}" letter-spacing="6">{title}</text>'
            f'{items}</svg>')

def board_fly_js(p, ids, t, st=0.035):
    sel = ', '.join(f'#{p}-i{k}' for k in ids)
    js = f'    tl.to("{sel}", {{ x: function (i) {{ return (i % 2 ? 1 : -1) * (700 + (i * 37) % 300); }}, y: function (i) {{ return -200 - (i * 53) % 400; }}, rotation: function (i) {{ return (i % 2 ? 1 : -1) * (40 + (i * 13) % 50); }}, opacity: 0, duration: 0.55, ease: "power3.in", stagger: {st}, svgOrigin: "450 400" }}, {t});\n'
    return js

def steam(p, x, y, n=3, s=1.0):
    return ''.join(f'<svg viewBox="0 0 60 160" width="{60 * s:.0f}" height="{160 * s:.0f}" style="position:absolute;left:{x + k * 46 * s:.0f}px;top:{y}px;overflow:visible" data-layout-allow-overlap><path id="{p}-s{k}" d="M30 150 C 0 120, 60 100, 30 70 C 0 40, 60 20, 30 0" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0"/></svg>' for k in range(n))

def steam_js(p, t0, t1, n=3):
    js = []
    k = 0; t = t0
    while t < t1 - 0.2:
        i = k % n
        js.append(f'    tl.fromTo("#{p}-s{i}", {{ y: 40, opacity: 0, scaleY: 0.6 }}, {{ y: -90, opacity: 0.9, scaleY: 1.1, duration: 0.45, ease: "sine.out" }}, {t:.3f});')
        js.append(f'    tl.to("#{p}-s{i}", {{ y: -170, opacity: 0, duration: 0.35, ease: "sine.in" }}, {t + 0.45:.3f});')
        k += 1; t += 0.27
    return '\n'.join(js) + '\n'

def cup(i, x, y, s=1.0, col=CORAL):
    return (f'<svg id="{i}" viewBox="0 0 220 180" width="{220 * s:.0f}" height="{180 * s:.0f}" style="position:absolute;left:{x}px;top:{y}px;overflow:visible" data-layout-allow-overlap>'
            f'<ellipse cx="100" cy="160" rx="96" ry="18" fill="#ffffff" stroke="{INK}" stroke-width="8"/>'
            f'<path d="M30 40 H170 Q166 150 100 152 Q34 150 30 40 Z" fill="{col}" stroke="{INK}" stroke-width="9" stroke-linejoin="round"/>'
            f'<path d="M168 62 Q212 62 206 96 Q200 124 158 120" fill="none" stroke="{INK}" stroke-width="10"/>'
            f'<ellipse cx="100" cy="40" rx="70" ry="14" fill="{COFFEE}" stroke="{INK}" stroke-width="8"/><ellipse cx="100" cy="40" rx="44" ry="7" fill="{CREMA}"/></svg>')

def machine(i, x, y, s=1.0):
    return (f'<svg id="{i}" viewBox="0 0 400 380" width="{400 * s:.0f}" height="{380 * s:.0f}" style="position:absolute;left:{x}px;top:{y}px;overflow:visible" data-layout-allow-overlap>'
            f'<rect x="20" y="20" width="360" height="250" rx="34" fill="{CORAL}" stroke="{INK}" stroke-width="10"/>'
            f'<rect x="20" y="20" width="360" height="70" rx="30" fill="#ffffff" stroke="{INK}" stroke-width="10"/>'
            f'<circle cx="110" cy="56" r="20" fill="{SUN}" stroke="{INK}" stroke-width="7"/><circle cx="290" cy="56" r="20" fill="{TEAL}" stroke="{INK}" stroke-width="7"/>'
            f'<rect x="150" y="270" width="100" height="40" rx="10" fill="#c9c9c9" stroke="{INK}" stroke-width="8"/>'
            f'<rect x="185" y="308" width="30" height="30" fill="#c9c9c9" stroke="{INK}" stroke-width="6"/>'
            f'<path id="{i}-dr" d="M200 340 V380" stroke="{COFFEE}" stroke-width="10" stroke-linecap="round" opacity="0"/>'
            f'<rect x="0" y="360" width="400" height="20" rx="10" fill="{INK}"/></svg>')

def barista(p, x, y, s=1.0):
    """a barista waving a cup; ids {p}-ba (arm), {p}-bh (head)"""
    return (f'<svg id="{p}-b" viewBox="0 0 360 560" width="{360 * s:.0f}" height="{560 * s:.0f}" style="position:absolute;left:{x}px;top:{y}px;overflow:visible" data-layout-allow-overlap>'
            f'<rect x="60" y="240" width="240" height="340" rx="100" fill="{TEAL}" stroke="{INK}" stroke-width="10"/>'
            f'<path d="M90 330 Q180 300 270 330 L262 560 H98 Z" fill="{COFFEE}" stroke="{INK}" stroke-width="8"/>'
            f'<rect x="155" y="170" width="50" height="80" fill="{SKIN2}" stroke="{INK}" stroke-width="8"/>'
            f'<g id="{p}-bh"><circle cx="180" cy="120" r="88" fill="{SKIN2}" stroke="{INK}" stroke-width="10"/>'
            f'<path d="M92 112 Q100 30 180 30 Q260 30 268 112 L268 92 Q180 60 92 92 Z" fill="{INK}"/><rect x="88" y="78" width="184" height="26" rx="13" fill="{CORAL}" stroke="{INK}" stroke-width="6"/>'
            f'<circle cx="148" cy="128" r="9" fill="{INK}"/><circle cx="212" cy="128" r="9" fill="{INK}"/><path d="M150 162 Q180 186 210 162" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"/></g>'
            f'<g id="{p}-ba" style="transform-origin:90px 300px;transform-box:view-box">'
            f'<path d="M90 300 Q20 280 30 170" fill="none" stroke="{INK}" stroke-width="60" stroke-linecap="round"/>'
            f'<path d="M90 300 Q20 280 30 170" fill="none" stroke="{TEAL}" stroke-width="42" stroke-linecap="round"/>'
            f'<circle cx="30" cy="165" r="30" fill="{SKIN2}" stroke="{INK}" stroke-width="8"/>'
            f'<g transform="translate(-40 60) scale(0.45)"><path d="M30 40 H170 Q166 150 100 152 Q34 150 30 40 Z" fill="#ffffff" stroke="{INK}" stroke-width="14"/><ellipse cx="100" cy="40" rx="70" ry="14" fill="{COFFEE}" stroke="{INK}" stroke-width="12"/></g></g>'
            f'</svg>')

def jar(col):
    return (f'<svg viewBox="0 0 100 120" width="100%" height="100%"><rect x="22" y="6" width="56" height="20" rx="6" fill="{INK}"/>'
            f'<path d="M14 30 H86 V104 Q86 116 74 116 H26 Q14 116 14 104 Z" fill="{col}" stroke="{INK}" stroke-width="7"/><rect x="26" y="56" width="48" height="30" rx="6" fill="#ffffff" stroke="{INK}" stroke-width="5"/></svg>')
