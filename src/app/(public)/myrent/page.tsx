import MyRentals from "@/components/rental/myRentals";
import getEquipments from "@/libs/getEquipments";
export default async function MyRentalPage() {
    return <MyRentals equipments={await getEquipments()} />;
}
