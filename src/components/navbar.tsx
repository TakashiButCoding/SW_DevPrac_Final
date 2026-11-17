"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut, LogIn } from "lucide-react";


export default function Navbar() {
    const { data: session, status } = useSession();

    const isLoggedIn = status === "authenticated";
    const role = session?.user?.role;

    const isAdmin = role === "admin";
    const isMember = role === "member";
    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Equipments", href: "/equipment" },
        { label: "Rent", href: "/rent" },
        ...(isMember
            ? [{ label: "My Rentals", href: "/myrent" }]
            : []),

        ...(isAdmin
            ? [
                { label: "Manage Equipment", href: "/admin/equipment" },
                { label: "Manage Rentals", href: "/admin/rentals" },
            ]
            : []),
    ];

    let authButton = null;
    if (status !== "loading") {
        authButton = isLoggedIn ? (
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 cursor-pointer hover:text-primary"
            >
                <LogOut size={18} />
                Logout
            </button>
        ) : (
            <button
                onClick={() => signIn()}
                className="flex items-center gap-2 cursor-pointer hover:text-primary"
            >
                <LogIn size={18} />
                Login
            </button>
        );
    }
    
    return (
        <header className="bg-white h-16 sticky top-0 shadow-md">
            <div className="center h-full px-4">
                <div className="flex-1 flex justify-start">
                    <Image
                        src="/images/logo.png"
                        alt="Equiply Logo"
                        width={150}
                        height={50}
                    />
                </div>
                <div className="flex-1 center">
                    <nav className="flex-1 flex justify-center gap-16 whitespace-nowrap">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-md font-medium hover:text-primary transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex flex-1 justify-end">
                    {authButton}
                </div>
            </div>
        </header>
    );
}