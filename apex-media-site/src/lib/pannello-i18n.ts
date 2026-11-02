/* Testi del pannello (admin e cliente) in italiano e cinese semplificato. */
export type Lingua = "it" | "zh";
export const COOKIE_LINGUA = "eo_lang";

const it = {
  titoloAdmin: "Dashboard",
  titoloCliente: "La tua dashboard",
  sottotitolo: "Click, prenotazioni e andamento · fuso Europe/Rome",
  areaRiservata: "Apex Media · area riservata",
  password: "Password",
  entra: "Entra",
  esci: "Esci",
  erroreLogin: "Password non corretta.",
  troppiTentativi: "Troppi tentativi: riprova tra 15 minuti.",
  tuttiSiti: "Tutti i siti",
  filtra: "Filtra",
  esportaCsv: "Esporta CSV",
  lingua: "Lingua",
  solaLettura: "Accesso in sola lettura",
  // hero
  click30: "Click in 30 giorni",
  prenotazioni30: "Prenotazioni in 30 giorni",
  incasso30: "Incasso in 30 giorni",
  oggi: "oggi",
  ultimi7: "negli ultimi 7 giorni",
  mesePrecedente: "rispetto ai 30 giorni precedenti",
  // click
  sezClick: "Contatti dal sito",
  descClick: "Ogni click su WhatsApp, telefono e Prenota, con la sorgente che lo ha portato.",
  whatsapp: "WhatsApp",
  telefono: "Telefono",
  prenota: "Prenota",
  totale: "Totale",
  totale30: "Totale 30 giorni",
  graficoTitolo: "Click al giorno, ultimi 30 giorni",
  perSorgente: "Per sorgente",
  perDispositivo: "Per dispositivo",
  perPagina: "Per pagina",
  voce: "Voce",
  mobile: "Mobile",
  desktop: "Desktop",
  nessunClick: "Nessun click negli ultimi 30 giorni.",
  sorgenti: { google_ads: "Google Ads", instagram: "Instagram / Meta", organico: "Organico / diretto", altro: "Altro" } as Record<string, string>,
  notaSorgenti: "Sorgente: Google Ads = gclid presente o utm_source=google · Instagram = utm_source instagram/ig/facebook/meta · Organico = nessun parametro · Altro = altri utm. Nessun dato personale salvato.",
  // prenotazioni
  sezPrenotazioni: "Prenotazioni",
  descPrenotazioni: "Registrate a mano dal centro o importate da Treatwell.",
  data: "Data",
  trattamento: "Trattamento",
  canale: "Canale",
  importo: "Importo",
  note: "Note",
  azioni: "Azioni",
  elimina: "Elimina",
  confermaElimina: "Eliminare questa prenotazione?",
  aggiungi: "Aggiungi prenotazione",
  salva: "Salva",
  importaCsv: "Importa CSV",
  importaHint: "Intestazione: data;trattamento;canale;importo;note · date gg/mm/aaaa o aaaa-mm-gg",
  importate: "prenotazioni importate",
  nessunaPrenotazione: "Nessuna prenotazione negli ultimi 12 mesi.",
  perCanale: "Per canale",
  perTrattamento: "Per trattamento",
  canali: { treatwell: "Treatwell", telefono: "Telefono", whatsapp: "WhatsApp", "walk-in": "Di persona" } as Record<string, string>,
  altroTrattamento: "Altro (scrivi sotto)",
  // note mensili
  sezNote: "Andamento mese per mese",
  descNote: "Il commento di Apex Media sui risultati del mese.",
  mese: "Mese",
  testoIt: "Testo in italiano",
  testoZh: "Testo in cinese",
  scriviNota: "Scrivi o aggiorna la nota del mese",
  nessunaNota: "Nessuna nota ancora.",
  aggiornato: "Aggiornato",
  errore: "Qualcosa non ha funzionato",
  erroreStorage: "Non riesco a leggere lo storage: controlla che su Vercel il progetto abbia un Blob store collegato (BLOB_READ_WRITE_TOKEN).",
  mesi: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
};

