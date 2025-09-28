// pages/InventoryPage.jsx
import { useState } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import useProducts from "../hooks/useProducts";
import ModalShell from "../components/ui/ModalShell";

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

  // 🔁 Token anti-cache para imágenes
  const [reloadToken, setReloadToken] = useState(0);

  // Wrapper: setea token y vuelve a pedir productos
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
        onDelete={async (id) => {
          await deleteProduct(id);
          reload();
        }}
        reloadToken={reloadToken}
      />

      {/* Modal con el formulario (fijo, alto limitado y scroll interno) */}
      <ModalShell
        open={isModalOpen}
        onClose={closeModal}
        title={selectedProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              type="button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="product-form" // dispara el submit del <form id="product-form">
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            >
              {selectedProduct ? "Actualizar" : "Agregar Producto"}
            </button>
          </div>
        }
      >
        <ProductForm
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          reload={reload}
          onFinished={closeModal} // cierra modal al terminar
        />
      </ModalShell>
    </div>
  );
}
