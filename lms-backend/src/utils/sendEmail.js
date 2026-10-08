import { Resend } from "resend";

export const sendEmail = async (options) => {
  // If RESEND_API_KEY is provided, use it (for real emails).
  // Otherwise, fallback to a local mock for dev testing.
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      const { data, error } = await resend.emails.send({
        from: `${process.env.FROM_NAME || 'LMS Platform'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error("Resend Error:", error);
        throw new Error(error.message);
      }

      console.log("Message sent via Resend: %s", data?.id);
    } catch (error) {
      console.error("Failed to send email via Resend:", error.message);
      throw error;
    }
  } else {
    // USE LOCAL MOCK FOR TESTING
    console.log("=========================================");
    console.log("📩 MOCK EMAIL SENT (No Resend Configured)");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log("-----------------------------------------");
    console.log(options.html);
    console.log("=========================================");
  }
};
