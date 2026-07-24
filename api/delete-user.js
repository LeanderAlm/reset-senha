export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const userRes = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.SUPABASE_ANON_KEY,
        },
      },
    );

    const userData = await userRes.json();

    if (!userRes.ok || !userData?.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const userId = userData.id;
    const suffix = userId.replace(/-/g, '');
    const deletedAt = new Date().toISOString();

    const updateProfileRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          documento: `EXCLUIDO-${suffix}`,
          nome_completo: null,
          razao_social: null,
          telefone: 'EXCLUIDO',
          email: `excluido-${suffix}@anonimo.invalid`,
          cep: 'EXCLUIDO',
          rua: 'EXCLUIDO',
          numero: 'EXCLUIDO',
          complemento: null,
          bairro: 'EXCLUIDO',
          cidade: 'EXCLUIDO',
          estado: 'EXCLUIDO',
          observacoes: '',
          status: 'excluido',
          accepted_terms_at: null,
          document_url: null,
          deleted_at: deletedAt,
        }),
      },
    );

    if (!updateProfileRes.ok) {
      const errorText = await updateProfileRes.text();

      console.error(
        '[DELETE USER] Erro ao anonimizar profile:',
        errorText,
      );

      return res.status(500).json({
        error: 'Não foi possível anonimizar os dados da conta',
      });
    }

    const deleteAuthRes = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      },
    );

    if (!deleteAuthRes.ok) {
      const errorText = await deleteAuthRes.text();

      console.error(
        '[DELETE USER] Erro ao excluir Authentication:',
        errorText,
      );

      return res.status(500).json({
        error: 'Os dados foram anonimizados, mas houve erro ao excluir o acesso',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conta excluída com sucesso',
    });
  } catch (error) {
    console.error('[DELETE USER] Erro inesperado:', error);

    return res.status(500).json({
      error: 'Erro interno',
    });
  }
}
