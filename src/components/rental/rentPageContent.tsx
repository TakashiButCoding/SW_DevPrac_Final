"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import RentalForm from "@/components/rental/rentalForm";
import type { Equipment } from "@/types/equipmentsType";

interface RentPageContentProps {
    equipments: Equipment[];
}

export default function RentPageContent({
    equipments,
}: RentPageContentProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace(
                `/login?callbackUrl=${encodeURIComponent("/rent")}`
            );
        }

        if (
            status === "authenticated" &&
            session?.user?.role !== "member"
        ) {
            router.replace("/equipment");
        }
    }, [status, session?.user?.role, router]);

    if (
        status === "loading" ||
        status !== "authenticated" ||
        session?.user?.role !== "member"
    ) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoaderCircle className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto my-10 max-w-3xl px-4">
            <div className="card p-10">
                <h1 className="text-2xl font-bold">
                    Make a Rental Request
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    Please fill out the form below to make a rental request.
                </p>

                <div className="mt-6">
                    <RentalForm equipments={equipments} />
                </div>
            </div>
        </div>
    );
}