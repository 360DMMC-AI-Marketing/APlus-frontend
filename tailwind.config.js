/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Logo brand colors - red and navy as co-equal colors
        primary: {
          DEFAULT: '#F03C3C',      // Coral red
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#F03C3C',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        secondary: {
          DEFAULT: '#002850',      // Navy blue
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dbfe',
          300: '#7cb8fc',
          400: '#3d8ff8',
          500: '#1570ef',
          600: '#0857ce',
          700: '#0844a7',
          800: '#0a3a85',
          900: '#002850',
        },
        neutral: {
          DEFAULT: '#1a2332',
        },
        medical: {
          red: '#F03C3C',
          navy: '#002850',
          lightRed: '#fee2e2',
          lightBlue: '#e0effe',
        },
        blue:{
          DEFAULT: "#0c4a6e",
        },
        lightblue:{
          DEFAULT: "#0ea5e9"
        }
      },
      fontFamily: {
        'display': ['DM Serif Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        aplusmed: {
          "primary": "#F03C3C",
          "secondary": "#002850",
          "neutral": "#1a2332",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#e2e8f0",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#dc2626",
        },
      },
    ],
  },
}
