"use client";

import { useState } from "react";
import sendRentalData from "@/libs/sendRentalData";

import EquipmentSelect from "./equipmentSelector";
import type { Equipment } from "@/types/equipmentsType";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
Field,
FieldGroup,
FieldLabel,
FieldSet,
} from "@/components/ui/field";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "../ui/select";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface RentalFormProps {
equipments: Equipment[];
initialEquipmentId?: string;
}

export default function RentalForm({
    equipments,
    initialEquipmentId = "",
    }: RentalFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [equipmentId, setEquipmentId] = useState(initialEquipmentId);
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [returnDate, setReturnDate] = useState("");

    const selectedEquipment = equipments.find(
        (equipment) => equipment._id === equipmentId
    );

    const maxQuantity = Math.min(selectedEquipment?.quantity ?? 3, 3);
    const today = new Date().toLocaleDateString("en-CA");

    function validateRental(): boolean {
        // 1. Equipment validation
        if (!selectedEquipment || !selectedEquipment.isActive) {
            toast.error("Please select valid equipment.");
            return false;
        }

        // 2. Quantity validation
        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 3 ||
            quantity > selectedEquipment.quantity
        ) {
            toast.error("Invalid quantity. Maximum 3 or available stock.");
            return false;
        }

        // 3. Required dates
        if (!startDate || !returnDate) {
            toast.error("Please select start and return dates.");
            return false;
        }

        // 4. Start date must not be in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${returnDate}T00:00:00`);

        if (
            !Number.isFinite(start.getTime()) ||
            !Number.isFinite(end.getTime())
        ) {
            toast.error("Invalid rental dates.");
            return false;
        }

        if (start < today) {
            toast.error("Start date cannot be before today.");
            return false;
        }

        // 5. Return date must not be before start date
        if (end < start) {
            toast.error("Return date cannot be before start date.");
            return false;
        }

        // 6. Maximum rental duration: 7 calendar days
        const duration = (
            Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
            Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
        ) / 86400000;

        if (duration > 7) {
            toast.error("Rental duration cannot exceed 7 days.");
            return false;
        }

        return true;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isSubmitting || !validateRental()) {
            return;
        }

        const rentalData = {
            equipmentId,
            quantity,
            startDate,
            returnDate,
        };

        setIsSubmitting(true);
        try {
            await sendRentalData(rentalData);
            toast.success("Rental request submitted successfully.");
            router.push("/myrent");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create rental request");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">            
            <FieldSet>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Equipment</FieldLabel>
                        <EquipmentSelect
                        equipments={equipments}
                        value={equipmentId}
                        onChange={setEquipmentId}
                        />
                    </Field>
                    <Field>
                        <FieldLabel>Quantity</FieldLabel>

                        <Select
                            value={String(quantity)}
                            onValueChange={(value) => setQuantity(Number(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select quantity" />
                            </SelectTrigger>

                            <SelectContent>
                                {Array.from(
                                    { length: maxQuantity },
                                    (_, i) => i + 1
                                ).map((value) => (
                                    <SelectItem key={value} value={String(value)}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
                        <Input
                            id="startDate"
                            type="date"
                            min={today}
                            value={startDate}
                            onChange={(e) => {
                                const newStartDate = e.target.value;

                                setStartDate(newStartDate);

                                // Reset return date if it becomes invalid
                                if (returnDate) {
                                    const start = new Date(`${newStartDate}T00:00:00`);
                                    const end = new Date(`${returnDate}T00:00:00`);

                                    const duration =
                                        (end.getTime() - start.getTime()) / 86400000;

                                    if (
                                        !newStartDate ||
                                        duration < 0 ||
                                        duration > 7
                                    ) {
                                        setReturnDate("");
                                    }
                                }
                            }}
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="returnDate">Return Date</FieldLabel>
                        <Input
                            id="returnDate"
                            type="date"
                            min={startDate || today}
                            max={
                                startDate
                                    ? (() => {
                                        const date = new Date(`${startDate}T00:00:00`);
                                        date.setDate(date.getDate() + 7);
                                        return [
                                            date.getFullYear(),
                                            String(date.getMonth() + 1).padStart(2, "0"),
                                            String(date.getDate()).padStart(2, "0"),
                                        ].join("-");
                                    })()
                                    : undefined
                            }
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            required
                        />
                    </Field>
                    <Button type="submit" disabled={isSubmitting || !equipmentId || quantity <= 0 || !startDate || !returnDate} className="w-full">
                        {isSubmitting ? "Submitting..." : "Submit Rental Request"}
                    </Button>
                </FieldGroup>
            </FieldSet>
        </form>
    );
}