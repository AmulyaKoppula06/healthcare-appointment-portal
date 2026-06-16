const nodemailer = require('nodemailer');

// Create transporter — uses env vars if set, otherwise logs to console (demo mode)
function getTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Demo mode: log emails to console
  return nodemailer.createTransport({ jsonTransport: true });
}

async function sendMail({ to, subject, html }) {
  const transporter = getTransporter();
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER ? `"MediCare" <${process.env.SMTP_USER}>` : '"MediCare" <noreply@medicare.com>',
      to, subject, html,
    });
    if (!process.env.SMTP_USER) {
      console.log(`📧 [EMAIL DEMO] To: ${to} | Subject: ${subject}`);
    }
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
}

const templates = {
  welcome(name, email, role) {
    return {
      subject: '🏥 Welcome to MediCare!',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1e40af,#3b82f6,#06b6d4);padding:40px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">💙 MediCare</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;">Your Health, Our Priority</p>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#1e3a8a;margin-top:0;">Welcome, ${name}! 👋</h2>
            <p style="color:#475569;line-height:1.6;">Your <strong>${role}</strong> account has been created successfully.</p>
            <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:8px;margin:20px 0;">
              <p style="margin:0;color:#1e40af;"><strong>Account Details</strong></p>
              <p style="margin:8px 0 0;color:#475569;">Email: ${email}<br/>Role: ${role.charAt(0).toUpperCase()+role.slice(1)}</p>
            </div>
            ${role === 'patient' ? `
            <p style="color:#475569;">You can now:</p>
            <ul style="color:#475569;line-height:2;">
              <li>Search and book appointments with top doctors</li>
              <li>Check your symptoms with our AI tool</li>
              <li>View and download your prescriptions</li>
            </ul>` : `
            <p style="color:#475569;">You can now:</p>
            <ul style="color:#475569;line-height:2;">
              <li>Manage your appointments</li>
              <li>Write prescriptions for patients</li>
              <li>Track your daily schedule</li>
            </ul>`}
          </div>
          <div style="background:#f1f5f9;padding:20px 32px;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0;">© 2024 MediCare. All rights reserved.</p>
          </div>
        </div>
      `,
    };
  },

  loginAlert(name, email) {
    const time = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    return {
      subject: '🔐 New Login to Your MediCare Account',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1e40af,#3b82f6,#06b6d4);padding:40px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">💙 MediCare</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#1e3a8a;margin-top:0;">New Sign-In Detected 🔐</h2>
            <p style="color:#475569;">Hi <strong>${name}</strong>, a new sign-in to your account was detected.</p>
            <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:8px;margin:20px 0;">
              <p style="margin:0;color:#92400e;"><strong>Sign-In Details</strong></p>
              <p style="margin:8px 0 0;color:#78350f;">Email: ${email}<br/>Time: ${time}</p>
            </div>
            <p style="color:#475569;">If this was you, no action is needed. If you didn't sign in, please contact support immediately.</p>
          </div>
          <div style="background:#f1f5f9;padding:20px 32px;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0;">© 2024 MediCare. All rights reserved.</p>
          </div>
        </div>
      `,
    };
  },

  appointmentConfirmed(patientName, patientEmail, doctorName, specialization, date, time, priority) {
    return {
      subject: '✅ Appointment Confirmed - MediCare',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1e40af,#3b82f6,#06b6d4);padding:40px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">💙 MediCare</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;">Appointment Confirmation</p>
          </div>
          <div style="padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;">✅</div>
            </div>
            <h2 style="color:#1e3a8a;margin-top:0;text-align:center;">Appointment Booked!</h2>
            <p style="color:#475569;text-align:center;">Hi <strong>${patientName}</strong>, your appointment has been booked successfully.</p>
            <div style="background:#eff6ff;border-radius:12px;padding:20px;margin:20px 0;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#64748b;padding:8px 0;font-size:14px;">Doctor</td><td style="color:#1e293b;font-weight:600;text-align:right;">Dr. ${doctorName}</td></tr>
                <tr><td style="color:#64748b;padding:8px 0;font-size:14px;border-top:1px solid #e2e8f0;">Specialization</td><td style="color:#1e293b;font-weight:600;text-align:right;border-top:1px solid #e2e8f0;">${specialization}</td></tr>
                <tr><td style="color:#64748b;padding:8px 0;font-size:14px;border-top:1px solid #e2e8f0;">Date</td><td style="color:#1e293b;font-weight:600;text-align:right;border-top:1px solid #e2e8f0;">${date}</td></tr>
                <tr><td style="color:#64748b;padding:8px 0;font-size:14px;border-top:1px solid #e2e8f0;">Time</td><td style="color:#1e293b;font-weight:600;text-align:right;border-top:1px solid #e2e8f0;">${time}</td></tr>
                <tr><td style="color:#64748b;padding:8px 0;font-size:14px;border-top:1px solid #e2e8f0;">Priority</td><td style="text-align:right;border-top:1px solid #e2e8f0;"><span style="background:${priority==='critical'?'#fee2e2':priority==='urgent'?'#fef3c7':'#f0fdf4'};color:${priority==='critical'?'#991b1b':priority==='urgent'?'#92400e':'#166534'};padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize;">${priority}</span></td></tr>
              </table>
            </div>
            <div style="background:#fef9c3;border-left:4px solid #eab308;padding:12px 16px;border-radius:8px;">
              <p style="margin:0;color:#713f12;font-size:13px;">⏰ Please arrive 10 minutes early. Bring any relevant medical records.</p>
            </div>
          </div>
          <div style="background:#f1f5f9;padding:20px 32px;text-align:center;">
            <p style="color:#94a3b8;font-size:13px;margin:0;">© 2024 MediCare. All rights reserved.</p>
          </div>
        </div>
      `,
    };
  },
};

module.exports = { sendMail, templates };
