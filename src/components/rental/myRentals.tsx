"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Equipment } from "@/types/equipmentsType";

type Rental = { _id: string; equipment: Equipment | null; quantity: number; startDate: string; returnDate: string; createdAt: string };
type Draft = { equipment: string; quantity: number; startDate: string; returnDate: string };
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));

export default function MyRentals({ equipments }: { equipments: Equipment[] }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft>({ equipment: "", quantity: 1, startDate: "", returnDate: "" });
    const [deleting, setDeleting] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const today = new Date().toISOString().slice(0, 10);
    const load = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/rentals", { cache: "no-store", signal });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to load rental history");
            if (!signal?.aborted) setRentals(result.data);
        } catch (err) {
            if (!signal?.aborted) setError(err instanceof Error ? err.message : "Unable to load rental history");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (status === "unauthenticated") router.replace("/login?callbackUrl=%2Fmyrent");
        if (status === "authenticated" && session?.user?.role !== "member") router.replace("/equipment");
        if (status !== "authenticated" || session?.user?.role !== "member") return;
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, [status, session?.user?.role, router, load]);

    async function mutate(id: string, method: "PUT" | "DELETE") {
        if (busy) return;
        if (method === "PUT") {
            const equipment = equipments.find(item => item._id === draft.equipment);
            const duration = (Date.parse(draft.returnDate) - Date.parse(draft.startDate)) / 86400000;
            if (!equipment?.isActive || !Number.isInteger(draft.quantity) || draft.quantity < 1 || draft.quantity > Math.min(3, equipment.quantity)) {
                toast.error("Select active equipment and a quantity between 1 and the available stock (maximum 3)."); return;
            }
            if (!draft.startDate || !draft.returnDate || draft.startDate < today || !Number.isFinite(duration) || duration < 0 || duration > 7) {
                toast.error("Choose dates from today onward, with a return date within 7 days of the start."); return;
            }
        }
        setBusy(true);
        try {
            const response = await fetch(`/api/rentals/${id}`, {
                method, headers: { "Content-Type": "application/json" },
                body: method === "PUT" ? JSON.stringify(draft) : undefined,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Unable to save rental request");
            setRentals(current => method === "DELETE" ? current.filter(item => item._id !== id) : current.map(item => item._id === id ? result.data : item));
            setEditing(null); setDeleting(null);
            toast.success(method === "DELETE" ? "Rental request deleted." : "Rental request updated.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Unable to save rental request");
        } finally { setBusy(false); }
    }

    if (status !== "authenticated" || session?.user?.role !== "member") {
        return (
            <div className="flex justify-center py-20" role="status">
                <LoaderCircle className="size-8 animate-spin" />
                <span className="sr-only">Loading rentals</span>
            </div>
        )
    }
    const sorted = [...rentals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const selected = equipments.find(item => item._id === draft.equipment);
    const maxReturn = draft.startDate ? new Date(Date.parse(draft.startDate) + 7 * 86400000).toISOString().slice(0, 10) : undefined;
    let rentalContent;
    if (loading) {
        rentalContent = <p role="status" className="py-10 text-center">Loading rental history...</p>;
    } else if (error) {
        rentalContent = <div className="card space-y-4 p-6" role="alert"><p>{error}</p><Button onClick={() => void load()}>Try Again</Button></div>;
    } else if (sorted.length === 0) {
        rentalContent = <div className="card space-y-3 p-10 text-center"><h2 className="text-xl font-semibold">No rental requests yet</h2><p className="text-muted-foreground">Your requests will appear here after you submit a rental.</p><Link href="/rent" className="text-primary underline">Make your first request</Link></div>;
    } else {
        rentalContent = <>
            <p className="text-sm text-muted-foreground">{sorted.length} rental request{sorted.length === 1 ? "" : "s"}</p>
            {sorted.map(rental => <article key={rental._id} className="card space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="text-xl font-semibold">{rental.equipment?.name ?? "Equipment unavailable"}</h2><p className="text-sm text-muted-foreground">{rental.equipment?.category ?? "Removed from catalog"}</p></div>
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div><dt className="text-muted-foreground">Quantity</dt><dd>{rental.quantity}</dd></div>
                    <div><dt className="text-muted-foreground">Start date</dt><dd>{dateLabel(rental.startDate)}</dd></div>
                    <div><dt className="text-muted-foreground">Return date</dt><dd>{dateLabel(rental.returnDate)}</dd></div>
                    <div><dt className="text-muted-foreground">Requested on</dt><dd>{dateLabel(rental.createdAt)}</dd></div>
                </dl>
                {editing === rental._id && <form className="space-y-4 border-t pt-5" onSubmit={event => { event.preventDefault(); void mutate(rental._id, "PUT"); }}>
                    <h3 className="font-semibold">Edit rental request</h3>
                    <p className="text-sm text-muted-foreground">Dates must start today or later and span at most 7 days.</p>
                    <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-sm">Equipment<select required className="h-9 w-full rounded-lg border bg-background px-3" value={draft.equipment} onChange={event => setDraft({ ...draft, equipment: event.target.value, quantity: 1 })}>
                            <option value="" disabled>Select equipment</option>
                            {!equipments.some(item => item._id === draft.equipment && item.isActive && item.quantity > 0) && draft.equipment && <option value={draft.equipment} disabled>Unavailable - choose another item</option>}
                            {equipments.filter(item => item.isActive && item.quantity > 0).map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
                        </select></label>
                        <label className="space-y-2 text-sm">Quantity<Input required type="number" min={1} max={Math.min(3, selected?.quantity ?? 3)} step={1} value={draft.quantity} onChange={event => setDraft({ ...draft, quantity: Number(event.target.value) })} /></label>
                        <label className="space-y-2 text-sm">Start Date<Input required type="date" min={today} value={draft.startDate} onChange={event => setDraft({ ...draft, startDate: event.target.value })} /></label>
                        <label className="space-y-2 text-sm">Return Date<Input required type="date" min={draft.startDate || today} max={maxReturn} value={draft.returnDate} onChange={event => setDraft({ ...draft, returnDate: event.target.value })} /></label>
                    </fieldset>
                    <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save Changes"}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(null)}>Cancel</Button></div>
                </form>}
                {deleting === rental._id && <div className="space-y-3 border-t pt-4" role="alert">
                    <p>Delete this rental request? This cannot be undone.</p><div className="flex gap-2"><Button variant="destructive" disabled={busy} onClick={() => void mutate(rental._id, "DELETE")}>{busy ? "Deleting..." : "Confirm Delete"}</Button><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Cancel</Button></div>
                </div>}
                {editing !== rental._id && deleting !== rental._id && <div className="flex gap-2">
                    <Button variant="outline" disabled={busy} onClick={() => { setEditing(rental._id); setDeleting(null); setDraft({ equipment: rental.equipment?._id ?? "", quantity: rental.quantity, startDate: rental.startDate.slice(0, 10), returnDate: rental.returnDate.slice(0, 10) }); }}><Pencil />Edit Request</Button>
                    <Button variant="destructive" disabled={busy} onClick={() => { setDeleting(rental._id); setEditing(null); }}><Trash2 />Delete</Button>
                </div>}
            </article>)}
        </>;
    }
    return (
        <div className="mx-auto my-10 max-w-4xl space-y-6 px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div><h1 className="text-3xl font-bold">My Rentals</h1><p className="mt-2 text-muted-foreground">View your rental history and manage your requests.</p></div>
                <Link href="/rent" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">New Rental Request</Link>
            </div>
            {rentalContent}
        </div>
    );
}
