import crypto from 'crypto';

export const generateFlag = (userId: string, lessonId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secure_academy_secret_key';
  const hash = crypto.createHmac('sha256', secret)
                     .update(`${userId}:${lessonId}`)
                     .digest('hex')
                     .substring(0, 16);
  return `flag{${hash}}`;
};
