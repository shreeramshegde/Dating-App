/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hinge: {
          black: '#121212',
          charcoal: '#1A1A1A',
          dark: '#222222',
          muted: '#666666',
          border: '#E3DDD3',
          borderDark: '#2E2E2E',
          cream: '#FAF7F2',
          creamDark: '#F3EFE6',
          stone: '#EAE4D8',
          kohlrabi: '#1B3B36', // Signature Hinge forest green
          kohlrabiLight: '#2C5A52',
          terracotta: '#A24838',
          rose: '#9E2A3B',
          roseLight: '#FBECEE',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'hinge': '0 10px 30px -5px rgba(20, 20, 20, 0.08)',
        'hinge-card': '0 16px 40px -10px rgba(0, 0, 0, 0.1)',
        'modal': '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
