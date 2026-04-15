export type BookingSlotStatus = "available" | "booked" | "blocked";

export interface BookingAvailabilityEntry {
  blockedHours?: number[];
  bookedHours?: number[];
}

export interface BookingMeta {
  currentMonth: string;
  currency?: string;
  durationMode?: string;
  maxHour: number;
  maximumGuests?: number;
  minHour: number;
  nextMonth: string;
  requiresGuestCount?: boolean;
}

export interface BookingCalendarDay {
  date: Date | null;
  day?: number;
  isoDate: string | null;
  isPast: boolean;
  isSelectable: boolean;
  status: BookingSlotStatus;
}

export interface BookingHourSlot {
  hour: number;
  isSelectable: boolean;
  label: string;
  status: BookingSlotStatus;
}

const padBookingPart = (value: number) => String(value).padStart(2, "0");

export const formatBookingDate = (date: Date | null) => {
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${padBookingPart(date.getMonth() + 1)}-${padBookingPart(
    date.getDate()
  )}`;
};

export const parseMonthKey = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, year, month] = match;
  return new Date(Number(year), Number(month) - 1, 1);
};

export const formatMonthLabel = (date: Date | null) => {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export const formatCurrencyAmount = (
  amount?: number | null,
  currency = "BDT",
  fallback = "Price not listed"
) => {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return fallback;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

export const formatHourLabel = (hour: number) => {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const period = normalizedHour >= 12 ? "PM" : "AM";
  const hour12 = normalizedHour % 12 === 0 ? 12 : normalizedHour % 12;
  return `${hour12}:00 ${period}`;
};

export const formatHourRange = (hours: number[]) => {
  if (!hours.length) {
    return "";
  }

  const sortedHours = [...hours].sort((a, b) => a - b);
  const ranges: Array<{ start: number; end: number }> = [];

  let rangeStart = sortedHours[0];
  let previousHour = sortedHours[0];

  for (let index = 1; index < sortedHours.length; index += 1) {
    const currentHour = sortedHours[index];

    if (currentHour === previousHour + 1) {
      previousHour = currentHour;
      continue;
    }

    ranges.push({ start: rangeStart, end: previousHour + 1 });
    rangeStart = currentHour;
    previousHour = currentHour;
  }

  ranges.push({ start: rangeStart, end: previousHour + 1 });

  return ranges
    .map((range) =>
      range.end === range.start + 1
        ? formatHourLabel(range.start)
        : `${formatHourLabel(range.start)} - ${formatHourLabel(range.end)}`
    )
    .join(', ');
};

const normalizeHours = (hours?: number[]) =>
  Array.from(new Set((hours ?? []).filter((hour) => Number.isInteger(hour)))).sort((a, b) => a - b);

export const getDateAvailabilityEntry = (
  availability: Record<string, BookingAvailabilityEntry> | undefined,
  isoDate: string
) => {
  const entry = availability?.[isoDate];
  return {
    blockedHours: normalizeHours(entry?.blockedHours),
    bookedHours: normalizeHours(entry?.bookedHours),
  };
};

export const getAvailableHoursForDate = (
  isoDate: string,
  meta: Pick<BookingMeta, "minHour" | "maxHour">,
  availability?: Record<string, BookingAvailabilityEntry>
) => {
  const { blockedHours, bookedHours } = getDateAvailabilityEntry(availability, isoDate);
  const unavailableHours = new Set([...blockedHours, ...bookedHours]);
  const availableHours: number[] = [];

  for (let hour = meta.minHour; hour <= meta.maxHour; hour += 1) {
    if (!unavailableHours.has(hour)) {
      availableHours.push(hour);
    }
  }

  return availableHours;
};

const getDateStatus = (
  isoDate: string,
  meta: Pick<BookingMeta, "minHour" | "maxHour">,
  availability?: Record<string, BookingAvailabilityEntry>
): BookingSlotStatus => {
  const { blockedHours, bookedHours } = getDateAvailabilityEntry(availability, isoDate);
  const availableHours = getAvailableHoursForDate(isoDate, meta, availability);

  if (bookedHours.length > 0) {
    return "booked";
  }

  if (blockedHours.length > 0 && availableHours.length === 0) {
    return "blocked";
  }

  if (blockedHours.length > 0) {
    return "blocked";
  }

  return "available";
};

export const getCalendarDays = (
  month: Date,
  meta: Pick<BookingMeta, "minHour" | "maxHour">,
  availability?: Record<string, BookingAvailabilityEntry>
): BookingCalendarDay[] => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: BookingCalendarDay[] = [];

  for (let i = 0; i < startingDayOfWeek; i += 1) {
    days.push({
      date: null,
      isoDate: null,
      isPast: false,
      isSelectable: false,
      status: "available",
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, monthIndex, day);
    const isoDate = formatBookingDate(date);

    if (!isoDate) {
      continue;
    }

    const availableHours = getAvailableHoursForDate(isoDate, meta, availability);
    const isPastDate = date < todayStart;
    days.push({
      date,
      day,
      isoDate,
      isPast: isPastDate,
      isSelectable: !isPastDate && availableHours.length > 0,
      status: getDateStatus(isoDate, meta, availability),
    });
  }

  return days;
};

export const getHourSlots = (
  isoDate: string | null,
  meta: Pick<BookingMeta, "minHour" | "maxHour">,
  availability?: Record<string, BookingAvailabilityEntry>
): BookingHourSlot[] => {
  if (!isoDate) {
    return [];
  }

  const { blockedHours, bookedHours } = getDateAvailabilityEntry(availability, isoDate);
  const blockedSet = new Set(blockedHours);
  const bookedSet = new Set(bookedHours);
  const slots: BookingHourSlot[] = [];

  for (let hour = meta.minHour; hour <= meta.maxHour; hour += 1) {
    let status: BookingSlotStatus = "available";

    if (bookedSet.has(hour)) {
      status = "booked";
    } else if (blockedSet.has(hour)) {
      status = "blocked";
    }

    slots.push({
      hour,
      isSelectable: status === "available",
      label: formatHourLabel(hour),
      status,
    });
  }

  return slots;
};

export const buildNextSelectedHours = (
  currentSelection: number[],
  clickedHour: number,
  selectableHours: number[]
) => {
  const selectableSet = new Set(selectableHours);
  if (!selectableSet.has(clickedHour)) {
    return {
      error: "This hour is not available for booking.",
      hours: currentSelection,
    };
  }

  const sortedSelection = [...currentSelection].sort((a, b) => a - b);

  if (sortedSelection.includes(clickedHour)) {
    if (sortedSelection.length === 1) {
      return { hours: [] };
    }

    if (clickedHour === sortedSelection[0]) {
      return { hours: sortedSelection.slice(1) };
    }

    if (clickedHour === sortedSelection[sortedSelection.length - 1]) {
      return { hours: sortedSelection.slice(0, -1) };
    }

    return { hours: [clickedHour] };
  }

  const nextSelection = [...sortedSelection, clickedHour].sort((a, b) => a - b);
  if (!nextSelection.every((hour) => selectableSet.has(hour))) {
    return {
      error: "Only available hours can be selected.",
      hours: currentSelection,
    };
  }

  return { hours: nextSelection };
};

export const findFirstSelectableDate = (
  months: Date[],
  meta: Pick<BookingMeta, "minHour" | "maxHour">,
  availability?: Record<string, BookingAvailabilityEntry>
) => {
  for (const month of months) {
    const days = getCalendarDays(month, meta, availability);
    const firstSelectableDay = days.find((day) => day.date && day.isSelectable)?.date ?? null;
    if (firstSelectableDay) {
      return firstSelectableDay;
    }
  }

  return null;
};
