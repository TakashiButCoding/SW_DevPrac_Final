"use client";

import { useState } from "react";
import type { Equipment } from "@/types/equipmentsType";
import { useRouter } from "next/navigation";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";


export default function EquipmentList({equipments}: {equipments: Equipment[]}) {
    const router = useRouter();
    const [category, setCategory] = useState("all");

    const categories = [
        "all",
        ...new Set(equipments.map((equipment) => equipment.category)),
    ];

    const filteredEquipments = category === "all" ? equipments : equipments.filter((equipment) => equipment.category === category);
    return(
        
        <div>
            <div className="mt-6">
                Sort
                <div className="mt-2 flex justify-between">
                    <div>

                        {
                            categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                                        category === cat
                                            ? "bg-primary text-white"
                                            : "bg-gray-200 text-mute"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))
                        }
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            className="bg-primary text-white px-12 py-2 rounded-full hover:bg-primary/80 hover:cursor-pointer"
                            onClick={() => router.push("/rent")}
                        >
                            Rent!
                        </button>
                    </div>
                </div>
            </div>
            <div className="card mt-2 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary">
                            <TableHead className="text-white">Name</TableHead>
                            <TableHead className="text-white">Category</TableHead>
                            <TableHead className="text-white">Description</TableHead>
                            <TableHead className="text-white">Quantity</TableHead>
                            <TableHead className="text-white">Rental Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            filteredEquipments.map((equipment) => (
                                <TableRow key={equipment._id} className="hover:bg-white" >
                                    <TableCell >{equipment.name}</TableCell>
                                    <TableCell >{equipment.category}</TableCell>
                                    <TableCell >{equipment.description}</TableCell>
                                    <TableCell >{equipment.quantity}</TableCell>
                                    <TableCell >{equipment.rentalRate}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}