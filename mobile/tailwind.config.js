/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        secondary: "#FF6584",
        background: "#F9FAFB",
        surface: "#FFFFFF",
        text: "#1F2937",
        textMuted: "#6B7280",
        success: "#10B981",
        error: "#EF4444",
      }
    },
  },
  plugins: [],
}
