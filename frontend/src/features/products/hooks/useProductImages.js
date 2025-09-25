// hooks/useProductImages.js
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../api/backend";

// 👇 Ajustá esto a tu base real del backend (igual que en ProductForm)
const BACKEND_BASE = "http://localhost/SistemaDeInventario/backend";

// Helper: si viene una ruta relativa, la completa con BACKEND_BASE
function absUrl(u) {
  if (!u) return "";
  // ya absoluta?
  if (/^https?:\/\//i.test(u)) return u;
  // evitar doble slash
  if (u.startsWith("/")) return `${BACKEND_BASE}${u}`;
  return `${BACKEND_BASE}/${u}`;
}

/**
 * Maneja la galería de imágenes de un producto:
 *  - carga inicial (normaliza: solo 1 principal)
 *  - eliminar
 *  - marcar como principal
 *  - reordenar
 *
 * Estructura esperada: { id, url, sort_order, is_main }
 */
export default function useProductImages(productId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sorted = useMemo(
    () =>
      (images || []).slice().sort((a, b) => {
        const ao = Number(a.sort_order ?? 9999);
        const bo = Number(b.sort_order ?? 9999);
        return ao - bo;
      }),
    [images]
  );

  // Cargar imágenes y normalizar a 1 principal
  useEffect(() => {
    if (!productId) {
      setImages([]);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `admin/products/get-product-images.php?product_id=${productId}`
        );
        const list = Array.isArray(res.data) ? res.data : [];

        const mapped = list.map((x) => {
          const raw =
            x.url || x.image_url || x.path || x.image_path || x.filepath || "";
          return {
            id: x.id,
            url: absUrl(raw),
            sort_order: Number(x.sort_order ?? x.order ?? 9999),
            is_main:
              x.is_main === true || x.is_main === 1 || String(x.is_main) === "1",
          };
        });

        mapped.sort(
          (a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)
        );

        let mainIndex = mapped.findIndex((i) => i.is_main);
        if (mainIndex === -1) mainIndex = 0;
        if (mainIndex !== 0) {
          const [m] = mapped.splice(mainIndex, 1);
          mapped.unshift(m);
        }

        const normalized = mapped.map((it, i) => ({
          ...it,
          is_main: i === 0,
          sort_order: i + 1,
        }));

        setImages(normalized);
      } catch (err) {
        console.error("Error cargando imágenes:", err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const deleteImage = useCallback(async (imageId) => {
    if (!imageId) return;
    try {
      await api.post("admin/products/delete-product-image.php", {
        image_id: imageId,
      });
      setImages((prev) => prev.filter((it) => it.id !== imageId));
    } catch (err) {
      console.error("Error eliminando imagen:", err);
    }
  }, []);

  const setMainImage = useCallback(
    async (imageId) => {
      if (!productId || !imageId) return;
      try {
        await api.post("admin/products/set-main-product-image.php", {
          product_id: productId,
          image_id: imageId,
        });

        setImages((prev) => {
          const arr = prev.slice();
          const idx = arr.findIndex((x) => x.id === imageId);
          if (idx === -1) return prev;
          const [it] = arr.splice(idx, 1);
          arr.unshift({ ...it, is_main: true });
          return arr.map((x, i) => ({ ...x, sort_order: i + 1, is_main: i === 0 }));
        });
      } catch (err) {
        console.error("Error seteando principal:", err);
      }
    },
    [productId]
  );

  const reorderImages = useCallback(
  async (newOrderIds) => {
    if (!productId || !Array.isArray(newOrderIds) || !newOrderIds.length) return;

    try {
      // 👉 Enviar como form-data: product_id + order[]
      const fd = new FormData();
      fd.append("product_id", String(productId));
      newOrderIds.forEach((id) => fd.append("order[]", String(id)));

      await api.post("admin/products/reorder-product-images.php", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // actualizar estado local (reflejar el nuevo orden y la principal)
      setImages((prev) => {
        const map = new Map(prev.map((x) => [x.id, x]));
        const next = newOrderIds
          .map((id, i) => {
            const it = map.get(id);
            if (!it) return null;
            return { ...it, sort_order: i + 1, is_main: i === 0 };
          })
          .filter(Boolean);
        // defensivo: anexar alguna que no viniera
        prev.forEach((x) => {
          if (!newOrderIds.includes(x.id)) next.push(x);
        });
        return next;
      });
    } catch (err) {
      console.error("Error reordenando imágenes:", err);
    }
  },
  [productId]
);


  return {
    images: sorted,
    loading,
    deleteImage,
    setMainImage,
    reorderImages,
    setImages,
  };
}
