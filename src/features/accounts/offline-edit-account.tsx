"use client";

import { useSearchParams } from "next/navigation";
import { AccountForm } from "./account-form";

export function OfflineEditAccount() {
  return <AccountForm title="Editar compte" action="Desa els canvis" accountId={useSearchParams().get("id") ?? undefined} />;
}
