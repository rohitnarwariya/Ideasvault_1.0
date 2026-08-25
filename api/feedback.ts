import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log("==================================================================");
  console.log("[API/Feedback] 1. Request received.");
  console.log(`Method: ${req.method} | URL: ${req.url}`);

  if (req.method !== "POST") {
    console.warn("[API/Feedback] Error: Method Not Allowed.");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { name, email, category, problem, details } = req.body || {};

  // Field validation
  if (!name || typeof name !== "string" || !name.trim()) {
    console.warn("[API/Feedback] Validation failed: Name is required.");
    return res.status(400).json({ success: false, error: "Name is required." });
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    console.warn("[API/Feedback] Validation failed: Category is required.");
    return res.status(400).json({ success: false, error: "Category is required." });
  }

  if (!problem || typeof problem !== "string" || !problem.trim()) {
    console.warn("[API/Feedback] Validation failed: Problem / Suggestion is required.");
    return res.status(400).json({ success: false, error: "Problem / Suggestion is required." });
  }

  const recipientEmail = "kamro8395@gmail.com";
  console.log("[API/Feedback] 2. Validation passed.");
  console.log(`Recipient: ${recipientEmail}`);
  console.log(`Sender Name: ${name.trim()}`);
  console.log(`Category: ${category.trim()}`);

  const formattedEmail = (email && typeof email === "string" && email.trim()) ? email.trim() : "Not Provided";
  const formattedDetails = (details && typeof details === "string" && details.trim()) ? details.trim() : "None";
  const submissionTime = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  const subject = `[IdeaVault Feedback] ${category.trim()}`;
  const emailContent = `
Name: ${name.trim()}
Email: ${formattedEmail}
Category: ${category.trim()}

Message:
${problem.trim()}

Additional Details:
${formattedDetails}

Submission Time:
${submissionTime}
  `.trim();

  // 1. Try Resend if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    console.log("[API/Feedback] 3. Starting email send via Resend API...");
    try {
      const fromAddress = process.env.RESEND_FROM_EMAIL || "IdeaVault Feedback <onboarding@resend.dev>";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [recipientEmail],
          subject: subject,
          text: emailContent,
          reply_to: formattedEmail !== "Not Provided" ? formattedEmail : undefined,
        }),
      });

      const resendData = await response.json();
      console.log("[API/Feedback] 4. Resend API Provider Response:", JSON.stringify(resendData, null, 2));

      if (!response.ok || resendData.error) {
        const errorDetails = resendData.message || resendData.error?.message || resendData.error || JSON.stringify(resendData);
        console.error("[API/Feedback] 5. Resend Email Send Failed:", errorDetails);
        return res.status(500).json({
          success: false,
          error: `Resend Email Delivery Error: ${errorDetails}. Note: Default Resend onboarding key only allows sending to the Resend account owner's email address unless a custom domain is verified.`,
        });
      }

      console.log("[API/Feedback] 5. Success! Resend accepted email delivery. Email ID:", resendData.id);
      return res.status(200).json({
        success: true,
        emailId: resendData.id,
        message: "Thank you! Your feedback has been sent successfully.",
      });
    } catch (sendErr: any) {
      console.error("[API/Feedback] 5. Exception sending email via Resend:", sendErr);
      return res.status(500).json({
        success: false,
        error: `Exception communicating with Resend API: ${sendErr.message || sendErr}`,
      });
    }
  }

  // 2. Try Nodemailer (SMTP) if SMTP_HOST is configured
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    console.log("[API/Feedback] 3. Starting email send via Nodemailer SMTP...");
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || "",
        } : undefined,
      });

      console.log("[API/Feedback] Verifying SMTP authentication credentials...");
      await transporter.verify();
      console.log("[API/Feedback] SMTP Credentials verified successfully.");

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@ideavault.app",
        to: recipientEmail,
        subject: subject,
        text: emailContent,
        replyTo: formattedEmail !== "Not Provided" ? formattedEmail : undefined,
      });

      console.log("[API/Feedback] 4. Nodemailer Provider Response:", JSON.stringify(info, null, 2));
      console.log("[API/Feedback] 5. Success! SMTP accepted email delivery. Message ID:", info.messageId);

      return res.status(200).json({
        success: true,
        emailId: info.messageId,
        message: "Thank you! Your feedback has been sent successfully.",
      });
    } catch (smtpErr: any) {
      console.error("[API/Feedback] 5. Nodemailer SMTP Error:", smtpErr);
      return res.status(500).json({
        success: false,
        error: `SMTP Email Delivery Error: ${smtpErr.message || smtpErr}`,
      });
    }
  }

  // 3. Neither Resend nor SMTP credentials configured in process.env
  console.error("[API/Feedback] 5. Failure: No email provider configured (Neither RESEND_API_KEY nor SMTP_HOST found in environment).");
  return res.status(500).json({
    success: false,
    error: "Email delivery failed: No email provider is configured. Please add RESEND_API_KEY or SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) to your environment variables.",
  });
}
