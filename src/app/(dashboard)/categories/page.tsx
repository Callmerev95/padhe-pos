import { getCategories } from "./actions";
import { CategoryTable } from "@/components/shared/categories/CategoryTable";

export default async function CategoriesPage() {
  const categories = await getCategories();

  // JANGAN bungkus dengan div min-h-full agar tidak ada margin ekstra
  return <CategoryTable data={categories} />;
}