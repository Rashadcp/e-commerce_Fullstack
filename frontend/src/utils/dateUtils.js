// Lightweight date utilities: parse common formats and format safely
export function parseDate(dateStr) {
  if (!dateStr) return null;
  // try direct parse (ISO and common browser-parseable formats)
  const tryDirect = new Date(dateStr);
  if (!isNaN(tryDirect.getTime())) return tryDirect;

  // Match patterns like: 15/10/2025, 12:23:54 pm
  const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2}):(\d{2})\s*(am|pm)?$/i);
  if (m) {
    let [, day, month, year, hh, mm, ss, ampm] = m;
    day = parseInt(day, 10);
    month = parseInt(month, 10) - 1; // JS months 0-11
    year = parseInt(year, 10);
    hh = parseInt(hh, 10);
    mm = parseInt(mm, 10);
    ss = parseInt(ss, 10);
    if (ampm) {
      if (/pm/i.test(ampm) && hh < 12) hh += 12;
      if (/am/i.test(ampm) && hh === 12) hh = 0;
    }
    const d = new Date(year, month, day, hh, mm, ss);
    if (!isNaN(d.getTime())) return d;
  }

  // fallback: try replacing slashes with dashes and removing am/pm
  const alt = dateStr.replace(/\//g, '-').replace(/,?\s*(am|pm)/i, '');
  const tryAlt = new Date(alt);
  if (!isNaN(tryAlt.getTime())) return tryAlt;

  return null;
}

export function formatDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '-';
  return d.toLocaleString();
}
