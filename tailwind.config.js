/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Card background colors
    'from-purple-700', 'to-indigo-800',
    'from-red-700', 'to-orange-800',
    'from-sky-700', 'to-blue-800',
    'from-emerald-600', 'to-green-700',
    'from-pink-600', 'to-rose-700',
    'from-blue-600', 'to-cyan-700',
    // Action button gradients
    'from-purple-500', 'to-purple-700', 'border-purple-400',
    'hover:from-purple-400', 'hover:to-purple-600',
    // Health bar gradient
    'from-red-600', 'to-red-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}