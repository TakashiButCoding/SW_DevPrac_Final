import { NextRequest } from "next/server";
import { proxyEquipment } from "@/libs/proxyEquipment";

export function GET(request: NextRequest) { return proxyEquipment(request); }
export function POST(request: NextRequest) { return proxyEquipment(request); }