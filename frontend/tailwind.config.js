/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#135aad',
        secondary: '#f48936',
        accent: '#e3297c',
        surface: '#f9f9f9',
        'surface-dim': '#dadad9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f3f3',
        'surface-container': '#eeeeed',
        'on-surface': '#1a1c1c',
        'on-surface-variant': '#424656',
        outline: '#727687',
        'outline-variant': '#E2E8F0',
        error: '#EF4444',
        success: '#22C55E',
        'surface-glass': 'rgba(255, 255, 255, 0.92)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0px 4px 20px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
      },
      backgroundImage: {
        'soft-radial': 'radial-gradient(circle at top, rgba(19,90,173,0.12), rgba(255,255,255,0) 40%), linear-gradient(180deg, #f8fbff 0%, #f4f5f7 100%)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.12)', opacity: '0.7' },
        },
      },
      animation: {
        'pulse-slow': 'pulseSlow 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
