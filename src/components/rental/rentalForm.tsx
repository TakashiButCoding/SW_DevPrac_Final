"use client";

import { useState } from "react";
import sendRentalData from "@/libs/sendRentalData";

import EquipmentSelect from "./equipmentSelector";
import type { Equipment } from "@/types/equipmentsType";

import { getMaxRentalQuantity, isValidRentalQuantity, validateRentalDates } from "@/libs/rentalValidation";
import RentalDateFields from "./rentalDateFields";
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
    const [{ startDate, returnDate }, setDates] = useState({ startDate: "", returnDate: "" });

    const selectedEquipment = equipments.find(
        (equipment) => equipment._id === equipmentId
    );

    const maxQuantity = getMaxRentalQuantity(selectedEquipment);

    function validateRental(): boolean {
        if (!selectedEquipment?.isActive) {
            toast.error("Please select valid equipment.");
            return false;
        }

        if (!isValidRentalQuantity(quantity, selectedEquipment)) {
            toast.error("Invalid quantity. Maximum 3 or available stock.");
            return false;
        }

        const dateError = validateRentalDates(startDate, returnDate);
        if (dateError) {
            toast.error(dateError);
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
                    <RentalDateFields
                        startDate={startDate}
                        returnDate={returnDate}
                        onChange={setDates}
                    />
                    <Button type="submit" disabled={isSubmitting || !equipmentId || quantity <= 0 || !startDate || !returnDate} className="w-full">
                        {isSubmitting ? "Submitting..." : "Submit Rental Request"}
                    </Button>
                </FieldGroup>
            </FieldSet>
        </form>
    );
}
