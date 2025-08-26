// ----------------------------------------------
// 🧾 InventoryPage.jsx
// ----------------------------------------------
import { useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import useProducts from '../hooks/useProducts';

export default function InventoryPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Sistema de Inventario</h1>

      <ProductForm
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
      />

      <ProductList
        products={products}
        setSelectedProduct={setSelectedProduct}
        onDeleteProduct={deleteProduct}
      />
    </div>
  );
}
