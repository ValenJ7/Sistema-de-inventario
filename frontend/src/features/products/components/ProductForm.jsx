// components/ProductForm.jsx
import { useEffect, useState } from "react";
import api, { uploadProductImage } from "../../../api/backend";
import ImagePickerPro from "./ui/ImagePickerPro";
import useProductImages from "../hooks/useProductImages";
import ProductImageGallery from "./ui/ProductImageGallery";

const BACKEND_BASE = "http://localhost/SistemaDeInventario/backend";

export default function ProductForm({
  selectedProduct,
  setSelectedProduct,
  onAddProduct,
  onUpdateProduct,
  reload,
  onFinished, // 👈 callback para cerrar modal
}) {
  const [form, setForm] = useState({
    id: null,
    name: "",
    category_id: "",
    price: "",
  });

  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([{ label: "", stock: 0 }]);

  // Imagen
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Hook de imágenes (galería cuando ya existe el producto)
  const { images, deleteImage, setMainImage, reorderImages } = useProductImages(
    form.id
  );

  // Cargar categorías
  useEffect(() => {
    api
      .get("admin/categories/get-categories.php")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  // Al seleccionar producto para editar
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

      // traer variantes del backend
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
            // fallback legacy
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
    } else {
      // modo agregar
      setForm({ id: null, name: "", category_id: "", price: "" });
      setVariants([{ label: "", stock: 0 }]);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(null);
      setCurrentImage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  // liberar memoria si cambia preview o al desmontar
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // recibe File|null del ImagePicker
  const handlePick = (file) => {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setFile(null);
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFile(file);
    setPreview(url);
  };

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
            .filter((v) => v.label.length > 0), // evitar variantes vacías
        };
        await api.post("admin/products/set-product-variants.php", payload);
      }

      // subir imagen (opcional)
      if (file && productId) {
        const r = await uploadProductImage(productId, file);
        if (!r?.success) console.error("Error subiendo imagen:", r?.error);
      }

      // recargar listado y cerrar modal
      if (typeof reload === "function") await reload(Date.now());
      if (typeof onFinished === "function") onFinished();

      // Limpieza (por si el modal no se cerrara por algún motivo)
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      setCurrentImage(null);
      setVariants([{ label: "", stock: 0 }]);
      setForm({ id: null, name: "", category_id: "", price: "" });
      // ⚠️ No hacemos setSelectedProduct(null) acá porque el modal ya se cierra arriba
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

        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p className="font-medium">Ejemplos de talles:</p>
          <ul className="list-disc list-inside">
            <li>Ropa: XS, S, M, L, XL, XXL</li>
            <li>Numéricos: 1, 2, 3, 4, 5, 6</li>
            <li>Talle único: Único / One Size</li>
            <li>Calzado: 35, 36, 37, 38, 39, 40</li>
          </ul>
        </div>
      </div>

      {/* Imagen principal */}
      <ImagePickerPro
        label="Imagen principal"
        value={preview || currentImage || null}
        onChangeFile={handlePick}
      />

      {form.id && (
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
