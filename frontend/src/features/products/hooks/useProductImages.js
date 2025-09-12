import { useEffect, useState } from "react";
import api from "../../../api/backend";

/**
 * Hook para cargar y operar con imágenes de un producto
 */
export default function useProductImages(productId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  const reload = () => setReloadTick((t) => t + 1);

  useEffect(() => {
    if (!productId) {
      setImages([]);
      return;
    }
    setLoading(true);
    api
      .get(`/admin/products/get-product-images.php?product_id=${productId}`)
      .then((res) => {
        // El backend devuelve array directo vía json_ok
        if (Array.isArray(res.data)) setImages(res.data);
        else setImages([]);
      })
      .catch((err) => {
        console.error("Error cargando imágenes:", err);
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, [productId, reloadTick]);

  // 🗑 Borrar imagen
  const deleteImage = async (id) => {
    try {
      await api.delete(`/admin/products/delete-product-image.php?id=${id}`);
      reload();
    } catch (err) {
      console.error("Error borrando imagen:", err);
    }
  };

  // ⭐ Marcar como principal (usar FormData para PHP)
  const setMainImage = async (id) => {
    try {
      const fd = new FormData();
      fd.append("id", id);
      await api.post(`/admin/products/set-main-product-image.php`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      reload();
    } catch (err) {
      console.error("Error seteando principal:", err);
    }
  };

  // 🔀 Reordenar imágenes
  const reorderImages = async (orders) => {
    try {
      await api.post(`/admin/products/reorder-product-images.php`, { orders });
      reload();
    } catch (err) {
      console.error("Error reordenando imágenes:", err);
    }
  };

  return { images, loading, reload, deleteImage, setMainImage, reorderImages };
}
