"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function RentPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams<{ id: string }>();

    const id = params.id;

    useEffect(() => {
        if (status === "unauthenticated") {
            const callbackUrl = "/rent";
            router.replace(
                `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
            );
        }

        if (
            status === "authenticated" &&
            session?.user?.role !== "member"
        ) {
            router.replace("/equipment");
        }
    }, [status, session, router, id]);

    if (status === "loading") {
        return <p>Checking authentication...</p>;
    }

    if (status !== "authenticated" || session?.user?.role !== "member") {
        return null;
    }

    return (
        <div className="mx-auto my-10 max-w-3xl">
            <div className="card p-10">
                <h1 className="text-2xl font-bold">Making a rent request</h1>
                <p className="text-muted-foreground text-sm">
                    Please fill out the form below to make a rent request.
                </p>
                <form>
                    
                </form>
            </div>
        </div>
    );
}