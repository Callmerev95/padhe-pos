import { getIngredients } from "./actions";
import IngredientsClient from "./IngredientsClient";

export default async function IngredientsPage() {
  // Ambil data dari server (logic asli kamu)
  const response = await getIngredients();
  const ingredients = response.data || [];

  // Kirim data ke Client Component
  return <IngredientsClient initialData={ingredients} />;
}