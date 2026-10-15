// ===== Anime Tactics: battle prototype =====
// Everything about the game lives in this file.

const SIZE = 8; // the board is 8 tiles wide and 8 tiles tall

// The starting line-up. Each unit has:
// hp = health, atk = damage per hit, move = tiles it can walk, range = how far it can hit.
// "heal: true" means its "attack" heals friends instead of hurting enemies.
function startingUnits() {
  return [
    { name: "Akira",  role: "Swordsman", icon: "🗡️", team: "hero",  hp: 30, atk: 10, move: 3, range: 1, x: 1, y: 6 },
    { name: "Yuki",   role: "Mage",      icon: "🔮", team: "hero",  hp: 18, atk: 12, move: 2, range: 3, x: 2, y: 7 },
    { name: "Sakura", role: "Healer",    icon: "🌸", team: "hero",  hp: 20, atk: 8,  move: 3, range: 2, x: 0, y: 7, heal: true },
    { name: "Oni",    role: "Brute",     icon: "👹", team: "enemy", hp: 28, atk: 8,  move: 2, range: 1, x: 6, y: 1 },
    { name: "Kitsune",role: "Archer",    icon: "🦊", team: "enemy", hp: 16, atk: 6,  move: 2, range: 3, x: 7, y: 0 },
    { name: "Shade",  role: "Rogue",     icon: "👻", team: "enemy", hp: 18, atk: 7,  move: 3, range: 1, x: 5, y: 0 },
    { name: "Goblin", role: "Grunt",     icon: "👺", team: "enemy", hp: 14, atk: 5,  move: 3, range: 1, x: 7, y: 2 },
  ].map(u => ({ ...u, maxHp: u.hp, moved: false, acted: false }));
}

// ----- Game state (what is happening right now) -----
let units = [];
let selected = null;   // the hero you clicked
let phase = "player";  // "player", "enemy" or "over"

// Grab the page elements we need
const boardEl = document.getElementById("board");
const infoEl = document.getElementById("info");
const logEl = document.getElementById("log");

// ----- Small helper functions -----
const unitAt = (x, y) => units.find(u => u.hp > 0 && u.x === x && u.y === y);
const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // steps, no diagonals
const alive = team => units.filter(u => u.team === team && u.hp > 0);

function log(text) {
  logEl.innerHTML = "<div>" + text + "</div>" + logEl.innerHTML;
}

// Find every tile a unit can walk to (it can't walk through other units).
function reachableTiles(unit) {
  const result = [{ x: unit.x, y: unit.y }];
  const seen = new Set([unit.x + "," + unit.y]);
  let frontier = [{ x: unit.x, y: unit.y }];
  for (let step = 0; step < unit.move; step++) {
    const next = [];
    for (const t of frontier) {
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = t.x + dx, ny = t.y + dy, key = nx + "," + ny;
        if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE || seen.has(key) || unitAt(nx, ny)) continue;
        seen.add(key); next.push({ x: nx, y: ny }); result.push({ x: nx, y: ny });
      }
    }
    frontier = next;
  }
  return result;
}

// Who can this unit attack (or heal) from where it stands?
function targetsFor(unit) {
  return units.filter(o => o.hp > 0 && o !== unit && distance(unit, o) <= unit.range &&
    (unit.heal ? (o.team === unit.team && o.hp < o.maxHp) : o.team !== unit.team));
}

// Do the attack (or heal)
function act(unit, target) {
  if (unit.heal) {
    const amount = Math.min(unit.atk, target.maxHp - target.hp);
    target.hp += amount;
    log(`💚 ${unit.name} heals ${target.name} for ${amount}`);
  } else {
    target.hp = Math.max(0, target.hp - unit.atk);
    log(`💥 ${unit.name} hits ${target.name} for ${unit.atk}`);
    if (target.hp === 0) log(`☠️ ${target.name} is defeated!`);
  }
  unit.moved = unit.acted = true;
  checkGameOver();
}

