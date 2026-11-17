import { NextRequest } from "next/server";
import { proxyEquipment } from "@/libs/proxyEquipment";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) { return proxyEquipment(request, (await context.params).id); }
export async function PUT(request: NextRequest, context: Context) { return proxyEquipment(request, (await context.params).id); }
export async function DELETE(request: NextRequest, context: Context) { return proxyEquipment(request, (await context.params).id); }