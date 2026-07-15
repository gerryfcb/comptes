import { AccountForm } from "@/features/accounts/account-form";
export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountForm title="Editar compte" action="Desa els canvis" accountId={id} />;
}
