# -*- coding: utf-8 -*-
# Icone monocrome bianche, 16px, usate dentro i chip colorati Apex Media.
_W = 'fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"'

def _svg(inner, w=16):
    return f'<svg width="{w}" height="{w}" viewBox="0 0 24 24" {_W}>{inner}</svg>'

GOOGLE = _svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>')
IG     = _svg('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.9"/><circle cx="17.2" cy="6.8" r="1.1" fill="#fff" stroke="none"/>')
FB     = _svg('<path d="M14.6 7.5h2.2V4.4h-2.6c-2.4 0-3.8 1.5-3.8 3.9v2H8.2v3.1h2.2V21h3.3v-7.6h2.4l.4-3.1h-2.8V8.7c0-.8.3-1.2.9-1.2z" fill="#fff" stroke="none"/>')
TT     = _svg('<path d="M14.1 3v10.9a3.1 3.1 0 1 1-2.6-3.06" /><path d="M14.1 3c.4 2.2 2 3.8 4.3 4.1"/>')
TW     = _svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3.2"/><path d="M3.5 9.8h17M8.3 3.4v3.2M15.7 3.4v3.2"/><path d="M9 14.4l2 2 4-4.2"/>')
WA     = _svg('<path d="M20.2 11.6a8.2 8.2 0 0 1-12.2 7.2L3.8 20.2l1.4-4.1A8.2 8.2 0 1 1 20.2 11.6z"/>')
TEL    = _svg('<path d="M20.5 16.9v2.6a1.7 1.7 0 0 1-1.9 1.7 17 17 0 0 1-7.4-2.6 16.7 16.7 0 0 1-5.1-5.1A17 17 0 0 1 3.5 6a1.7 1.7 0 0 1 1.7-1.9h2.6a1.7 1.7 0 0 1 1.7 1.5c.1.9.3 1.7.6 2.5a1.7 1.7 0 0 1-.4 1.8l-1.1 1.1a13.6 13.6 0 0 0 5.1 5.1l1.1-1.1a1.7 1.7 0 0 1 1.8-.4c.8.3 1.6.5 2.5.6a1.7 1.7 0 0 1 1.4 1.7z"/>')
SITE   = _svg('<rect x="3" y="4.5" width="18" height="15" rx="2.6"/><path d="M3 9h18M6.6 6.7h.01M9.2 6.7h.01"/>')
CHART  = _svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>')
STAR   = _svg('<path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.6l5.9-.8z"/>')
TARGET = _svg('<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r=".9" fill="#fff" stroke="none"/>')
MAIL   = _svg('<rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M3.8 6.4L12 12.6l8.2-6.2"/>')
MAPS   = _svg('<path d="M12 21s6.6-5.6 6.6-10.2A6.6 6.6 0 0 0 5.4 10.8C5.4 15.4 12 21 12 21z"/><circle cx="12" cy="10.6" r="2.4"/>')
APEX   = ('<svg width="15" height="16" viewBox="0 0 30 32" fill="none">'
          '<path d="M15 3 L27.5 29 L2.5 29 Z" stroke="url(#ag)" stroke-width="2.8" stroke-linejoin="round"/>'
          '<path d="M15 13.5 L20 24 L10 24 Z" fill="url(#ag)" opacity=".92"/>'
          '<defs><linearGradient id="ag" x1="2" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">'
          '<stop stop-color="#F5E3A8"/><stop offset="1" stop-color="#E7C568"/></linearGradient></defs></svg>')
