import { notFound } from "next/navigation";
import HomeClient from "@/components/HomeClient";
import { getClientDictionary, isLocale } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <HomeClient dict={getClientDictionary(locale)} locale={locale} />;
}
