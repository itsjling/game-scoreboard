import { BRUTAL_ACCENT_COLORS } from "./constants"

const adjectives = [
  "Wild",
  "Clever",
  "Mighty",
  "Lucky",
  "Brave",
  "Swift",
  "Jolly",
  "Fierce",
  "Bright",
  "Calm",
  "Eager",
  "Grand",
  "Noble",
  "Royal",
  "Witty",
]

const animals = [
  "Tiger",
  "Eagle",
  "Dolphin",
  "Fox",
  "Owl",
  "Panda",
  "Wolf",
  "Lion",
  "Hawk",
  "Bear",
  "Rabbit",
  "Deer",
  "Koala",
  "Falcon",
  "Turtle",
]

export function generateGameName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adjective}-${animal}`
}

export function generateBrutalColor(): string {
  return BRUTAL_ACCENT_COLORS[Math.floor(Math.random() * BRUTAL_ACCENT_COLORS.length)]
}

export function createEntityId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now()}_${random}`
}
