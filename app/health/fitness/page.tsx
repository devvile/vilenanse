'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Dumbbell, Plus, Flame, Target, TrendingUp, Calendar, LayoutGrid } from 'lucide-react'
import { FitnessWeeklyTimeline } from '@/components/health/fitness-weekly-timeline'
import { FitnessTrainingList } from '@/components/health/fitness-training-list'
import { FitnessTrainingForm } from '@/components/health/fitness-training-form'
import { getTrainings, addTraining, updateTraining, deleteTraining, Training } from '@/lib/fitness'
import { format, startOfWeek, endOfWeek, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'

export default function FitnessPage() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Training | undefined>()

  const fetchData = useCallback(async () => {
    try {
      const start = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const end = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const data = await getTrainings(start, end)
      setTrainings(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const selectedDateTrainings = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return trainings.filter(t => t.training_date === dateStr)
  }, [trainings, selectedDate])

  const weeklyStats = useMemo(() => {
    const totalCalories = trainings.reduce((acc, t) => acc + t.calories, 0)
    const totalSessions = trainings.length
    const avgCalories = totalSessions > 0 ? Math.round(totalCalories / totalSessions) : 0
    return { totalCalories, totalSessions, avgCalories }
  }, [trainings])

  const handleSave = async (data: Partial<Training>) => {
    try {
      if (editingTraining) {
        await updateTraining(editingTraining.id, data)
      } else {
        await addTraining(data as any)
      }
      setIsFormOpen(false)
      setEditingTraining(undefined)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Abort this session record?')) return
    try {
      await deleteTraining(id)
      fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (training: Training) => {
    setEditingTraining(training)
    setIsFormOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto pt-24 pb-20 min-h-screen space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary">
            {format(selectedDate, 'eeee')}
          </h2>
          <h1 className="text-4xl font-black text-white tracking-tighter mt-1">
            Fitness Log
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingTraining(undefined)
              setIsFormOpen(true)
            }}
            className="w-12 h-12 flex items-center justify-center bg-blue-500 rounded-2xl text-white transition-all shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95"
          >
            <Plus className="h-6 w-6 stroke-[3]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content: Timeline and List */}
        <div className="lg:col-span-2 space-y-10">
          <FitnessWeeklyTimeline
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            trainings={trainings}
          />

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <LayoutGrid className="h-3 w-3" />
                Session Details
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                {selectedDateTrainings.length} session{selectedDateTrainings.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-32 bg-white/[0.03] rounded-[2.5rem]" />
                <div className="h-32 bg-white/[0.03] rounded-[2.5rem]" />
              </div>
            ) : (
              <FitnessTrainingList
                trainings={selectedDateTrainings}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        {/* Sidebar: Weekly Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-8 sticky top-32">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Weekly Performance</h3>
            </div>

            <div className="space-y-8">
              {/* Metric 1 */}
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 flex items-center justify-center bg-orange-500/10 rounded-2xl text-orange-500 shrink-0">
                  <Flame className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight tabular-nums">
                    {weeklyStats.totalCalories}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                    Total Calories Burnt
                  </div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-500/10 rounded-2xl text-blue-500 shrink-0">
                  <Dumbbell className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight tabular-nums">
                    {weeklyStats.totalSessions}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                    Completed Sessions
                  </div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 flex items-center justify-center bg-emerald-500/10 rounded-2xl text-emerald-500 shrink-0">
                  <Target className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight tabular-nums">
                    {weeklyStats.avgCalories}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                    Average Per Session
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-medium text-gray-600 leading-relaxed text-center italic">
                "The only bad workout is the one that didn't happen."
              </p>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <FitnessTrainingForm
          training={editingTraining}
          selectedDate={format(selectedDate, 'yyyy-MM-dd')}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingTraining(undefined)
          }}
        />
      )}
    </div>
  )
}
