'use client'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_TOKEN) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN, {
        api_host: '/ingest',
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
      })
    }
  }, [])
  
  return <PHProvider client={posthog}>{children}</PHProvider>
}
