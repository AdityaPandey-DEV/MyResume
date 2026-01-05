import { revalidatePath } from 'next/cache'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  // 🔥 Clear public ISR cache when admin page is accessed
  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath('/skills')
  revalidatePath('/education')
  revalidatePath('/certifications')

  return <AdminClient />
}