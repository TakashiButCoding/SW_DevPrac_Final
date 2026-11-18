"use client";

import { useId } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getMaxRentalReturnDate, getUtcToday } from "@/libs/rentalValidation";

type RentalDates = {
    startDate: string;
    returnDate: string;
};

type RentalDateFieldsProps = RentalDates & {
    onChange: (dates: RentalDates) => void;
};

export default function RentalDateFields({ startDate, returnDate, onChange }: RentalDateFieldsProps) {
    const id = useId();
    const today = getUtcToday();

    function changeStartDate(nextStartDate: string) {
        const maxReturnDate = getMaxRentalReturnDate(nextStartDate);
        const canKeepReturnDate = maxReturnDate && returnDate >= nextStartDate && returnDate <= maxReturnDate;

        onChange({
            startDate: nextStartDate,
            returnDate: canKeepReturnDate ? returnDate : "",
        });
    }

    return (
        <>
            <Field>
                <FieldLabel htmlFor={`${id}-start`}>Start Date</FieldLabel>
                <Input
                    id={`${id}-start`}
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={event => changeStartDate(event.target.value)}
                    required
                />
            </Field>
            <Field>
                <FieldLabel htmlFor={`${id}-return`}>Return Date</FieldLabel>
                <Input
                    id={`${id}-return`}
                    type="date"
                    min={startDate || today}
                    max={getMaxRentalReturnDate(startDate)}
                    value={returnDate}
                    onChange={event => onChange({ startDate, returnDate: event.target.value })}
                    required
                />
            </Field>
        </>
    );
}
