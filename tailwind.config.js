/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            boxShadow: {
                glow: "0 20px 80px rgba(255, 255, 255, 0.08)",
            },
        },
    },
    plugins: [],
};
