export function generatePasswordResetEmailHtml(code: string): string {
  return `
    <div style="width: 100%; background-color: #d1d1d1; padding: 2rem 0; font-family: Arial, sans-serif;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; padding: 2rem; text-align: center;">
        <tr>
          <td>
            <h2 style="font-size: 20px; color: #9fcf61; margin-bottom: 1rem;">Money Nerd!</h2>
            <p style="font-size: 16px; color: #333;">Para alterar a sua antiga senha, utilize o código abaixo.</p>
            <div style="font-size: 32px; font-weight: bold; color: #333; margin: 2rem 0;">${code}</div>
            <p style="font-size: 16px; color: #333;">Caso você não tenha solicitado um processo de alteração de senha, por favor, ignore este e-mail.</p>
            <p style="font-size: 12px; color: #999;">O código expira em 10 minutos.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}
