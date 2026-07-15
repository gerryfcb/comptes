import { notFound } from "next/navigation";
import { MovementForm } from "@/features/movements/movement-form";
const types = {
  despesa: { title: "Nova despesa", action: "Desa la despesa", kind: "expense" },
  ingres: { title: "Nou ingrés", action: "Desa l’ingrés", kind: "income" },
  transferencia: { title: "Nova transferència", action: "Desa la transferència", kind: "transfer" },
  estalvi: { title: "Moviment d’estalvi", action: "Desa el moviment", kind: "saving" },
} as const;
export function generateStaticParams() { return Object.keys(types).map((tipus) => ({ tipus })); }
export default async function Page({ params }: { params: Promise<{ tipus: string }> }) {
  const { tipus } = await params; const config = types[tipus as keyof typeof types]; if (!config) notFound();
  return <MovementForm {...config} />;
}
