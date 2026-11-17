import type { Equipment } from "@/types/equipmentsType";
export default async function getEquipments(): Promise<Equipment[]> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/equipment`,
            {
                method: "GET",
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch equipment");
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error("Failed to fetch equipment:", error);
        return [];
    }
}