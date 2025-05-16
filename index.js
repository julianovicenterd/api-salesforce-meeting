const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function authenticateSalesforce() {
  const response = await fetch(process.env.SF_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function submitToSalesforce(data) {
  const token = await authenticateSalesforce();

  const response = await fetch(`${process.env.SF_REST_URL}/data/v1/async/dataextensions/key:DE_NUTRIS_CADASTRO/rows`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [data]
    }),
  });

  return response.ok;
}

app.post('/', async (req, res) => {
  const formData = req.body;

  const mappedData = {
    nome: formData.nome,
    email: formData.email,
    telefone: formData.telefone,
    crn: formData.crn,
    conhecimento: formData.conhecimento
  };

  try {
    const success = await submitToSalesforce(mappedData);
    if (success) {
      res.status(200).json({ message: 'Dados enviados com sucesso' });
    } else {
      res.status(500).json({ message: 'Erro ao enviar dados' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro inesperado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
