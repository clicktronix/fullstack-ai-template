import { redirect } from 'next/navigation'
import { connection } from 'next/server'

export default async function AdminIndexPage() {
  await connection()
  redirect('/admin/work-items')
}
