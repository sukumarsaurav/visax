/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#136dec",
                "primary-hover": "#1060d4",
                "secondary": "#6366f1",
                "success": "#10b981",
                "warning": "#f59e0b",
                "error": "#ef4444",
                "info": "#3b82f6",
                "background-light": "#f6f7f8",
                "background-dark": "#101822",
                "surface-light": "#ffffff",
                "surface-dark": "#1e293b",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px",
            },
        },
    },
    plugins: [],
}
