// Funzione Vercel: riceve una prenotazione "prenota e ritira" dal sito.
//
// Con le variabili d'ambiente RESEND_API_KEY, RESERVATION_EMAIL_TO e RESERVATION_EMAIL_FROM
// la prenotazione arriva via email allo staff del negozio. Senza, risponde in modalità demo
// (nessun invio) e il sito lo dichiara al visitatore.

type Item = { nome: string; slug: string; taglia: string; quantita: number; prezzo: number }
type Payload = { nome: string; telefono: string; email?: string; giorno: string; fascia: string; note?: string; articoli: Item[] }

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

const clean = (v: unknown, max = 200) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max)

export async function POST(request: Request): Promise<Response> {
  let body: Payload
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'Richiesta non valida' }, 400)
  }

  const nome = clean(body.nome, 80)
  const telefono = clean(body.telefono, 30)
  const items = Array.isArray(body.articoli) ? body.articoli.slice(0, 20) : []
  if (nome.length < 2 || !/^[0-9 +()./-]{6,}$/.test(telefono) || items.length === 0) {
    return json({ ok: false, error: 'Dati mancanti' }, 422)
  }

  const code = `EDM-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`
  const lines = items.map(
    (i) => `• ${clean(i.nome, 80)} — taglia ${clean(i.taglia, 20)} × ${Number(i.quantita) || 1} (${Number(i.prezzo) || 0} €)`,
  )
  const text = [
    `Nuova prenotazione ${code}`,
    '',
    `Cliente: ${nome}`,
    `Telefono: ${telefono}`,
    body.email ? `Email: ${clean(body.email, 120)}` : null,
    `Ritiro: ${clean(body.giorno, 60)}, ${clean(body.fascia, 60)}`,
    body.note ? `Note: ${clean(body.note, 500)}` : null,
    '',
    ...lines,
  ]
    .filter(Boolean)
    .join('\n')

  const { RESEND_API_KEY, RESERVATION_EMAIL_TO, RESERVATION_EMAIL_FROM } = process.env
  if (!RESEND_API_KEY || !RESERVATION_EMAIL_TO || !RESERVATION_EMAIL_FROM) {
    console.log(`[prenota] demo, nessun invio\n${text}`)
    return json({ ok: true, code, demo: true })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: RESERVATION_EMAIL_FROM,
      to: RESERVATION_EMAIL_TO.split(',').map((s) => s.trim()),
      subject: `Prenotazione ${code} · ${nome}`,
      text,
    }),
  })
  if (!res.ok) {
    console.error('[prenota] invio email fallito', res.status, await res.text())
    return json({ ok: false, error: 'Invio non riuscito' }, 502)
  }
  return json({ ok: true, code, demo: false })
}
