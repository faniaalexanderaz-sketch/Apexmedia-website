# -*- coding: utf-8 -*-
"""Genera i PDF del report Apex Media per Essenza d'Oriente (IT + ZH-CN)."""
import os, subprocess, sys, importlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "assets"))
import icons

CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

SHELL = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8"/>
<title>{title}</title>
<link rel="stylesheet" href="assets/report.css"/>
</head>
<body>
{pages}
</body>
</html>"""

PAGE = """<section class="page {cls}">
  <div class="phead">
    <div class="logo"><span class="sq">{apex}</span><span class="wm">APEX MEDIA</span></div>
    <span class="tag">{tag}</span>
  </div>
  {body}
  <div class="pfoot"><span>{foot_l}</span><span>{foot_r}</span></div>
</section>"""

PAGE_BARE = """<section class="page {cls}">
{body}
</section>"""


def build(lang, strings, pages, out_html):
    html_pages = []
    for p in pages:
        cls = p.get("cls", "")
        if p.get("bare"):
            html_pages.append(PAGE_BARE.format(cls=cls, body=p["body"]))
        else:
            html_pages.append(PAGE.format(
                cls=cls, apex=icons.APEX, tag=strings["tag"],
                foot_l=strings["foot_l"], foot_r=strings["foot_r"], body=p["body"]))
    html = SHELL.format(lang=lang, title=strings["title"], pages="\n".join(html_pages))
    path = os.path.join(HERE, out_html)
    open(path, "w", encoding="utf-8").write(html)
    return path


def to_pdf(html_path, pdf_path):
    subprocess.run([
        CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw", "--virtual-time-budget=20000",
        "--font-render-hinting=none",
        "--print-to-pdf=" + pdf_path, "file://" + html_path,
    ], check=True, capture_output=True)
    print("PDF:", pdf_path, os.path.getsize(pdf_path) // 1024, "KB")


if __name__ == "__main__":
    for mod, lang, stem in (("content_it", "it", "Apex-Media-Essenza-dOriente-Report-6-mesi-IT"),
                            ("content_cn", "zh-CN", "Apex-Media-Essenza-dOriente-Report-6-mesi-CN"),
                            ("content_it_short", "it", "Apex-Media-Essenza-dOriente-Sintesi-IT"),
                            ("content_cn_short", "zh-CN", "Apex-Media-Essenza-dOriente-Sintesi-CN")):
        m = importlib.import_module(mod)
        hp = build(lang, m.STRINGS, m.PAGES, stem + ".html")
        to_pdf(hp, os.path.join(HERE, stem + ".pdf"))
