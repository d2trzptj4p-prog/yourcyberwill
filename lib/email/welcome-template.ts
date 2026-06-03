export function getWelcomeEmailHTML(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #09090b; 
            background-color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 540px; 
            margin: 40px auto; 
            padding: 32px 24px; 
            border: 1px solid #e4e4e7; 
            border-radius: 12px; 
          }
          .header { 
            margin-bottom: 32px; 
          }
          .brand {
            font-size: 14px;
            font-weight: 600;
            color: #09090b;
            letter-spacing: -0.02em;
          }
          h1 {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.03em;
            margin: 24px 0 16px 0;
            color: #09090b;
          }
          h2 {
            font-size: 16px;
            font-weight: 600;
            letter-spacing: -0.02em;
            margin: 32px 0 12px 0;
            color: #09090b;
          }
          p {
            margin: 0 0 16px 0;
            color: #71717a;
            font-size: 15px;
          }
          ul {
            padding-left: 20px;
            margin: 0 0 24px 0;
            color: #71717a;
            font-size: 15px;
          }
          li {
            margin-bottom: 12px;
          }
          li strong {
            color: #09090b;
          }
          .button-container {
            margin: 28px 0;
          }
          .button { 
            display: inline-block; 
            padding: 10px 24px; 
            background-color: #18181b; 
            color: #ffffff !important; 
            text-decoration: none; 
            border-radius: 9999px; 
            font-weight: 500;
            font-size: 14px;
          }
          .button:hover {
            background-color: #27272a;
          }
          .footer { 
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e4e4e7; 
            color: #a1a1aa; 
            font-size: 12px; 
          }
          .footer p {
            color: #a1a1aa;
            font-size: 12px;
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="brand">YourCyberWill</span>
            <h1>Welcome to YourCyberWill 🎉</h1>
          </div>
          
          <p>Hi ${userName},</p>
          <p>We're thrilled to have you join the YourCyberWill community. Your account is now active and ready to use.</p>
          
          <h2>What's Next?</h2>
          <ul>
            <li><strong>Set Up Check-Ins:</strong> Configure regular check-ins to ensure your digital legacy is secure and your designated recipients are notified if anything happens.</li>
            <li><strong>Add Recipients:</strong> Invite trusted friends or family members who will receive your important information and documents.</li>
            <li><strong>Secure Your Assets:</strong> Upload and organize important files, documents, and information that matter to you.</li>
          </ul>
          
          <div class="button-container">
            <a href="https://yourcyberwill.com/dashboard" class="button">Go to Dashboard</a>
          </div>
          
          <h2>Need Help?</h2>
          <p>If you have any questions or need assistance getting started, feel free to reach out to our support team at <a href="mailto:support@yourcyberwill.com" style="color: #18181b; text-decoration: underline;">support@yourcyberwill.com</a>.</p>
          
          <p style="margin-top: 32px;">Best regards,<br><strong style="color: #09090b;">The YourCyberWill Team</strong></p>
          
          <div class="footer">
            <p>&copy; 2026 YourCyberWill. All rights reserved.</p>
            <p>This is an automated welcome email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getWelcomeEmailText(userName: string): string {
  return `
Welcome to YourCyberWill! 🎉

Hi ${userName},

We're thrilled to have you join the YourCyberWill community. Your account is now active and ready to use.

What's Next?

• Set Up Check-Ins: Configure regular check-ins to ensure your digital legacy is secure and your designated recipients are notified if anything happens.
• Add Recipients: Invite trusted friends or family members who will receive your important information and documents.
• Secure Your Assets: Upload and organize important files, documents, and information that matter to you.

Go to your dashboard to get started: https://yourcyberwill.com/dashboard

Need Help?

If you have any questions or need assistance getting started, feel free to reach out to our support team at support@yourcyberwill.com.

Best regards,
The YourCyberWill Team

---
This is an automated welcome email. Please do not reply directly to this message.
  `.trim();
}