const BASE_URL = "http://localhost/SistemaDeInventario/backend/auth";

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  return data; // contiene access_token, refresh_token y user
}

export async function validateToken(token) {
  const res = await fetch(`${BASE_URL}/validate.php`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${BASE_URL}/refresh.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return res.json();
}
