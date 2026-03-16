import { ActivityIcon, HomeIcon, UserIcon, UtensilsIcon } from "lucide-react"
import { NavLink } from "react-router-dom"


const BottomNav = () => {
    const NavItems = [
        { path: '/', label: 'Home', icon: HomeIcon },
        { path: '/food', label: 'Food', icon: UtensilsIcon },
        { path: '/activity', label: 'Activity', icon: ActivityIcon },
        { path: '/profile', label: 'Profile', icon: UserIcon },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-2 lg:hidden">
            <div className="max-w-lg mx-auto flex items-center justify-around">
                {NavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150 ${
                                isActive
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`
                        }
                    >
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}

export default BottomNav