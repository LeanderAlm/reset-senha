export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID é obrigatório' });
  }

  try {
    const response = await fetch(
      'https://vppzpfoqmhjsynusyitx.supabase.co/auth/v1/admin/users/' + userId,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer SUA_SERVICE_ROLE_KEY`,
          apikey: 'SUA_SERVICE_ROLE_KEY',
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(400).json({ error: text });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
