/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F5",
        surface: "#FFFFFF",
        primary: "#556B2F",
        accent: "#C8A96A",
        charcoal: "#2B2B2B",
        slate: "#6B7280",
        border: "#E5E7EB",
        success: "#5E8C61",
        error: "#C65D5D",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "var(--font-noto-sinhala)", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
