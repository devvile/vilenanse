'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  X,
  Activity,
  Zap,
  Frown,
  Utensils,
  Save,
  FileUp
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  getWeek,
  isWithinInterval
} from 'date-fns'
import {
  getMealsForDay,
  getMealsForWeek,
  addMeal,
  updateMeal,
  deleteMeal,
  getCalorieLimit,
  updateCalorieLimit
} from '@/lib/calories'
import { getTrainings, Training } from '@/lib/fitness'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceLine
} from 'recharts'

// --- Types ---
interface Meal {
  id: string
  name: string
  calories: number
  eaten_at: string
  caused_hurt: boolean
  is_munchies: boolean
  created_at: string
}

// --- Components ---

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-48 bg-white/[0.05] rounded-2xl" />
    <div className="h-64 bg-white/[0.05] rounded-2xl" />
    <div className="h-96 bg-white/[0.05] rounded-2xl" />
  </div>
)

export default function CaloriesPage() {
  const [loading, setLoading] = useState(true)
  const [calorieLimit, setCalorieLimit] = useState(2000)
  const [isEditingLimit, setIsEditingLimit] = useState(false)
  const [limitInput, setLimitInput] = useState('2000')

  // Day View State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dayType, setDayType] = useState<'today' | 'yesterday' | 'picker'>('today')
  const [meals, setMeals] = useState<Meal[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Form State
  const [mealName, setMealName] = useState('')
  const [mealCalories, setMealCalories] = useState('')
  const [causedHurt, setCausedHurt] = useState(false)
  const [isMunchies, setIsMunchies] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit Drawer State
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Deleting State
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Week View State
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [weekType, setWeekType] = useState<'this' | 'last' | 'picker'>('this')
  const [weekMeals, setWeekMeals] = useState<Meal[]>([])
  const [weekTrainings, setWeekTrainings] = useState<Training[]>([])
  const [showWeekPicker, setShowWeekPicker] = useState(false)

  // Month View State
  const [monthDate, setMonthDate] = useState(new Date())
  const [monthMeals, setMonthMeals] = useState<Meal[]>([])
  const [monthTrainings, setMonthTrainings] = useState<Training[]>([])

  // --- Data Fetching ---

  const fetchDayData = useCallback(async (date: Date) => {
    try {
      const data = await getMealsForDay(format(date, 'yyyy-MM-dd'))
      setMeals(data as any)
    } catch (error) {
      console.error('Failed to fetch day meals', error)
    }
  }, [])

  const fetchWeekData = useCallback(async (start: Date) => {
    try {
      const end = endOfWeek(start, { weekStartsOn: 1 })
      const startDateStr = format(start, 'yyyy-MM-dd')
      const endDateStr = format(end, 'yyyy-MM-dd')

      const [mealData, trainingData] = await Promise.all([
        getMealsForWeek(startDateStr, endDateStr),
        getTrainings(startDateStr, endDateStr)
      ])

      setWeekMeals(mealData as any)
      setWeekTrainings(trainingData)
    } catch (error) {
      console.error('Failed to fetch week data', error)
    }
  }, [])

  const fetchMonthData = useCallback(async (date: Date) => {
    try {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      const rangeStart = startOfWeek(monthStart, { weekStartsOn: 1 })
      const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
      const rangeStartStr = format(rangeStart, 'yyyy-MM-dd')
      const rangeEndStr = format(rangeEnd, 'yyyy-MM-dd')

      const [mealData, trainingData] = await Promise.all([
        getMealsForWeek(rangeStartStr, rangeEndStr),
        getTrainings(rangeStartStr, rangeEndStr)
      ])

      setMonthMeals(mealData as any)
      setMonthTrainings(trainingData)
    } catch (error) {
      console.error('Failed to fetch month data', error)
    }
  }, [])

  const fetchLimit = useCallback(async () => {
    try {
      const limit = await getCalorieLimit()
      setCalorieLimit(limit)
      setLimitInput(limit.toString())
    } catch (error) {
      console.error('Failed to fetch limit', error)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([
        fetchLimit(),
        fetchDayData(selectedDate),
        fetchWeekData(weekStart),
        fetchMonthData(monthDate)
      ])
      setLoading(false)
    }
    init()
  }, [])

  // --- Handlers ---

  const handleDayTypeChange = (type: 'today' | 'yesterday' | 'picker') => {
    setDayType(type)
    let newDate = new Date()
    if (type === 'today') {
      newDate = new Date()
      setShowDatePicker(false)
    } else if (type === 'yesterday') {
      newDate = subDays(new Date(), 1)
      setShowDatePicker(false)
    } else {
      setShowDatePicker(true)
      return
    }
    setSelectedDate(newDate)
    fetchDayData(newDate)
  }

  const handleWeekTypeChange = (type: 'this' | 'last' | 'picker') => {
    setWeekType(type)
    let newStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    if (type === 'this') {
      newStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      setShowWeekPicker(false)
    } else if (type === 'last') {
      newStart = subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7)
      setShowWeekPicker(false)
    } else {
      setShowWeekPicker(true)
      return
    }
    setWeekStart(newStart)
    fetchWeekData(newStart)
  }

  const handleWeekSelect = (start: Date) => {
    setWeekType('picker')
    setShowWeekPicker(true)
    setWeekStart(start)
    fetchWeekData(start)

    // Smooth scroll to week view
    const weekView = document.getElementById('week-view')
    if (weekView) {
      weekView.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handlePrevMonth = () => {
    const newDate = subDays(startOfMonth(monthDate), 1)
    setMonthDate(startOfMonth(newDate))
    fetchMonthData(startOfMonth(newDate))
  }

  const handleNextMonth = () => {
    const newDate = addDays(endOfMonth(monthDate), 1)
    setMonthDate(startOfMonth(newDate))
    fetchMonthData(startOfMonth(newDate))
  }

  const handleLimitUpdate = async () => {
    const newLimit = parseInt(limitInput)
    if (isNaN(newLimit) || newLimit <= 0) return

    // Optimistic update
    const oldLimit = calorieLimit
    setCalorieLimit(newLimit)
    setIsEditingLimit(false)

    try {
      await updateCalorieLimit(newLimit)
    } catch (error) {
      setCalorieLimit(oldLimit)
      setLimitInput(oldLimit.toString())
      console.error('Failed to update limit', error)
    }
  }

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mealName || !mealCalories || isSubmitting) return

    setIsSubmitting(true)
    const calories = parseInt(mealCalories)

    const newMeal = {
      name: mealName,
      calories,
      eaten_at: format(selectedDate, 'yyyy-MM-dd'),
      caused_hurt: causedHurt,
      is_munchies: isMunchies,
    }

    try {
      await addMeal(newMeal)
      // Reset form
      setMealName('')
      setMealCalories('')
      setCausedHurt(false)
      setIsMunchies(false)
      // Refresh all data to sync
      await Promise.all([
        fetchDayData(selectedDate),
        fetchWeekData(weekStart),
        fetchMonthData(monthDate)
      ])
    } catch (error) {
      console.error('Failed to add meal', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMeal(id)
      setDeletingId(null)
      await Promise.all([
        fetchDayData(selectedDate),
        fetchWeekData(weekStart),
        fetchMonthData(monthDate)
      ])
    } catch (error) {
      console.error('Failed to delete meal', error)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMeal || isSubmitting) return

    setIsSubmitting(true)
    try {
      await updateMeal(editingMeal.id, {
        name: editingMeal.name,
        calories: editingMeal.calories,
        caused_hurt: editingMeal.caused_hurt,
        is_munchies: editingMeal.is_munchies,
      })
      setIsDrawerOpen(false)
      setEditingMeal(null)
      await Promise.all([
        fetchDayData(selectedDate),
        fetchWeekData(weekStart),
        fetchMonthData(monthDate)
      ])
    } catch (error) {
      console.error('Failed to update meal', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Calculations ---

  const consumedToday = meals.reduce((sum, m) => sum + m.calories, 0)
  const remainingToday = calorieLimit - consumedToday
  const progressPercent = Math.min((consumedToday / calorieLimit) * 100, 100)

  const getProgressColor = (percent: number) => {
    if (consumedToday > calorieLimit) return 'bg-red-500'
    if (percent >= 85) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  // Chart Data Preparation
  const daysInWeek = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 })
  })

  const weekChartData = daysInWeek.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayMeals = weekMeals.filter(m => m.eaten_at === dayStr)
    const dayTrainings = weekTrainings.filter(t => t.training_date === dayStr)

    const eatenTotal = dayMeals.reduce((sum, m) => sum + m.calories, 0)
    const burntTotal = dayTrainings.reduce((sum, t) => sum + t.calories, 0)
    const netTotal = eatenTotal - burntTotal

    return {
      name: format(day, 'EEE'),
      total: netTotal, // This is what the line chart follows
      rawEaten: eatenTotal > 0 && burntTotal > 0 ? eatenTotal : null, // Only show if we HAVE both
      munchies: dayMeals.filter(m => m.is_munchies).reduce((sum, m) => sum + m.calories, 0),
      hasTraining: burntTotal > 0,
      burnt: burntTotal
    }
  })

  // Month View Data Preparation
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)

  // Group meals into weeks
  const weekRows = []
  let current = monthStart
  while (current <= monthEnd) {
    const ws = startOfWeek(current, { weekStartsOn: 1 })
    const we = endOfWeek(current, { weekStartsOn: 1 })

    const wMeals = monthMeals.filter(m => {
      const d = new Date(m.eaten_at)
      return d >= ws && d <= we
    })

    const wTrainings = monthTrainings.filter(t => {
      const d = new Date(t.training_date)
      return d >= ws && d <= we
    })

    // Days with entries
    const daysWithEntries = new Set(wMeals.map(m => m.eaten_at)).size
    const eatenTotal = wMeals.reduce((sum, m) => sum + m.calories, 0)
    const burntTotal = wTrainings.reduce((sum, t) => sum + t.calories, 0)
    const netTotal = eatenTotal - burntTotal
    const avg = daysWithEntries > 0 ? Math.round(netTotal / daysWithEntries) : 0

    weekRows.push({
      start: ws,
      end: we,
      total: netTotal,
      avg
    })

    current = addDays(we, 1)
  }

  const maxWeeklyCalories = Math.max(...weekRows.map(w => w.total), 1)

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pt-20">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pt-24 pb-20 space-y-8 min-h-screen">

      {/* SECTION 1: DAY VIEW */}
      <Card className="bg-card border-white/[0.08] overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Utensils className="h-5 w-5 text-emerald-500" />
              Day View
            </h2>

            <div className="flex flex-wrap bg-background rounded-2xl sm:rounded-full p-1 border border-white/[0.05]">
              {(['today', 'yesterday', 'picker'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleDayTypeChange(type)}
                  className={cn(
                    "flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-[10px] font-bold rounded-xl sm:rounded-full transition-all uppercase tracking-tight",
                    dayType === type
                      ? "bg-emerald-500 text-black"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {type === 'picker' ? 'Pick a day' : type}
                </button>
              ))}
            </div>
          </div>

          {showDatePicker && (
            <div className="p-4 bg-background/50 rounded-2xl border border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const d = subDays(selectedDate, 1)
                    setSelectedDate(d)
                    fetchDayData(d)
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="relative group/date">
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value)
                      if (!isNaN(newDate.getTime())) {
                        setSelectedDate(newDate)
                        fetchDayData(newDate)
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full"
                    title="Select date"
                  />
                  <div className="flex items-center gap-2 font-medium group-hover/date:text-emerald-400 transition-colors cursor-pointer">
                    <CalendarIcon className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm sm:text-base">{format(selectedDate, 'PPPP')}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const d = addDays(selectedDate, 1)
                    setSelectedDate(d)
                    fetchDayData(d)
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>Daily limit:</span>
            {isEditingLimit ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="number"
                  value={limitInput}
                  onChange={e => setLimitInput(e.target.value)}
                  onBlur={handleLimitUpdate}
                  onKeyDown={e => e.key === 'Enter' && handleLimitUpdate()}
                  className="w-20 bg-background border border-white/[0.1] rounded px-2 py-0.5 text-white outline-none focus:border-emerald-500"
                />
                <span className="text-xs">kcal</span>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingLimit(true)}
                className="flex items-center gap-1.5 text-white font-medium hover:text-emerald-400 transition-colors"
              >
                {calorieLimit} kcal
                <Edit2 className="h-3 w-3 opacity-50" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", getProgressColor(progressPercent))}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs sm:text-sm font-medium">
              <span className="text-text-secondary">
                <span className="text-white">{consumedToday}</span> kcal consumed
              </span>
              {remainingToday >= 0 ? (
                <span className="text-emerald-400">{remainingToday} kcal remaining</span>
              ) : (
                <span className="text-red-500">{Math.abs(remainingToday)} kcal over limit</span>
              )}
            </div>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddMeal} className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                placeholder="Meal name"
                value={mealName}
                onChange={e => setMealName(e.target.value)}
                className="bg-background/50 border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
              <input
                type="number"
                placeholder="Calories"
                value={mealCalories}
                onChange={e => setMealCalories(e.target.value)}
                className="bg-background/50 border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCausedHurt(!causedHurt)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    causedHurt ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/[0.05] border-transparent text-text-secondary hover:bg-white/[0.08]"
                  )}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Caused hurt
                </button>
                <button
                  type="button"
                  onClick={() => setIsMunchies(!isMunchies)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    isMunchies ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/[0.05] border-transparent text-text-secondary hover:bg-white/[0.08]"
                  )}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Munchies
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1">
                  {/* <Link
                  href="/health/calories/import"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] text-text-secondary hover:text-white font-bold rounded-xl transition-all border border-transparent hover:border-white/[0.1]"
                >
                  <FileUp className="h-3.5 w-3.5" />
                  Import CSV
                </Link> */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !mealName || !mealCalories}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex-1"
                  >
                    {isSubmitting ? 'Adding Protocol...' : 'Record Meal'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Meal List */}
          <div className="space-y-3">
            {meals.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-sm">
                No meals recorded for this day.
              </div>
            ) : (
              meals.map((meal) => (
                <div
                  key={meal.id}
                  className="group p-2.5 sm:p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl sm:rounded-2xl border border-white/[0.05] transition-all flex items-center justify-between gap-2 sm:gap-4"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-white truncate text-xs sm:text-base">{meal.name}</span>
                    {meal.caused_hurt && <Activity className="h-3 w-3 text-red-500 shrink-0" />}
                    {meal.is_munchies && <Zap className="h-3 w-3 text-amber-500 shrink-0" />}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span className="text-emerald-400 font-bold whitespace-nowrap text-xs sm:text-base">
                      {meal.calories} <span className="text-[10px] opacity-70">kcal</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {deletingId === meal.id ? (
                        <div className="flex items-center gap-1 bg-red-500/10 rounded-lg p-1 animate-in slide-in-from-right-2">
                          <button
                            onClick={() => handleDelete(meal.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="bg-white/10 hover:bg-white/20 text-white p-1 rounded-md transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingMeal({ ...meal })
                              setIsDrawerOpen(true)
                            }}
                            className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(meal.id)}
                            className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 2: WEEK VIEW */}
      <Card id="week-view" className="bg-card border-white/[0.08] scroll-mt-24 transition-all duration-500">
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ChevronRight className="h-5 w-5 text-emerald-500" />
                Week View
              </h2>
              {weekMeals.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-text-secondary ml-7">
                  <span>
                    Total: <span className="text-white font-bold">{weekMeals.reduce((sum, m) => sum + m.calories, 0)}</span> kcal
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span>
                    Avg: <span className="text-emerald-400 font-bold">
                      {Math.round(weekMeals.reduce((sum, m) => sum + m.calories, 0) / (new Set(weekMeals.map(m => m.eaten_at)).size || 1))}
                    </span> kcal/day
                  </span>
                </div>
              )}
            </div>

            <div className="flex bg-background rounded-full p-1 border border-white/[0.05]">
              {(['this', 'last', 'picker'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleWeekTypeChange(type)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all uppercase tracking-tight",
                    weekType === type
                      ? "bg-emerald-500 text-black"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {type === 'picker' ? 'Pick a week' : (type === 'this' ? 'This week' : 'Last week')}
                </button>
              ))}
            </div>
          </div>

          {showWeekPicker && (
            <div className="p-4 bg-background/50 rounded-2xl border border-white/[0.05] flex items-center justify-between">
              <button
                onClick={() => {
                  const d = subDays(weekStart, 7)
                  setWeekStart(d)
                  fetchWeekData(d)
                }}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="text-xs text-text-secondary uppercase tracking-widest font-bold mb-1">Week of</div>
                <div className="font-medium">
                  {format(weekStart, 'MMM d')} – {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
                </div>
              </div>
              <button
                onClick={() => {
                  const d = addDays(weekStart, 7)
                  setWeekStart(d)
                  fetchWeekData(d)
                }}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  hide={true}
                  domain={[0, 'dataMax + 500']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #ffffff10',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Net Calories"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0d0d12' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                >
                  <LabelList
                    dataKey="total"
                    position="top"
                    offset={10}
                    style={{ fill: '#10b981', fontSize: 10, fontWeight: 'bold' }}
                    formatter={(val: any) => val > 0 ? val : ''}
                  />
                </Line>
                <Line
                  type="monotone"
                  dataKey="rawEaten"
                  name="Total Intake"
                  stroke="#4b5563"
                  strokeWidth={0}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#4b5563', strokeWidth: 1, stroke: '#0d0d12' }}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  animationDuration={1500}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="munchies"
                  name="Munchies"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1, stroke: '#0d0d12', opacity: 0.6 }}
                  animationDuration={1500}
                />
                <ReferenceLine
                  y={calorieLimit}
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    position: 'right',
                    value: 'Limit',
                    fill: '#38bdf8',
                    fontSize: 10,
                    fontWeight: 'bold'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* SECTION 3: MONTH VIEW */}
      <Card className="bg-card border-white/[0.08]">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-500" />
              {format(monthDate, 'MMMM yyyy')}
            </h2>

            <div className="flex items-center gap-2 bg-background/50 rounded-xl p-1 border border-white/[0.05]">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-white"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  setMonthDate(startOfMonth(today))
                  fetchMonthData(startOfMonth(today))
                }}
                className="px-3 py-1 text-[10px] font-bold uppercase tracking-tight hover:text-emerald-400 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-white"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            {weekRows.map((row, i) => {
              const rowProgress = (row.total / maxWeeklyCalories) * 100
              const isSelected = isSameDay(row.start, weekStart)

              return (
                <button
                  key={i}
                  onClick={() => handleWeekSelect(row.start)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all duration-300 group",
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                      : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] active:scale-[0.99]"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isSelected ? "text-emerald-400" : "text-gray-500"
                          )}>
                            Week {getWeek(row.start)}
                          </p>
                          {isSelected && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[8px] font-black uppercase tracking-tighter">
                              <Check className="h-2 w-2" /> Selected
                            </div>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {format(row.start, 'MMM d')} – {format(row.end, 'MMM d')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-white">{row.total} <span className="text-[10px] opacity-50 uppercase">kcal</span></p>
                        {row.avg > 0 && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">avg {row.avg} / day</p>}
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000 ease-out",
                          isSelected ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" : "bg-emerald-500/60"
                        )}
                        style={{ width: `${rowProgress}%` }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Edit Drawer (Sheet) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md animate-in slide-in-from-right duration-300">
              <div className="h-full flex flex-col bg-[#0d0d12] border-l border-white/[0.08] shadow-2xl">
                <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                  <h2 className="text-xl font-bold">Edit Meal</h2>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="flex-1 p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary ml-1">Meal name</label>
                      <input
                        value={editingMeal?.name || ''}
                        onChange={e => setEditingMeal(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary ml-1">Calories (kcal)</label>
                      <input
                        type="number"
                        value={editingMeal?.calories || ''}
                        onChange={e => setEditingMeal(prev => prev ? { ...prev, calories: parseInt(e.target.value) || 0 } : null)}
                        className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="pt-4 space-y-4">
                      <button
                        type="button"
                        onClick={() => setEditingMeal(prev => prev ? { ...prev, caused_hurt: !prev.caused_hurt } : null)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all",
                          editingMeal?.caused_hurt ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/[0.02] border-white/[0.08] text-text-secondary hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5" />
                          <span className="font-semibold">Caused hurt</span>
                        </div>
                        {editingMeal?.caused_hurt && <Check className="h-5 w-5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingMeal(prev => prev ? { ...prev, is_munchies: !prev.is_munchies } : null)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all",
                          editingMeal?.is_munchies ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/[0.02] border-white/[0.08] text-text-secondary hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5" />
                          <span className="font-semibold">Munchies</span>
                        </div>
                        {editingMeal?.is_munchies && <Check className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-10 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 px-6 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !editingMeal?.name}
                      className="flex-1 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <Save className="h-5 w-5" />
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
