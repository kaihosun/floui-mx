import { supabaseAdmin } from './_lib/supabase.js'
import { sendResourceEmail } from './_lib/resend.js'
import MercadoPago, { Payment } from 'mercadopago'

const mp = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Responder 200 inmediatamente — MP reintenta si no recibe respuesta rápida
  res.status(200).json({ ok: true })

  const { type, data } = req.body

  if (type !== 'payment' || !data?.id) return

  try {
    // Verificar el pago en MP (no confiar en el payload del webhook)
    const payment = new Payment(mp)
    const paymentData = await payment.get({ id: data.id })

    if (paymentData.status !== 'approved') return

    const leadId = paymentData.external_reference
    const mpPaymentId = String(paymentData.id)

    // Idempotencia — si ya procesamos este pago, salir
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id, status')
      .eq('mp_payment_id', mpPaymentId)
      .single()

    if (existing) return

    // Obtener lead y recurso
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id, nombre, correo, recurso_id')
      .eq('id', leadId)
      .single()

    if (!lead) return

    const { data: recurso } = await supabaseAdmin
      .from('recursos')
      .select('id, titulo, archivo_path')
      .eq('id', lead.recurso_id)
      .single()

    if (!recurso?.archivo_path) return

    // Generar signed URL (7 días)
    const { data: signedData } = await supabaseAdmin.storage
      .from('resources')
      .createSignedUrl(recurso.archivo_path, 60 * 60 * 24 * 7)

    if (!signedData?.signedUrl) return

    // Actualizar lead a paid + delivered
    await supabaseAdmin
      .from('leads')
      .update({
        status: 'delivered',
        mp_payment_id: mpPaymentId,
        delivered_at: new Date().toISOString(),
      })
      .eq('id', leadId)

    // Incrementar descargas
    await supabaseAdmin.rpc('increment_descargas', { recurso_id: recurso.id })

    // Enviar email de entrega
    await sendResourceEmail({
      nombre: lead.nombre,
      correo: lead.correo,
      recurso,
      downloadUrl: signedData.signedUrl,
      tipo: 'premium',
    })

  } catch (err) {
    console.error('webhook-mp error:', err)
  }
}
