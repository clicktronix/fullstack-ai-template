import 'server-only'

import { pilotWorkItemsServer } from './server'

export async function readPilotWorkItemsForRsc() {
  return pilotWorkItemsServer.list()
}
