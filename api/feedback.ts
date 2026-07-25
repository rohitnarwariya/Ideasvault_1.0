export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, email, category, problem, details } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required." });
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    return res.status(400).json({ error: "Category is required." });
  }

  if (!problem || typeof problem !== "string" || !problem.trim()) {
    return res.status(400).json({ error: "Problem / Suggestion is required." });
  }

  const recipientEmail = "kamro8395@gmail.com";
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

  console.log("================ IDEA VAULT FEEDBACK SUBMISSION ================");
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: ${subject}`);
  console.log("Body:");
  console.log(emailContent);
  console.log("==================================================================");

  // If a Resend API key is configured in process.env.RESEND_API_KEY, attempt sending via Resend HTTP API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "IdeaVault Feedback <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: subject,
          text: emailContent,
          reply_to: formattedEmail !== "Not Provided" ? formattedEmail : undefined,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.warn("Resend email delivery warning:", errText);
      } else {
        console.log("Feedback email successfully dispatched via Resend API.");
      }
    } catch (sendErr) {
      console.error("Error sending email via Resend:", sendErr);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Thank you! Your feedback has been sent successfully.",
  });
}
