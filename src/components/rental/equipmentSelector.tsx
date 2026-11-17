"use client";

import type { Equipment } from "@/types/equipmentsType";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EquipmentSelectProps {
    equipments: Equipment[];
    value: string;
    onChange: (id: string) => void;
}

export default function EquipmentSelect({
    equipments,
    value,
    onChange,
}: EquipmentSelectProps) {

    const selectedEquipment = equipments.find(
        (equipment) => equipment._id === value
    );

    return (
        <Select value={value} onValueChange={(value) => onChange(value ?? "")}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select equipment">
                    {selectedEquipment?.name}
                </SelectValue>
            </SelectTrigger>

            <SelectContent>
                {equipments
                    .filter(
                        (equipment) =>
                            equipment.isActive && equipment.quantity > 0
                    )
                    .map((equipment) => (
                        <SelectItem
                            key={equipment._id}
                            value={equipment._id}
                        >
                            {equipment.name}
                        </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
