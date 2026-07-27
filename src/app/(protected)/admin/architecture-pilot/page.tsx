import { createPilotWorkItemAction } from '@/modules/pilot-work-items/actions'
import { readPilotWorkItemsForRsc } from '@/modules/pilot-work-items/rsc'

export default async function ArchitecturePilotPage() {
  const items = await readPilotWorkItemsForRsc()

  return (
    <main>
      <h1>Capability architecture pilot</h1>
      <p>{items.length} work items</p>
      <form action={createPilotWorkItemAction}>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Description
          <input name="description" />
        </label>
        <label>
          Priority
          <input name="priority" type="checkbox" />
        </label>
        <button type="submit">Create</button>
      </form>
    </main>
  )
}
