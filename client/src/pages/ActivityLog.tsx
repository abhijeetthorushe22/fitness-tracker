import React, { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext"
import type { ActivityEntry } from "../types"
import { quickActivities } from "../assets/assets"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { DumbbellIcon, PlusIcon, Trash2Icon } from "lucide-react"
import api from "../config/api"
import toast from "react-hot-toast"

const ActivityLog = () => {
  const { allActivityLogs, setAllActivityLogs } = useAppContext()
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', duration: 30, calories: 0 })
  const [error, setError] = useState('')
  const today = new Date().toISOString().split('T')[0]

  const loadActivities = () => {
    const todayActivities = allActivityLogs.filter((a: ActivityEntry) => {
      const logDate = a.date || (a.createdAt ? a.createdAt.split('T')[0] : '')
      return logDate === today
    })
    setActivities(todayActivities)
  }

  useEffect(() => {
    loadActivities()
  }, [allActivityLogs])

  const handleQuickAdd = (activity: { name: string; rate: number }) => {
    setFormData({
      name: activity.name,
      duration: 30,
      calories: 30 * activity.rate,
    })
    setShowForm(true)
  }

  const handleDurationChange = (val: string | number) => {
    const duration = Number(val) || 0
    const activity = quickActivities.find(a => a.name === formData.name)
    const calories = activity ? duration * activity.rate : formData.calories
    setFormData(prev => ({ ...prev, duration, calories }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        data: {
          name: formData.name,
          duration: formData.duration,
          calorie: formData.calories
        }
      }
      const { data } = await api.post('/api/activitylogs', payload)
      toast.success("Activity Log Added Successfully")

      const entryData = data.data ? data.data : data;
      const newEntry = {
        ...entryData,
        calories: entryData.calorie
      }

      setAllActivityLogs(prev => [...prev, newEntry])
      setFormData({ name: '', duration: 30, calories: 0 })
      setShowForm(false)
    } catch (error: any) {
      console.log(error)
      setError(error?.response?.data?.error?.message || error?.message || 'Failed to save activity.')
      toast.error("Failed to add activity")
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this activity log?")
      if (!confirm) return;
      
      await api.delete(`/api/activitylogs/${documentId}`)
      toast.success("Activity Log Deleted Successfully")
      setAllActivityLogs(prev => prev.filter(a => a.documentId !== documentId))
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message)
    }
  }

  const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0)
  const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Activity Log</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Track your workouts</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Today</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalMinutes} min</p>
          </div>
        </div>
      </div>

      <div className="page-content-grid">

        {/* LEFT COLUMN — Quick Add or Form */}
        <div className="space-y-4">
          {!showForm ? (
            <>
              {/* Quick Add Card */}
              <Card>
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Quick Add</h3>
                <div className="flex flex-wrap gap-2">
                  {quickActivities.map(activity => (
                    <button
                      key={activity.name}
                      onClick={() => handleQuickAdd(activity)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {activity.emoji} {activity.name}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Add Custom Activity Button */}
              <Button className="w-full" onClick={() => setShowForm(true)}>
                <PlusIcon className="size-5" />
                Add Custom Activity
              </Button>
            </>
          ) : (
            /* Add Activity Form */
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">New Activity</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Activity Name"
                  placeholder="e.g. Running"
                  value={formData.name}
                  onChange={v => setFormData(prev => ({ ...prev, name: v.toString() }))}
                  required
                />
                <div className="flex gap-4">
                  <Input
                    label="Duration (min)"
                    type="number"
                    className="flex-1"
                    placeholder="e.g. 30"
                    min={1}
                    max={300}
                    required
                    value={formData.duration}
                    onChange={handleDurationChange}
                  />
                  <Input
                    label="Calories burned"
                    type="number"
                    className="flex-1"
                    placeholder="e.g. 200"
                    min={1}
                    max={3000}
                    required
                    value={formData.calories}
                    onChange={v => setFormData(prev => ({ ...prev, calories: Number(v) || 0 }))}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1"
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false)
                      setFormData({ name: '', duration: 30, calories: 0 })
                      setError('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Activity
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN — Activity List */}
        {activities.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <DumbbellIcon className="size-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
              No activities logged today
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start moving and track your progress
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Time</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalMinutes} <span className="text-sm font-medium">min</span></p>
              </Card>
              <Card>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Calories Burned</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalCalories} <span className="text-sm font-medium">kcal</span></p>
              </Card>
            </div>

            {/* Activity entries */}
            {activities.map(activity => (
              <Card key={activity.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <DumbbellIcon className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{activity.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{activity.duration} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {activity.calories} kcal
                    </span>
                    <button
                      onClick={() => activity.documentId && handleDelete(activity.documentId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete activity"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default ActivityLog