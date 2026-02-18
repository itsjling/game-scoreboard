import { joyful } from "joyful"
import { BRUTAL_ACCENT_COLORS } from "./constants"

export function generateGameName(): string {
  return joyful() as string
}

export function generateBrutalColor(): string {
  return BRUTAL_ACCENT_COLORS[Math.floor(Math.random() * BRUTAL_ACCENT_COLORS.length)]
}

export function createEntityId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now()}_${random}`
}
