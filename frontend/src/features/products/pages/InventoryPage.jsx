import { useState } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import useProducts from "../hooks/useProducts";

export default function InventoryPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    reload: fetchProducts,
  } = useProducts();

  const [reloadToken, setReloadToken] = useState(0);

  const reload = (token) => {
    setReloadToken(token || Date.now());
    if (typeof fetchProducts === "function") fetchProducts();
  };

  const openModal = (product = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
        <button
          onClick={() => openModal(null)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <span className="text-xl">＋</span> Agregar Producto
        </button>
      </div>

      {/* Tabla de productos */}
      <ProductList
        products={products}
        onEdit={openModal}
        onDelete={deleteProduct}
        reloadToken={reloadToken}
      />

      {/* Modal con el formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            {/* Botón cerrar */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {selectedProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
            </h2>

            <ProductForm
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              reload={reload}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
