import type { Metadata } from 'next'
import { LandingView } from './_internal/ui/LandingView'

export const metadata: Metadata = {
  title: 'Fullstack AI Template',
  description: 'Opinionated starter for AI products and full-stack B2B applications',
}

export default function HomePage() {
  return <LandingView />
}
