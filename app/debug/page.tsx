
import { runDebug } from '@/lib/debug-script'

export default async function Page() {
  await runDebug()
  return (
    <div>Check server console</div>
  )
}
