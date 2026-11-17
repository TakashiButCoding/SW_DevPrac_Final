import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxyEquipment(request: NextRequest, id?: string) {
    const token = await getToken({ req: request });
    if (!token?.accessToken) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    if (token.role !== "admin") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
    if (id && !/^[a-fA-F0-9]{24}$/.test(id)) return NextResponse.json({ error: "Invalid equipment ID" }, { status: 400 });

    let body: string | undefined;
    if (request.method === "POST" || request.method === "PUT") {
        try {
            const data = await request.json();
            if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
            const { name, category, description, quantity, rentalRate } = data;
            if (![name, category, description].every(value => typeof value === "string" && value.trim()) ||
                !Number.isInteger(quantity) || quantity < 0 || typeof rentalRate !== "number" || !Number.isFinite(rentalRate) || rentalRate < 0) {
                throw new Error();
            }
            body = JSON.stringify({ name: name.trim(), category: category.trim(), description: description.trim(), quantity, rentalRate });
        } catch {
            return NextResponse.json({ error: "Provide a name, category, description, nonnegative whole quantity, and nonnegative rental rate" }, { status: 400 });
        }
    }
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/equipment${id ? `/${id}` : ""}`, {
            method: request.method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.accessToken}` },
            body,
            cache: "no-store",
        });
        return NextResponse.json(await response.json(), { status: response.status });
    } catch {
        return NextResponse.json({ error: "Unable to reach the equipment service" }, { status: 502 });
    }
}