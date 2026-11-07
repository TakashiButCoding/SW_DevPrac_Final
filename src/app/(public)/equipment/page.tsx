import getEquipments from "@/libs/getEquipments";
import { Equipment } from "@/types/equipmentsType";
import Link from "next/link";
export default async function EquipmentPage() {
    const equipments = await getEquipments();

    console.log(equipments);

    return (
        <div className="max-w-7xl mx-auto my-10">
            <h1 className="text-4xl font-medium">
                Equipments
            </h1>

            <div>
                Sort
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {equipments.map((equipment:Equipment) => (
                    <Link href={`/equipment/${equipment._id}`} key={equipment._id}>    
                        <div
                            key={equipment._id}
                            className="bg-white rounded-xl border p-6"
                        >
                            <h2 className="text-xl font-semibold">
                                {equipment.name}
                            </h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}