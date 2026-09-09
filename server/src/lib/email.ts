import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = process.env.CONTACT_TO_EMAIL || "hello@qodily.dz";

export async function sendContactEmail(data: {
  name: string;
  email: string;
  company?: string;
  build: string;
  objective: string;
  needs: string[];
  budget: string;
  timeline: string;
  message?: string;
}) {
  const needsList = data.needs.join(", ");

  await resend.emails.send({
    from: "Qodily Contact <noreply@qodily.dz>",
    to: toEmail,
    subject: `New Project Request — ${data.build} from ${data.name}`,
    html: `
      <h2>New Project Request</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Name</td><td style="padding:8px;border-bottom:1px solid #eee">${data.name}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
        ${data.company ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Company</td><td style="padding:8px;border-bottom:1px solid #eee">${data.company}</td></tr>` : ""}
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Building</td><td style="padding:8px;border-bottom:1px solid #eee">${data.build}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Objective</td><td style="padding:8px;border-bottom:1px solid #eee">${data.objective}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Needs</td><td style="padding:8px;border-bottom:1px solid #eee">${needsList}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Budget</td><td style="padding:8px;border-bottom:1px solid #eee">${data.budget}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Timeline</td><td style="padding:8px;border-bottom:1px solid #eee">${data.timeline}</td></tr>
        ${data.message ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Message</td><td style="padding:8px;border-bottom:1px solid #eee">${data.message}</td></tr>` : ""}
      </table>
    `,
  });
}
