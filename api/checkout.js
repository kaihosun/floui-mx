import { supabase, supabaseAdmin } from './_lib/supabase.js'
import { subscribeToLoops } from './_lib/loops.js'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SLUG_REGEX = /^[a-z0-9-]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { nombre, correo, telefono, recurso_id, newsletter_opt } = req.body

  if (!nombre || !correo || !recurso_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }

  if (typeof nombre !== 'string' || nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre inválido' })
  }
  if (typeof correo !== 'string' || !EMAIL_REGEX.test(correo)) {
    return res.status(400).json({ error: 'Email inválido' })
  }
  if (telefono != null && (typeof telefono !== 'string' || telefono.length > 20)) {
    return res.status(400).json({ error: 'Teléfono inválido' })
  }
  if (typeof recurso_id !== 'string' || !SLUG_REGEX.test(recurso_id)) {
    return res.status(400).json({ error: 'Recurso inválido' })
  }

  // Obtener recurso premium
  const { data: recurso, error: recursoError } = await supabase
    .from('recursos')
    .select('id, titulo, subtitulo, precio_mxn, acceso, portada_path')
    .eq('id', recurso_id)
    .eq('publicado', true)
    .single()

  if (recursoError || !recurso) {
    return res.status(404).json({ error: 'Recurso no encontrado' })
  }

  if (recurso.acceso !== 'premium' || !recurso.precio_mxn) {
    return res.status(400).json({ error: 'Recurso no disponible para compra' })
  }

  // Crear lead en estado pending
  const { data: lead, error: leadError } = await supabaseAdmin
    .from('leads')
    .insert({
      nombre,
      correo,
      telefono: telefono || null,
      recurso_id,
      newsletter_opt: newsletter_opt || false,
      status: 'pending',
    })
    .select('id')
    .single()

  if (leadError) {
    console.error('checkout lead insert error:', leadError)
    return res.status(500).json({ error: 'Error al procesar la solicitud' })
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://floui.mx'

  // Crear preferencia en MercadoPago
  // SDK v2 devuelve el objeto directamente (sin envolver en { body })
  const preference = new Preference(mp)
  const mpResponse = await preference.create({
    body: {
      items: [{
        title: recurso.titulo,
        description: recurso.subtitulo || 'Recurso digital floui',
        quantity: 1,
        currency_id: 'MXN',
        unit_price: recurso.precio_mxn,
      }],
      payer: {
        name: nombre,
        email: correo,
      },
      external_reference: lead.id,
      notification_url: `${baseUrl}/api/webhook-mp`,
      back_urls: {
        success: `${baseUrl}/floui-up?status=success`,
        failure: `${baseUrl}/floui-up?status=failure`,
        pending: `${baseUrl}/floui-up?status=pending`,
      },
      auto_return: 'approved',
    }
  })

  // Guardar preference_id en el lead
  await supabaseAdmin
    .from('leads')
    .update({ mp_preference_id: mpResponse.id })
    .eq('id', lead.id)

  // Newsletter (no bloquear si falla)
  if (newsletter_opt) {
    subscribeToLoops({ nombre, correo, fuente: 'lead' }).catch(console.error)

    supabaseAdmin.from('suscriptores').upsert(
      { nombre, correo, fuente: 'lead' },
      { onConflict: 'correo' }
    ).catch(console.error)
  }

  return res.status(200).json({ init_point: mpResponse.init_point })
}
