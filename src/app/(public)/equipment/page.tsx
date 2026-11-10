import EquipmentList from "@/components/equipment/equipmentList";
import getEquipments from "@/libs/getEquipments";

export default async function EquipmentPage() {
    const equipments = await getEquipments();
        
    return (
        <div className="max-w-7xl mx-auto my-10">
            <h1 className="text-4xl font-medium">
                Equipments
            </h1>

            <EquipmentList equipments={equipments} />
            
        </div>
    );
}