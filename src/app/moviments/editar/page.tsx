import { Suspense } from "react";
import { OfflineEditMovement } from "@/features/movements/offline-edit-movement";

export default function EditMovementPage() {
  return <Suspense fallback={null}><OfflineEditMovement /></Suspense>;
}
