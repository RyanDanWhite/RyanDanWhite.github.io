# RyanDanWhite.github.io

Personal browser start page hosted with GitHub Pages.

The site provides a lightweight, dark-themed home page with quick links, search tools, a persistent scratchpad, and a small hidden Easter egg.

## Features

- Two-column responsive layout
- Dark theme
- Horizontal quick-link flyouts
- Google quick search
- Wikipedia quick search
- Local scratchpad
- Copy-to-clipboard support
- Live clock
- Breakout Easter egg

## Project Structure

```text
RyanDanWhite.github.io/
├── index.html
├── README.md
├── style/
│   └── startpage.css
└── js/
    ├── startpage.js
    └── breakout.js

Files
index.html

Defines the page structure and content, including:

Quick-link groups
Scratchpad
Google search
Wikipedia search
Clock
Easter egg elements
style/startpage.css

Contains the site's presentation and layout:

Dark color palette
Two-column layout
Horizontal flyouts
Search controls
Scratchpad styling
Responsive behavior
Easter egg and game overlay styling
js/startpage.js

Provides the main page behavior:

Live clock
Scratchpad persistence using localStorage
Copy-to-clipboard functionality
Flyout accessibility state
js/breakout.js

Contains the Breakout Easter egg:

HTML5 Canvas game
Paddle and ball controls
Brick collision logic
Mouse and keyboard controls
Restart and exit behavior
Quick Links

The left side of the page organizes bookmarks into several groups:

About Ryan White
Shopping
Tech
The Googles

Links appear horizontally when a group is opened or hovered.

Search

The right column provides dedicated quick-search forms for:

Google
Wikipedia

Search results open in a new browser tab.

Scratchpad

The scratchpad is intended for temporary notes while browsing.

Content is stored locally in the browser using localStorage, allowing notes to survive page refreshes without requiring a backend service.

The Copy button copies the current scratchpad contents to the clipboard.

Breakout Easter Egg

A deliberately subtle trigger on the page launches a small Breakout game.

Controls:

Mouse movement: move paddle
Left / Right Arrow: move paddle
Space: restart after the game ends
Escape: exit the game

The Easter egg is intentionally not advertised by the normal page interface.

Design Goals

This project is intentionally small and dependency-free.

The current implementation uses:

HTML5
CSS
Vanilla JavaScript

The page does not require jQuery, a JavaScript framework, a database, or a build process.

The goal is to keep the start page fast, simple, maintainable, and easy to host directly through GitHub Pages.