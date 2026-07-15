import type { Metadata } from "next";
import { MovementsView } from "@/features/movements/movements-view";
export const metadata: Metadata = { title: "Moviments" };
export default function MovementsPage() { return <MovementsView />; }
