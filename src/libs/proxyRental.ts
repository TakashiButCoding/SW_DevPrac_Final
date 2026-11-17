import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxyRental(request: NextRequest, id?: string) {
    const token = await getToken({ req: request });
    if (!token?.accessToken) return NextResponse.json({ error: "Please sign in to manage rentals" }, { status: 401 });
    if (id && !/^[a-fA-F0-9]{24}$/.test(id)) return NextResponse.json({ error: "Invalid rental ID" }, { status: 400 });
    let body;
    if (request.method === "PUT") {
        try {
            const data = await request.json();
            if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
            body = JSON.stringify({ equipment: data.equipment, quantity: data.quantity, startDate: data.startDate, returnDate: data.returnDate });
        } catch {
            return NextResponse.json({ error: "Invalid rental data" }, { status: 400 });
        }
    }
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rentals${id ? '/' + id : ''}`, {
            method: request.method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.accessToken}` },
            body,
            cache: "no-store",
        });
        return NextResponse.json(await response.json(), { status: response.status });
    } catch {
        return NextResponse.json({ error: "Unable to reach the rental service" }, { status: 502 });
    }
}
