# Anime Tactics

A small browser game: an anime-style turn-based strategy battle. You lead three heroes on an 8×8 grid and try to defeat the enemy team. There is nothing to install. The whole game is three files: `index.html`, `style.css`, and `game.js`.

**Play it here:** [https://rfmstacks.github.io/anime-srpg/](https://rfmstacks.github.io/anime-srpg/)

## How to play

1. Open the live site above, or open `index.html` in your browser.
2. Click one of your heroes (the blue circles) to select them.
3. Blue tiles show where that hero can walk. Click a blue tile to move.
4. Red tiles show who you can hit. Click a red enemy to attack. Sakura the healer uses red tiles on hurt allies to heal them instead.
5. Press **Wait** if the selected hero should stop without attacking.
6. Press **End Turn** when you are finished. The enemies then move and attack.
7. Defeat every enemy to win. If all of your heroes fall, you lose. Press **Play Again** to start over.

Each hero can move and act once per turn. Units that have already acted turn gray.

## Your team

- **Akira** (Swordsman) — tough fighter who hits the tile next to him.
- **Yuki** (Mage) — hits harder from farther away, but is fragile.
- **Sakura** (Healer) — restores an ally’s health instead of attacking.

## Play it on your computer

Clone or download this folder, then double-click `index.html`. Any modern browser is enough. You do not need Node, a build step, or a server.
