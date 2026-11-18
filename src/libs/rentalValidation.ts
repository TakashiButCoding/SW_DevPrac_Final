import type { Equipment } from "@/types/equipmentsType";

export const MAX_RENTAL_DAYS = 7;
const MAX_RENTAL_QUANTITY = 3;

export function getUtcToday() {
    return new Date().toISOString().slice(0, 10);
}

function parseCalendarDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

    const date = new Date(`${value}T00:00:00.000Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        return undefined;
    }
    return date;
}

export function getMaxRentalReturnDate(startDate: string) {
    const date = parseCalendarDate(startDate);
    if (!date) return undefined;

    date.setUTCDate(date.getUTCDate() + MAX_RENTAL_DAYS);
    return date.getUTCFullYear() > 9999 ? "9999-12-31" : date.toISOString().slice(0, 10);
}

export function validateRentalDates(startDate: string, returnDate: string, today = getUtcToday()) {
    if (!startDate || !returnDate) return "Please select start and return dates.";

    const maxReturnDate = getMaxRentalReturnDate(startDate);
    if (!maxReturnDate || !parseCalendarDate(returnDate)) return "Invalid rental dates.";
    if (startDate < today) return "Start date cannot be before today.";
    if (returnDate < startDate) return "Return date cannot be before start date.";
    if (returnDate > maxReturnDate) return `Rental duration cannot exceed ${MAX_RENTAL_DAYS} days.`;

    return undefined;
}

export function getMaxRentalQuantity(equipment?: Equipment) {
    return Math.min(MAX_RENTAL_QUANTITY, equipment?.quantity ?? MAX_RENTAL_QUANTITY);
}

export function isValidRentalQuantity(quantity: number, equipment?: Equipment) {
    return Boolean(equipment?.isActive) && Number.isInteger(quantity) &&
        quantity >= 1 && quantity <= getMaxRentalQuantity(equipment);
}
