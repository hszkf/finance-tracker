import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
const appUrl = process.env.APP_URL || "http://localhost:3000";

export async function sendGroupInvitation({
  to,
  inviterName,
  groupName,
  token,
}: {
  to: string;
  inviterName: string;
  groupName: string;
  token: string;
}) {
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `You're invited to join "${groupName}" on FinanceTracker`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">You've been invited!</h1>
        <p>${inviterName} has invited you to join <strong>"${groupName}"</strong>.</p>
        <p>Click below to accept:</p>
        <a href="${appUrl}/invite/${token}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Accept Invitation
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          This invitation expires in 7 days.
        </p>
      </div>
    `,
  });
}

export async function sendBudgetAlert({
  to,
  categoryName,
  budgetAmount,
  spentAmount,
  percentage,
  currency,
}: {
  to: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  currency: string;
}) {
  const alertLevel =
    percentage >= 100 ? "exceeded" : percentage >= 80 ? "approaching" : "warning";
  const color = percentage >= 100 ? "#dc2626" : percentage >= 80 ? "#f59e0b" : "#2563eb";
  const symbol = currency === "GBP" ? "£" : "RM";

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Budget Alert: ${categoryName} is ${alertLevel} limit`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${color};">Budget Alert</h1>
        <p>Your <strong>${categoryName}</strong> budget is at <strong>${percentage}%</strong>.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;">Spent: <strong>${symbol}${spentAmount.toFixed(2)}</strong></p>
          <p style="margin: 8px 0 0 0;">Budget: <strong>${symbol}${budgetAmount.toFixed(2)}</strong></p>
        </div>
        <a href="${appUrl}/budgets"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          View Budget
        </a>
      </div>
    `,
  });
}

export async function sendWeeklySummary({
  to,
  userName,
  totalSpent,
  currency,
  topCategories,
  weekStartDate,
}: {
  to: string;
  userName: string;
  totalSpent: number;
  currency: string;
  topCategories: { name: string; amount: number }[];
  weekStartDate: string;
}) {
  const symbol = currency === "GBP" ? "£" : "RM";

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Your Weekly Spending Summary - ${weekStartDate}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hi ${userName},</h1>
        <p>Here's your spending summary for the week of ${weekStartDate}:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <h2 style="margin: 0; color: #1a1a1a;">Total Spent</h2>
          <p style="font-size: 32px; font-weight: bold; margin: 8px 0; color: #2563eb;">
            ${symbol}${totalSpent.toFixed(2)}
          </p>
        </div>
        <h3>Top Categories</h3>
        <ul style="padding-left: 20px;">
          ${topCategories.map((cat) => `<li style="margin: 8px 0;">${cat.name}: <strong>${symbol}${cat.amount.toFixed(2)}</strong></li>`).join("")}
        </ul>
        <a href="${appUrl}/reports"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          View Full Report
        </a>
      </div>
    `,
  });
}

export async function sendSettlementRequest({
  to,
  fromUserName,
  amount,
  currency,
  groupName,
}: {
  to: string;
  fromUserName: string;
  amount: number;
  currency: string;
  groupName: string;
}) {
  const symbol = currency === "GBP" ? "£" : "RM";

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `${fromUserName} requested a settlement`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Settlement Request</h1>
        <p><strong>${fromUserName}</strong> has requested you settle up in <strong>"${groupName}"</strong>.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center;">
          <p style="margin: 0; color: #666;">Amount Owed</p>
          <p style="font-size: 32px; font-weight: bold; margin: 8px 0; color: #dc2626;">
            ${symbol}${amount.toFixed(2)}
          </p>
        </div>
        <a href="${appUrl}/groups"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          View & Settle
        </a>
      </div>
    `,
  });
}

export { resend };
