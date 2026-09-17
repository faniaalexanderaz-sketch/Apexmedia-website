#!/usr/bin/env node
/**
 * APEX MEDIA — genera le email HTML personalizzate a partire da prospects.csv.
 *
 *   node outreach/build-email.mjs            # tutti i prospect con stato "pronto"
 *   node outreach/build-email.mjs --limit 20 # solo i primi 20 (cadenza giornaliera)
 *
 * Output in outreach/out/:
 *   <slug>.html      l'email da incollare in Gmail
 *   manifest.json    destinatario + oggetto + file, per l'invio automatico
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARI, OFFERTA, ALLEGATO, CTA_TESTO, CHIUSURA, FIRMA_NOME } from "./copy.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));

/* Dati mittente Apex Media. Cambiarli qui, non nel template. */
const MITTENTE = {
  email: "info@apexmedia.it",          // casella di contatto mostrata nelle email
  emailInvio: "apex.info.studio@gmail.com",  // casella da cui partono materialmente
  sitoUrl: "https://infoapex.eu",
  sitoLabel: "infoapex.eu",
  tel1: "+39 351 594 0685",      // Alexander
  tel1Raw: "+393515940685",
  tel2: "+39 333 701 8993",      // Federico Delfino
  tel2Raw: "+393337018993",
  whatsapp: "393515940685",
};

/* ---------- CSV: parser minimo con supporto virgolette ---------- */
function leggiCsv(testo) {
  const righe = [];
  let campo = "";
  let riga = [];
  let inVirgolette = false;

  for (let i = 0; i < testo.length; i++) {
    const c = testo[i];
    if (inVirgolette) {
      if (c === '"') {
        if (testo[i + 1] === '"') { campo += '"'; i++; } else { inVirgolette = false; }
      } else campo += c;
      continue;
    }
    if (c === '"') { inVirgolette = true; continue; }
    if (c === ",") { riga.push(campo); campo = ""; continue; }
    if (c === "\n") { riga.push(campo); righe.push(riga); riga = []; campo = ""; continue; }
    if (c === "\r") continue;
    campo += c;
  }
  if (campo !== "" || riga.length) { riga.push(campo); righe.push(riga); }

  const intestazioni = righe.shift().map((h) => h.trim());
  return righe
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => Object.fromEntries(intestazioni.map((h, i) => [h, (r[i] ?? "").trim()])));
}

function slug(testo) {
  return testo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

/* ---------- render ---------- */
function componi(p) {
  const scenario = SCENARI[p.scenario];
  if (!scenario) throw new Error(`Scenario sconosciuto "${p.scenario}" per ${p.attivita}`);
  if (!p.dettaglio) throw new Error(`${p.attivita}: manca "dettaglio" (il problema verificato). Non si invia.`);

  const nome = p.referente?.trim();
  const valori = {
    SUBJECT: scenario.subject(p),
    PREHEADER: scenario.preheader(p),
    SALUTO: nome ? `Buongiorno ${nome},` : "Buongiorno,",
    APERTURA: scenario.apertura(p),
    PROBLEMA: scenario.problema(p),
    CONSEGUENZA: scenario.conseguenza(p),
    OFFERTA: OFFERTA(p),
    ALLEGATO: ALLEGATO(p),
    CTA_TESTO,
    CTA_URL: `https://wa.me/${MITTENTE.whatsapp}?text=${encodeURIComponent(
      `Ciao Alexander, ho ricevuto la tua mail su ${p.attivita}. Vediamo la demo.`
    )}`,
    CHIUSURA: CHIUSURA(p),
    FIRMA_NOME,
    ATTIVITA: p.attivita,
    TEL1: MITTENTE.tel1,
    TEL1_RAW: MITTENTE.tel1Raw,
    TEL2: MITTENTE.tel2,
    TEL2_RAW: MITTENTE.tel2Raw,
    SITO_URL: MITTENTE.sitoUrl,
    SITO_LABEL: MITTENTE.sitoLabel,
    EMAIL_MITTENTE: MITTENTE.email,
  };

  const template = readFileSync(join(QUI, "email-template.html"), "utf8");
  const html = template.replace(/\{\{(\w+)\}\}/g, (intero, chiave) => {
    if (!(chiave in valori)) throw new Error(`Segnaposto non risolto: ${chiave}`);
    return valori[chiave];
  });

  // via i commenti: sono note interne, non devono viaggiare dentro l'email
  const pulito = html.replace(/<!--[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n");

  return { subject: valori.SUBJECT, html: pulito, ctaUrl: valori.CTA_URL };
}

/* Versione testo semplice: Gmail la usa come alternativa e aiuta la consegna. */
const ENTITA = {
  nbsp: " ", middot: "\u00b7", egrave: "\u00e8", eacute: "\u00e9", agrave: "\u00e0",
  ugrave: "\u00f9", ograve: "\u00f2", igrave: "\u00ec", rsquo: "'", lsquo: "'",
  laquo: "\u00ab", raquo: "\u00bb", amp: "&", lt: "<", gt: ">", quot: '"',
  "8203": "", zwnj: "", "39": "'",
};

function versioneTesto(html, ctaUrl) {
  return html
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, "")      // preheader
    .replace(/<head[\s\S]*?<\/head>/i, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<a\b[^>]*href="(?:tel:|mailto:)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    // ogni link tiene il PROPRIO indirizzo: prima finivano tutti su WhatsApp
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (tutto, href, testo) => {
      const etichetta = testo.replace(/<[^>]+>/g, "").trim();
      return etichetta.includes(href.replace(/^https?:\/\//, "")) ? etichetta : `${etichetta}: ${href}`;
    })
    .replace(/<\/(p|tr|div|h\d|table)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#?(\w+);/g, (intero, chiave) => (chiave in ENTITA ? ENTITA[chiave] : intero))
    .split("\n").map((r) => r.trim()).join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ---------- main ---------- */
const argomenti = process.argv.slice(2);
const indiceLimite = argomenti.indexOf("--limit");
const limite = indiceLimite !== -1 ? Number(argomenti[indiceLimite + 1]) : Infinity;

const prospects = leggiCsv(readFileSync(join(QUI, "prospects.csv"), "utf8"))
  .filter((p) => p.stato === "pronto" && p.email)
  .slice(0, limite);

const cartellaOut = join(QUI, "out");
rmSync(cartellaOut, { recursive: true, force: true });
mkdirSync(cartellaOut, { recursive: true });

const manifest = prospects.map((p) => {
  const { subject, html, ctaUrl } = componi(p);
  const file = `${slug(p.attivita)}.html`;
  writeFileSync(join(cartellaOut, file), html);
  return { attivita: p.attivita, to: p.email, subject, file, testo: versioneTesto(html, ctaUrl) };
});

writeFileSync(join(cartellaOut, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`${manifest.length} email generate in outreach/out/`);
for (const m of manifest) console.log(`  ${m.to.padEnd(34)} ${m.subject}`);
