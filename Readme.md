# Advanced Calculator

A web-based calculator with basic and scientific modes, memory functions, calculation history, and full keyboard support — built with plain HTML, CSS, and JavaScript (no frameworks or dependencies).

## Features

- **Basic operations** — add, subtract, multiply, divide, parentheses, percent
- **Scientific mode** — sin, cos, tan (+ inverse), ln, log, square root, square, powers, factorial, π, e
- **Degrees / Radians toggle** for trig functions
- **Memory** — MC, MR, M+, M−
- **History panel** — click any past result to reuse it
- **Keyboard support** — type numbers and operators directly, Enter to evaluate, Esc to clear
- **Responsive design** — works on desktop and mobile

## Demo

Open `index.html` in a browser, or run it with a local server (see below).

## Getting Started

### Option 1: Just open it
Double-click `index.html`. (Some browsers restrict local file access for fonts/scripts, so if styling looks off, use Option 2.)

### Option 2: Run with a local server
```bash
# Python 3
python3 -m http.server 8000

# or Node.js
npx serve .
```
Then visit `http://localhost:8000` in your browser.

## Project Structure

```
calculator/
├── index.html   # Markup
├── style.css    # Styling
├── script.js    # Calculator logic
└── README.md
```

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
