import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendResourceEmail({ nombre, correo, recurso, downloadUrl, tipo }) {
  const subject = tipo === 'free'
    ? `Tu recurso "${recurso.titulo}" está listo`
    : `Compra confirmada — "${recurso.titulo}"`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF6F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF6F2;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#262626;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:300;font-style:italic;letter-spacing:-0.02em;color:#FFF6F2;">floui</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#262626;opacity:0.5;">
                ${tipo === 'free' ? 'Tu descarga gratuita' : 'Compra confirmada'}
              </p>
              <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;letter-spacing:-0.03em;color:#262626;line-height:1.2;">
                ${recurso.titulo}
              </h1>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#262626;">
                Hola ${nombre}, tu recurso está listo. El link de descarga es válido por 7 días.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#3B62AB;border-radius:8px;">
                    <a href="${downloadUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:-0.01em;">
                      Descargar ahora
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#262626;opacity:0.5;line-height:1.6;">
                Si el botón no funciona, copia este link en tu navegador:<br>
                <span style="color:#3B62AB;word-break:break-all;">${downloadUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #FFF6F2;">
              <p style="margin:0;font-size:12px;color:#262626;opacity:0.4;line-height:1.6;">
                floui · Marketing · Software · Growth<br>
                <a href="https://floui.mx" style="color:#3B62AB;text-decoration:none;">floui.mx</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'hola@floui.mx',
    to: correo,
    subject,
    html,
  })
}
