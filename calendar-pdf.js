// ============================================================
// Space4Ag Tour — Calendar & PDF Integration Script
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('.schedule-table')) {
    injectCalendarButtons();
  }
  const pdfBtn = document.querySelector('.pdf-btn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', function (e) {
      e.preventDefault();
      buildPrintView();
      document.body.classList.add('pdf-export-mode');
      window.print();
    });
  }
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('pdf-export-mode');
  });
});

function buildPrintView() {
  const root = document.querySelector('main.page-content');
  const container = root.querySelector('#print-view');
  container.innerHTML = ''; // reset on repeat exports

  const title = document.createElement('h1');
  title.textContent = 'Space4Ag Itinerary — August 23–28, 2026';
  container.appendChild(title);

  root.querySelectorAll('.day-block').forEach((block) => {
    const dayLabel = block.querySelector('.day-label')?.textContent.trim() || '';
    const dayName = block.querySelector('h3')?.textContent.trim() || '';
    const intro = block.querySelector('.day-intro')?.textContent.trim() || '';
    const hosts = block.querySelector('.hosts-line')?.textContent.trim() || '';

    const section = document.createElement('section');
    section.className = 'print-day';

    section.innerHTML = `
      <h2>${dayName} <span class="print-date">— ${dayLabel}</span></h2>
      ${intro ? `<p class="print-intro">${intro}</p>` : ''}
    `;

    // Clean table: strip calendar-button spans, keep time + description text only
    const table = block.querySelector('.schedule-table');
    if (table) {
      const cleanTable = document.createElement('table');
      cleanTable.className = 'print-table';
      table.querySelectorAll('tr').forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;
        const time = cells[0].textContent.trim();
        // clone description cell, strip the calendar-add button before reading text
        const descClone = cells[1].cloneNode(true);
        descClone.querySelectorAll('.add-to-calendar-btn').forEach(el => el.remove());
        const desc = descClone.textContent.replace(/\s+/g, ' ').trim();

        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="print-time">${time}</td><td class="print-desc">${desc}</td>`;
        cleanTable.appendChild(tr);
      });
      section.appendChild(cleanTable);
    }

    if (hosts) {
      const p = document.createElement('p');
      p.className = 'print-hosts';
      p.textContent = hosts;
      section.appendChild(p);
    }

    // Pull any fact/info boxes in as plain text blocks, image-free
    block.querySelectorAll('.three-m-box, .ok-facts-box, .cedar-box').forEach((box) => {
      const boxClone = box.cloneNode(true);
      boxClone.querySelectorAll('img').forEach(el => el.remove());
      boxClone.classList.add('print-infobox');
      section.appendChild(boxClone);
    });

    container.appendChild(section);
  });
}

// Dynamically generate and download .ics (iCalendar) file
function downloadICS(title, description, location, startStr, endStr) {
  // Format Date to UTC-like standard: YYYYMMDDTHHMMSS
  // Input: YYYY-MM-DDTHH:MM:SS
  const formatICSDate = (dateStr) => {
    return dateStr.replace(/[-:]/g, '').split('.')[0];
  };

  const start = formatICSDate(startStr);
  const end = formatICSDate(endStr);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Space4Ag Tour//Itinerary Calendar//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Automatically parse page layout to build Calendar sync triggers
function injectCalendarButtons() {
  const dayBlocks = document.querySelectorAll('.day-block');

  dayBlocks.forEach((block) => {
    // Parse date from header or label
    // Example label: "August 24th" or "August 23rd"
    const labelEl = block.querySelector('.day-label');
    if (!labelEl) return;
    const labelText = labelEl.textContent.trim(); // "August 24th"

    // Convert label text to date string parts
    const dayMatch = labelText.match(/(\d+)/);
    if (!dayMatch) return;
    const dayNum = parseInt(dayMatch[1]);
    const month = labelText.toLowerCase().includes('august') ? 8 : 8; // August 2026
    const dateStr = `2026-08-${String(dayNum).padStart(2, '0')}`;

    // Scan each row in the schedule table
    const rows = block.querySelectorAll('.schedule-table tr');
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return;

      const timeText = cells[0].textContent.trim(); // e.g. "8:50–11:00 AM" or "8:00 AM"
      const descText = cells[1].textContent.trim(); // Description text
      const mapLink = cells[1].querySelector('a[href*="maps"]');
      const location = mapLink ? mapLink.textContent.trim() : 'Space4Ag Tour Stop';

      // Parse time components
      const timeParsed = parseTimeRange(timeText, dateStr);
      if (!timeParsed) return;

      // Create add-to-calendar icon button
      const calBtn = document.createElement('a');
      calBtn.href = '#';
      calBtn.className = 'add-to-calendar-btn';
      calBtn.innerHTML = '&#128197;'; // Calendar symbol
      calBtn.title = 'Add this event to your Calendar';
      calBtn.style.marginLeft = '8px';
      calBtn.style.textDecoration = 'none';
      calBtn.style.fontSize = '0.9rem';
      calBtn.style.cursor = 'pointer';

      calBtn.addEventListener('click', (e) => {
        e.preventDefault();
        downloadICS(
          `Space4Ag: ${descText.split('—')[0].split('@')[0].trim()}`,
          descText,
          location,
          timeParsed.start,
          timeParsed.end
        );
      });

      cells[1].appendChild(calBtn);
    });
  });
}

// Helper to parse time strings like "8:50–11:00 AM", "6:15–8:30 PM", "8:00 AM"
function parseTimeRange(timeStr, baseDateStr) {
  // Remove spaces
  const cleanStr = timeStr.replace(/\s+/g, '');

  let startHour = 0, startMin = 0, endHour = 0, endMin = 0;
  let ampm = 'AM';

  // Check for AM/PM at the end
  if (cleanStr.toLowerCase().includes('pm')) {
    ampm = 'PM';
  }

  // Split start/end if range
  const parts = cleanStr.split(/[-–—]/);
  const startPart = parts[0];
  const endPart = parts[1] || null;

  const parseSingleTime = (part, defaultAmpm) => {
    let partAmpm = defaultAmpm;
    if (part.toLowerCase().includes('am')) partAmpm = 'AM';
    if (part.toLowerCase().includes('pm')) partAmpm = 'PM';

    const digits = part.replace(/[a-zA-Z]/g, '');
    const timeSplits = digits.split(':');
    let hr = parseInt(timeSplits[0]);
    let min = timeSplits[1] ? parseInt(timeSplits[1]) : 0;

    if (partAmpm === 'PM' && hr < 12) hr += 12;
    if (partAmpm === 'AM' && hr === 12) hr = 0;

    return { hr, min };
  };

  try {
    const startT = parseSingleTime(startPart, ampm);
    let endT;

    if (endPart) {
      endT = parseSingleTime(endPart, ampm);
    } else {
      // Default to 1 hour duration
      endT = { hr: (startT.hr + 1) % 24, min: startT.min };
    }

    const startISO = `${baseDateStr}T${String(startT.hr).padStart(2, '0')}:${String(startT.min).padStart(2, '0')}:00`;
    const endISO = `${baseDateStr}T${String(endT.hr).padStart(2, '0')}:${String(endT.min).padStart(2, '0')}:00`;

    return { start: startISO, end: endISO };
  } catch (err) {
    console.error('Failed to parse time range:', timeStr, err);
    return null;
  }
}
