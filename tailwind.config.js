/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        space: { 950:'#04070F',900:'#0A0F1E',800:'#0F172A',700:'#111827',600:'#1E2939',500:'#253047' },
        primary: { 400:'#818CF8',500:'#6366F1',600:'#4F46E5',700:'#4338CA' },
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        mono: ['JetBrains Mono','monospace'],
      },
      animation: { 'fade-in': 'fadeIn 0.25s ease-out' },
      keyframes: {
        fadeIn: { from:{ opacity:'0',transform:'translateY(4px)' }, to:{ opacity:'1',transform:'translateY(0)' } }
      },
    },
  },
  plugins: [],
}
