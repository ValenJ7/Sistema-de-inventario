// ----------------------------------------------
// 🧾 InventoryPage.jsx (fix: reloadToken + wrapper de reload)
// ----------------------------------------------
import { useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import useProducts from '../hooks/useProducts';

export default function InventoryPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Renombramos reload del hook para evitar choque de nombres
  const { products, addProduct, updateProduct, deleteProduct, reload: fetchProducts } = useProducts();

  // 🔁 Token anti-cache para imágenes
  const [reloadToken, setReloadToken] = useState(0);

  // Wrapper: setea token (o Date.now()) y después vuelve a pedir productos
  const reload = (token) => {
    setReloadToken(token || Date.now());
    if (typeof fetchProducts === 'function') fetchProducts();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Sistema de Inventario</h1>

      <ProductForm
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
        reload={reload}                // 👈 pasamos wrapper
      />

      <ProductList
        products={products}
        setSelectedProduct={setSelectedProduct}
        onDeleteProduct={deleteProduct}
        reloadToken={reloadToken}      // 👈 ahora sí existe
      />
    </div>
  );
}
