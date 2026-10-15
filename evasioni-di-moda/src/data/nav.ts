// voci di navigazione: `href` = pagina, `id` = sezione della home
export const navItems = [
  { id: 'nuovi-arrivi', label: 'Nuovi arrivi' },
  { id: 'collezioni', label: 'Collezioni' },
  { href: '/collezioni/', label: 'Prenota online' },
  { id: 'negozio', label: 'Il negozio' },
  { id: 'contatti', label: 'Contatti' },
] as const

export type NavItem = (typeof navItems)[number]

export const navKey = (item: NavItem) => ('id' in item ? item.id : item.href)
export const navHref = (item: NavItem, anchor: (id: string) => string) => ('id' in item ? anchor(item.id) : item.href)
