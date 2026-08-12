/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stencil: {
          bg: '#F4F2EC',
          ink: '#101010',
          hazard: '#E8B009',
          olive: '#3C4A3D',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        stencil: ['"Saira Stencil One"', 'cursive'],
      },
      backgroundImage: {
        'technical-grid': 'linear-gradient(to right, #10101010 1px, transparent 1px), linear-gradient(to bottom, #10101010 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-sm': '20px 20px',
      }
    },
  },
  plugins: [],
}
