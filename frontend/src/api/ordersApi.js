// src/api/ordersApi.js
import api from './backend';

export async function fetchOrders(token) {
  try {
    const res = await api.get('admin/orders/list.php', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (e) {
    throw e?.response?.data?.error || 'Error al obtener pedidos';
  }
}

export async function fetchOrderById(id, token) {
  try {
    const res = await api.get(`admin/orders/view.php?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (e) {
    throw e?.response?.data?.error || 'Error al obtener pedido';
  }
}

export async function addTrackingNumber(orderId, trackingNumber, token) {
  try {
    const res = await api.post(
      'admin/orders/add-tracking.php',
      JSON.stringify({
        order_id: orderId,
        tracking_number: trackingNumber,
      }),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (e) {
    throw e?.response?.data?.error || 'Error al agregar tracking';
  }
}

export async function updateShippingStatus(orderId, status, token) {
  try {
    const res = await api.post(
      'admin/orders/update-status.php',
      JSON.stringify({
        order_id: orderId,
        shipping_status: status,
      }),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (e) {
    throw e?.response?.data?.error || 'Error al actualizar estado';
  }
}

export async function fetchReadyToShipOrders(token) {
  try {
    const res = await api.get("admin/orders/list-ready.php", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (e) {
    throw e?.response?.data?.error || "Error al obtener pedidos para despachar";
  }
}