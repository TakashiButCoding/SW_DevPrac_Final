import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request });
    if (!token?.accessToken) {
        return NextResponse.json({ error: "Please sign in to submit a rental request" }, { status: 401 });
    }

    let rentalData;
    try {
        rentalData = await request.json();
        if (!rentalData || typeof rentalData !== "object" || Array.isArray(rentalData)) {
            throw new Error("Invalid rental data");
        }
    } catch {
        return NextResponse.json({ error: "Invalid rental data" }, { status: 400 });
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rentals`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.accessToken}`,
            },
            body: JSON.stringify({
                equipment: rentalData.equipmentId,
                quantity: rentalData.quantity,
                startDate: rentalData.startDate,
                returnDate: rentalData.returnDate,
            }),
        });
        const result = await response.json();
        return NextResponse.json(result, { status: response.status });
    } catch {
        return NextResponse.json({ error: "Unable to reach the rental service" }, { status: 502 });
    }
}

export { proxyRental as GET } from "@/libs/proxyRentalGet";
