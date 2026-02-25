import { Moon } from 'lucide-react'

export default function SleepPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Moon className="h-6 w-6 text-purple-500" />
        </div>
        <h1 className="text-2xl font-bold">Sleep Monitor</h1>
      </div>
      <div className="grid gap-6">
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-card/50 backdrop-blur-sm">
          <p className="text-text-secondary">Analyze your sleep quality and patterns. (Coming Soon)</p>
        </div>
      </div>
    </div>
  )
}
