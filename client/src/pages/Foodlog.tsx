import React, { useEffect, useRef, useState } from "react"
import { useAppContext } from "../context/AppContext"
import type { FoodEntry } from "../types"
import Card from "../components/ui/Card"
import { quickActivitiesFoodLog } from "../assets/assets"
import Button from "../components/ui/Button"
import { Loader2Icon, PlusIcon, SparkleIcon, UtensilsCrossedIcon, CoffeeIcon, SunIcon, MoonIcon, CookingPotIcon, Trash2Icon } from "lucide-react"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import api from "../config/api"
import toast from "react-hot-toast"

// Meal type icon & color lookup tables
const mealIcon: Record<string, React.ElementType> = {
  breakfast: CoffeeIcon,
  lunch: SunIcon,
  dinner: MoonIcon,
  snack: CookingPotIcon,
}

const mealColors: Record<string, string> = {
  breakfast: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  lunch: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  dinner: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  snack: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
}

const Foodlog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext()

  const [entries, setEntries] = useState<FoodEntry[]>(allFoodLogs)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    calories: 0,
    mealType: ''
  })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0]

  const loadEntries = () => {
    const todayEntries = allFoodLogs.filter((e: FoodEntry) => e.createdAt?.split('T')[0] === today)
    setEntries(todayEntries)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!formData.name.trim()||!formData.calories||formData.calories <=0||!formData.mealType){
      return toast.error("Please Enter Valid Data")
    }
    try {
      const payload = {
        data: {
          name: formData.name,
          calorie: formData.calories,
          mealtype: formData.mealType.toLowerCase()
        }
      }
      const { data } = await api.post('/api/food-logs', payload)
      toast.success("Food Log Added Successfully")

      // Map back to frontend structure
      const entryData = data.data ? data.data : data;
      const attrs = entryData.attributes || entryData;
      const newEntry = {
        ...attrs,
        id: entryData.id,
        documentId: entryData.documentId,
        calories: attrs.calorie,
        mealType: attrs.mealtype
      }

      setAllFoodLogs(prev => [...prev, newEntry])
      setFormData({ name: '', calories: 0, mealType: '' })
      setShowForm(false)
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message)
    }
  }

  const handleDelete = async (documentId: string) => {
    try{
      const confirm = window.confirm("Are you sure you want to delete this food log?")
      if(!confirm){
        return
      }
      await api.delete(`/api/food-logs/${documentId}`)
      toast.success("Food Log Deleted Successfully")
      setAllFoodLogs(prev => prev.filter(e => e.documentId !== documentId))
    }catch(error:any){
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message)
    }
    
  }

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0)

  // Group entries by meal type (lowercase key)
  const groupedEntries = entries.reduce<Record<string, FoodEntry[]>>((acc, entry) => {
    const key = (entry.mealType || (entry as any).mealtype || 'snack').toLowerCase()
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  const handleQuickAdd = (activityName: string) => {
    setFormData({ ...formData, mealType: activityName })
    setShowForm(true)
  }
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    setLoading(true)
    const imageFormData = new FormData()
    imageFormData.append('image', file)
    try {
      const { data } = await api.post('/api/image-analysis/analyze', imageFormData)
      const result = data.result;
      let mealType = '';
      const hour = new Date().getHours();
      if (hour >= 7 && hour < 12) {
        mealType = 'breakfast'
      } else if (hour >= 12 && hour < 18) {
        mealType = 'lunch'
      } else if (hour >= 18 && hour < 22) {
        mealType = 'dinner'
      } else {
        mealType = 'snack'
      }
      
      if (!result.foodName || !result.calories) {
        return toast.error("Could not extract food data from image")
      }
      
      const payload = {
        data: {
          name: result.foodName,
          calorie: result.calories,
          mealtype: mealType
        }
      }
      
      const { data: newEntry } = await api.post('/api/food-logs', payload)
      toast.success("Food Log Added Successfully")
      
      const entryData = newEntry.data ? newEntry.data : newEntry;
      const attrs = entryData.attributes || entryData;
      const mappedEntry = {
        ...attrs,
        id: entryData.id,
        documentId: entryData.documentId,
        calories: attrs.calorie,
        mealType: attrs.mealtype
      }

      setAllFoodLogs(prev => [...prev, mappedEntry])
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message)
    } finally {
      setLoading(false)
      setShowForm(false)
    }
  }
  const handleAIFoodSnap = () => {
    inputRef.current?.click()
  }

  useEffect(() => {
    loadEntries();
  }, [allFoodLogs])

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Food Log</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Track your daily food intake</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Today's Total</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalCalories} kcal</p>
          </div>
        </div>
      </div>
      <div className="page-content-grid">
        {/* Quick Add Section */}
        {!showForm && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Quick Add</h3>
              <div className="flex flex-wrap gap-2">
                {quickActivitiesFoodLog.map((activity) => (
                  <button onClick={() => handleQuickAdd(activity.name)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    key={activity.name}>
                    {activity.emoji}{activity.name}
                  </button>
                ))}
              </div>
            </Card>
            <Button className='w-full' onClick={() => setShowForm(true)}>
              <PlusIcon className='size-5'/>
              Add Food Entry
            </Button>
            <Button className='w-full' onClick={handleAIFoodSnap}>
              <SparkleIcon className='size-5'/>
              AI Food Snap
            </Button>
            <input onChange={handleImageChange} type="file" accept="image/*" hidden ref={inputRef} />
            {loading && (
              <div className="fixed inset-0 bg-slate-100/5 dark:bg-slate-900/50 backdrop-blur flex items-center justify-center z-100">
                <Loader2Icon className="size-8 text-emerald-600 dark:text-emerald-400 animate-spin"/>
              </div>
            )}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Add Food Entry</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input label="Food Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v.toString()})}
                placeholder="e.g. Chicken Breast"
              />
              <Input label="Calories" value={formData.calories} onChange={(v) => setFormData({...formData, calories: Number(v)})}
                placeholder="e.g. 300"
                type="number"
              />
              <Select label="Meal Type" value={formData.mealType} onChange={(v) => setFormData({...formData, mealType: v.toString()})}
                placeholder="Select Meal Type"
                options={[
                  {value: 'breakfast', label: 'Breakfast'},
                  {value: 'lunch', label: 'Lunch'},
                  {value: 'dinner', label: 'Dinner'},
                  {value: 'snack', label: 'Snack'},
                ]}
              />
              <div className="flex gap-3 pt-2">
                <Button className='flex-1' type="button" variant="secondary" onClick={() => { setShowForm(false); setFormData({ name: '', calories: 0, mealType: '' }) }}>Cancel</Button>
                <Button type="submit" className="flex-1">Add Entry</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossedIcon className="size-8 text-slate-300 dark:text-slate-600"/>
            </div>
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold mb-2">No Food Logged Yet</h3>
            <p className="text-slate-500 dark:text-slate-400">Start tracking your meals to stay on target</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((mealKey) => {
              if (!groupedEntries[mealKey]) return null

              const MealIcon = mealIcon[mealKey]
              const mealCalories = groupedEntries[mealKey].reduce((sum, e) => sum + e.calories, 0)

              return (
                <Card key={mealKey}>
                  <div className="flex items-center justify-between mb-4">
                    <div className='flex items-center gap-3'>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mealColors[mealKey]}`}>
                        <MealIcon className='size-5'/>
                      </div>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{mealKey}</h4>
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{mealCalories} kcal</span>
                  </div>
                  <div className="space-y-2">
                    {groupedEntries[mealKey].map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{entry.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{entry.calories} kcal</span>
                          <button
                            onClick={() => entry.documentId && handleDelete(entry.documentId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2Icon className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default Foodlog