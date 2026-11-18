"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Equipment } from "@/types/equipmentsType";
import { getMaxRentalQuantity, isValidRentalQuantity, validateRentalDates } from "@/libs/rentalValidation";
import RentalDateFields from "./rentalDateFields";

type Rental = {
    _id: string;
    user: { _id: string; name: string; email: string; tel?: string } | null;
    equipment: Equipment | null;
    quantity: number;
    startDate: string;
    returnDate: string;
    createdAt: string;
};
type Draft = { equipment: string; quantity: string; startDate: string; returnDate: string };
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
const selectClass = "h-9 w-full rounded-lg border bg-white px-3";

async function api(path: string, options?: RequestInit) {
    const response = await fetch(path, { ...options, cache: "no-store" });
    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error(result.error || result.message || "Unable to complete the request");
    return result;
}

export default function RentalManager() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Rental | null>(null);
    const [mode, setMode] = useState<"view" | "edit" | "delete" | null>(null);
    const [draft, setDraft] = useState<Draft>({ equipment: "", quantity: "1", startDate: "", returnDate: "" });
    const [busy, setBusy] = useState(false);
    const load = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError("");
        try {
            const [rentalResult, equipmentResult] = await Promise.all([
                api("/api/rentals", { signal }), api("/api/equipment", { signal }),
            ]);
            if (!signal?.aborted) { setRentals(rentalResult.data); setEquipment(equipmentResult.data); }
        } catch (error) {
            if (!signal?.aborted) setError(error instanceof Error ? error.message : "Unable to load rental requests");
        } finally { if (!signal?.aborted) setLoading(false); }
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, [load]);

    function open(rental: Rental, nextMode: "view" | "edit" | "delete") {
        setSelected(rental);
        setMode(nextMode);
        setError("");
        setNotice("");
        setDraft({ equipment: rental.equipment?._id ?? "", quantity: String(rental.quantity), startDate: rental.startDate.slice(0, 10), returnDate: rental.returnDate.slice(0, 10) });
    }
    async function mutate(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        if (!selected || busy) return;
        setError("");
        const deleting = mode === "delete";
        if (!deleting) {
            const item = equipment.find(item => item._id === draft.equipment);
            const quantity = Number(draft.quantity);
            if (!isValidRentalQuantity(quantity, item)) {
                setError("Choose active equipment and a whole quantity from 1 to the available stock (maximum 3)."); return;
            }
            const dateError = validateRentalDates(draft.startDate, draft.returnDate);
            if (dateError) {
                setError(dateError);
                return;
            }
        }
        setBusy(true);
        try {
            const result = await api(`/api/rentals/${selected._id}`, {
                method: deleting ? "DELETE" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: deleting ? undefined : JSON.stringify({ ...draft, quantity: Number(draft.quantity) }),
            });
            setRentals(items => deleting ? items.filter(item => item._id !== selected._id) : items.map(item => item._id === selected._id ? result.data : item));
            setMode(null);
            setSelected(null);
            setNotice(deleting ? "Rental request deleted." : "Rental request updated.");
        } catch (error) { setError(error instanceof Error ? error.message : "Unable to save rental request"); }
        finally { setBusy(false); }
    }
    function close() { setMode(null); setSelected(null); setError(""); }
    const visible = [...rentals].filter(item => [item._id, item.user?.name, item.user?.email, item.equipment?.name].join(" ").toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const chosen = equipment.find(item => item._id === draft.equipment);

    return <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
        <div><p className="mb-2 text-sm font-medium text-primary">Administration</p><h1 className="text-3xl font-semibold">Manage rental requests</h1><p className="mt-2 text-muted-foreground">View and manage equipment rental requests from all members.</p></div>
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {notice && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-800">{notice}</p>}
        {selected && mode && <section aria-labelledby="request-title" className="card space-y-5 p-6">
            <div><h2 id="request-title" className="text-xl font-semibold">{mode === "edit" ? "Edit rental request" : mode === "delete" ? "Delete rental request?" : "Rental request details"}</h2><p className="mt-1 break-all text-xs text-muted-foreground">Request ID: {selected._id}</p></div>
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div><dt className="text-muted-foreground">Renter</dt><dd>{selected.user?.name ?? "User unavailable"}</dd></div>
                <div><dt className="text-muted-foreground">Email</dt><dd className="break-all">{selected.user?.email ?? "Unavailable"}</dd></div>
                <div><dt className="text-muted-foreground">Telephone</dt><dd>{selected.user?.tel || "Not provided"}</dd></div>
                <div><dt className="text-muted-foreground">Equipment</dt><dd>{selected.equipment?.name ?? "Equipment unavailable"}</dd></div>
                <div><dt className="text-muted-foreground">Quantity</dt><dd>{selected.quantity}</dd></div>
                <div><dt className="text-muted-foreground">Requested on</dt><dd>{dateLabel(selected.createdAt)}</dd></div>
                <div><dt className="text-muted-foreground">Start date</dt><dd>{dateLabel(selected.startDate)}</dd></div>
                <div><dt className="text-muted-foreground">Return date</dt><dd>{dateLabel(selected.returnDate)}</dd></div>
            </dl>
            {mode === "edit" && <form onSubmit={mutate} className="space-y-4 border-t pt-5">
                <p className="text-sm text-muted-foreground">Rentals must start today or later, last at most 7 days, and contain 1–3 items within available stock.</p>
                <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">Equipment<select required className={selectClass} value={draft.equipment} onChange={event => setDraft({ ...draft, equipment: event.target.value, quantity: "1" })}>
                        <option value="" disabled>Select equipment</option>
                        {draft.equipment && !equipment.some(item => item._id === draft.equipment && item.isActive && item.quantity > 0) && <option value={draft.equipment} disabled>Unavailable — choose another item</option>}
                        {equipment.filter(item => item.isActive && item.quantity > 0).map(item => <option key={item._id} value={item._id}>{item.name} ({item.quantity} available)</option>)}
                    </select></label>
                    <label className="space-y-2 text-sm">Quantity<Input type="number" required min={1} max={getMaxRentalQuantity(chosen)} step={1} value={draft.quantity} onChange={event => setDraft({ ...draft, quantity: event.target.value })} /></label>
                    <RentalDateFields
                        startDate={draft.startDate}
                        returnDate={draft.returnDate}
                        onChange={dates => setDraft(current => ({ ...current, ...dates }))}
                    />
                </fieldset>
                <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button><Button type="button" variant="outline" disabled={busy} onClick={close}>Cancel</Button></div>
            </form>}
            {mode === "delete" && <div className="space-y-4 border-t pt-4"><p>This permanently deletes the rental request and cannot be undone.</p><div className="flex gap-2"><Button variant="destructive" disabled={busy} onClick={() => void mutate()}>{busy ? "Deleting…" : "Confirm delete"}</Button><Button variant="outline" disabled={busy} onClick={close}>Cancel</Button></div></div>}
            {mode === "view" && <div className="flex gap-2"><Button onClick={() => setMode("edit")}><Pencil />Edit request</Button><Button variant="outline" onClick={close}>Close</Button></div>}
        </section>}
        <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b p-4"><label className="min-w-0 grow"><span className="sr-only">Search rental requests</span><Input placeholder="Search renter, email, equipment, or request ID…" value={search} onChange={event => setSearch(event.target.value)} /></label><Button variant="outline" disabled={busy || loading} onClick={() => void load()}>Refresh</Button></div>
            {loading ? <p role="status" className="p-10 text-center">Loading rental requests…</p> : <>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-primary text-white"><tr>{["Renter", "Equipment", "Quantity", "Start date", "Return date", "Actions"].map(title => <th key={title} scope="col" className="px-5 py-4 font-medium">{title}</th>)}</tr></thead><tbody>{visible.map(rental => <tr key={rental._id} className="border-b last:border-0 hover:bg-blue-50/50">
                    <td className="px-5 py-4"><p className="font-medium">{rental.user?.name ?? "User unavailable"}</p><p className="text-xs text-muted-foreground">{rental.user?.email}</p></td>
                    <td className="px-5 py-4">{rental.equipment?.name ?? "Equipment unavailable"}</td><td className="px-5 py-4">{rental.quantity}</td><td className="whitespace-nowrap px-5 py-4">{dateLabel(rental.startDate)}</td><td className="whitespace-nowrap px-5 py-4">{dateLabel(rental.returnDate)}</td>
                    <td className="px-5 py-4"><div className="flex gap-2"><Button variant="outline" disabled={busy} aria-label={`View request ${rental._id}`} onClick={() => open(rental, "view")}><Eye />View</Button><Button variant="outline" disabled={busy} aria-label={`Edit request ${rental._id}`} onClick={() => open(rental, "edit")}><Pencil />Edit</Button><Button variant="destructive" disabled={busy} aria-label={`Delete request ${rental._id}`} onClick={() => open(rental, "delete")}><Trash2 />Delete</Button></div></td>
                </tr>)}</tbody></table></div>
                {visible.length === 0 && <div className="p-10 text-center"><h2 className="font-semibold">{rentals.length ? "No matching requests" : error ? "Requests could not be loaded" : "No rental requests yet"}</h2><p className="mt-2 text-sm text-muted-foreground">{rentals.length ? "Try a different search." : error ? "Use Refresh to try again." : "Member rental requests will appear here."}</p></div>}
                <p className="border-t px-5 py-3 text-sm text-muted-foreground">{visible.length} of {rentals.length} rental requests</p>
            </>}
        </div>
    </div>;
}