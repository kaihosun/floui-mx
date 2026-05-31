import { supabaseAdmin } from './_lib/supabase.js'
import { sendResourceEmail } from './_lib/resend.js'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createHmac, timingSafeEqual } from 'node:crypto'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })

function isSecretConfigured(secret) {
  return !!secret && !secret.startsWith('PENDIENTE')
}

function verifyMpSignature({ secret, xSignature, xRequestId, dataId }) {
  if (!xSignature || typeof xSignature !== 'string') return false

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, ...rest] = p.trim().split('=')
      return [k, rest.join('=')]
    })
  )
  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return false

  const id = dataId != null ? String(dataId).toLowerCase() : ''
  const requestId = xRequestId || ''
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`

  const computed = createHmac('sha256', secret).update(manifest).digest('hex')

  const a = Buffer.from(computed, 'utf8')
  const b = Buffer.from(v1, 'utf8')
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, data } = req.body || {}
  const dataId = data?.id

  // Validar firma del webhook (fail-open mientras secret esté PENDIENTE)
  const secret = process.env.MP_WEBHOOK_SECRET
  const xSignature = req.headers['x-signature']
  const xRequestId = req.headers['x-request-id']

  if (isSecretConfigured(secret)) {
    const valid = verifyMpSignature({ secret, xSignature, xRequestId, dataId })
    if (!valid) {
      console.warn('webhook-mp: firma inválida', { xRequestId })
      return res.status(401).json({ error: 'Invalid signature' })
    }
  } else {
    console.warn('webhook-mp: MP_WEBHOOK_SECRET no configurado — fail-open')
  }

  // Responder 200 inmediatamente — MP reintenta si no recibe respuesta rápida
  res.status(200).json({ ok: true })

  if (type !== 'payment' || !dataId) return

  try {
    // Verificar el pago en MP (no confiar en el payload del webhook)
    const payment = new Payment(mp)
    const paymentData = await payment.get({ id: dataId })

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
