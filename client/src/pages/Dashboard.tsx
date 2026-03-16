import { useEffect, useState } from "react"
import { UtensilsCrossedIcon, FlameIcon, ActivityIcon, ZapIcon, TrendingUpIcon, ScaleIcon } from "lucide-react"
import { getMotivationalMessage } from "../assets/assets"
import Card from "../components/ui/Card"
import ProgressBar from "../components/ui/ProgressBar"
import { useAppContext } from "../context/AppContext"
import type { FoodEntry, ActivityEntry } from "../types"
import CaloriesChart from "../components/CaloriesChart"



const Dashboard = () => {
  const { user, allActivityLogs, allFoodLogs } = useAppContext()
  const [todayFood, setTodayFood] = useState<FoodEntry[]>([])
  const [todayActivity, setTodayActivity] = useState<ActivityEntry[]>([])

  const DAILY_CALORIE_LIMIT: number = user?.dailyCalorieIntake || 2000
  const DAILY_BURN_GOAL: number = user?.dailyCalorieBurn || 400

  // load user data
  const loadUserData = () => {
    const today = new Date().toISOString().split('T')[0]
    
    const todayFoodFiltered = allFoodLogs.filter((log) => {
      const logDate = log.date || (log.createdAt ? log.createdAt.split('T')[0] : '')
      return logDate === today
    })
    
    const todayActivityFiltered = allActivityLogs.filter((log) => {
      const logDate = log.date || (log.createdAt ? log.createdAt.split('T')[0] : '')
      return logDate === today
    })
    
    setTodayFood(todayFoodFiltered)
    setTodayActivity(todayActivityFiltered)
  }

  useEffect(() => {
    loadUserData()
  }, [allActivityLogs, allFoodLogs])

  const totalCalories = todayFood.reduce((sum, log) => sum + log.calories, 0)
  const totalBurned = todayActivity.reduce((sum, log) => sum + log.calories, 0)
  const totalActiveMinutes = todayActivity.reduce((sum, log) => sum + log.duration, 0)
  const caloriesRemaining = DAILY_CALORIE_LIMIT - totalCalories

  const motivation = getMotivationalMessage(totalCalories, totalActiveMinutes, DAILY_CALORIE_LIMIT)

  return (
    <div className="page-container">
      {/* header */}
      <div className="dashboard-header">
        <p className="text-emerald-100 text-sm font-medium">Welcome back</p>
        <h1>{`Hi there! 👋 ${user?.username}`}</h1>

        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{motivation.emoji}</span>
            <p className="text-white font-medium">{motivation.text}</p>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="dashboard-grid">

        {/* Calorie Card */}
        <Card className="shadow-lg col-span-2">

          {/* Calories Consumed Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <UtensilsCrossedIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Calories Consumed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalCalories}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Limit</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{DAILY_CALORIE_LIMIT}</p>
            </div>
          </div>

          <ProgressBar value={totalCalories} max={DAILY_CALORIE_LIMIT} />

          <div className="mt-4 flex justify-between items-center">
            <div
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                caloriesRemaining >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              {caloriesRemaining >= 0
                ? `${caloriesRemaining} kcal remaining`
                : `${Math.abs(caloriesRemaining)} kcal over`}
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {Math.round((totalCalories / DAILY_CALORIE_LIMIT) * 100)}%
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

          {/* Calories Burned Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <FlameIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Calories Burned</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalBurned}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{DAILY_BURN_GOAL}</p>
            </div>
          </div>

          <ProgressBar value={totalBurned} max={DAILY_BURN_GOAL} />

        </Card>

        {/* Active Minutes Card */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <ActivityIcon className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Minutes</p>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{totalActiveMinutes}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">minutes today</p>
        </Card>

        {/* Goal Card */}
        {user && (
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUpIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Your Goal</p>
                <p className="text-white font-semibold capitalize">
                  {user.goal === 'lose' ? 'Lose Weight' : user.goal === 'gain' ? 'Gain Weight' : 'Maintain Weight'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Workouts Card */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <ZapIcon className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Workouts</p>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{todayActivity.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">activities logged</p>
        </Card>

        {/* Body Metrics Card */}
        {user && user.weight && (
          <Card className="shadow-lg col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <ScaleIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Body Metrics</h3>
                <p className="text-slate-500 text-sm">Your stats</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Height</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{user.height} <span className="text-sm font-normal">cm</span></p>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Weight</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{user.weight} <span className="text-sm font-normal">kg</span></p>
              </div>
            </div>

            {/* BMI with color-coded status */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">BMI</span>
              {(() => {
                const bmi = (user.weight / Math.pow((user.height ?? 170) / 100, 2)).toFixed(1)
                const getStatus = (b: number) => {
                  if (b < 18.5) return { color: 'text-blue-500', bg: 'bg-blue-500', label: 'Underweight' }
                  if (b < 25)   return { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Normal' }
                  if (b < 30)   return { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Overweight' }
                  return         { color: 'text-red-500', bg: 'bg-red-500', label: 'Obese' }
                }
                const status = getStatus(parseFloat(bmi))
                return (
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${status.color}`}>{bmi}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs text-white ${status.bg}`}>{status.label}</span>
                  </div>
                )
              })()}
            </div>

            {/* BMI Scale Visual */}
            <div className="mt-2">
              <div className="h-2 w-full rounded-full overflow-hidden flex">
                <div className="flex-1 bg-blue-400 opacity-70"></div>
                <div className="flex-1 bg-emerald-400 opacity-70"></div>
                <div className="flex-1 bg-yellow-400 opacity-70"></div>
                <div className="flex-1 bg-red-400 opacity-70"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
              </div>
            </div>

          </Card>
        )}

        {/* quick summary */}
        <Card>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Meals Logged</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{todayFood.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Total Calories</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{totalCalories} kcal</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-slate-400">Active Time</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{totalActiveMinutes} mins</span>
            </div>
          </div>
        </Card>

        {/* Activity & Intake Graph */}
        <Card className="col-span-2">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">This Week Progress</h3>
          <CaloriesChart />
        </Card>

      </div>
    </div>
  )
}

export default Dashboard