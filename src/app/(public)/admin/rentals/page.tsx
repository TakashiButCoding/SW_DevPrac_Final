import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import RentalManager from "@/components/rental/rentalManager";

export default async function AdminRentalsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login?callbackUrl=/admin/rentals");
    if (session.user.role !== "admin") {
        return <div className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-3xl font-semibold">Access denied</h1><p className="mt-3 text-muted">Administrator access is required to manage rental requests.</p></div>;
    }
    return <RentalManager />;
}