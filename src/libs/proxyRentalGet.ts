import { NextRequest } from "next/server";
import { proxyRental as proxy } from "./proxyRental";
export function proxyRental(request: NextRequest) { return proxy(request); }
