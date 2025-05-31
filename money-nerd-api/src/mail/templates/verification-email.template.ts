export function generateCodeEmailHtml(code: string): string {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Use the following code to verify your email:</p>
      <div style="font-size: 32px; font-weight: bold; margin: 20px 0;">${code}</div>
      <p style="font-size: 12px; color: #999;">This code will expire in 10 minutes.</p>
    </div>
  `;
}
