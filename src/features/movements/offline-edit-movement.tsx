"use client";

import { useSearchParams } from "next/navigation";
import { MovementForm } from "./movement-form";

export function OfflineEditMovement() {
  const params = useSearchParams();
  const tipus = params.get("tipus");
  const kind = tipus === "income" || tipus === "transfer" || tipus === "saving" ? tipus : "expense";
  return <MovementForm title="Editar moviment" action="Desa els canvis" kind={kind} movementId={params.get("id") ?? undefined} />;
}
