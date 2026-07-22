/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f9fb",
        ink: "#191c1e",
        muted: "#45474c",
        line: "#c5c6cd",
        primary: "#091426",
        amber: "#855300",
        accent: "#fea619",
        danger: "#ba1a1a",
        success: "#19733b",
      },
    },
  },
  plugins: [],
}
