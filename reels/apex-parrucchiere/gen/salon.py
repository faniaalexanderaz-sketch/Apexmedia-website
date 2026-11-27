# flat motion-graphics salon: a hairdresser cutting a client's hair, drawn in SVG and animated with GSAP.
INK = '#1b1b1f'; CORAL = '#ff5a5f'; TEAL = '#2ec4b6'; SUN = '#ffbe0b'; CREAM = '#f7f0e6'; SKIN1 = '#f2c3a0'; SKIN2 = '#c68b59'; HAIR1 = '#4a3426'; NAVY = '#2b2d42'

def scissors(p, x, y, s=1.0):
    blade = ('<path d="M0 0 L150 -10 L156 0 L150 6 Z" fill="#e9ecef" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
             '<circle cx="-34" cy="0" r="22" fill="none" stroke="{c}" stroke-width="12"/>').replace('{INK}', INK)
    return (f'<g transform="translate({x} {y}) scale({s})"><g id="{p}-sa">{blade.replace("{c}", CORAL)}</g>'
            f'<g id="{p}-sb" transform="scale(1,-1)">{blade.replace("{c}", CORAL)}</g><circle cx="0" cy="0" r="7" fill="{INK}"/></g>')

def salon(p, top=640, mirror=True, sc=1.0):
    """client in a cape, hairdresser behind with scissors; ids: {p}-arm, {p}-sa/{p}-sb (blades), {p}-h0..h9 (falling hair), {p}-hd (stylist head)"""
    hair_top = ''.join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{HAIR1}"/>' for cx, cy, r in
                       [(400, 520, 62), (450, 480, 70), (520, 478, 70), (575, 515, 60), (370, 580, 46), (600, 575, 44), (480, 455, 60)])
    bits = ''.join(f'<g transform="translate({560 + (k % 4) * 18} {480 + (k % 3) * 24})"><path id="{p}-h{k}" d="M0 0 q14 -18 30 -4 q10 12 26 2" fill="none" stroke="{HAIR1}" stroke-width="10" stroke-linecap="round" opacity="0"/></g>' for k in range(10))
    mir = (f'<rect x="120" y="40" width="840" height="760" rx="60" fill="#e3f4f2" stroke="{INK}" stroke-width="10"/>'
           f'<path d="M180 120 L330 120 L200 330 Z" fill="#ffffff" opacity="0.7"/><path d="M260 120 L300 120 L190 300 L180 270 Z" fill="#ffffff" opacity="0.5"/>'
           + ''.join(f'<circle cx="{170 + k * 185}" cy="40" r="18" fill="{SUN}" stroke="{INK}" stroke-width="6"/>' for k in range(5))) if mirror else ''
    return (f'<svg id="{p}-sv" viewBox="0 0 1080 1280" width="1080" height="1280" style="position:absolute;left:0;top:{top}px;overflow:visible;transform:scale({sc});transform-origin:50% 0" data-layout-allow-overlap>'
            + mir +
            # hairdresser (behind, right)
            f'<g id="{p}-sty">'
            f'<rect x="690" y="640" width="250" height="520" rx="110" fill="{CORAL}" stroke="{INK}" stroke-width="10"/>'
            f'<path d="M730 780 Q815 750 900 780 L890 1160 H740 Z" fill="#ffffff" stroke="{INK}" stroke-width="8"/><path d="M770 860 H860" stroke="{CORAL}" stroke-width="10" stroke-linecap="round"/>'
            f'<rect x="790" y="560" width="50" height="90" fill="{SKIN2}" stroke="{INK}" stroke-width="8"/>'
            f'<g id="{p}-hd"><circle cx="815" cy="500" r="92" fill="{SKIN2}" stroke="{INK}" stroke-width="10"/>'
            f'<path d="M725 495 Q735 395 820 400 Q905 405 905 490 Q860 450 800 455 Q760 460 725 495 Z" fill="{INK}"/><circle cx="845" cy="385" r="42" fill="{INK}"/>'
            f'<circle cx="780" cy="510" r="9" fill="{INK}"/><circle cx="850" cy="510" r="9" fill="{INK}"/><path d="M790 548 Q815 566 840 548" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"/></g>'
            # arm with scissors (pivot at the shoulder)
            f'<g id="{p}-arm" style="transform-origin:720px 700px;transform-box:view-box">'
            f'<path d="M720 700 Q640 680 620 560" fill="none" stroke="{INK}" stroke-width="64" stroke-linecap="round"/>'
            f'<path d="M720 700 Q640 680 620 560" fill="none" stroke="{CORAL}" stroke-width="46" stroke-linecap="round"/>'
            f'<circle cx="620" cy="555" r="34" fill="{SKIN2}" stroke="{INK}" stroke-width="8"/>'
            f'<g transform="rotate(-150 620 545)">{scissors(p, 620, 545, 1.3)}</g></g>'
            f'</g>'
            # client (front, centre)
            f'<g id="{p}-cl">'
            f'<rect x="450" y="640" width="60" height="80" fill="{SKIN1}" stroke="{INK}" stroke-width="8"/>'
            f'<path d="M260 1280 C260 860 360 720 480 720 C600 720 700 860 700 1280 Z" fill="{NAVY}" stroke="{INK}" stroke-width="10"/>'
            f'<path d="M420 722 L480 800 L540 722" fill="none" stroke="#ffffff" stroke-width="10" stroke-linejoin="round"/>'
            f'<circle cx="480" cy="580" r="118" fill="{SKIN1}" stroke="{INK}" stroke-width="10"/>'
            f'<g id="{p}-hair">{hair_top}</g>'
            f'<path d="M425 590 Q440 578 455 590" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>'
            f'<path d="M505 590 Q520 578 535 590" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>'
            f'<path d="M450 640 Q480 664 510 640" fill="none" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>'
            f'<circle cx="415" cy="625" r="16" fill="{CORAL}" opacity="0.45"/><circle cx="545" cy="625" r="16" fill="{CORAL}" opacity="0.45"/>'
            f'</g>{bits}</svg>')

