import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export default function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: ButtonProps) {
    const baseStyles = 'px-5 py-3 flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variants = {
        primary: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 active:scale-[0.98]',
        secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-400',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 active:scale-[0.98]',
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
}
