import { MovementForm } from "@/features/movements/movement-form";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tipus?: string }> }) {
  const { id } = await params; const { tipus } = await searchParams;
  const kind = tipus === "income" || tipus === "transfer" || tipus === "saving" ? tipus : "expense";
  return <MovementForm title="Editar moviment" action="Desa els canvis" kind={kind} movementId={id} />;
}
