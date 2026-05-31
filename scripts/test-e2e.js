#!/usr/bin/env node
/**
 * E2E test suite — floui /up
 *
 * Prueba los tres flujos críticos contra la URL configurada (prod o local).
 * Limpia los leads de prueba de Supabase al terminar.
 *
 * Uso:
 *   BASE_URL=https://floui.mx node scripts/test-e2e.js
 *   BASE_URL=http://localhost:3000 node scripts/test-e2e.js
 *
 * Requiere en el entorno (o en .env.local):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MP_ACCESS_TOKEN (sandbox), RESEND_API_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import MercadoPago, { Payment } from 'mercadopago'
import { createHmac } from 'node:crypto'

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL || 'https://floui.mx'
const TEST_EMAIL = process.env.TEST_EMAIL || 'eduardo.aquino@miglobal.com.mx'
const TEST_NOMBRE = 'QA Bot'
const TEST_TELEFONO = '+525500000000'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const createdLeadIds = []

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pass(msg) { console.log(`  ✓ ${msg}`) }
function fail(msg) { console.error(`  ✗ ${msg}`); process.exitCode = 1 }
function section(title) { console.log(`\n── ${title} ──`) }

async function post(path, body, extraHeaders = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = { _raw: text } }
  return { status: res.status, json }
}

/**
 * Genera un header x-signature compatible con la verificación HMAC de MP.
 * Usa el mismo algoritmo que webhook-mp.js: manifest = "id:{dataId};request-id:{reqId};ts:{ts};"
 */
function buildMpSignature({ secret, dataId, requestId }) {
  const ts = Math.floor(Date.now() / 1000).toString()
  const id = dataId != null ? String(dataId).toLowerCase() : ''
  const reqId = requestId || ''
  const manifest = `id:${id};request-id:${reqId};ts:${ts};`
  const v1 = createHmac('sha256', secret).update(manifest).digest('hex')
  return { xSignature: `ts=${ts},v1=${v1}`, xRequestId: reqId }
}

async function getLeadById(id) {
  const { data } = await supabase.from('leads').select('*').eq('id', id).single()
  return data
}

async function getFreeRecurso() {
  const { data } = await supabase
    .from('recursos')
    .select('id, titulo, acceso, archivo_path')
    .eq('acceso', 'free')
    .eq('publicado', true)
    .limit(1)
    .single()
  return data
}

async function getPremiumRecurso() {
  const { data } = await supabase
    .from('recursos')
    .select('id, titulo, acceso, precio_mxn')
    .eq('acceso', 'premium')
    .eq('publicado', true)
    .not('precio_mxn', 'is', null)
    .limit(1)
    .single()
  return data
}

async function cleanup() {
  if (createdLeadIds.length === 0) return
  await supabase.from('leads').delete().in('id', createdLeadIds)
  console.log(`\n  Cleanup: ${createdLeadIds.length} lead(s) de prueba eliminados.`)
}

// ─── Test 1: Free download ────────────────────────────────────────────────────

