export default async function handler(req, res) {
  const { job_id } = req.query;

  try {
    const response = await fetch(
      `${process.env.API_URL}/api/actas/job/status/${job_id}`
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con el servidor' });
  }
}

