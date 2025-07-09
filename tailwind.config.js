/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', "class"],
  theme: {
  	extend: {
  		colors: {
  			dark: {
  				bg: '#1a1a1a',
  				surface: '#2d2d2d',
  				border: '#404040',
  				text: '#e5e5e5',
  				'text-secondary': '#a3a3a3'
  			},
  			dnd: {
  				gold: '#FFD700',
  				'gold-dark': '#B8860B',
  				copper: '#B87333',
  				silver: '#C0C0C0',
  				platinum: '#E5E4E2',
  				'red-dragon': '#8B0000',
  				'blue-dragon': '#0066CC',
  				'green-dragon': '#228B22',
  				'black-dragon': '#2F2F2F',
  				'white-dragon': '#F5F5F5',
  				'purple-magic': '#663399',
  				'blue-magic': '#4169E1',
  				'green-nature': '#228B22',
  				'fire-orange': '#FF4500',
  				'ice-blue': '#87CEEB',
  				'earth-brown': '#8B4513',
  				'shadow-gray': '#696969'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'spell-cast': 'spell-cast 0.5s ease-in-out',
  			'dice-roll': 'dice-roll 0.3s ease-out',
  			'fire-burst': 'fire-burst 0.8s ease-out',
  			'ice-crystal': 'ice-crystal 1s ease-in-out',
  			'magic-sparkle': 'magic-sparkle 2s ease-in-out infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			'spell-cast': {
  				'0%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				},
  				'50%': {
  					transform: 'scale(1.1)',
  					opacity: '0.8'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			'dice-roll': {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'fire-burst': {
  				'0%': {
  					transform: 'scale(0)',
  					opacity: '0'
  				},
  				'50%': {
  					transform: 'scale(1.2)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '0.8'
  				}
  			},
  			'ice-crystal': {
  				'0%': {
  					transform: 'rotate(0deg) scale(1)',
  					opacity: '0'
  				},
  				'50%': {
  					transform: 'rotate(180deg) scale(1.1)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'rotate(360deg) scale(1)',
  					opacity: '0.8'
  				}
  			},
  			'magic-sparkle': {
  				'0%, 100%': {
  					opacity: '0.3',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					opacity: '1',
  					transform: 'scale(1.1)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
