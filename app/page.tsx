import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/reserve?spot=table-1')
}