// ----- Drawing the board -----
function draw() {
  boardEl.innerHTML = "";
  const moves = selected && !selected.moved ? reachableTiles(selected) : [];
  const targets = selected && !selected.acted ? targetsFor(selected) : [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      if (moves.some(t => t.x === x && t.y === y)) tile.classList.add("move");
      const u = unitAt(x, y);
      if (u && targets.includes(u)) tile.classList.add("attack");
      if (u) {
        const el = document.createElement("div");
        el.className = "unit " + u.team + (u.acted ? " done" : "") + (u === selected ? " selected" : "");
        el.innerHTML = u.icon + `<div class="hpbar"><div style="width:${100 * u.hp / u.maxHp}%"></div></div>`;
        el.title = `${u.name} (${u.role})`;
        tile.appendChild(el);
      }
      tile.onclick = () => clickTile(x, y);
      boardEl.appendChild(tile);
    }
  }
  document.getElementById("waitBtn").disabled = !selected;
  document.getElementById("turnLabel").textContent = phase === "enemy" ? "Enemy Turn..." : "Your Turn";
}

function showInfo(u) {
  infoEl.innerHTML = u ? `<b style="font-size:20px">${u.icon} ${u.name}</b><br><i>${u.role}</i><br>
    ❤️ HP: ${u.hp}/${u.maxHp}<br>⚔️ ${u.heal ? "Heal" : "Attack"}: ${u.atk}<br>
    👟 Move: ${u.move} &nbsp; 🎯 Range: ${u.range}` : "Click one of your heroes (blue) to start.";
}

// ----- What happens when you click a tile -----
function clickTile(x, y) {
  if (phase !== "player") return;
  const u = unitAt(x, y);
  // 1) Clicked a target we can hit/heal -> do it
  if (selected && u && !selected.acted && targetsFor(selected).includes(u)) {
    act(selected, u); selected = null; showInfo(u); draw(); return;
  }
  // 2) Clicked one of our heroes that still has an action -> select it
  if (u && u.team === "hero" && !u.acted) { selected = u; showInfo(u); draw(); return; }
  // 3) Clicked an empty blue tile -> walk there
  if (selected && !selected.moved && !u && reachableTiles(selected).some(t => t.x === x && t.y === y)) {
    selected.x = x; selected.y = y; selected.moved = true;
    if (targetsFor(selected).length === 0) log(`${selected.name} moved. Nothing in range - press Wait.`);
    draw(); return;
  }
  // 4) Anything else: just show info about what was clicked
  showInfo(u); selected = null; draw();
}

// "Wait" ends this hero's action without attacking
document.getElementById("waitBtn").onclick = () => {
  if (selected) { selected.moved = selected.acted = true; selected = null; draw(); }
};
document.getElementById("endTurnBtn").onclick = () => { if (phase === "player") enemyTurn(); };
document.getElementById("restartBtn").onclick = startGame;

// ----- Enemy AI: walk toward the closest hero and attack if possible -----
const pause = ms => new Promise(r => setTimeout(r, ms));
async function enemyTurn() {
  phase = "enemy"; selected = null; draw();
  for (const e of alive("enemy")) {
    if (phase === "over") return;
    const heroes = alive("hero");
    const goal = heroes.sort((a, b) => distance(e, a) - distance(e, b))[0];
    // Pick the reachable tile that ends closest to that hero (but not closer than needed)
    if (distance(e, goal) > e.range) {
      const best = reachableTiles(e).sort((a, b) => distance(a, goal) - distance(b, goal))[0];
      e.x = best.x; e.y = best.y; draw(); await pause(350);
    }
    const t = targetsFor(e).sort((a, b) => a.hp - b.hp)[0]; // hit the weakest in range
    if (t) { act(e, t); draw(); await pause(350); }
  }
  if (phase === "over") return;
  // New round: everyone can move and act again
  units.forEach(u => (u.moved = u.acted = false));
  phase = "player"; log("— Your turn —"); draw();
}

// ----- Winning and losing -----
function checkGameOver() {
  const won = alive("enemy").length === 0, lost = alive("hero").length === 0;
  if (!won && !lost) return;
  phase = "over";
  document.getElementById("overlayText").textContent = won ? "🎉 Victory!" : "💀 Defeat...";
  document.getElementById("overlay").classList.remove("hidden");
}

function startGame() {
  units = startingUnits(); selected = null; phase = "player";
  logEl.innerHTML = ""; log("Battle start! Defeat all enemies.");
  document.getElementById("overlay").classList.add("hidden");
  showInfo(null); draw();
}

startGame();
