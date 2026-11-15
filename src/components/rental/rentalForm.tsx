"use client";

import { useState } from "react";

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

interface RentalFormProps {
  equipments: Equipment[];
  initialEquipmentId?: string;
}

export default function RentalForm({
  equipments,
  initialEquipmentId = "",
}: RentalFormProps) {
  const [equipmentId, setEquipmentId] = useState(initialEquipmentId);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const selectedEquipment = equipments.find(
    (equipment) => equipment._id === equipmentId
  );

  const maxQuantity = Math.min(selectedEquipment?.quantity ?? 3, 3);
  const today = new Date().toLocaleDateString("en-CA");
  return (
    <form className="space-y-6">
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
                <Button type="submit" disabled={!equipmentId} className="w-full">
                    Submit Rental Request
                </Button>
            </FieldGroup>
        </FieldSet>
    </form>
  );
}