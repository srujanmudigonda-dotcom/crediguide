import { supabase } from "../lib/supabaseClient";

/*
|--------------------------------------------------------------------------
| Due-date reminders — Supabase
|--------------------------------------------------------------------------
| Same reminder rules the old Express backend used. Reminders are
| generated when the Loans / Notifications screens load (as before);
| each reminder is inserted only once (title + message match).
| A scheduled server-side job can call the same logic later.
*/

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// due_date comes back from Postgres as "YYYY-MM-DD" — parse it as a
// local date so the day difference is not shifted by timezone.
const parseDateOnly = (value) => {
  if (!value) return null;
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return startOfDay(value);
  return new Date(y, m - 1, d);
};

const daysUntil = (dueDate) => {
  const today = startOfDay(new Date());
  const due = parseDateOnly(dueDate);
  if (!due) return null;
  return Math.round((due.getTime() - today.getTime()) / 86400000);
};

const insertIfNew = async (userId, { type, title, message, scheduledFor }) => {
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("title", title)
    .eq("message", message)
    .limit(1);

  if (existing && existing.length > 0) {
    return;
  }

  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    scheduled_for: scheduledFor || null,
  });
};

const currentUserId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
};

/* ---------------- Loan EMI reminders: 15/10/7/3/1/0 days + overdue ------ */

export const generateLoanReminders = async () => {
  const userId = await currentUserId();
  if (!userId) return;

  const { data: loans, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "Paid")
    .eq("reminder_enabled", true);

  if (error || !loans) return;

  for (const loan of loans) {
    const days = daysUntil(loan.due_date);
    if (days === null) continue;

    let message = "";
    if (days === 15) message = `Your ${loan.loan_name} EMI is due in 15 days.`;
    else if (days === 10) message = `Your ${loan.loan_name} EMI is due in 10 days.`;
    else if (days === 7) message = `Your ${loan.loan_name} EMI is due in 7 days.`;
    else if (days === 3) message = `Your ${loan.loan_name} EMI is due in 3 days.`;
    else if (days === 1) message = `Your ${loan.loan_name} EMI is due tomorrow.`;
    else if (days === 0) message = `Your ${loan.loan_name} EMI is due today.`;
    else if (days < 0) message = `Your ${loan.loan_name} EMI is overdue.`;

    if (!message) continue;

    await insertIfNew(userId, {
      type: "EMI",
      title: `${loan.loan_name} EMI Reminder`,
      message,
    });
  }
};

/* ---------------- Payment reminders: 7/3/1/0 days + overdue ----------- */

export const generatePaymentReminders = async () => {
  const userId = await currentUserId();
  if (!userId) return;

  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["Upcoming", "Due Soon", "Overdue"]);

  if (error || !payments) return;

  for (const payment of payments) {
    const days = daysUntil(payment.due_date);
    if (days === null) continue;

    const due = parseDateOnly(payment.due_date);
    const dueText = due.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const amountText = `₹${Number(payment.amount).toLocaleString("en-IN")}`;

    let title = "";
    let message = "";
    if (days === 7) {
      title = "Payment Due in 7 Days";
      message = `Your ${payment.title} of ${amountText} is due on ${dueText}.`;
    } else if (days === 3) {
      title = "Payment Due in 3 Days";
      message = `Your ${payment.title} of ${amountText} is due on ${dueText}.`;
    } else if (days === 1) {
      title = "Payment Due Tomorrow";
      message = `Your ${payment.title} of ${amountText} is due tomorrow, ${dueText}.`;
    } else if (days === 0) {
      title = "Payment Due Today";
      message = `Your ${payment.title} of ${amountText} is due today.`;
    } else if (days < 0) {
      title = "Payment Overdue";
      message = `Your ${payment.title} of ${amountText} was due on ${dueText}.`;
    }

    if (!title) continue;

    await insertIfNew(userId, {
      type: payment.type === "EMI" ? "EMI" : "Payment",
      title,
      message,
      scheduledFor: due.toISOString(),
    });
  }
};
