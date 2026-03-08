// tailwind.config.js
module.exports = {
      content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'], // update as needed
      theme: {
            extend: {
                  fontFamily: {
                        doto: ["var(--font-doto)", "sans-serif"],
                  },
                  keyframes: {
                        fall: {
                              '0%': { transform: 'translateY(-100px)', opacity: '0' },
                              '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                  },
                  animation: {
                        fall: 'fall 0.5s ease-out forwards',
                  },
            },
      },
      plugins: [],
}
