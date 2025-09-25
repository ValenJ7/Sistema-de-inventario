import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../api/backend";

const BACKEND_BASE = "http://localhost/SistemaDeInventario/backend";

function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u; // ya absoluta
  if (u.startsWith("/")) return `${BACKEND_BASE}${u}`;
  return `${BACKEND_BASE}/${u}`;
}

export default function useProductImages(productId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // siempre ordenadas por sort_order
  const sorted = useMemo(
    () =>
      (images || []).slice().sort((a, b) => {
        const ao = Number(a.sort_order ?? 9999);
        const bo = Number(b.sort_order ?? 9999);
        return ao - bo;
      }),
    [images]
  );

  // cargar imágenes
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

        const mapped = list.map((x) => ({
          id: x.id,
          url: absUrl(x.url),
          sort_order: Number(x.sort_order ?? 9999),
          is_main:
            x.is_main === true ||
            x.is_main === 1 ||
            String(x.is_main) === "1",
        }));

        setImages(mapped);
      } catch (err) {
        console.error("Error cargando imágenes:", err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // eliminar
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

  // marcar principal
  const setMainImage = useCallback(
    async (imageId) => {
      if (!productId || !imageId) return;
      try {
        await api.post("admin/products/set-main-product-image.php", {
          product_id: productId,
          image_id: imageId,
        });

        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_main: img.id === imageId,
          }))
        );
      } catch (err) {
        console.error("Error seteando principal:", err);
      }
    },
    [productId]
  );

  // reordenar
  const reorderImages = useCallback(
    async (newOrderIds) => {
      if (!productId || !Array.isArray(newOrderIds) || !newOrderIds.length)
        return;

      try {
        const fd = new FormData();
        fd.append("product_id", String(productId));
        newOrderIds.forEach((id) => fd.append("order[]", String(id)));

        await api.post("admin/products/reorder-product-images.php", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setImages((prev) => {
          const map = new Map(prev.map((x) => [x.id, x]));
          const next = newOrderIds
            .map((id, i) => {
              const it = map.get(id);
              if (!it) return null;
              return { ...it, sort_order: i + 1 };
            })
            .filter(Boolean);
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
