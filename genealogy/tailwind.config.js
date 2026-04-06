/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'oklch(55.8% 0.288 264.05)',
        'primary-foreground': 'oklch(98% 0 0)',
        secondary: 'oklch(96.1% 0 0)',
        'secondary-foreground': 'oklch(21% 0 0)',
        muted: 'oklch(96.1% 0 0)',
        'muted-foreground': 'oklch(55.8% 0 0)',
        accent: 'oklch(96.1% 0 0)',
        'accent-foreground': 'oklch(21% 0 0)',
        destructive: 'oklch(57.7% 0.245 27.33)',
        border: 'oklch(91.7% 0 0)',
        input: 'oklch(91.7% 0 0)',
        ring: 'oklch(55.8% 0.288 264.05)',
        background: 'oklch(100% 0 0)',
        foreground: 'oklch(14.5% 0 0)',
        card: 'oklch(100% 0 0)',
        'card-foreground': 'oklch(14.5% 0 0)',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
