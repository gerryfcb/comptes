import { Suspense } from "react";
import { OfflineEditAccount } from "@/features/accounts/offline-edit-account";

export default function EditAccountPage() {
  return <Suspense fallback={null}><OfflineEditAccount /></Suspense>;
}
