import { supabaseAdmin } from './_lib/supabase.js'
import { spawnSync } from 'node:child_process'
import { appendFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const LOG_DIR = '/tmp/floui-logs'
const FEEDBACK_DIR = '/tmp/floui-feedback'
const SLUG_REGEX = /^[a-z0-9-]+$/

function tryHermes(message) {
  const phone = process.env.HERMES_PHONE
  if (!phone || phone.startsWith('PENDIENTE')) return
  const candidates = ['hermes', '/Users/eduardoflores/.local/bin/hermes', '/Users/eduardoflores/.hermes/hermes-agent/hermes']
  for (const bin of candidates) {
    const r = spawnSync(bin, ['send', 'whatsapp', phone, message], { encoding: 'utf8' })
    if (r.error && r.error.code === 'ENOENT') continue
    return
  }
}

function writeLog(filename, line) {
  try {
    mkdirSync(LOG_DIR, { recursive: true })
    appendFileSync(resolve(LOG_DIR, filename), line + '\n')
  } catch (e) {
    console.log(`[log:${filename}] ${line}`)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = req.headers['x-approve-secret']
  if (!secret || secret !== process.env.APPROVE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { command } = req.body || {}
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Missing command' })
  }

  const parts = command.trim().split(/\s+/)
  const action = (parts[0] || '').toUpperCase()
  const slug = parts[1]
  const notes = parts.slice(2).join(' ')

  if (!slug) return res.status(400).json({ error: 'Missing slug' })
  if (!SLUG_REGEX.test(slug)) {
    return res.status(400).json({ error: 'Slug inválido' })
  }

  const ts = new Date().toISOString()

  if (action === 'APROBAR') {
    const { data, error } = await supabaseAdmin
      .from('recursos')
      .update({ publicado: true })
      .eq('slug', slug)
      .select('id, titulo')
      .maybeSingle()

    if (error) {
      console.error('approve update error:', error)
      return res.status(500).json({ error: 'DB error' })
    }
    if (!data) return res.status(404).json({ error: 'Recurso no encontrado' })

    writeLog('publisher.log', `${ts} | ${slug} | APROBADO`)
    tryHermes(`Recurso publicado en /up: ${data.titulo} (${slug})`)
    return res.status(200).json({ ok: true, message: 'Recurso publicado' })
  }

  if (action === 'RECHAZAR') {
    writeLog('rejections.log', `${ts} | ${slug} | RECHAZADO`)
    tryHermes(`Rechazo registrado para ${slug}. Designer notificado.`)
    return res.status(200).json({ ok: true, action: 'rejected', message: 'Designer notificado' })
  }

  if (action === 'NOTAS') {
    if (!notes) return res.status(400).json({ error: 'Notas vacías' })
    writeLog('feedback.log', `${ts} | ${slug} | NOTAS | ${notes}`)
    try {
      mkdirSync(FEEDBACK_DIR, { recursive: true })
      writeFileSync(resolve(FEEDBACK_DIR, `${slug}-feedback.md`),
        `# Feedback — ${slug}\n\nFecha: ${ts}\n\n${notes}\n`)
    } catch (e) {
      console.log(`[feedback:${slug}] ${notes}`)
    }
    tryHermes(`Feedback recibido para ${slug}. Curator notificado.`)
    return res.status(200).json({ ok: true, action: 'feedback_saved', message: 'Curator notificado' })
  }

  return res.status(400).json({ error: 'Acción desconocida. Usa APROBAR | RECHAZAR | NOTAS' })
}
