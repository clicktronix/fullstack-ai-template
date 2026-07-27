import 'server-only'

import { withServerReadErrorHandling } from '@/infrastructure/errors/with-server-read-error-handling'
import { pilotWorkItemsServer } from './server'

export const readPilotWorkItemsForRsc = withServerReadErrorHandling(
  'pilot-work-items.rsc',
  async () => pilotWorkItemsServer.list()
)
