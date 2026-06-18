# Snake Game

A responsive browser-based Snake arcade game built with HTML, CSS, and JavaScript.

## Features

- Classic Snake gameplay on a canvas board
- Easy, Normal, and Hard speed modes
- Score, best score, speed, and level panels
- Best score saved with `localStorage`
- Pause and restart controls
- Optional wall-wrap mode
- Optional sound effects
- Keyboard controls for desktop
- Touch controls for mobile
- Responsive layout for desktop and mobile screens

## Live Demo

After enabling GitHub Pages for this repository, the game can be hosted at:

```text
https://sriram127.github.io/Snake_Game/
```

## Tech Stack

- HTML
- CSS
- JavaScript

## Run Locally

Open `index.html` directly in a browser, or run a local server:

```bash
python -m http.server 8010
```

Then open:

```text
http://127.0.0.1:8010/
```

## How To Play

1. Choose a speed mode.
2. Press `Start Game`.
3. Use the arrow keys or `W`, `A`, `S`, `D` to move.
4. Eat the red food to grow and score points.
5. Avoid hitting the wall or your own body.
6. Turn on `Wrap walls` if you want the snake to pass through edges.

## Project Structure

```text
Snake_Game/
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore
```
