#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate premium word-highlighted ASS captions + top section titles."""

# (text, start, end) — exact timestamps derived from silencedetect on the
# actual voice-over audio (same file reused across sessions).
PHRASES = [
    ("Lo sapevi che ogni punto del piede racconta una parte del tuo corpo?", 0.00, 3.385, "A"),
    ("È una mappa antica: talloni, arco, dita —", 4.373, 5.416, "A"),
    ("ogni zona è collegata a un organo, a una tensione", 6.071, 8.405, "A"),
    ("che porti dentro senza saperlo...", 9.164, 10.927, "A"),
    ("La riflessologia plantare lavora su questi punti con pressioni precise,", 11.417, 13.603, "A"),
    ("sciogliendo i blocchi", 14.724, 16.114, "A"),
    ("e restituendo energia a tutto il corpo...", 16.484, 18.748, "A"),
    ("Il collo, invece, è dove accumuli lo stress della giornata...", 19.348, 22.708, "B"),
    ("il trapezio teso ti dice di rallentare...", 23.682, 24.679, "B"),
    ("Il massaggio shiatsu scioglie quei blocchi", 25.128, 27.164, "B"),
    ("e riattiva la circolazione cervicale...", 28.063, 30.475, "B"),
    ("Due trattamenti, un solo obiettivo:", 31.534, 33.979, "C"),
    ("il tuo equilibrio,", 34.570, 36.509, "C"),
    ("dalla testa ai piedi...", 37.479, 39.840, "C"),
    ("Prenota il tuo momento", 40.704, 41.601, "C"),
    ("da Essenza d'Oriente.", 42.240, 43.222, "C"),
    ("Il link è in bio.", 44.323, 46.608, "C"),
]

TITLES = [
    ("RIFLESSOLOGIA PLANTARE", 1.2, 18.7),
    ("MASSAGGIO CERVICALE", 19.5, 31.0),
    ("EQUILIBRIO TOTALE", 31.5, 40.0),
]

GOLD = "&H0068C5E7"   # ASS BGR for RGB E7C568 (gold)
WHITE = "&H00FFFFFF"
DIM = "&H00D8D8D8"

def fmt_t(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return f"{h:d}:{m:02d}:{s:05.2f}"

def chunk_words(text):
    words = text.split(" ")
    chunks = []
    cur = []
    cur_len = 0
    for w in words:
        cur.append(w)
        cur_len += len(w) + 1
        if cur_len >= 16 and len(cur) >= 2:
            chunks.append(cur)
            cur = []
            cur_len = 0
    if cur:
        chunks.append(cur)
    return chunks

def split_time(total_start, total_end, weights):
    total_w = sum(weights)
    dur = total_end - total_start
    out = []
    t = total_start
    for w in weights:
        d = dur * (w / total_w)
        out.append((t, t + d))
        t += d
    return out

events = []
for text, start, end, section in PHRASES:
    style = "CapBox" if section in ("A", "C") else "CapOutline"
    chunks = chunk_words(text)
    chunk_weights = [sum(len(w) for w in c) + len(c) for c in chunks]
    chunk_spans = split_time(start, end, chunk_weights)
    for chunk, (c_start, c_end) in zip(chunks, chunk_spans):
        word_weights = [len(w) + 1 for w in chunk]
        word_spans = split_time(c_start, c_end, word_weights)
        line_text_template = chunk
        for i, (w_start, w_end) in enumerate(word_spans):
            parts = []
            for j, w in enumerate(line_text_template):
                if j == i:
                    parts.append(f"{{\\c{GOLD}\\fscx108\\fscy108}}{w}{{\\c{WHITE}\\fscx100\\fscy100}}")
                else:
                    parts.append(w)
            line = " ".join(parts)
            events.append((w_start, w_end, style, line))

title_events = []
for text, start, end in TITLES:
    title_events.append((start, start + 0.5, "TitleIn", text))
    title_events.append((start + 0.5, end - 0.4, "Title", text))
    title_events.append((end - 0.4, end, "TitleOut", text))

ass = []
ass.append("[Script Info]")
ass.append("Title: Essenza d'Oriente v2 - Premium Captions")
ass.append("ScriptType: v4.00+")
ass.append("PlayResX: 1080")
ass.append("PlayResY: 1920")
ass.append("WrapStyle: 0")
ass.append("ScaledBorderAndShadow: yes")
ass.append("")
ass.append("[V4+ Styles]")
ass.append("Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding")
ass.append(f"Style: CapBox,DejaVu Sans,58,{WHITE},{WHITE},&H00000000,&H55000000,1,0,0,0,100,100,0.5,0,3,14,0,2,70,70,320,1")
ass.append(f"Style: CapOutline,DejaVu Sans,60,{WHITE},{WHITE},&H00000000,&H00000000,1,0,0,0,100,100,0.5,0,1,9,3,2,70,70,320,1")
ass.append(f"Style: Title,DejaVu Sans,34,{GOLD},{GOLD},&H00000000,&H70000000,1,0,0,0,100,100,3,0,3,10,0,8,60,60,140,1")
ass.append(f"Style: TitleIn,DejaVu Sans,34,{GOLD},{GOLD},&H00000000,&H70000000,1,0,0,0,100,100,3,0,3,10,0,8,60,60,140,1")
ass.append(f"Style: TitleOut,DejaVu Sans,34,{GOLD},{GOLD},&H00000000,&H70000000,1,0,0,0,100,100,3,0,3,10,0,8,60,60,140,1")
ass.append("")
ass.append("[Events]")
ass.append("Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text")

for w_start, w_end, style, line in events:
    ass.append(f"Dialogue: 0,{fmt_t(w_start)},{fmt_t(w_end)},{style},,0,0,0,,{{\\fad(40,40)}}{line}")

for t_start, t_end, style, text in title_events:
    if style == "TitleIn":
        tag = "{\\fad(250,0)}"
    elif style == "TitleOut":
        tag = "{\\fad(0,300)}"
    else:
        tag = ""
    ass.append(f"Dialogue: 1,{fmt_t(t_start)},{fmt_t(t_end)},{style},,0,0,0,,{tag}{text}")

with open("/home/user/Apexmedia-website/my-video/assets/v2/captions/captions_v2.ass", "w", encoding="utf-8") as f:
    f.write("\n".join(ass) + "\n")

print(f"Generated {len(events)} word-highlight events + {len(title_events)} title events")
