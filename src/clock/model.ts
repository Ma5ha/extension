export function dayOverview(date: Date) {
  const year = date.getFullYear();
  const localDay = Date.UTC(year, date.getMonth(), date.getDate());
  const start = Date.UTC(year, 0, 1);
  const day = Math.floor((localDay - start) / 86_400_000) + 1;
  const total = (Date.UTC(year + 1, 0, 1) - start) / 86_400_000;
  const thursday = new Date(localDay);
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const week = Math.ceil(((thursday.getTime() - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 86_400_000 + 1) / 7);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  return { year, day, total, week, weekend, untilSaturday: (6 - date.getDay() + 7) % 7 };
}
