import { Dumbbell } from 'lucide-react'

export default function FitnessPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Dumbbell className="h-6 w-6 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold">Fitness Log</h1>
      </div>
      <div className="grid gap-6">
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-card/50 backdrop-blur-sm">
          <p className="text-text-secondary">Keep track of your workouts and progress. (Coming Soon)</p>
        </div>
      </div>
    </div>
  )
}
