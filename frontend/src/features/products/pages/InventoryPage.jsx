// pages/InventoryPage.jsx
import { useState } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import useProducts from "../hooks/useProducts";
import ModalShell from "../components/ui/ModalShell";
import FiltersBar from "../components/ui/FiltersBar";

export default function InventoryPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    products, total, page, limit,
    sort, order,
    filters, setFilters,
    addProduct, updateProduct, deleteProduct,
    reload,
    setPage, setSort
  } = useProducts({
    sort: 'created_at',
    order: 'desc',
    limit: 20
  });

  const [reloadToken, setReloadToken] = useState(0);
  const doReload = (token) => {
    setReloadToken(token || Date.now());
    reload();
  };

  const openModal = (product = null) => { setSelectedProduct(product); setIsModalOpen(true); };
  const closeModal = () => { setSelectedProduct(null); setIsModalOpen(false); };

  const clearFilters = () => setFilters({
    ...filters,
    q: '', categoryId: null, stock: 'any',
    page: 1
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
        <button
          onClick={() => openModal(null)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <span className="text-xl">＋</span> Agregar Producto
        </button>
      </div>

      {/* Filtros */}
      <FiltersBar
        value={filters}
        onChange={(f) => setFilters(f)}
        onClear={clearFilters}
      />

      {/* Tabla de productos */}
      <ProductList
        products={products}
        total={total}
        page={page}
        limit={limit}
        sort={sort}
        order={order}
        onEdit={openModal}
        onDelete={async (id) => { await deleteProduct(id); doReload(); }}
        onPageChange={(p) => setPage(p)}
        onSortChange={(s, o) => setSort(s, o)}
        reloadToken={reloadToken}
      />

      {/* Modal */}
      <ModalShell
        open={isModalOpen}
        onClose={closeModal}
        title={selectedProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" type="button">
              Cancelar
            </button>
            <button type="submit" form="product-form" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold">
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
          reload={doReload}
          onFinished={closeModal}
        />
      </ModalShell>
    </div>
  );
}
