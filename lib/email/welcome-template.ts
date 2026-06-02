export function getWelcomeEmailHTML(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 40px 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Cipherwill! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            
            <p>We're thrilled to have you join the Cipherwill community. Your account is now active and ready to use.</p>
            
            <h2>What's Next?</h2>
            <ul>
              <li><strong>Set Up Check-Ins:</strong> Configure regular check-ins to ensure your digital legacy is secure and your designated recipients are notified if anything happens.</li>
              <li><strong>Add Recipients:</strong> Invite trusted friends or family members who will receive your important information and documents.</li>
              <li><strong>Secure Your Assets:</strong> Upload and organize important files, documents, and information that matter to you.</li>
            </ul>
            
            <p>
              <a href="https://cipherwill.com/dashboard" class="button">Go to Dashboard</a>
            </p>
            
            <h2>Need Help?</h2>
            <p>If you have any questions or need assistance getting started, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br>The Cipherwill Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Cipherwill. All rights reserved.</p>
            <p>This is an automated welcome email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getWelcomeEmailText(userName: string): string {
  return `
Welcome to Cipherwill! 🎉

Hi ${userName},

We're thrilled to have you join the Cipherwill community. Your account is now active and ready to use.

What's Next?

• Set Up Check-Ins: Configure regular check-ins to ensure your digital legacy is secure and your designated recipients are notified if anything happens.
• Add Recipients: Invite trusted friends or family members who will receive your important information and documents.
• Secure Your Assets: Upload and organize important files, documents, and information that matter to you.

Go to your dashboard to get started: https://cipherwill.com/dashboard

Need Help?

If you have any questions or need assistance getting started, feel free to reach out to our support team.

Best regards,
The Cipherwill Team

---
This is an automated welcome email. Please do not reply directly to this message.
  `.trim();
}
