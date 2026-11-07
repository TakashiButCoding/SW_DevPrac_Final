export default async function getEquipments() {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/equipment`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch equipment");
    }

    const data = await response.json();

    return data.data;
}