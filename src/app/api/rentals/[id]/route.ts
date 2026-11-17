import { NextRequest } from "next/server";
import { proxyRental } from "@/libs/proxyRental";
type Context = { params: Promise<{ id: string }> };
async function manage(request: NextRequest, context: Context) {
    return proxyRental(request, (await context.params).id);
}
export { manage as PUT, manage as DELETE };
