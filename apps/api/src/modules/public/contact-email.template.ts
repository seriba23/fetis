interface ContactEmailData {
  name: string;
  phone: string;
  phoneFormatted: string;
  email?: string | null;
  furnitureTypeLabel?: string | null;
  message: string;
  source?: string | null;
  appointmentDate: string;
  adminUrl: string;
}

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function buildContactEmailHtml(d: ContactEmailData): string {
  const rows: Array<[string, string]> = [
    ['Nombre', esc(d.name)],
    [
      'Teléfono',
      `<a href="tel:+52${d.phone}" style="color:#7C3AED;text-decoration:none;font-weight:600;">${esc(d.phoneFormatted)}</a>`,
    ],
  ];

  if (d.email) {
    rows.push([
      'Email',
      `<a href="mailto:${esc(d.email)}" style="color:#7C3AED;text-decoration:none;">${esc(d.email)}</a>`,
    ]);
  }

  if (d.furnitureTypeLabel) {
    rows.push(['Tipo de mueble', esc(d.furnitureTypeLabel)]);
  }

  rows.push(['Cita propuesta', esc(d.appointmentDate)]);

  if (d.source) {
    rows.push(['Origen', `<span style="font-size:12px;color:#64748B;">${esc(d.source)}</span>`]);
  }

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 14px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;width:160px;vertical-align:top;">${label}</td>
          <td style="padding:10px 14px;background:#FFFFFF;border-bottom:1px solid #E2E8F0;font-size:14px;color:#0F172A;">${value}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Nueva solicitud de contacto</title>
  </head>
  <body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F1F5F9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
            <tr>
              <td style="background:linear-gradient(135deg,#7C3AED 0%,#A78BFA 100%);padding:28px 32px;color:#FFFFFF;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.85;">Fetis Muebles</div>
                <div style="font-size:22px;font-weight:600;margin-top:6px;">Nueva solicitud de contacto</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px;font-size:15px;color:#334155;line-height:1.5;">
                Recibiste una solicitud desde el formulario de la landing. Los datos del cliente:
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
                  ${rowsHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 16px;font-size:13px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;">
                Mensaje del cliente
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <div style="background:#F8FAFC;border-left:3px solid #7C3AED;padding:14px 18px;border-radius:4px;font-size:14px;color:#0F172A;line-height:1.6;white-space:pre-wrap;">${esc(d.message)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;" align="center">
                <a href="${esc(d.adminUrl)}" style="display:inline-block;background:#7C3AED;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:999px;">Ver en el panel admin</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;text-align:center;">
                Notificación automática del sistema Fetis Muebles
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildContactEmailText(d: ContactEmailData): string {
  const lines = [
    'Nueva solicitud de contacto - Fetis Muebles',
    '',
    `Nombre: ${d.name}`,
    `Teléfono: ${d.phoneFormatted}`,
  ];
  if (d.email) lines.push(`Email: ${d.email}`);
  if (d.furnitureTypeLabel) lines.push(`Tipo de mueble: ${d.furnitureTypeLabel}`);
  lines.push(`Cita propuesta: ${d.appointmentDate}`);
  if (d.source) lines.push(`Origen: ${d.source}`);
  lines.push('', 'Mensaje:', d.message, '', `Ver en panel: ${d.adminUrl}`);
  return lines.join('\n');
}
