import { loadString, saveString } from "@/utils/storage"

import type { AnalyticsEventName } from "./events"

const DISTINCT_ID_KEY = "analytics.distinct-id"

interface CapturePayload {
  [key: string]: unknown
}

class PosthogClient {
  private apiKey: string | undefined
  private host: string | undefined
  private distinctId = ""
  private initialized = false

  init() {
    if (this.initialized) {
      return
    }

    this.apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY
    this.host = process.env.EXPO_PUBLIC_POSTHOG_HOST

    if (!this.apiKey || !this.host) {
      this.initialized = true
      return
    }

    const savedDistinctId = loadString(DISTINCT_ID_KEY)
    if (savedDistinctId) {
      this.distinctId = savedDistinctId
    } else {
      this.distinctId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      saveString(DISTINCT_ID_KEY, this.distinctId)
    }

    this.initialized = true
  }

  async capture(event: AnalyticsEventName, properties: CapturePayload = {}) {
    if (!this.initialized) {
      this.init()
    }

    if (!this.apiKey || !this.host) {
      return
    }

    try {
      await fetch(`${this.host.replace(/\/$/, "")}/capture/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          event,
          distinct_id: this.distinctId,
          properties: {
            ...properties,
            $lib: "scoreboard-rn-custom",
          },
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {
      // Intentionally swallow analytics failures to keep game interactions resilient.
    }
  }
}

export const analytics = new PosthogClient()
