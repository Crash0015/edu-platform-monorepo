export const parseDurationToSeconds = (value: string, fallbackSeconds: number) => {
  if (!value) {
    return fallbackSeconds;
  }

  const trimmed = value.trim();
  const match = /^(\d+)([smhd])$/i.exec(trimmed);
  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  return amount * (multipliers[unit] ?? fallbackSeconds);
};
