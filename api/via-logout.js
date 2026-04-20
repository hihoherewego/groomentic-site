// Vercel Serverless Function — clear the auth cookie and redirect to login

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  // Expire the cookie immediately
  res.setHeader(
    'Set-Cookie',
    'via-auth=; Path=/via; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  )
  res.setHeader('Location', '/via/login')
  return res.status(302).end()
}