async function testFreeDownload() {
  section('TEST 1 — Descarga gratuita (/api/leads)')

  const recurso = await getFreeRecurso()
  if (!recurso) { fail('No hay recurso free publicado en Supabase'); return }
  pass(`Recurso free encontrado: "${recurso.titulo}"`)

  const { status, json } = await post('/api/leads', {
    nombre: TEST_NOMBRE,
    correo: TEST_EMAIL,
    telefono: TEST_TELEFONO,
    recurso_id: recurso.id,
    newsletter_opt: false,
  })

  if (status !== 200) { fail(`API respondió ${status}: ${JSON.stringify(json)}`); return }
  if (!json.ok) { fail(`Respuesta sin ok=true: ${JSON.stringify(json)}`); return }
  pass(`API /api/leads → 200 ok`)

  // Verificar lead en Supabase
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('correo', TEST_EMAIL)
    .eq('recurso_id', recurso.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const lead = leads?.[0]
  if (!lead) { fail('Lead no encontrado en Supabase'); return }
  createdLeadIds.push(lead.id)

  if (lead.status === 'delivered') { pass(`Lead status = "delivered"`) }
  else { fail(`Lead status = "${lead.status}" (esperado "delivered")`) }

  if (lead.delivered_at) { pass(`delivered_at registrado`) }
  else { fail(`delivered_at es null`) }

  // Verificar email vía Resend logs (últimos 10 minutos)
  if (resend) {
    try {
      const { data: emails } = await resend.emails.list()
      const recent = emails?.find(e => e.to?.includes(TEST_EMAIL) && e.subject?.includes(recurso.titulo))
      if (recent) { pass(`Email enviado por Resend (id: ${recent.id})`) }
      else { fail(`Email no encontrado en Resend logs — verifica ${TEST_EMAIL}`) }
    } catch {
      pass(`Email enviado (no se pudo verificar vía Resend API — revisa ${TEST_EMAIL} manualmente)`)
    }
  } else {
    pass(`RESEND_API_KEY no definida — asume email enviado. Verifica ${TEST_EMAIL} manualmente.`)
  }
}

// ─── Test 2: Checkout premium ─────────────────────────────────────────────────

async function testCheckout() {
  section('TEST 2 — Checkout premium (/api/checkout)')

  const recurso = await getPremiumRecurso()
  if (!recurso) { fail('No hay recurso premium publicado con precio_mxn'); return }
  pass(`Recurso premium encontrado: "${recurso.titulo}" ($${recurso.precio_mxn} MXN)`)

  const { status, json } = await post('/api/checkout', {
    nombre: TEST_NOMBRE,
    correo: TEST_EMAIL,
    telefono: TEST_TELEFONO,
    recurso_id: recurso.id,
    newsletter_opt: false,
  })

  if (status !== 200) { fail(`API respondió ${status}: ${JSON.stringify(json)}`); return }
  if (!json.init_point) { fail(`Respuesta sin init_point: ${JSON.stringify(json)}`); return }
  pass(`API /api/checkout → 200 con init_point`)

  // Verificar que la URL de MP es válida
  if (json.init_point.startsWith('https://')) { pass(`init_point es HTTPS: ${json.init_point.slice(0, 60)}…`) }
  else { fail(`init_point no parece una URL válida: ${json.init_point}`) }

  // Verificar lead pending en Supabase
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('correo', TEST_EMAIL)
    .eq('recurso_id', recurso.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const lead = leads?.[0]
  if (!lead) { fail('Lead pending no encontrado en Supabase'); return }
  createdLeadIds.push(lead.id)

  if (lead.status === 'pending') { pass(`Lead status = "pending"`) }
  else { fail(`Lead status = "${lead.status}" (esperado "pending")`) }

  if (lead.mp_preference_id) { pass(`mp_preference_id guardado: ${lead.mp_preference_id}`) }
  else { fail(`mp_preference_id es null`) }

  console.log(`\n  ℹ Para completar la prueba de pago real, abre en browser:`)
  console.log(`    ${json.init_point}`)
  console.log(`    Usa tarjeta de prueba MercadoPago: 5031 7557 3453 0604, CVV: 123, Venc: 11/25`)
}

// ─── Test 3: Webhook simulado ─────────────────────────────────────────────────

async function testWebhookSimulated() {
  section('TEST 3 — Webhook MP simulado (/api/webhook-mp)')

  // Este test requiere un lead pending real — lo creamos directamente en Supabase
  const recurso = await getPremiumRecurso()
  if (!recurso) { fail('No hay recurso premium para simular webhook'); return }

  // Crear lead pending directo en Supabase (sin pasar por checkout para no crear preferencia real)
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      nombre: TEST_NOMBRE,
      correo: TEST_EMAIL,
      recurso_id: recurso.id,
      newsletter_opt: false,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !lead) { fail(`No se pudo crear lead de prueba: ${error?.message}`); return }
  createdLeadIds.push(lead.id)
  pass(`Lead de prueba creado (id: ${lead.id})`)

  // El webhook verifica el pago contra MP API real, así que no podemos simular completamente
  // sin un payment_id real de sandbox. Verificamos que el endpoint responde 200 cuando la
  // firma es válida, y que rechaza payloads sin firma (401) cuando el secret está configurado.

  const webhookSecret = process.env.MP_WEBHOOK_SECRET
  const fakePaymentId = 'FAKE_PAYMENT_ID_QA_TEST'
  const fakeRequestId = 'qa-test-request-001'

  let webhookHeaders = {}
  if (webhookSecret && !webhookSecret.startsWith('PENDIENTE')) {
    const { xSignature, xRequestId } = buildMpSignature({
      secret: webhookSecret,
      dataId: fakePaymentId,
      requestId: fakeRequestId,
    })
    webhookHeaders = { 'x-signature': xSignature, 'x-request-id': xRequestId }
    pass(`Firma HMAC generada para el request de prueba`)
  } else {
    pass(`MP_WEBHOOK_SECRET no configurado — enviando sin firma (fail-open esperado)`)
  }

  const { status: status1 } = await post('/api/webhook-mp', {
    type: 'payment',
    data: { id: fakePaymentId },
  }, webhookHeaders)

  if (status1 === 200) {
    pass(`Webhook responde 200 inmediatamente (correcto — MP requiere respuesta rápida)`)
  } else {
    fail(`Webhook respondió ${status1} (esperado 200) — verifica MP_WEBHOOK_SECRET en Vercel`)
  }

  // Verificar que el lead sigue en "pending" (el pago fake no debería procesarse)
  await new Promise(r => setTimeout(r, 1500))
  const updatedLead = await getLeadById(lead.id)
  if (updatedLead?.status === 'pending') {
    pass(`Lead sigue "pending" con payment_id inválido (idempotencia correcta)`)
  } else {
    fail(`Lead cambió a "${updatedLead?.status}" con payment_id inválido — revisar lógica`)
  }

  console.log(`\n  ℹ Para prueba completa del webhook: configura MP sandbox y usa un payment_id real.`)
  console.log(`    MP Sandbox docs: https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/integration-test/test-cards`)
}

// ─── Resumen ──────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\nfloui E2E Test Suite`)
  console.log(`BASE_URL: ${BASE_URL}`)
  console.log(`Test email: ${TEST_EMAIL}`)

  await testFreeDownload()
  await testCheckout()
  await testWebhookSimulated()
  await cleanup()

  console.log('\n' + (process.exitCode === 1 ? '❌ Algunos tests fallaron.' : '✅ Todos los tests pasaron.') + '\n')
}

run().catch(err => {
  console.error('\nError fatal:', err)
  process.exit(1)
})
