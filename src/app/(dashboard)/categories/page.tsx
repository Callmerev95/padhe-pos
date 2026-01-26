import { getCategories } from "./actions";
import { CategoriesClient } from "./CategoriesClient";
import { CategoryUI } from "./types/category.types";

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Kita cast ke CategoryUI karena prisma return Date object yang cocok
  return <CategoriesClient initialData={categories as CategoryUI[]} />;
}