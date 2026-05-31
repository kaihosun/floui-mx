export async function subscribeToLoops({ nombre, correo, fuente = 'lead' }) {
  if (!process.env.LOOPS_API_KEY) return { ok: false, reason: 'no_key' }

  const res = await fetch('https://app.loops.so/api/v1/contacts/upsert', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: correo,
      firstName: nombre,
      source: `floui-${fuente}`,
      subscribed: true,
    }),
  })

  return { ok: res.ok, status: res.status }
}
