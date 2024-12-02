import jwt, { JwtPayload } from 'jsonwebtoken'

export const generateToken = (
  payload: object,
  expiresIn: string = '1h'
): string => {
  return jwt.sign(payload, process.env.SECRET_KEY ?? '', { expiresIn })
}

export const verifyToken = (token: string): string | JwtPayload => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY ?? '')
  } catch (err) {
    console.error('Invalid token:', err)
    return ''
  }
}
