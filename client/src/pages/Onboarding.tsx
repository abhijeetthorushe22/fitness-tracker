import { ArrowLeft, ArrowRight, PersonStanding, ScaleIcon, Target, User } from "lucide-react"
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast"
import { useAppContext } from "../context/AppContext";
import type { ProfileFormData, UserData } from "../types";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { goalOptions } from "../assets/assets";
import Slider from "../components/ui/Slider";
import api from "../config/api";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { user, setOnboardingCompleted, fetchUser } = useAppContext()
  const [formData, setFormData] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: 'maintain',
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  })

  const totalSteps = 3;

  const updateField = (field: string, value: number | string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.age || Number(formData.age) < 13 || Number(formData.age) > 100) {
        toast.error("Please enter a valid age between 13 and 100")
        return
      }
    }

    if (step === 2) {
      if (!formData.weight || Number(formData.weight) < 20 || Number(formData.weight) > 200) {
        toast.error("Please enter a valid weight between 20 and 200")
        return
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step — save data
      const userData: Partial<UserData> = {
        age: formData.age,
        weight: formData.weight,
        height: formData.height ? formData.height : null,
        goal: formData.goal as UserData["goal"],
        dailyCalorieIntake: formData.dailyCalorieIntake,
        dailyCalorieBurn: formData.dailyCalorieBurn,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('fitnessuser', JSON.stringify(userData))
      try{
        await api.put(`/api/users/${user?.id}`, userData)
        toast.success("Profile updated successfully")
        setOnboardingCompleted(true)
        fetchUser(user?.token || "")
      }
      catch(error:any){
        console.log(error)
        toast.error(error?.response?.data?.error?.message || error?.message)
      }
      
    }
  }

  // Helper: calculate personalised calorie targets using Mifflin-St Jeor BMR
  // BMR (gender-neutral avg) = (10 × weight) + (6.25 × height) - (5 × age) - 78
  // Then multiply by activity factor 1.375 (lightly active) to get TDEE
  const handleGoalSelect = (goalValue: 'lose' | 'maintain' | 'gain') => {
    const age = Number(formData.age) || 25;
    const weight = Number(formData.weight) || 70;   // kg
    const height = Number(formData.height) || 170;  // cm

    // Basal Metabolic Rate (calories burned at rest)
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) - 78;

    // Total Daily Energy Expenditure (lightly active × 1.375)
    const tdee = Math.round(bmr * 1.375 / 50) * 50; // round to nearest 50

    // Estimated active burn (difference between TDEE and BMR, capped sensibly)
    const estimatedBurn = Math.round((tdee - bmr) / 50) * 50;

    let intake = tdee;
    let burn = estimatedBurn;

    if (goalValue === 'lose') {
      intake -= 400;   // calorie deficit
      burn += 100;     // slightly more activity encouraged
    } else if (goalValue === 'gain') {
      intake += 500;   // calorie surplus
      burn -= 50;      // less aggressive burn target
    }

    setFormData({
      ...formData,
      goal: goalValue,
      dailyCalorieIntake: Math.max(1200, intake), // never go below 1200
      dailyCalorieBurn: Math.max(100, burn),
    });
  }

  return (
    <>
      <Toaster />

      <div className="onboarding-container">
        {/* Header */}
        <div className="p-6 pt-12 onboarding-wrapper">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <PersonStanding className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">FitTrack</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-4">Let's personalize your experience</p>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 mb-8 onboarding-wrapper">
          <div className="flex gap-2 max-w-2xl">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Step {step} of {totalSteps}</p>
        </div>

        {/* Form Content */}
        <div className="flex-1 px-6 onboarding-wrapper">

          {/* Step 1 — Age */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <User className="size-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">How Old are You</h2>
                  <p className="text-slate-500 dark:text-slate-400">This helps us calculate your needs</p>
                </div>
              </div>
              <Input
                label="Age"
                type="number"
                className="max-w-2xl"
                value={formData.age}
                onChange={(v) => updateField('age', Number(v))}
              />
            </div>
          )}

          {/* Step 2 — Measurements */}
          {step === 2 && (
            <div className="space-y-6 onboarding-wrapper">
              <div className="flex items-center gap-4 mb-8">
                <ScaleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Your Measurements</h2>
                  <p className="text-slate-500 dark:text-slate-400">This helps us calculate your needs</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 max-w-2xl">
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(v) => updateField('weight', Number(v))}
                  placeholder="Enter your weight" min={20} max={200} required
                />
                <Input
                  label="Height (cm) - Optional"
                  type="number"
                  value={formData.height}
                  onChange={(v) => updateField('height', Number(v))}
                  placeholder="Enter your height" min={100} max={250}
                />
              </div>
            </div>
          )}

          {/* Step 3 — Goal + Daily Targets */}
          {step === 3 && (
            <div className="space-y-8 onboarding-wrapper">
              {/* Goal Header */}
              <div className="flex items-center gap-4">
                <Target className="size-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">What's Your Goal</h2>
                  <p className="text-slate-500 dark:text-slate-400">We'll tailor your experience based on your goal</p>
                </div>
              </div>

              {/* Goal Options */}
              <div className="flex flex-col gap-3 max-w-lg">
                {goalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleGoalSelect(option.value as 'lose' | 'maintain' | 'gain')}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 font-medium
                      ${formData.goal === option.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                      }`}
                  >
                    {option.value === 'lose'
                      ? `🔥 ${option.label}`
                      : option.value === 'maintain'
                      ? `⚖️ ${option.label}`
                      : `💪 ${option.label}`}
                  </button>
                ))}
              </div>

              {/* Daily Targets */}
              <div className="space-y-6 max-w-lg">
                <h3 className="text-base font-semibold text-slate-800 dark:text-white">Daily Targets</h3>
                <div className="space-y-6">
                  <Slider
                    label="Daily Calorie Intake"
                    min={1200}
                    max={4000}
                    step={50}
                    value={formData.dailyCalorieIntake}
                    onChange={(v) => updateField('dailyCalorieIntake', Number(v))}
                    unit="kcal"
                    infoText="The total calories you plan to consume each day."
                  />
                  <Slider
                    label="Daily Calorie Burn"
                    min={100}
                    max={2000}
                    step={50}
                    value={formData.dailyCalorieBurn}
                    onChange={(v) => updateField('dailyCalorieBurn', Number(v))}
                    unit="kcal"
                    infoText="The total calories you plan to burn each day."
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="p-6 pb-10 onboarding-wrapper">
          <div className="flex gap-3 lg:justify-end">
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep(step > 1 ? step - 1 : 1)} className="max-lg:flex-1 lg:px-10">
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </span>
              </Button>
            )}
            <Button onClick={handleNext} className="max-lg:flex-1 lg:px-10">
              <span className="flex items-center justify-center gap-2">
                {step === totalSteps ? 'Get Started' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </div>
        </div>

      </div>
    </>
  )
}

export default Onboarding