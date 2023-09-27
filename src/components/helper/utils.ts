export const MS_IN_DAY = 86_400_000;

export function getWeekNumber(date: Date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(
  ((date.getTime() - onejan.getTime()) / MS_IN_DAY + onejan.getDay() - 1) / 7
  );
  return week;
}

export function getDayOfWeek(date: Date) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  return daysOfWeek[date.getDay()];
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  return date.toLocaleDateString("de-DE", options);
}

export function formatTime(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit"
  };
  return date.toLocaleTimeString("de-DE", options);
}

export const formatStringDate = (date: Date) => {
  let dd = date.getDate();
  let mm = date.getMonth() + 1;
  let yyyy = date.getFullYear();
  let hh = date.getHours();
  let mms = date.getMinutes();

  const day = (dd < 10 ? '0' : '') + dd;
  console.log('day', day);

  const month = (mm < 10 ? '0' : '') + mm;
  console.log('month', month);

  const hours = (hh < 10 ? '0' : '') + hh;
  console.log('hours', hours);

  const minutes = (mms < 10 ? '0' : '') + mms;
  console.log('minutes', mms);

  return day + '.' + month + '.' + yyyy + ' ' + hours + '' + ':' + minutes;
};
