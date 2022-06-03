function getPururinInfo(value: string) {
  return value.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();
}

function getPururinPageCount(value: string) {
  const data = value.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim().split(", ").pop();
  return Number(data?.split(" ")[0]);
}

function getUrl(url: string) {
  return url.replace(/^\/\//, "https://");
}

function getId(url: string) {
  return url.replace(/^https?:\/\/[^\\/]+/, "").replace(/\/$/, "");
}

function getDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(input: Date) {
  const date = new Date(input);
  const formatter: any = new Intl.RelativeTimeFormat("en");
  const ranges: { [key: string]: number } = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (const key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.round(delta), key);
    }
  }
}



export { getPururinInfo, getPururinPageCount, getUrl, getId, getDate, timeAgo };