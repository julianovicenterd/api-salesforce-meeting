import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/submit', async (req, res) => {
  try {
    const { nome, email, telefone, CRN } = req.body;

    // Dados para autenticação Salesforce
    const client_id = 'ftjcbz9ks1nhw6903ghxlz5k';
    const client_secret = 'SCfBGfQa1hwFk820fiCZ48kZ';
    const authUrl = 'https://mcjss9736km3nd134n6cv8-hcfy0.auth.marketingcloudapis.com/v2/token';
    const restUrl = 'https://mcjss9736km3nd134n6cv8-hcfy0.rest.marketingcloudapis.com/';
    const dataExtensionKey = 'DE_NUTRIS_CADASTRO';

    // Autenticar no Salesforce para pegar o access_token
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id,
        client_secret
      }),
    });

    if (!authResponse.ok) {
      return res.status(500).json({ error: 'Falha na autenticação com Salesforce' });
    }

    const authData = await authResponse.json();
    const access_token = authData.access_token;

    // Enviar dados para a Data Extension
    const postResponse = await fetch(`${restUrl}hub/v1/dataevents/key:${dataExtensionKey}/rowset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keys: { email },
        values: { nome, email, telefone, CRN }
      }]),
    });

    if (!postResponse.ok) {
      return res.status(500).json({ error: 'Falha ao enviar dados para Salesforce' });
    }

    res.json({ success: true, message: 'Dados enviados com sucesso!' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
