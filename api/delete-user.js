export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    // 1. Validar usuário
    const userRes = await fetch(
      'https://vppzpfoqmhjsynusyitx.supabase.co/auth/v1/user',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: 'SUA_ANON_KEY',
        },
      }
    );

    const userData = await userRes.json();

    if (!userRes.ok || !userData?.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const userId = userData.id;

    // 2. Deletar usuário com service_role
    const deleteRes = await fetch(
      `https://vppzpfoqmhjsynusyitx.supabase.co/auth/v1/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer SUA_SERVICE_ROLE_KEY`,
          apikey: 'SUA_SERVICE_ROLE_KEY',
        },
      }
    );

    if (!deleteRes.ok) {
      const text = await deleteRes.text();
      return res.status(400).json({ error: text });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno' });
  }
}
