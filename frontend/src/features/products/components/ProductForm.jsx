// components/ProductForm.jsx
import { useEffect, useMemo, useState } from "react";
import api, { uploadProductImage } from "../../../api/backend";
import useProductImages from "../hooks/useProductImages";
import ProductImageGallery from "./ui/ProductImageGallery";
import LocalProductImages from "./ui/LocalProductImages";

const BACKEND_BASE = "http://localhost/SistemaDeInventario/backend";
const isTmp = (id) => String(id).startsWith("tmp_");

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

  // (heredado, por compat)
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Modo Agregar
  const [localImages, setLocalImages] = useState([]);

  // Modo Editar
  const { images, deleteImage, setMainImage, reorderImages } = useProductImages(form.id);

  // ---------- NUEVO: flujo "Subir imagen" en EDITAR ----------
  const [pick, setPick] = useState(null);         // {file, url} antes de confirmar
  const [staged, setStaged] = useState([]);       // [{id:'tmp_*', file, url}]
  const [orderIds, setOrderIds] = useState([]);   // último orden visible en la galería (mezclado)

  // Mezclar imágenes del backend + temporales para la galería
  const galleryItems = useMemo(() => {
    const base = (images || []).slice().sort((a, b) => a.sort_order - b.sort_order);
    const stagedAsImages = staged.map((s, i) => ({
      id: s.id,
      url: s.url,
      sort_order: (base.length + i),
      is_main: false, // no marcamos principal en tmp para simplificar
    }));
    const merged = [...base, ...stagedAsImages];

    // actualizar ordenIds por defecto si aún no hay
    if (!orderIds?.length && merged.length) {
      setOrderIds(merged.map((x) => x.id));
    }
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, staged]);

  // -----------------------------------------------------------

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
          selectedProduct.category_id == null ? "" : String(selectedProduct.category_id),
        price: selectedProduct.price ?? "",
      });

      const path = selectedProduct.image_path ?? selectedProduct.main_image ?? null;
      setCurrentImage(path ? `${BACKEND_BASE}${path}` : null);

      api
        .get(`admin/products/get-product-variants.php?product_id=${selectedProduct.id}`)
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

      // limpiar estado del flujo de subida
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(null);
      setLocalImages([]);
      // 👇 importante
      staged.forEach((s) => s.url && URL.revokeObjectURL(s.url));
      setStaged([]);
      if (pick?.url) URL.revokeObjectURL(pick.url);
      setPick(null);
      setOrderIds([]);
    } else {
      // modo agregar
      setForm({ id: null, name: "", category_id: "", price: "" });
      setVariants([{ label: "", stock: 0 }]);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(null);
      setCurrentImage(null);
      setLocalImages([]);
      staged.forEach((s) => s.url && URL.revokeObjectURL(s.url));
      setStaged([]);
      if (pick?.url) URL.revokeObjectURL(pick.url);
      setPick(null);
      setOrderIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (pick?.url) URL.revokeObjectURL(pick.url);
      staged.forEach((s) => s.url && URL.revokeObjectURL(s.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, pick, staged]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // variantes
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const addVariant = () => setVariants([...variants, { label: "", stock: 0 }]);
  const removeVariant = (index) => setVariants((prev) => prev.filter((_, i) => i !== index));

  // ---------- flujo subir en EDITAR ----------
  const openPicker = () => {
    const el = document.getElementById("edit-image-picker");
    if (el) el.click();
  };

  const handlePickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (pick?.url) URL.revokeObjectURL(pick.url);
    const url = URL.createObjectURL(f);
    setPick({ file: f, url });
    e.target.value = ""; // permite re-seleccionar el mismo
  };

  const confirmPick = () => {
    if (!pick) return;
    const tmpId = `tmp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setStaged((prev) => [...prev, { id: tmpId, file: pick.file, url: pick.url }]);
    // actualizar orden visible: agregamos al final
    setOrderIds((prev) => [...(prev || galleryItems.map((x) => x.id)), tmpId]);
    setPick(null);
  };

  const handleDeleteImage = async (id) => {
    if (isTmp(id)) {
      // borrar temporal local
      setStaged((prev) => {
        const it = prev.find((x) => x.id === id);
        if (it?.url) URL.revokeObjectURL(it.url);
        return prev.filter((x) => x.id !== id);
      });
      setOrderIds((prev) => (prev || []).filter((x) => x !== id));
    } else {
      await deleteImage(id);
    }
  };

  const handleSetMain = async (id) => {
    if (isTmp(id)) {
      // opcional: podríamos guardar un "mainId" local y aplicarlo luego
      // Por simplicidad: ignoramos marcar principal en temporales.
      return;
    }
    await setMainImage(id);
  };

  const handleReorder = async (newOrderIds) => {
    setOrderIds(newOrderIds);

    // separar reales vs temporales
    const realIds = newOrderIds.filter((x) => !isTmp(x));
    const tmpIds = newOrderIds.filter(isTmp);

    // 1) backend: reordenar solo reales
    if (realIds.length && reorderImages) await reorderImages(realIds);

    // 2) locales: reordenar staged según tmpIds
    if (tmpIds.length) {
      setStaged((prev) => {
        const byId = new Map(prev.map((s) => [s.id, s]));
        return tmpIds.map((id) => byId.get(id)).filter(Boolean);
      });
    }
  };
  // ------------------------------------------

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

      // variantes
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

      if (!selectedProduct) {
        // MODO AGREGAR (igual que tenías)
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
          try {
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
      } else {
        // MODO EDITAR
        // 1) Subir temporales (en el orden actual de 'staged')
        const uploadedByTmp = new Map(); // tmpId -> newId
        for (const it of staged) {
          const r = await uploadProductImage(productId, it.file);
          if (r?.id) uploadedByTmp.set(it.id, String(r.id));
        }

        // 2) Si hubo temporales, aplicar orden final (reemplazando tmp por nuevas IDs)
        if (uploadedByTmp.size > 0 && orderIds.length > 0) {
          const finalOrder = orderIds
            .map((id) => (isTmp(id) ? uploadedByTmp.get(id) : String(id)))
            .filter(Boolean);

          try {
            const fd = new FormData();
            fd.append("product_id", String(productId));
            finalOrder.forEach((id) => fd.append("order[]", String(id)));
            await api.post("admin/products/reorder-product-images.php", fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (e) {
            console.warn("Endpoint de reorden no disponible:", e);
          }
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
      staged.forEach((s) => s.url && URL.revokeObjectURL(s.url));
      setStaged([]);
      if (pick?.url) URL.revokeObjectURL(pick.url);
      setPick(null);
      setLocalImages([]);
      setOrderIds([]);
    } catch (err) {
      console.error("Error en submit:", err);
    }
  };

  return (
    <form id="product-form" onSubmit={handleSubmit} className="mb-8 w-full max-w-none space-y-4">
      <input type="hidden" name="id" value={form.id ?? ""} readOnly />

      {/* Campos */}
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
              <option key={c.id} value={String(c.id)}>{c.name}</option>
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

      {/* Subir imagen (EDITAR): botón + previsualización/confirmación */}
      {form.id && (
        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Agregar imagen</h3>
            <button
              type="button"
              onClick={openPicker}
              className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Subir imagen
            </button>
            <input
              id="edit-image-picker"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickFile}
            />
          </div>

          {pick && (
            <div className="mt-3 flex items-center gap-3">
              <div className="w-24 h-24 overflow-hidden rounded-lg bg-gray-50 border">
                <img src={pick.url} alt="Previsualización" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirmPick}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => { URL.revokeObjectURL(pick.url); setPick(null); }}
                  className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Galería (mezcla reales + temporales) */}
      {!form.id ? (
        <LocalProductImages value={[]} onChange={setLocalImages} />
      ) : (
        <ProductImageGallery
          images={galleryItems}
          onDeleteImage={handleDeleteImage}
          onSetMain={handleSetMain}
          onReorder={handleReorder}
        />
      )}

      {/* Sin botones aquí: los maneja el footer del ModalShell */}
    </form>
  );
}
