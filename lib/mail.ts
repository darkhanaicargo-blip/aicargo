import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOtpEmail(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Aicargo — Нууц үг сэргээх код',
    text: `Таны нэг удаагийн код: ${code}\n\nЭнэ код 10 минутын дараа хүчингүй болно.\nТа өөрөө хүсэлт гаргаагүй бол энэ имэйлийг үл тоомсорлоно уу.`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#111;color:#f0f0f0;border-radius:12px;">
        <h2 style="color:#e8f000;margin-bottom:8px;">Aicargo</h2>
        <p style="color:#888;margin-bottom:24px;">Нууц үг сэргээх код</p>
        <div style="background:#0a0a0a;border:1px solid #1e1e1e;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
          <span style="font-size:2.5rem;font-weight:800;letter-spacing:8px;color:#e8f000;">${code}</span>
        </div>
        <p style="color:#888;font-size:0.85rem;">Энэ код <strong style="color:#f0f0f0;">10 минутын</strong> дараа хүчингүй болно.</p>
        <p style="color:#555;font-size:0.8rem;margin-top:16px;">Та өөрөө хүсэлт гаргаагүй бол энэ имэйлийг үл тоомсорлоно уу.</p>
      </div>
    `,
  })
}

export async function sendNotificationEmail(
  email: string,
  name: string,
  cargoCount: number,
  totalAmount: number
) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Aicargo — Таны ачаа ирлээ',
    text: `Сайн байна уу, ${name},\n\nТаны ачааны мэдээлэл:\n  Ирсэн ачааны тоо: ${cargoCount} ширхэг\n  Нийт төлбөр: ₮${totalAmount.toLocaleString()}\n\nАчаагаа авахаар ирнэ үү.`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px;background:#111;color:#f0f0f0;border-radius:12px;">
        <h2 style="color:#e8f000;margin-bottom:4px;">Aicargo</h2>
        <p style="color:#888;margin-bottom:24px;">Ачааны мэдэгдэл</p>
        <p style="margin-bottom:20px;">Сайн байна уу, <strong>${name}</strong>,</p>
        <div style="background:#0a0a0a;border:1px solid #1e1e1e;border-radius:8px;overflow:hidden;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #1e1e1e;">
            <span style="color:#888;">Ирсэн ачааны тоо</span>
            <strong>${cargoCount} ширхэг</strong>
          </div>
          <div style="display:flex;justify-content:space-between;padding:12px 16px;">
            <span style="color:#888;">Нийт төлбөр</span>
            <strong style="color:#e8f000;">₮${totalAmount.toLocaleString()}</strong>
          </div>
        </div>
        <p style="color:#888;font-size:0.85rem;">Ачаагаа авахаар ирнэ үү.</p>
      </div>
    `,
  })
}
