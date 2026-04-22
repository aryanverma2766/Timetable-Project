# ClassFinder 🏛️
### UIC Free Room Detector — Chandigarh University

> Find free classrooms in your department in real-time, based on the actual section-wise timetable.

Built with **HTML, CSS, JavaScript, and jQuery** as part of an AI-assisted mini project.

---

## ⭐ Unique Element — Upcoming Free Slots Timeline

**This is the unique feature not present in any prior submitted project.**

For every room that is currently free, the app displays a **full-day slot timeline** showing:
- Which slots (1–8) the room is free vs occupied across the entire day
- Color-coded slot badges (green = free ✓, red = busy ✗)
- The current slot is highlighted with a blue outline
- This lets you see not just "is it free NOW" but **plan ahead** — e.g. "Room 309 is free for the next 3 slots"

This is implemented using real timetable cross-referencing with JS logic — not just a display widget.

---

## ✦ Features

| Feature | Description |
|---|---|
| Real Timetable Data | All 39 sections (23BCA–25BCD) extracted from the official PDF |
| Day + Slot Selector | Choose any day and time slot to check |
| Floor Filter | Filter by Floor 1–5 or all floors |
| Room Type Filter | Lecture Halls vs S/W Labs |
| Live Clock | Real-time clock with current day display |
| Use Current Time | One-click sets today's day and current slot |
| Auto Duration Badge | Shows how many consecutive slots a room stays free |
| Upcoming Slots ★ | **[UNIQUE]** Full-day availability timeline per free room |
| Floor-wise Map | Visual room grid organized by floor with free/busy status |
| Keyboard Shortcuts | Enter = search, Ctrl+T = current time |
| Auto-load | App auto-searches current time on startup |

---

## 🛠️ Tech Stack

- **HTML5** — App structure, semantic layout
- **CSS3** — Dark theme, grid, animations, CSS variables
- **JavaScript (ES6)** — Timetable logic, occupancy map, duration calc
- **jQuery 3.7.1** — DOM, events, animations

---

## 📚 Syllabus Coverage (Web Designing - UIE)

Topics from your Web Designing syllabus used in this project:
- **HTML**: Semantic tags, forms (select, button), data attributes, links
- **CSS**: Variables, Grid, Flexbox, animations (@keyframes), transitions, pseudo-elements
- **JavaScript**: Arrays, objects, functions, DOM manipulation, event handling, string methods
- **jQuery**: `$(document).ready`, `.on()`, `.each()`, `.find()`, `.animate()`, `.fadeIn/Out()`

**Beyond syllabus additions:**
- CSS Custom Properties (variables) for theming
- JS `Map` and `Set` for occupancy data structures
- Sticky positioning + scroll animation
- Responsive grid with `auto-fill`
- Real data extraction and transformation pipeline

---

## 🚀 How to Run

```bash
git clone https://github.com/YOUR_USERNAME/classfinder
cd classfinder
open index.html
```

No build step. No server. Works entirely in the browser.

---

## ⌨️ Shortcuts

| Key | Action |
|---|---|
| `Enter` | Search free rooms |
| `Ctrl + T` | Set current time |

---

*Created with the assistance of Claude (Anthropic) · UIE, Chandigarh University · Jan-June 2026 Session*
