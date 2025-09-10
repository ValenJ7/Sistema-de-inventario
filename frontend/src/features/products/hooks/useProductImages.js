import { useEffect, useState } from "react";
import api from "../../../api/backend";

export default function useProductImages(productId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api
      .get(`/products/get-product-images.php?product_id=${productId}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setImages(res.data);
        } else {
          setImages([]);
        }
      })
      .catch((err) => {
        console.error("Error cargando imágenes:", err);
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, [productId, reloadFlag]);

  const reload = () => setReloadFlag(Date.now());

  // 🗑 Borrar imagen
  const deleteImage = async (id) => {
    try {
      const res = await api.delete(`/products/delete-product-image.php?id=${id}`);
      if (res?.data?.success) reload();
    } catch (err) {
      console.error("Error borrando imagen:", err);
    }
  };

  // ⭐ Marcar como principal
    const setMainImage = async (id) => {
    try {
      const formData = new FormData();
      formData.append("id", id);

      const res = await api.post(`/products/set-main-product-image.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.success) reload();
    } catch (err) {
      console.error("Error seteando principal:", err);
    }
  };

  return { images, loading, reload, deleteImage, setMainImage };
}
