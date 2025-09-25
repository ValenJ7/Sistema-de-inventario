// components/ProductForm.jsx
import { useEffect, useState } from "react";
import api, { uploadProductImage } from "../../../api/backend";
// import ImagePickerPro from "./ui/ImagePickerPro"; // ❌ eliminado
import useProductImages from "../hooks/useProductImages";
import ProductImageGallery from "./ui/ProductImageGallery";
import LocalProductImages from "./ui/LocalProductImages";

const BACKEND_BASE = "http://localhost/SistemaDeInventario/backend";

export default function ProductForm({
  selectedProduct,
  setSelectedProduct,
  onAddProduct,
  onUpdateProduct,
  reload,
  onFinished,
}) {
  const [form, setForm] = useState({
    id: null,
    name: "",
    category_id: "",
    price: "",
  });

  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([{ label: "", stock: 0 }]);

  // estado de imagen sólo se usaba para ImagePickerPro; lo dejamos por si lo reusás
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Imágenes locales cuando aún no hay product_id (modo Agregar)
  const [localImages, setLocalImages] = useState([]);

  // Galería conectada al backend (modo Editar)
  const { images, deleteImage, setMainImage, reorderImages } = useProductImages(
    form.id
  );

  useEffect(() => {
    api
      .get("admin/categories/get-categories.php")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setForm({
        id: selectedProduct.id ?? null,
        name: selectedProduct.name ?? "",
        category_id:
          selectedProduct.category_id == null
            ? ""
            : String(selectedProduct.category_id),
        price: selectedProduct.price ?? "",
      });

      const path =
        selectedProduct.image_path ?? selectedProduct.main_image ?? null;
      setCurrentImage(path ? `${BACKEND_BASE}${path}` : null);

      api
        .get(
          `admin/products/get-product-variants.php?product_id=${selectedProduct.id}`
        )
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setVariants(
              res.data.map((v) => ({
                label: (v.label || "").trim(),
                stock: Number(v.stock) || 0,
              }))
            );
          } else {
            setVariants([
              {
                label: selectedProduct.size || "Único",
                stock: Number(selectedProduct.stock) || 0,
              },
            ]);
          }
        })
        .catch((err) => {
          console.error("Error cargando variantes:", err);
          setVariants([{ label: "", stock: 0 }]);
        });

      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(null);
      setLocalImages([]);
    } else {
      // modo agregar
      setForm({ id: null, name: "", category_id: "", price: "" });
      setVariants([{ label: "", stock: 0 }]);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(null);
      setCurrentImage(null);
      setLocalImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // variantes
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => setVariants([...variants, { label: "", stock: 0 }]);
  const removeVariant = (index) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    let productId = selectedProduct?.id ?? null;

    try {
      // crear / actualizar producto
      if (selectedProduct) {
        await onUpdateProduct({ ...form, id: productId ?? form.id });
        productId = productId ?? form.id;
      } else {
        productId = await onAddProduct(form); // debe devolver id
      }

      // guardar variantes
      if (productId) {
        const payload = {
          product_id: productId,
          variants: variants
            .map((v, i) => ({
              label: (v.label || "").trim(),
              stock: Number(v.stock) || 0,
              sort_order: i,
            }))
            .filter((v) => v.label.length > 0),
        };
        await api.post("admin/products/set-product-variants.php", payload);
      }

      // imágenes
      if (!selectedProduct) {
        // Subir imágenes locales en el orden elegido
        const ordered = (localImages || [])
          .slice()
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        const uploadedIds = [];
        for (const it of ordered) {
          if (!it.file) continue;
          const resp = await uploadProductImage(productId, it.file);
          if (resp?.id) uploadedIds.push(resp.id);
        }

        if (uploadedIds.length > 1) {
          try {s
            const fd = new FormData();
            fd.append("product_id", String(productId));
            uploadedIds.forEach((id) => fd.append("order[]", String(id)));

            await api.post("admin/products/reorder-product-images.php", fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (e) {
            console.warn("Endpoint de reorden no disponible:", e);
          }
        }
      } else if (file && productId) {
        // si en algún momento volvés a usar un picker puntual
        const r = await uploadProductImage(productId, file);
        if (!r?.success && !r?.id) {
          console.error("Error subiendo imagen en edición:", r?.error);
        }
      }

      if (typeof reload === "function") await reload(Date.now());
      if (typeof onFinished === "function") onFinished();

      // limpieza
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      setCurrentImage(null);
      setVariants([{ label: "", stock: 0 }]);
      setForm({ id: null, name: "", category_id: "", price: "" });
      setLocalImages([]);
    } catch (err) {
      console.error("Error en submit:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-lg mx-auto space-y-4">
      <input type="hidden" name="id" value={form.id ?? ""} readOnly />

      <div className="grid grid-cols-1 gap-3">
        <input
          className="border p-2 rounded w-full"
          type="text"
          name="name"
          placeholder="Nombre del Producto"
          value={form.name}
          onChange={handleChange}
          required
        />

        <div className="flex gap-3">
          <input
            className="border p-2 rounded flex-1"
            type="number"
            name="price"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            required
          />

        <select
            name="category_id"
            className="border p-2 rounded flex-1"
            value={form.category_id}
            onChange={handleChange}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Variantes */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Talles y Stock</h3>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            + Agregar Talle
          </button>
        </div>

        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="border p-2 rounded flex-1"
                type="text"
                placeholder="Ej: S, M, L, XL, 1, 2, 3, Único"
                value={v.label}
                onChange={(e) => handleVariantChange(i, "label", e.target.value)}
                required
              />
              <input
                className="border p-2 rounded w-24"
                type="number"
                min="0"
                value={v.stock}
                onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-red-500 hover:text-red-700"
                title="Eliminar"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Imágenes */}
      {!form.id ? (
        // Modo Agregar: galería local con flechas/eliminar
        <LocalProductImages value={[]} onChange={setLocalImages} />
      ) : (
        // Modo Editar: SOLO galería (sin dropzone/picker)
        <ProductImageGallery
          images={images}
          onDeleteImage={deleteImage}
          onSetMain={setMainImage}
          onReorder={reorderImages}
        />
      )}

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={() => (typeof onFinished === "function" ? onFinished() : null)}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          type="submit"
        >
          {selectedProduct ? "Actualizar" : "Agregar Producto"}
        </button>
      </div>
    </form>
  );
}
