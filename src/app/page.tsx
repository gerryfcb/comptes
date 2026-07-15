import { HomeView } from "@/features/home/home-view";

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ recurrencies?: string }> }) {
  const params = await searchParams;
  const date = new Intl.DateTimeFormat("ca-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(new Date());
  return <HomeView date={date} recurrencesGenerated={params?.recurrencies === "generated"} />;
}