def salon_js(p, t0, t1, snip=0.16):
    """snipping and falling hair from t0 to t1 (scene seconds), every tween explicit so seeking is exact"""
    js = []
    n = int((t1 - t0) / (snip * 2))
    for k in range(n):
        t = t0 + k * snip * 2
        js.append(f'    tl.fromTo("#{p}-sa", {{ rotation: -14 }}, {{ rotation: 4, duration: {snip}, ease: "power2.in", svgOrigin: "0 0" }}, {t:.3f});')
        js.append(f'    tl.fromTo("#{p}-sb", {{ rotation: -14 }}, {{ rotation: 4, duration: {snip}, ease: "power2.in", svgOrigin: "0 0" }}, {t:.3f});')
        js.append(f'    tl.to("#{p}-sa, #{p}-sb", {{ rotation: -14, duration: {snip}, ease: "power2.out", svgOrigin: "0 0" }}, {t + snip:.3f});')
    # arm sways between snips
    js.append(f'    tl.fromTo("#{p}-arm", {{ rotation: -6 }}, {{ rotation: 8, duration: 0.42, ease: "sine.inOut", yoyo: true, repeat: {max(1, int((t1 - t0) / 0.42))} }}, {t0:.3f});')
    js.append(f'    tl.fromTo("#{p}-hd", {{ rotation: -4 }}, {{ rotation: 4, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: {max(1, int((t1 - t0) / 0.6))}, svgOrigin: "815 560" }}, {t0:.3f});')
    # hair bits fall in a steady rain
    for k in range(int((t1 - t0) / 0.14)):
        i = k % 10; t = t0 + k * 0.14
        dx = [-60, 40, -20, 70, -90, 20, 50, -40, 90, -10][i]
        js.append(f'    tl.fromTo("#{p}-h{i}", {{ x: 0, y: 0, rotation: 0, opacity: 1 }}, {{ x: {dx}, y: 520, rotation: {dx * 4}, opacity: 0, duration: 0.9, ease: "power1.in" }}, {t:.3f});')
    return '\n'.join(js) + '\n'
