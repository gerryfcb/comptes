"use client";
import { usePathname } from "next/navigation";
import { BottomNavigation } from "@/design-system";

const items = [
  { href: "/", label: "Inici", icon: "home" as const },
  { href: "/moviments", label: "Moviments", icon: "movements" as const },
  { href: "/estadistiques", label: "Estadístiques", icon: "chart" as const },
  { href: "/comptes", label: "Comptes", icon: "accounts" as const },
  { href: "/configuracio", label: "Configuració", icon: "settings" as const },
];

export function AppNavigation() {
  return <BottomNavigation items={items} activeHref={usePathname()} />;
}
