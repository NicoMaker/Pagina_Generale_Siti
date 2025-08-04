tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "slide-in": "slideIn 0.6s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "bounce-in": "bounceIn 0.8s ease-out",
        flip: "flip 0.6s ease-in-out",
      },
    },
  },
};
