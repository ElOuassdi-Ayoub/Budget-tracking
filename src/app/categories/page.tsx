import { prisma } from "@/lib/prisma";
import { CategoryList } from "@/components/categories/CategoryList";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ isPreset: "desc" }, { name: "asc" }],
    include: { _count: { select: { expenses: true } } },
  });

  return (
    <div className="p-6 max-w-5xl">
      <CategoryList initialCategories={categories as any} />
    </div>
  );
}
