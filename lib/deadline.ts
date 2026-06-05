// lib/deadline.ts
// დედლაინის ლოგიკა: ყოველი თვის 20 რიცხვი, 23:59

export function getDeadline(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 20, 23, 59, 59);
}

export function isPortalLocked(): boolean {
  return new Date() > getDeadline();
}

export function getTimeRemaining(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const total = getDeadline().getTime() - new Date().getTime();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    expired: false,
  };
}

// მიმდინარე თვის დასაწყისი (HR ფილტრისთვის)
export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
}