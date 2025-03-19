import TableList from '@/components/table-list'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Supabase Data Explorer</h1>
      <TableList />
    </main>
  )
}