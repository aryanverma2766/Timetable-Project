import json
import re
from pathlib import Path

md_path = Path(r'c:\Users\JARVIS\Downloads\13_july_Section_Wise_STRUCTURED.md')
js_path = Path(r'e:\SEM2\CU WEB DESIGN\WEB PROJECT\timetable\timetable.js')
md_text = md_path.read_text(encoding='utf-8')
js_text = js_path.read_text(encoding='utf-8')

sections = []
current_section = None
for line in md_text.splitlines():
    if line.startswith('### '):
        current_section = line[4:].strip()
        sections.append((current_section, []))
        continue
    if current_section is None or not line.startswith('|'):
        continue
    cells = [c.strip() for c in line.strip().split('|')[1:-1]]
    if len(cells) < 8:
        continue
    if cells[0].lower() == 'day':
        continue
    if re.fullmatch(r'[-: ]+', cells[0]):
        continue
    if cells[0] not in {'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'}:
        continue

    day_map = {'Monday': 'Mo', 'Tuesday': 'Tu', 'Wednesday': 'We', 'Thursday': 'Th', 'Friday': 'Fr'}
    day = day_map[cells[0]]
    slot = int(cells[1])
    subject = cells[4]
    room = cells[6]

    normalized_room = room.replace('Lecture Hall-', 'Lecture-hall-')
    normalized_room = normalized_room.replace('Software Lab-', 'S/W-Lab-')
    normalized_room = normalized_room.replace('Soft skill-Lab-', 'Soft-skill-Lab-')
    normalized_room = normalized_room.replace('UI-UX-Lab-', 'UI/UX-Lab-')
    normalized_room = normalized_room.replace('Hardware Lab-', 'H/W-Lab-')
    normalized_room = normalized_room.replace('AR-VR-Lab-', 'AR-VR-Lab-')
    normalized_room = normalized_room.replace('Physics Lab-', 'Physics Lab-')
    normalized_room = normalized_room.replace('-E2-Block', '_E2')
    normalized_room = normalized_room.replace('-Block', '')
    normalized_room = normalized_room.replace(' ', '')
    normalized_room = normalized_room.replace('LectureHall', 'Lecture-hall')
    normalized_room = normalized_room.replace('Lecturehall', 'Lecture-hall')

    sections[-1][1].append((current_section, day, slot, normalized_room, subject))

lines = []
lines.append('// RAW occupancy data: [section, day, slot, roomString, subject]')
lines.append('// Extracted from the 13 July 2026 section-wise timetable')
lines.append('const RAW_SCHEDULE = [')
for section, entries in sections:
    lines.append(f'  // ===== {section} =====')
    for sec, day, slot, room, subject in entries:
        lines.append(f'  [{json.dumps(sec)},{json.dumps(day)},{slot},{json.dumps(room)},{json.dumps(subject)}],')
    lines.append('')
lines.append('];')
replacement = '\n'.join(lines)
pattern = re.compile(r"// RAW occupancy data: \[section, day, slot, roomString, subject\].*?// Build structured schedule: \{ \"Mo-1\": Set of occupied rooms \}", re.S)
new_js = pattern.sub(replacement + '\n\n// Build structured schedule: { "Mo-1": Set of occupied rooms }', js_text, count=1)
js_path.write_text(new_js, encoding='utf-8')
print('updated', js_path)
