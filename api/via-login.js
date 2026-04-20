// Vercel Serverless Function — validate password and set auth cookie
// Expects POST with form-urlencoded body: password=XXX&next=/via

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  // Parse form-urlencoded body (Vercel doesn't parse it automatically)
  let bodyStr = ''
  if (typeof req.body === 'string') {
    bodyStr = req.body
  } else if (req.body && typeof req.body === 'object') {
    // Already parsed by Vercel (if content-type was JSON or similar)
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(req.body)) params.set(k, String(v))
    bodyStr = params.toString()
  } else {
    // Read raw stream
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => { bodyStr += chunk.toString() })
      req.on('end', resolve)
      req.on('error', reject)
    })
  }

  const params = new URLSearchParams(bodyStr)
  const password = params.get('password') || ''
  const next = params.get('next') || '/via'

  // Only allow relative paths starting with /via to avoid open redirects
  const safeNext = next.startsWith('/via') ? next : '/via'

  const expected = process.env.VIA_ACCESS_PASSWORD

  if (!expected) {
    return res.status(500).send('Server misconfigured: VIA_ACCESS_PASSWORD not set')
  }

  if (password === expected) {
    // Set HttpOnly cookie, 30-day expiry, path=/via
    const maxAge = 60 * 60 * 24 * 30
    res.setHeader(
      'Set-Cookie',
      `via-auth=1; Path=/via; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
    )
    res.setHeader('Location', safeNext)
    return res.status(302).end()
  }

  // Wrong password — redirect back to login with error flag
  const params2 = new URLSearchParams({ error: '1', next: safeNext })
  res.setHeader('Location', `/via/login?${params2.toString()}`)
  return res.status(302).end()
}
