import { supabaseAdmin } from './_lib/supabase.js'
import { sendResourceEmail } from './_lib/resend.js'
import { subscribeToLoops } from './_lib/loops.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { nombre, correo, telefono, recurso_id, newsletter_opt } = req.body

  if (!nombre || !correo || !recurso_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }

  // Obtener recurso (solo free — premium usa /api/checkout)
  const { data: recurso, error: recursoError } = await supabaseAdmin
    .from('recursos')
    .select('id, titulo, acceso, archivo_path')
    .eq('id', recurso_id)
    .eq('publicado', true)
    .single()

  if (recursoError || !recurso) {
    return res.status(404).json({ error: 'Recurso no encontrado' })
  }

  if (recurso.acceso !== 'free') {
    return res.status(400).json({ error: 'Recurso premium — usar /api/checkout' })
  }

  // Guardar lead
  const { data: lead, error: leadError } = await supabaseAdmin
    .from('leads')
    .insert({
      nombre,
      correo,
      telefono: telefono || null,
      recurso_id,
      newsletter_opt: newsletter_opt || false,
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (leadError) {
    console.error('leads insert error:', leadError)
    return res.status(500).json({ error: 'Error al procesar la solicitud' })
  }

  // Incrementar contador de descargas
  await supabaseAdmin.rpc('increment_descargas', { recurso_id })

  // Generar signed URL (7 días)
  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from('resources')
    .createSignedUrl(recurso.archivo_path, 60 * 60 * 24 * 7)

  if (signedError || !signedData?.signedUrl) {
    console.error('signed URL error:', signedError)
    return res.status(500).json({ error: 'Error al generar link de descarga' })
  }

  // Enviar email
  await sendResourceEmail({
    nombre,
    correo,
    recurso,
    downloadUrl: signedData.signedUrl,
    tipo: 'free',
  })

  // Newsletter (no bloquear si falla)
  if (newsletter_opt) {
    subscribeToLoops({ nombre, correo, fuente: 'lead' }).catch(console.error)

    supabaseAdmin.from('suscriptores').upsert(
      { nombre, correo, fuente: 'lead' },
      { onConflict: 'correo' }
    ).catch(console.error)
  }

  return res.status(200).json({ ok: true, message: 'Revisa tu correo' })
}
