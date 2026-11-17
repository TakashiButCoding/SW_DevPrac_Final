export interface RentalRequest {
    equipmentId: string;
    quantity: number;
    startDate: string;
    returnDate: string;
}

export default async function sendRentalData(
    rentalData: RentalRequest
) {
    const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(rentalData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error || "Failed to create rental request"
        );
    }

    return result.data;
}