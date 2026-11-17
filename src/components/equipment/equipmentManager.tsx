"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Equipment } from "@/types/equipmentsType";
import { Plus, Pencil, Trash2, Eye, Package } from "lucide-react";

type Form = { name: string; category: string; description: string; quantity: string; rentalRate: string };
const emptyForm: Form = { name: "", category: "", description: "", quantity: "0", rentalRate: "0" };
const button = "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";
const input = "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary";

async function request(path = "", options?: RequestInit) {
    const response = await fetch(`/api/equipment${path}`, { ...options, cache: "no-store" });
    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error(result.error || result.message || "Unable to complete the request");
    return result;
}

export default function EquipmentManager() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [mode, setMode] = useState<"create" | "edit" | "view" | null>(null);
    const [selected, setSelected] = useState<Equipment | null>(null);
    const [form, setForm] = useState<Form>(emptyForm);
    const [busy, setBusy] = useState(false);
    const [deleting, setDeleting] = useState<Equipment | null>(null);

    async function load() {
        setLoading(true);
        setError("");
        try { setEquipment((await request()).data); }
        catch (error) { setError(error instanceof Error ? error.message : "Unable to load equipment"); }
        finally { setLoading(false); }
    }
    useEffect(() => { void load(); }, []);

    function open(nextMode: "create" | "edit" | "view", item?: Equipment) {
        setSelected(item ?? null);
        setForm(item ? { name: item.name, category: item.category, description: item.description, quantity: String(item.quantity), rentalRate: String(item.rentalRate) } : emptyForm);
        setMode(nextMode);
        setDeleting(null);
        setError("");
        setNotice("");
    }

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            const result = await request(mode === "edit" ? `/${selected!._id}` : "", {
                method: mode === "edit" ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, quantity: Number(form.quantity), rentalRate: Number(form.rentalRate) }),
            });
            setEquipment(items => [...items.filter(item => item._id !== result.data._id), result.data].sort((a, b) => a.name.localeCompare(b.name)));
            setNotice(mode === "edit" ? "Equipment updated successfully." : "Equipment created successfully.");
            setMode(null);
        } catch (error) { setError(error instanceof Error ? error.message : "Unable to save equipment"); }
        finally { setBusy(false); }
    }

    async function remove() {
        if (!deleting) return;
        setBusy(true);
        setError("");
        try {
            await request(`/${deleting._id}`, { method: "DELETE" });
            setEquipment(items => items.filter(item => item._id !== deleting._id));
            setDeleting(null);
            setNotice("Equipment deleted successfully.");
        } catch (error) { setError(error instanceof Error ? error.message : "Unable to delete equipment"); }
        finally { setBusy(false); }
    }

    const categories = [...new Set(equipment.map(item => item.category))].sort();
    const visible = equipment.filter(item => (!category || item.category === category) && `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
    const fields: { key: keyof Form; label: string; type?: string }[] = [
        { key: "name", label: "Name" }, { key: "category", label: "Category" },
        { key: "quantity", label: "Available quantity", type: "number" }, { key: "rentalRate", label: "Rental rate (THB / day)", type: "number" },
    ];

    return <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div><p className="mb-2 text-sm font-medium text-primary">Administration</p><h1 className="text-3xl font-semibold">Manage equipment</h1><p className="mt-2 text-muted">View your inventory and keep equipment details up to date.</p></div>
            <button className={`${button} bg-primary text-white hover:bg-primary-hover`} onClick={() => open("create")} disabled={busy}><Plus size={18} />Add equipment</button>
        </div>
        {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-green-800">{notice}</p>}
        {mode && <section aria-labelledby="equipment-form-title" className="card mb-6 p-6">
            <h2 id="equipment-form-title" className="mb-5 text-xl font-semibold">{mode === "create" ? "Add equipment" : mode === "edit" ? "Edit equipment" : "Equipment details"}</h2>
            <form onSubmit={save}>
                <fieldset disabled={busy || mode === "view"} className="grid gap-4 sm:grid-cols-2">
                    {fields.map(({ key, label, type }) => <label key={key} className="grid gap-2 text-sm font-medium">{label}<input className={input} name={key} value={form[key]} type={type ?? "text"} required min={type === "number" ? 0 : undefined} step={key === "quantity" ? 1 : key === "rentalRate" ? "any" : undefined} onChange={event => setForm({ ...form, [key]: event.target.value })} /></label>)}
                    <label className="grid gap-2 text-sm font-medium sm:col-span-2">Description<textarea className={input} name="description" rows={3} required value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
                </fieldset>
                {mode === "view" && selected && <p className="mt-4 break-all text-xs text-muted">Equipment ID: {selected._id}</p>}
                <div className="mt-5 flex gap-3">{mode !== "view" && <button type="submit" disabled={busy} className={`${button} bg-primary text-white hover:bg-primary-hover`}>{busy ? "Saving…" : "Save equipment"}</button>}<button type="button" className={button} disabled={busy} onClick={() => { setMode(null); setError(""); }}>{mode === "view" ? "Close" : "Cancel"}</button></div>
            </form>
        </section>}
        {deleting && <section aria-labelledby="delete-title" className="mb-6 rounded-xl border border-red-200 bg-white p-6"><h2 id="delete-title" className="text-lg font-semibold">Delete {deleting.name}?</h2><p className="mt-2 text-muted">This equipment will be removed from the available inventory. Existing rental history will be preserved.</p><div className="mt-4 flex gap-3"><button className={`${button} bg-red-600 text-white hover:bg-red-700`} disabled={busy} onClick={remove}>{busy ? "Deleting…" : "Confirm delete"}</button><button className={button} disabled={busy} onClick={() => { setDeleting(null); setError(""); }}>Cancel</button></div></section>}
        <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b p-4"><label className="grow"><span className="sr-only">Search equipment</span><input className={input} placeholder="Search equipment…" value={search} onChange={event => setSearch(event.target.value)} /></label><label><span className="sr-only">Filter by category</span><select className={input} value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label><button className={button} disabled={loading || busy} onClick={load}>Refresh</button></div>
            {loading ? <p role="status" className="p-10 text-center text-muted">Loading equipment…</p> : <><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-primary text-white"><tr>{["Equipment", "Category", "Available", "Rate / day", "Actions"].map(title => <th key={title} scope="col" className="px-5 py-4 font-medium">{title}</th>)}</tr></thead><tbody>{visible.map(item => <tr key={item._id} className="border-b last:border-0 hover:bg-blue-50/50"><td className="max-w-xs px-5 py-4"><p className="font-medium">{item.name}</p><p className="mt-1 truncate text-muted">{item.description}</p></td><td className="px-5 py-4">{item.category}</td><td className="px-5 py-4">{item.quantity}</td><td className="whitespace-nowrap px-5 py-4">{new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(item.rentalRate)}</td><td className="px-5 py-4"><div className="flex gap-2"><button className={button} disabled={busy} aria-label={`View ${item.name}`} onClick={() => open("view", item)}><Eye size={16} />View</button><button className={button} disabled={busy} aria-label={`Edit ${item.name}`} onClick={() => open("edit", item)}><Pencil size={16} />Edit</button><button className={`${button} text-red-600`} disabled={busy} aria-label={`Delete ${item.name}`} onClick={() => { setDeleting(item); setMode(null); setError(""); setNotice(""); }}><Trash2 size={16} />Delete</button></div></td></tr>)}</tbody></table></div>{visible.length === 0 && <div className="p-12 text-center"><Package className="mx-auto mb-3 text-muted" size={32} /><p className="font-medium">{equipment.length ? "No equipment matches your filters" : "No equipment available"}</p><p className="mt-1 text-sm text-muted">{equipment.length ? "Try another search or category." : "Add equipment to start building your inventory."}</p></div>}<p className="border-t px-5 py-3 text-sm text-muted">{visible.length} of {equipment.length} equipment items</p></>}
        </div>
    </div>;
}