const zh: typeof it = {
  titoloAdmin: "数据面板",
  titoloCliente: "您的数据面板",
  sottotitolo: "点击、预约与月度走势 · 时区 Europe/Rome",
  areaRiservata: "Apex Media · 专属登录区",
  password: "密码",
  entra: "登录",
  esci: "退出",
  erroreLogin: "密码不正确。",
  troppiTentativi: "尝试次数过多，请 15 分钟后再试。",
  tuttiSiti: "所有网站",
  filtra: "筛选",
  esportaCsv: "导出 CSV",
  lingua: "语言",
  solaLettura: "只读访问",
  click30: "近 30 天点击",
  prenotazioni30: "近 30 天预约",
  incasso30: "近 30 天营业额",
  oggi: "今天",
  ultimi7: "近 7 天",
  mesePrecedente: "较前 30 天",
  sezClick: "来自网站的联系",
  descClick: "每一次点击 WhatsApp、电话和「预约」按钮，以及带来点击的来源。",
  whatsapp: "WhatsApp",
  telefono: "电话",
  prenota: "预约",
  totale: "合计",
  totale30: "30 天合计",
  graficoTitolo: "每日点击，近 30 天",
  perSorgente: "按来源",
  perDispositivo: "按设备",
  perPagina: "按页面",
  voce: "项目",
  mobile: "手机",
  desktop: "电脑",
  nessunClick: "近 30 天没有点击。",
  sorgenti: { google_ads: "Google 广告", instagram: "Instagram / Meta", organico: "自然流量 / 直接访问", altro: "其他" },
  notaSorgenti: "来源说明：Google 广告 = 带 gclid 或 utm_source=google · Instagram = utm_source 为 instagram/ig/facebook/meta · 自然流量 = 无参数 · 其他 = 其他 utm。不保存任何个人数据。",
  sezPrenotazioni: "预约记录",
  descPrenotazioni: "由店里手动登记，或从 Treatwell 导入。",
  data: "日期",
  trattamento: "项目",
  canale: "渠道",
  importo: "金额",
  note: "备注",
  azioni: "操作",
  elimina: "删除",
  confermaElimina: "确定删除这条预约？",
  aggiungi: "添加预约",
  salva: "保存",
  importaCsv: "导入 CSV",
  importaHint: "表头：data;trattamento;canale;importo;note · 日期格式 日/月/年 或 年-月-日",
  importate: "条预约已导入",
  nessunaPrenotazione: "近 12 个月没有预约记录。",
  perCanale: "按渠道",
  perTrattamento: "按项目",
  canali: { treatwell: "Treatwell", telefono: "电话", whatsapp: "WhatsApp", "walk-in": "到店" },
  altroTrattamento: "其他（在下方填写）",
  sezNote: "逐月走势",
  descNote: "Apex Media 对当月业绩的点评。",
  mese: "月份",
  testoIt: "意大利语内容",
  testoZh: "中文内容",
  scriviNota: "撰写或更新本月点评",
  nessunaNota: "暂无点评。",
  aggiornato: "更新于",
  errore: "出了点问题",
  erroreStorage: "无法读取存储：请确认 Vercel 项目已连接 Blob 存储（BLOB_READ_WRITE_TOKEN）。",
  mesi: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
};

export const DIZIONARIO: Record<Lingua, typeof it> = { it, zh };
export type Dizionario = typeof it;

export function normalizzaLingua(v: unknown, predefinita: Lingua): Lingua {
  return v === "zh" || v === "zh-CN" ? "zh" : v === "it" ? "it" : predefinita;
}

/** "2026-11" → "novembre 2026" / "2026年11月" */
export function nomeMese(mese: string, lingua: Lingua): string {
  const [a, m] = mese.split("-");
  const i = Number(m) - 1;
  return lingua === "zh" ? `${a}年${i + 1}月` : `${DIZIONARIO.it.mesi[i]} ${a}`;
}

export function formattaData(iso: string, lingua: Lingua): string {
  const [a, m, g] = iso.slice(0, 10).split("-");
  return lingua === "zh" ? `${a}/${m}/${g}` : `${g}/${m}/${a}`;
}

export function euro(n: number, lingua: Lingua): string {
  return new Intl.NumberFormat(lingua === "zh" ? "zh-CN" : "it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
