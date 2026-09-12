/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        health: {
          dark: '#030806',
          darker: '#010403',
          card: 'rgba(10, 24, 18, 0.7)',
          cardLight: 'rgba(255, 255, 255, 0.85)',
          border: 'rgba(16, 185, 129, 0.15)',
          borderLight: 'rgba(16, 185, 129, 0.2)',
          emerald: {
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            900: '#064e3b',
            glow: 'rgba(16, 185, 129, 0.35)',
          },
          slate: {
            850: '#0f172a',
            950: '#020617',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'spin-slow': 'spin 24s linear infinite',
        'glow': 'glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.2))' },
          '100%': { filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.5))' },
        }
      },
      boxShadow: {
        'emerald-soft': '0 0 40px -10px rgba(16, 185, 129, 0.25)',
        'emerald-lg': '0 0 60px -15px rgba(16, 185, 129, 0.35)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(0, 50, 30, 0.08)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
