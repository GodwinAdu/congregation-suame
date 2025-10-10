import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendPasswordResetEmail = async (
    email: string,
    fullName: string,
    tempPassword: string
) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Suame Congregation</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 40px 30px; }
            .password-box { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .password { font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px; }
            .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset</h1>
                <p>Suame Congregation Management System</p>
            </div>
            <div class="content">
                <h2>Hello ${fullName},</h2>
                <p>Your password has been reset by a congregation administrator. Please use the temporary password below to log into your account:</p>
                
                <div class="password-box">
                    <p><strong>Temporary Password:</strong></p>
                    <div class="password">${tempPassword}</div>
                </div>
                
                <p><strong>Important Security Instructions:</strong></p>
                <ul>
                    <li>Please change this password immediately after logging in</li>
                    <li>Do not share this password with anyone</li>
                    <li>This password will expire in 24 hours</li>
                </ul>
                
                <p>If you did not request this password reset, please contact your congregation administrator immediately.</p>
                
                <p>May Jehovah's blessings be with you,<br>
                <strong>Suame Congregation</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated message from the Suame Congregation Management System.</p>
                <p>Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"Suame Congregation" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔐 Password Reset - Suame Congregation',
        html: htmlContent,
    });
};

export const sendInvitationEmail = async (
    email: string,
    fullName: string,
    inviteCode: string
) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Suame Congregation</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 40px 30px; }
            .welcome-box { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .invite-code { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #1976d2; letter-spacing: 1px; background-color: white; padding: 10px; border-radius: 4px; text-align: center; }
            .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #2196f3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome!</h1>
                <p>Suame Congregation Management System</p>
            </div>
            <div class="content">
                <h2>Dear ${fullName},</h2>
                <p>We are delighted to welcome you to the Suame Congregation Management System! You have been invited to join our digital congregation community.</p>
                
                <div class="welcome-box">
                    <p><strong>Your Invitation Code:</strong></p>
                    <div class="invite-code">${inviteCode}</div>
                </div>
                
                <p><strong>Getting Started:</strong></p>
                <ol>
                    <li>Visit our congregation portal</li>
                    <li>Click on "Accept Invitation"</li>
                    <li>Enter the invitation code above</li>
                    <li>Complete your account setup</li>
                </ol>
                
                <p><strong>What you can do:</strong></p>
                <ul>
                    <li>📊 Submit field service reports</li>
                    <li>📅 View meeting schedules and assignments</li>
                    <li>👥 Connect with your service group</li>
                    <li>📖 Access congregation announcements</li>
                </ul>
                
                <p>We look forward to having you as part of our digital congregation family!</p>
                
                <p>Christian love and warm regards,<br>
                <strong>Suame Congregation Elders</strong></p>
            </div>
            <div class="footer">
                <p>This invitation was sent by a congregation administrator.</p>
                <p>If you have any questions, please contact your local elders.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"Suame Congregation" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🎉 Welcome to Suame Congregation - Your Invitation',
        html: htmlContent,
    });
};