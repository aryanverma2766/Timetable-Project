/* ============================================================
   ClassFinder — app.js
   Free Room Finder for UIE, Chandigarh University
   Uses HTML, CSS, JS, jQuery
   UNIQUE FEATURE: Upcoming Free Slots Timeline per room
============================================================ */

$(function () {

  const DAYS = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday' };
  const DAY_ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr'];

  /* ─── LOADER ─────────────────────────────── */
  let prog = 0;
  const msgs = ["Loading timetable data...", "Parsing room schedule...", "Building occupancy map...", "Ready!"];
  let mi = 0;
  const li = setInterval(function () {
    prog += Math.random() * 20 + 10;
    if (prog >= 100) prog = 100;
    $(".loader-bar").css("width", prog + "%");
    if (mi < msgs.length - 1 && prog > (mi + 1) * 25) {
      $("#loader-msg").text(msgs[++mi]);
    }
    if (prog >= 100) {
      clearInterval(li);
      setTimeout(function () {
        $("#loader").fadeOut(400, function () {
          $("#app").fadeIn(300);
          init();
        });
      }, 400);
    }
  }, 80);

  /* ─── INIT ───────────────────────────────── */
  function init() {
    updateClock();
    setInterval(updateClock, 1000);
    setDefaultDay();
  }

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    $("#live-clock").text(h + ":" + m + ":" + s);
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()];
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    $("#live-day").text(dayName + " · " + dateStr);
  }

  function setDefaultDay() {
    const jsDay = new Date().getDay();
    const dayMap = { 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr' };
    const d = dayMap[jsDay] || 'Mo';
    $("#sel-day").val(d);
  }

  /* ─── USE CURRENT TIME ───────────────────── */
  $("#find-current-btn").on("click", function () {
    const now = new Date();
    const jsDay = now.getDay();
    const dayMap = { 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr' };
    const d = dayMap[jsDay];
    if (!d) { toast("Today is a weekend! Showing Monday."); $("#sel-day").val('Mo'); }
    else $("#sel-day").val(d);

    // Find current slot
    const mins = now.getHours() * 60 + now.getMinutes();
    const slotTimes = [
      [595, 640], [640, 685], [685, 730], [730, 775],
      [775, 820], [820, 865], [865, 910], [910, 955]
    ];
    let slot = null;
    slotTimes.forEach(([s, e], i) => { if (mins >= s && mins < e) slot = i + 1; });
    if (slot) { $("#sel-slot").val(slot); toast("📍 Set to current time: Slot " + slot); }
    else toast("⏰ Classes are over for today! Showing Slot 1.");
  });

  /* ─── FIND ROOMS ─────────────────────────── */
  $("#find-now-btn").on("click", findFreeRooms);

  function findFreeRooms() {
    const day = $("#sel-day").val();
    const slot = parseInt($("#sel-slot").val());
    const floorFilter = $("#sel-floor").val();
    const typeFilter = $("#sel-type").val();

    const key = day + '-' + slot;
    const occupied = OCCUPANCY_MAP[key] || {};

    // Get all rooms & filter
    let allRooms = Object.values(ALL_ROOMS);
    if (floorFilter !== 'all') allRooms = allRooms.filter(r => r.floor === floorFilter);
    if (typeFilter !== 'all') allRooms = allRooms.filter(r => r.type === typeFilter);

    const free = [], busy = [];
    allRooms.forEach(room => {
      if (occupied[room.id]) busy.push({ room, ...occupied[room.id] });
      else free.push({ room });
    });

    // Sort: free first, then by room number
    free.sort((a, b) => a.room.id.localeCompare(b.room.id));
    busy.sort((a, b) => a.room.id.localeCompare(b.room.id));

    renderStats(free.length, busy.length, slot, day);
    renderResults(free, busy, day, slot, floorFilter);
    renderUpcoming(day, slot, floorFilter, typeFilter);
    renderFloorMap(day, slot);

    // Scroll to results
    setTimeout(() => { $('html').animate({ scrollTop: $("#stats-bar").offset().top - 70 }, 300); }, 100);
  }

  /* ─── STATS ──────────────────────────────── */
  function renderStats(freeCount, busyCount, slot, day) {
    $("#sp-free-num").text(freeCount);
    $("#sp-busy-num").text(busyCount);
    $("#sp-slot-label").text("Slot " + slot);
    $("#sp-duration").text(SLOTS[slot].label);
    $("#stats-bar").show();
  }

  /* ─── RESULTS ────────────────────────────── */
  function renderResults(free, busy, day, slot, floorFilter) {
    const $results = $("#results");
    const $grid = $("#rooms-grid");
    const $tabs = $("#floor-tabs");
    const $label = $("#result-day-label");

    $label.text("— " + DAYS[day] + " · " + SLOTS[slot].label);
    $results.show();
    $grid.empty();
    $tabs.empty();

    if (free.length === 0) {
      $grid.html('<div class="empty-state"><span class="es-icon">😓</span>No free rooms found for this slot.<br>Try a different time or floor.</div>');
      return;
    }

    // Build floor tabs
    const floors = [...new Set(free.map(f => f.room.floor))].sort();
    $tabs.append('<span class="floor-tab active" data-floor="all">All</span>');
    floors.forEach(f => $tabs.append(`<span class="floor-tab" data-floor="${f}">Floor ${f}</span>`));

    // Render free rooms (calculate how many consecutive slots free)
    free.forEach(({ room }, i) => {
      const freeDuration = getConsecutiveFreeSlots(room.id, day, slot);
      const $card = $(`
        <div class="room-card free" data-floor="${room.floor}" style="animation-delay:${i * 0.03}s">
          <div class="rc-status">✓ Available</div>
          <div class="rc-room">${room.label}</div>
          <div class="rc-type">${room.type === 'Lecture' ? '🎓 Lecture Hall' : '💻 Lab'}</div>
          <div class="rc-floor">Floor <span>${room.floor}</span> · E2 Block</div>
          <div class="rc-duration">⏱ Free for ${freeDuration} slot${freeDuration > 1 ? 's' : ''} (~${freeDuration * 45} min)</div>
        </div>
      `);
      $grid.append($card);
    });

    // Floor tab filtering
    $tabs.on("click", ".floor-tab", function () {
      $(".floor-tab").removeClass("active");
      $(this).addClass("active");
      const f = $(this).data("floor");
      $(".room-card.free").each(function () {
        if (f === "all" || $(this).data("floor") == f) $(this).show();
        else $(this).hide();
      });
    });
  }

  /* ─── CONSECUTIVE FREE SLOTS (duration calc) ─ */
  function getConsecutiveFreeSlots(roomId, day, startSlot) {
    let count = 0;
    for (let s = startSlot; s <= 8; s++) {
      const key = day + '-' + s;
      const occ = OCCUPANCY_MAP[key] || {};
      if (!occ[roomId]) count++;
      else break;
    }
    return Math.max(1, count);
  }

  /* ─── UPCOMING FREE SLOTS (UNIQUE FEATURE) ── */
  function renderUpcoming(day, currentSlot, floorFilter, typeFilter) {
    const $sec = $("#upcoming-section");
    const $grid = $("#upcoming-grid");
    $grid.empty();

    // For each free room now, show its full day schedule
    let rooms = Object.values(ALL_ROOMS);
    if (floorFilter !== 'all') rooms = rooms.filter(r => r.floor === floorFilter);
    if (typeFilter !== 'all') rooms = rooms.filter(r => r.type === typeFilter);

    // Only show rooms that are FREE right now
    const key = day + '-' + currentSlot;
    const occupied = OCCUPANCY_MAP[key] || {};
    const freeNow = rooms.filter(r => !occupied[r.id]);

    if (freeNow.length === 0) { $sec.hide(); return; }

    freeNow.slice(0, 18).forEach((room, idx) => {
      const $card = $('<div class="upcoming-card"></div>').css('animation-delay', idx * 0.04 + 's');
      $card.append(`<div class="uc-room">${room.label}</div>`);
      $card.append(`<div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:6px">${room.type} · Floor ${room.floor}</div>`);
      const $slots = $('<div class="uc-slots"></div>');

      for (let s = 1; s <= 8; s++) {
        const k = day + '-' + s;
        const occ = OCCUPANCY_MAP[k] || {};
        const isFree = !occ[room.id];
        const isCurrent = s === currentSlot;
        const label = 'S' + s;
        const title = SLOTS[s].label;
        $slots.append(`
          <span class="uc-slot ${isFree ? 'free' : 'busy'}" title="${title}${isFree ? ' — FREE' : ' — Busy'}" style="${isCurrent ? 'outline:2px solid #58a6ff;outline-offset:1px' : ''}">
            ${label}${isFree ? '✓' : '✗'}
          </span>
        `);
      }
      $card.append($slots);
      $grid.append($card);
    });

    $sec.show();
  }

  /* ─── FLOOR MAP ──────────────────────────── */
  function renderFloorMap(day, slot) {
    const $sec = $("#floormap-section");
    const $map = $("#floor-map");
    $map.empty();

    const key = day + '-' + slot;
    const occupied = OCCUPANCY_MAP[key] || {};

    // Group rooms by floor
    const byFloor = {};
    Object.values(ALL_ROOMS).forEach(room => {
      if (!byFloor[room.floor]) byFloor[room.floor] = [];
      byFloor[room.floor].push(room);
    });

    Object.keys(byFloor).sort().forEach(floor => {
      const rooms = byFloor[floor].sort((a, b) => a.id.localeCompare(b.id));
      const freeCount = rooms.filter(r => !occupied[r.id]).length;
      const $floor = $(`
        <div class="fm-floor">
          <div class="fm-floor-label">Floor ${floor} <span style="font-size:13px;font-family:var(--font-mono);color:var(--text-muted)">(${freeCount}/${rooms.length} free)</span></div>
          <div class="fm-rooms"></div>
        </div>
      `);
      const $rooms = $floor.find('.fm-rooms');
      rooms.forEach(room => {
        const isFree = !occupied[room.id];
        const info = occupied[room.id];
        const title = isFree ? 'FREE' : (info ? info.subject + ' · ' + info.section : 'Occupied');
        $rooms.append(`<span class="fm-room ${isFree ? 'free' : 'busy'}" title="${title}">${room.id.split('-')[1]}</span>`);
      });
      $map.append($floor);
    });

    $sec.show();
  }

  /* ─── TOAST ──────────────────────────────── */
  let toastT;
  function toast(msg) {
    if (toastT) clearTimeout(toastT);
    $("#toast").text(msg).stop(true).show().css("opacity", 1);
    toastT = setTimeout(() => $("#toast").fadeOut(400), 2500);
  }

  /* ─── KEYBOARD ───────────────────────────── */
  $(document).on("keydown", function (e) {
    if (e.key === "Enter") $("#find-now-btn").click();
    if (e.ctrlKey && e.key === "t") { e.preventDefault(); $("#find-current-btn").click(); }
  });

  // Auto-run with current time on load
  setTimeout(function () {
    $("#find-current-btn").click();
    setTimeout(() => $("#find-now-btn").click(), 200);
  }, 600);
});
