import { createContext, useContext } from 'react'
import type { ImageAsset } from '../data/images'

/** Contenuto mostrato nel pannello di approfondimento (look, collezione, ispirazione). */
export type InquiryContent = {
  kicker: string
  title: string
  image: ImageAsset
  paragraphs: string[]
  tips?: string[]
  /** argomento usato per il messaggio WhatsApp precompilato */
  topic: string
  price?: string
}

export const InquiryContext = createContext<(content: InquiryContent) => void>(() => {})

export const useInquiry = () => useContext(InquiryContext)
