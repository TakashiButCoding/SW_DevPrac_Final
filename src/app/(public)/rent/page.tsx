import RentPageContent from "@/components/rental/rentPageContent";
import getEquipments from "@/libs/getEquipments";

export default async function RentPage() {
    const equipments = await getEquipments();

    return <RentPageContent equipments={equipments} />;
}