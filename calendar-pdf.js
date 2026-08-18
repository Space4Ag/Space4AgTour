// ============================================================
// Space4Ag Tour — Calendar & PDF Integration Script
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('.schedule-table')) {
    injectCalendarButtons();
  }
  if (document.querySelector('.locations-group')) {
    injectLocationMapButtons();
  }
  if (document.querySelector('.day-card')) {
    injectAtGlanceMapButtons();
  }
  const pdfBtns = document.querySelectorAll('.pdf-btn');
  pdfBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      buildPrintView();
      document.body.classList.add('pdf-export-mode');
      window.print();
    });
  });
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('pdf-export-mode');
  });
});

function buildPrintView() {
  const root = document.querySelector('main.page-content');
  const container = root.querySelector('#print-view');
  if (!container) return;
  container.innerHTML = ''; // reset on repeat exports

  const title = document.createElement('h1');
  const pageH2 = root.querySelector('.section-header h2')?.textContent.trim();
  title.textContent = pageH2 ? `Space4Ag — ${pageH2}` : 'Space4Ag Tour';
  title.style.fontSize = '20pt';
  title.style.borderBottom = '3px solid #1E3D2F';
  title.style.paddingBottom = '0.1in';
  title.style.marginBottom = '0.3in';
  title.style.textAlign = 'center';
  container.appendChild(title);

  if (root.querySelector('.day-block')) {
    // === DAY BY DAY PAGE ===
    root.querySelectorAll('.day-block').forEach((block) => {
      const dayLabel = block.querySelector('.day-label')?.textContent.trim() || '';
      const dayName = block.querySelector('h3')?.textContent.trim() || '';
      const intro = block.querySelector('.day-intro')?.textContent.trim() || '';
      const hosts = block.querySelector('.hosts-line')?.textContent.trim() || '';

      const section = document.createElement('section');
      section.className = 'print-day';

      section.innerHTML = `
        <h2>${dayName} <span class="print-date">— ${dayLabel}</span></h2>
        ${intro ? `<p class="print-intro" style="font-style: italic; margin-bottom: 0.1in;">${intro}</p>` : ''}
      `;

      const table = block.querySelector('.schedule-table');
      if (table) {
        const cleanTable = document.createElement('table');
        cleanTable.className = 'print-table';

        // Filter only top-level direct rows of the schedule table, ignoring nested speaker-table rows
        const directRows = Array.from(table.querySelectorAll('tr')).filter(tr => !tr.closest('.speaker-schedule-box'));

        directRows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 2) return;
          const time = cells[0].textContent.trim();
          const descClone = cells[1].cloneNode(true);
          
          // Remove action buttons (calendar/map)
          descClone.querySelectorAll('.schedule-desc-actions, .map-btn, .add-to-calendar-btn').forEach(el => el.remove());

          // Handle speaker schedule box inside cell if present
          const speakerBox = descClone.querySelector('.speaker-schedule-box');
          let speakerHTML = '';
          if (speakerBox) {
            const speakerRows = speakerBox.querySelectorAll('.speaker-table tr');
            if (speakerRows.length > 0) {
              speakerHTML = `
                <div class="print-speaker-box" style="margin-top: 0.1in; border-left: 2.5px solid #1E3D2F; padding: 0.06in 0.12in; background: #faf9f6; border-radius: 4px;">
                  <div style="font-weight: bold; font-size: 9.5pt; color: #1E3D2F; margin-bottom: 0.04in; text-transform: uppercase; letter-spacing: 0.06em;">Lunch Presentations &amp; Speaker Schedule</div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; line-height: 1.4;">
              `;
              speakerRows.forEach(sRow => {
                const sCells = sRow.querySelectorAll('td');
                if (sCells.length >= 2) {
                  const sTime = sCells[0].textContent.trim();
                  const sDesc = sCells[1].innerHTML.trim();
                  speakerHTML += `<tr><td style="width: 1.05in; font-weight: bold; color: #1E3D2F; vertical-align: top; padding: 2px 0;">${sTime}</td><td style="vertical-align: top; padding: 2px 0;">${sDesc}</td></tr>`;
                }
              });
              speakerHTML += `</table></div>`;
            }
            speakerBox.remove();
          }

          // Clean main description
          let descText = descClone.innerHTML.trim();
          descText = descText.replace(/&middot;\s*<a[^>]*>map<\/a>/gi, '');
          descText = descText.replace(/·\s*<a[^>]*>map<\/a>/gi, '');
          descText = descText.replace(/\s*·\s*$/, '').trim();

          const tr = document.createElement('tr');
          tr.innerHTML = `<td class="print-time" style="width: 1.5in; font-weight: bold; vertical-align: top;">${time}</td><td class="print-desc" style="vertical-align: top;">${descText}${speakerHTML}</td>`;
          cleanTable.appendChild(tr);
        });
        section.appendChild(cleanTable);
      }

      if (hosts) {
        const p = document.createElement('p');
        p.className = 'print-hosts';
        p.style.fontWeight = 'bold';
        p.style.marginTop = '0.08in';
        p.textContent = hosts;
        section.appendChild(p);
      }

      block.querySelectorAll('.three-m-box, .ok-facts-box, .cedar-box').forEach((box) => {
        const boxClone = box.cloneNode(true);
        boxClone.querySelectorAll('img').forEach(el => el.remove());
        boxClone.classList.add('print-infobox');
        section.appendChild(boxClone);
      });

      container.appendChild(section);
    });
  } 
  else if (root.querySelector('.day-card')) {
    // === ITINERARY AT A GLANCE PAGE ===
    root.querySelectorAll('.day-card').forEach((card) => {
      const dayHeader = card.querySelector('.day-header')?.textContent.trim() || '';

      const section = document.createElement('section');
      section.className = 'print-day';

      section.innerHTML = `
        <h2>${dayHeader}</h2>
      `;

      const table = card.querySelector('table');
      if (table) {
        const cleanTable = document.createElement('table');
        cleanTable.className = 'print-table';
        table.querySelectorAll('tr').forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 2) return;
          const time = cells[0].textContent.trim();
          const descClone = cells[1].cloneNode(true);
          descClone.querySelectorAll('.schedule-desc-actions').forEach(el => el.remove());
          const desc = descClone.textContent.replace(/\s+/g, ' ').trim();

          const tr = document.createElement('tr');
          tr.innerHTML = `<td class="print-time" style="width: 1.5in; font-weight: bold; vertical-align: top;">${time}</td><td class="print-desc" style="vertical-align: top;">${desc}</td>`;
          cleanTable.appendChild(tr);
        });
        section.appendChild(cleanTable);
      }

      container.appendChild(section);
    });
  } 
  else if (root.querySelector('.locations-group')) {
    // === LOCATIONS PAGE ===
    root.querySelectorAll('.locations-group').forEach((group) => {
      const title = group.querySelector('h3')?.textContent.trim() || '';

      const section = document.createElement('section');
      section.className = 'print-locations-group';
      section.style.marginBottom = '0.3in';
      section.style.pageBreakInside = 'avoid';

      const h3 = document.createElement('h3');
      h3.textContent = title;
      h3.style.fontSize = '14pt';
      h3.style.borderBottom = '1.5px solid #1E3D2F';
      h3.style.paddingBottom = '0.04in';
      h3.style.marginBottom = '0.1in';
      h3.style.color = '#1E3D2F';
      h3.style.pageBreakAfter = 'avoid';
      section.appendChild(h3);

      // Handle hotel items if present
      const hotelItems = group.querySelectorAll('.hotel-item');
      if (hotelItems.length > 0) {
        hotelItems.forEach(item => {
          const hName = item.querySelector('.hotel-name')?.textContent.trim() || '';
          const hMeta = item.querySelector('.hotel-meta')?.textContent.replace(/Map/gi, '').replace(/[·•]/g, '').trim() || '';
          const hNote = item.querySelector('.hotel-booking-note')?.textContent.trim() || '';

          const itemDiv = document.createElement('div');
          itemDiv.style.marginBottom = '0.12in';
          itemDiv.style.lineHeight = '1.4';
          itemDiv.innerHTML = `
            <div style="font-weight: bold; color: #1E3D2F;">${hName}</div>
            <div style="font-size: 9.5pt; color: #555;">${hMeta}</div>
            <div style="font-size: 9pt; color: #333; margin-top: 0.02in;">${hNote}</div>
          `;
          section.appendChild(itemDiv);
        });
      }

      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.padding = '0';
      ul.style.margin = '0';

      group.querySelectorAll('li').forEach((li) => {
        const cleanLi = document.createElement('li');
        cleanLi.style.marginBottom = '0.08in';
        cleanLi.style.lineHeight = '1.45';

        const clone = li.cloneNode(true);
        clone.querySelectorAll('.location-item-actions').forEach(el => el.remove());
        clone.querySelectorAll('a').forEach(a => {
          const txt = a.textContent.toLowerCase().trim();
          if (txt === 'book' || txt === 'map') {
            a.remove();
          }
        });

        let text = clone.textContent.replace(/\s+/g, ' ').trim();
        text = text.replace(/^[•\s·]+|[•\s·]+$/g, '').trim();
        text = text.replace(/&amp;/g, '&');
        text = text.replace(/&middot;/g, '·');
        text = text.replace(/·\s*·/g, '·');
        text = text.replace(/\s*·\s*$/, '');
        
        cleanLi.textContent = text;
        ul.appendChild(cleanLi);
      });

      if (group.querySelectorAll('li').length > 0) {
        section.appendChild(ul);
      }
      container.appendChild(section);
    });
  } 
  else if (root.querySelector('.bio-card')) {
    // === BIOS PAGE (NASA TEAM OR HOSTS) ===
    const children = root.children;
    Array.from(children).forEach((child) => {
      if (child.classList.contains('region-label')) {
        const regionHeader = document.createElement('h2');
        regionHeader.textContent = child.textContent.trim();
        regionHeader.style.fontSize = '16pt';
        regionHeader.style.marginTop = '0.3in';
        regionHeader.style.borderBottom = '2.5px solid #c47a00';
        regionHeader.style.paddingBottom = '0.05in';
        regionHeader.style.color = '#c47a00';
        regionHeader.style.pageBreakAfter = 'avoid';
        container.appendChild(regionHeader);
      } else if (child.classList.contains('bio-card')) {
        const name = child.querySelector('h3')?.textContent.trim() || '';
        const role = child.querySelector('.bio-role')?.textContent.trim() || '';

        const bioSection = document.createElement('section');
        bioSection.style.pageBreakInside = 'avoid';
        bioSection.style.marginBottom = '0.25in';

        const nameEl = document.createElement('h3');
        nameEl.textContent = name;
        nameEl.style.fontSize = '14pt';
        nameEl.style.margin = '0.15in 0 0.02in 0';
        nameEl.style.color = '#1E3D2F';
        nameEl.style.pageBreakAfter = 'avoid';
        bioSection.appendChild(nameEl);

        if (role) {
          const roleEl = document.createElement('p');
          roleEl.textContent = role;
          roleEl.style.fontWeight = 'bold';
          roleEl.style.fontSize = '10pt';
          roleEl.style.margin = '0 0 0.08in 0';
          roleEl.style.color = '#555';
          bioSection.appendChild(roleEl);
        }

        child.querySelectorAll('.bio-text p:not(.bio-role)').forEach((p) => {
          const descEl = document.createElement('p');
          descEl.textContent = p.textContent.trim();
          descEl.style.margin = '0 0 0.06in 0';
          descEl.style.lineHeight = '1.45';
          bioSection.appendChild(descEl);
        });

        container.appendChild(bioSection);
      }
    });
  }
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

    // Scan each top-level row in the schedule table (ignore nested speaker-table rows)
    const rows = Array.from(block.querySelectorAll('.schedule-table tr')).filter(tr => !tr.closest('.speaker-schedule-box'));
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

      // Wrap current cell content in a content div
      const wrapper = document.createElement('div');
      wrapper.className = 'schedule-desc-wrapper';

      const content = document.createElement('div');
      content.className = 'schedule-desc-content';
      while (cells[1].firstChild) {
        content.appendChild(cells[1].firstChild);
      }

      // Check if there is a map link and extract URL
      let mapUrl = '';
      if (mapLink) {
        mapUrl = mapLink.getAttribute('href');
      }

      // Remove any trailing "map" links from the description text
      content.querySelectorAll('a').forEach(a => {
        if (a.textContent.trim().toLowerCase() === 'map') {
          let prevNode = a.previousSibling;
          if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
            prevNode.textContent = prevNode.textContent.replace(/[\s·•&middot;]+$/, '');
          }
          a.remove();
        }
      });

      // Actions container
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'schedule-desc-actions';

      // Create map button if URL exists
      if (mapUrl) {
        const mapBtn = document.createElement('a');
        mapBtn.href = mapUrl;
        mapBtn.target = '_blank';
        mapBtn.rel = 'noopener';
        mapBtn.className = 'map-btn';
        mapBtn.title = 'View location on Google Maps';
        mapBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        `;
        actionsContainer.appendChild(mapBtn);
      }

      // Create add-to-calendar icon button
      const calBtn = document.createElement('a');
      calBtn.href = '#';
      calBtn.className = 'add-to-calendar-btn';
      calBtn.title = 'Add this event to your calendar';
      calBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      `;

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
      actionsContainer.appendChild(calBtn);

      wrapper.appendChild(content);
      wrapper.appendChild(actionsContainer);
      cells[1].appendChild(wrapper);
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

// Automatically parse locations page list items and inject map buttons on the right
function injectLocationMapButtons() {
  const groups = document.querySelectorAll('.locations-group');
  groups.forEach(group => {
    const listItems = group.querySelectorAll('ul li');
    listItems.forEach(li => {
      // Find maps link
      const mapLink = li.querySelector('a[href*="maps"]');
      if (!mapLink) return;

      const mapUrl = mapLink.getAttribute('href');
      
      // Find book link if present
      const bookLink = li.querySelector('.book-btn');

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'location-item-wrapper';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'space-between';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '0.75rem';
      wrapper.style.width = '100%';

      const content = document.createElement('div');
      content.className = 'location-item-content';
      content.style.flexGrow = '1';

      // Move children of li to content
      while (li.firstChild) {
        content.appendChild(li.firstChild);
      }

      // Extract the book link from inline text
      const inlineBookBtn = content.querySelector('.book-btn');
      if (inlineBookBtn) {
        inlineBookBtn.remove();
      }

      // Actions container
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'location-item-actions';

      // Append Book button if it exists
      if (bookLink) {
        const cleanBookBtn = document.createElement('a');
        cleanBookBtn.href = bookLink.getAttribute('href');
        cleanBookBtn.target = '_blank';
        cleanBookBtn.rel = 'noopener';
        cleanBookBtn.className = 'book-btn';
        cleanBookBtn.textContent = 'Book';
        actionsContainer.appendChild(cleanBookBtn);
      }

      // Create map button
      const mapBtn = document.createElement('a');
      mapBtn.href = mapUrl;
      mapBtn.target = '_blank';
      mapBtn.rel = 'noopener';
      mapBtn.className = 'map-btn';
      mapBtn.title = 'View location on Google Maps';
      mapBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      `;
      actionsContainer.appendChild(mapBtn);

      // Clean up any trailing middots or separators in content
      let textHTML = content.innerHTML;
      textHTML = textHTML.replace(/&middot;\s*$/, '');
      textHTML = textHTML.replace(/·\s*$/, '');
      content.innerHTML = textHTML.trim();

      wrapper.appendChild(content);
      wrapper.appendChild(actionsContainer);
      li.appendChild(wrapper);
    });
  });
}

// Automatically parse At a Glance page schedule table rows and inject map buttons on the right
function injectAtGlanceMapButtons() {
  const cards = document.querySelectorAll('.day-card');
  cards.forEach(card => {
    const rows = card.querySelectorAll('table tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return;

      // Find maps link
      const mapLink = cells[1].querySelector('a[href*="maps"]');
      if (!mapLink) return;

      const mapUrl = mapLink.getAttribute('href');

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'schedule-desc-wrapper';

      const content = document.createElement('div');
      content.className = 'schedule-desc-content';
      while (cells[1].firstChild) {
        content.appendChild(cells[1].firstChild);
      }

      // Actions container
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'schedule-desc-actions';

      // Create map button
      const mapBtn = document.createElement('a');
      mapBtn.href = mapUrl;
      mapBtn.target = '_blank';
      mapBtn.rel = 'noopener';
      mapBtn.className = 'map-btn';
      mapBtn.title = 'View location on Google Maps';
      mapBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      `;
      actionsContainer.appendChild(mapBtn);

      wrapper.appendChild(content);
      wrapper.appendChild(actionsContainer);
      cells[1].appendChild(wrapper);
    });
  });
}
