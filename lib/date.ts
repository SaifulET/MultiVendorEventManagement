const padDatePart = (value: number) => String(value).padStart(2, '0');

const parseDateValue = (value: Date | string) => {
  if (value instanceof Date) {
    return value;
  }

  const trimmedValue = value.trim();
  const dateOnlyMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(trimmedValue);
};

export const formatDateDDMMYY = (
  value?: Date | string | null,
  fallback = ''
) => {
  if (!value) {
    return fallback;
  }

  const parsed = parseDateValue(value);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return `${padDatePart(parsed.getDate())}/${padDatePart(parsed.getMonth() + 1)}/${String(
    parsed.getFullYear()
  ).slice(-2)}`;
};
