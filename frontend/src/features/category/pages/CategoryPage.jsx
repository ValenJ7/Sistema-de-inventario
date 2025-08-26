// ----------------------------------------------
// 🧾 CategoryPage.jsx
// ----------------------------------------------
import { useState } from 'react';
import useCategories from '../hooks/useCategories';
import CategoryForm from '../components/CategoryForm';
import CategoryList from '../components/CategoryList';

export default function CategoryPage() {
  const [selected, setSelected] = useState(null);
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Gestión de Categorías</h2>

      <CategoryForm
        selected={selected}
        setSelected={setSelected}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
      />

      <CategoryList
        categories={categories}
        setSelected={setSelected}
        onDelete={deleteCategory}
      />
    </div>
  );
}
