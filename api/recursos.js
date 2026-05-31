import { supabase } from './_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { tema, formato, acceso, destacado } = req.query

  let query = supabase
    .from('recursos')
    .select('id, slug, titulo, subtitulo, tema, formato, acceso, precio_mxn, portada_path, paginas, descargas, nuevo, destacado')
    .eq('publicado', true)
    .order('created_at', { ascending: false })

  if (tema)      query = query.eq('tema', tema)
  if (formato)   query = query.eq('formato', formato)
  if (acceso)    query = query.eq('acceso', acceso)
  if (destacado) query = query.eq('destacado', true)

  const { data, error } = await query

  if (error) {
    console.error('recursos GET error:', error)
    return res.status(500).json({ error: 'Error al cargar recursos' })
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  return res.status(200).json(data)
}
