import React, { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext"
import { goalLabels, goalOptions } from "../assets/assets"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import { Calendar, Scale, UserIcon, RulerIcon, Target, LogOutIcon } from "lucide-react"
import api from "../config/api"
import toast from "react-hot-toast"

const Profile = () => {
  const { user, setUser, logout, allFoodLogs, allActivityLogs } = useAppContext()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    age: 0,
    weight: 0,
    height: 0,
    goal: 'maintain',
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        age: user.age || 0,
        weight: user.weight || 0,
        height: user.height || 0,
        goal: user.goal || 'maintain',
        dailyCalorieIntake: user.dailyCalorieIntake || 2000,
        dailyCalorieBurn: user.dailyCalorieBurn || 400,
      })
    }
  }, [user])

  if (!user) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/api/users/${user.id}`, formData)
      setUser({ ...user, ...data })
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error?.message || error?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : 'N/A'

  // Stats
  const today = new Date().toISOString().split('T')[0]
  const todayFood = allFoodLogs.filter(f => {
    const logDate = f.date || (f.createdAt ? f.createdAt.split('T')[0] : '')
    return logDate === today
  }).length
  const todayActivities = allActivityLogs.filter(a => {
    const logDate = a.date || (a.createdAt ? a.createdAt.split('T')[0] : '')
    return logDate === today
  }).length

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your settings</p>
        </div>
      </div>

      <div className="page-content-grid">

        {/* LEFT COLUMN — Profile Card */}
        <Card>
          {/* Avatar + title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
              <UserIcon className="size-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white text-lg">Your Profile</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Member since {memberSince}</p>
            </div>
          </div>

          {isEditing ? (
            /* ── Edit form ── */
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input label="Age" type="number" className="flex-1" placeholder="e.g. 25"
                  min={1} max={100} required value={formData.age}
                  onChange={v => setFormData(p => ({ ...p, age: Number(v) || 0 }))} />
                <Input label="Weight (kg)" type="number" className="flex-1" placeholder="e.g. 70"
                  min={1} max={300} required value={formData.weight}
                  onChange={v => setFormData(p => ({ ...p, weight: Number(v) || 0 }))} />
                <Input label="Height (cm)" type="number" className="flex-1" placeholder="e.g. 175"
                  min={1} max={250} required value={formData.height}
                  onChange={v => setFormData(p => ({ ...p, height: Number(v) || 0 }))} />
              </div>
              <div className="flex gap-4">
                <Select label="Goal" className="flex-1" value={formData.goal}
                  onChange={v => setFormData(p => ({ ...p, goal: v.toString() }))}
                  options={goalOptions} />
                <Input label="Daily Calorie Intake" type="number" className="flex-1" placeholder="e.g. 2000"
                  min={500} max={5000} required value={formData.dailyCalorieIntake}
                  onChange={v => setFormData(p => ({ ...p, dailyCalorieIntake: Number(v) || 0 }))} />
                <Input label="Daily Calorie Burn" type="number" className="flex-1" placeholder="e.g. 400"
                  min={0} max={5000} required value={formData.dailyCalorieBurn}
                  onChange={v => setFormData(p => ({ ...p, dailyCalorieBurn: Number(v) || 0 }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      age: user.age || 0, weight: user.weight || 0, height: user.height || 0,
                      goal: user.goal || 'maintain',
                      dailyCalorieIntake: user.dailyCalorieIntake || 2000,
                      dailyCalorieBurn: user.dailyCalorieBurn || 400,
                    })
                  }}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            <>
              <div className="space-y-3">
                {/* Age */}
                <div className="profile-info-row">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Age</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{user.age} years</p>
                  </div>
                </div>

                {/* Weight */}
                <div className="profile-info-row">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Scale className="size-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Weight</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{user.weight} kg</p>
                  </div>
                </div>

                {/* Height */}
                {(user.height ?? 0) > 0 && (
                  <div className="profile-info-row">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <RulerIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Height</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{user.height} cm</p>
                    </div>
                  </div>
                )}

                {/* Goal */}
                <div className="profile-info-row">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <Target className="size-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Goal</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {user.goal ? goalLabels[user.goal] : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="secondary" onClick={() => setIsEditing(true)} className="w-full mt-4">
                Edit Profile
              </Button>
            </>
          )}
        </Card>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Your Stats */}
          <Card>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-3xl font-bold text-teal-500 dark:text-teal-400">{todayFood}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Food entries</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-3xl font-bold text-teal-500 dark:text-teal-400">{todayActivities}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Activities</p>
              </div>
            </div>
          </Card>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium transition-all duration-200"
          >
            <LogOutIcon className="size-4" />
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile