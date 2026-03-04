'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseMealCSV, MealCSVParseResult, ParsedMeal } from '@/lib/utils/csv-parser-health'
import { bulkAddMeals } from '@/lib/calories'
import { FileUp, CheckCircle2, AlertCircle, Eye, EyeOff, UploadCloud, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function MealCSVUpload() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [parsing, setParsing] = useState(false)
    const [importing, setImporting] = useState(false)
    const [parseResult, setParseResult] = useState<MealCSVParseResult | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setParseResult(null)
            setShowPreview(false)
        }
    }

    const handleParse = async () => {
        if (!file) return

        setParsing(true)
        try {
            const result = await parseMealCSV(file)
            setParseResult(result)
            if (result.success) {
                setShowPreview(true)
            }
        } catch (error) {
            console.error('Parse error:', error)
        } finally {
            setParsing(false)
        }
    }

    const handleImport = async () => {
        if (!parseResult?.data) return

        setImporting(true)
        try {
            await bulkAddMeals(parseResult.data)
            router.push('/health/calories?imported=true')
        } catch (error) {
            console.error('Import error:', error)
            alert('Failed to import meals. Please check your data and try again.')
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card className="bg-[#1a1a24] border-white/[0.08] relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <UploadCloud className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Upload Meals CSV</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group/input">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed transition-all duration-300",
                                file
                                    ? "border-emerald-500/50 bg-emerald-500/5"
                                    : "border-white/10 bg-[#0d0d12] hover:border-emerald-500/30"
                            )}>
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    file ? "bg-emerald-500 text-black" : "bg-white/5 text-gray-400"
                                )}>
                                    <FileUp className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className={cn("text-sm font-bold", file ? "text-white" : "text-gray-500")}>
                                        {file ? file.name : "Choose CSV file..."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {file && !parseResult && (
                            <button
                                onClick={handleParse}
                                disabled={parsing}
                                className="btn btn-primary w-full py-4 text-sm font-black"
                            >
                                {parsing ? 'Parsing...' : 'Parse File'}
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {parseResult && (
                <Card className="bg-[#1a1a24] border-white/[0.08] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Review Meals</h2>
                            </div>
                            <div className="text-xs font-black text-white px-3 py-1 rounded-full bg-white/5">
                                {parseResult.data.length} Meals Found
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Calories</p>
                                    <p className="text-2xl font-black text-white">
                                        {parseResult.data.reduce((acc, meal) => acc + meal.calories, 0)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Skipped Rows</p>
                                    <p className="text-2xl font-black text-white">{parseResult.skipped}</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-white/[0.05] bg-[#0d0d12]">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                                            <th className="px-4 py-3 font-black text-gray-500 uppercase">Meal</th>
                                            <th className="px-4 py-3 font-black text-gray-500 uppercase">Calories</th>
                                            <th className="px-4 py-3 font-black text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 font-black text-gray-500 uppercase">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {parseResult.data.slice(0, 10).map((meal, i) => (
                                            <tr key={i} className="hover:bg-white/[0.01]">
                                                <td className="px-4 py-3 font-bold text-white">{meal.name}</td>
                                                <td className="px-4 py-3 font-black">{meal.calories}</td>
                                                <td className="px-4 py-3 text-gray-400">{meal.eaten_at}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {meal.is_munchies && <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase">Munchies</span>}
                                                        {meal.caused_hurt && <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[8px] font-black uppercase">Hurt</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {parseResult.data.length > 10 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-2 text-center text-gray-500 italic">
                                                    And {parseResult.data.length - 10} more...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="btn btn-primary w-full py-4 text-sm font-black"
                            >
                                {importing ? 'Importing...' : `Complete Import (${parseResult.data.length} Meals)`}
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="bg-[#1a1a24]/50 border-white/[0.05] p-8 border-dashed">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-emerald-500/50" />
                    CSV Format Requirements
                </h3>
                <code className="block p-4 rounded-xl bg-black text-[10px] text-emerald-500/80 font-mono mb-4">
                    name,calories,eaten_at,is_munchies,caused_hurt
                </code>
                <ul className="text-xs text-gray-500 space-y-2 list-disc ml-4 font-medium">
                    <li><span className="text-gray-300 font-bold">name:</span> Name of the meal</li>
                    <li><span className="text-gray-300 font-bold">calories:</span> Numeric value (e.g. 300)</li>
                    <li><span className="text-gray-300 font-bold">eaten_at:</span> Date in YYYY-MM-DD format</li>
                    <li><span className="text-gray-300 font-bold">is_munchies:</span> TRUE or FALSE</li>
                    <li><span className="text-gray-300 font-bold">caused_hurt:</span> TRUE or FALSE</li>
                </ul>
            </Card>
        </div>
    )
}
