export const parseDate = (value: string | Date | undefined) => {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date(value);
};

export const isTimeOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
) => startA < endB && startB < endA;

