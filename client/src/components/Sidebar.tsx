import { ActivityIcon, HomeIcon, PersonStandingIcon, UserIcon, UtensilsIcon } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"


const Sidebar = () => {
    const NavItems = [
        { path: '/', label: 'Home', icon: HomeIcon },
        { path: '/food', label: 'Food', icon: UtensilsIcon },
        { path: '/activity', label: 'Activity', icon: ActivityIcon },
        { path: '/profile', label: 'Profile', icon: UserIcon },
    ]

    const { theme, toggleTheme } = useTheme()

    return (
        <nav className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <PersonStandingIcon className="size-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">FitTrack</h1>
            </div>

            <div className="flex flex-col gap-2">
                {NavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                                isActive
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                        }
                    >
                        <item.icon className="size-5" />
                        <span className="text-base">{item.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="mt-auto">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
                >
                    <span className="text-base">{theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
                </button>
            </div>
        </nav>
    )
}

export default Sidebar