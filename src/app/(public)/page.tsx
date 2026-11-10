import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
                <p className="text-sm font-semibold tracking-widest text-primary">
                    EQUIPLY / EQUIPMENT RENTAL
                </p>

                <h1 className="my-8 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
                    Equipment
                    <br />
                    Rental Service
                </h1>

                <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                    Find the equipment you need, when you need it.
                    Explore a wide range of categories, including
                    sports, IT, cameras, and more.
                </p>

                <div className="mt-8">
                    <Link
                    href="/rent"
                    className="inline-flex items-center gap-3 rounded-md bg-primary mr-4 px-8 py-3 font-medium text-white transition-colors hover:bg-primary/80"
                    >
                        Rent
                        <ArrowUpRight className="size-5" />
                    </Link>
                    <Link
                    href="/equipment"
                    className="inline-flex items-center gap-3 rounded-md bg-gray-200 px-8 py-3 font-medium text-black transition-colors hover:bg-gray-300"
                    >
                        Explore
                        <ArrowUpRight className="size-5" />
                    </Link>
                </div>

                <p className="text-sm font-semibold tracking-widest text-muted-foreground mt-8">
                    Sport   /   IT   /   Devices   /   More                 
                </p>
            </div>

            {/* Right: Hero Image */}
            <div className="relative flex min-h-80 items-center justify-center rounded-3xl bg-blue-100 p-8">
            <Image
                src="/images/hero.png"
                alt="Equipment available for rental"
                width={550}
                height={450}
                className="h-auto w-full object-contain"
                priority
            />
            </div>
        </div>
    </main>
  );
}