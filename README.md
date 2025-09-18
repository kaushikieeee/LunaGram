# LunaGram – Instagram for macOS

LunaGram is a beautiful, battery-friendly, native-feeling macOS `.app` for Instagram, built with Electron.

## Motivation

I faced a problem: there was no official Instagram app for my MacBook, and I didn't want to keep a browser tab open just for Instagram. Not only did this clutter my workspace, but browsers are notorious for draining battery life. I wanted a seamless, focused Instagram experience—one that felt like a real app, not just another tab.

So I built LunaGram.

## Features

- Native-feeling Instagram experience in a standalone window
- Persistent login (no need to log in every time)
- Custom app icon (easy to change)
- External links open in your default browser
- Ad and suggestion removal for a cleaner feed
- Deep link support (open `lunagram://` links directly in the app)
- Mobile feature parity: post stories, reels, and more

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the app:**
   ```sh
   npm start
   ```
3. **Build the .app bundle:**
   ```sh
   npm run pack
   ```
   The `.app` will be in the `Instagram-darwin-x64` folder.

## Building a Packaged App

To create a standalone `.app` you can share or install:

1. Make sure all dependencies are installed:
   ```sh
   npm install
   ```
2. Build the app using electron-packager:
   ```sh
   npm run pack
   ```
   This will generate a folder like `Instagram-darwin-x64` (or `LunaGram-darwin-x64`).
3. Inside that folder, you'll find `LunaGram.app` (or `Instagram.app`).
4. Follow the installation steps above to move it to your Applications folder.

You can now launch LunaGram like any other Mac app!

## Installation

1. After building, find `LunaGram.app` (or `Instagram.app`) in the `Instagram-darwin-x64` folder.
2. Drag and drop the `.app` file into your `/Applications` folder for easy access.
3. If you see a warning or the app doesn't open, run this command in Terminal:
   
   ```sh
   xattr -c /Applications/LunaGram.app
   ```
   (Replace `LunaGram.app` with the actual app name if different.)

This will clear any security attributes and allow the app to run.

## Customization

- Replace `icon.png` in the project root with your own PNG icon for a personalized look.

## Why LunaGram?

- No more wasting battery with a heavy browser just for Instagram
- No distractions from other tabs
- Looks and feels like a true Mac app

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [electron-packager](https://github.com/electron/electron-packager)

---

**Built because Mac users deserve a real Instagram app.**
