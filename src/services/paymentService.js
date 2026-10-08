import { supabase } from "../lib/supabaseClient";

/*
|--------------------------------------------------------------------------
| Payments — Supabase
|--------------------------------------------------------------------------
| Rows are mapped back to the camelCase shape the UI uses
| (dueDate, paidAt, reminderEnabled, _id).
*/

const mapPayment = (row) => ({
  _id: row.id,
  id: row.id,
  type: row.type,
  title: row.title,
  amount: Number(row.amount),
  dueDate: row.due_date,
  status: row.status,
  paidAt: row.paid_at,
  reminderEnabled: row.reminder_enabled,
  createdAt: row.created_at,
});

export const getPayments = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, payments: (data || []).map(mapPayment) };
};

export const getUpcomingPayments = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .in("status", ["Upcoming", "Due Soon", "Overdue"])
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, payments: (data || []).map(mapPayment) };
};

export const createPayment = async ({ type, title, amount, dueDate, reminderEnabled }) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      type,
      title: title.trim(),
      amount: Number(amount),
      due_date: dueDate,
      reminder_enabled: reminderEnabled !== undefined ? reminderEnabled : true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, payment: mapPayment(data) };
};

export const markPaymentAsPaid = async (paymentId) => {
  const { data, error } = await supabase
    .from("payments")
    .update({ status: "Paid", paid_at: new Date().toISOString() })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, payment: mapPayment(data) };
};

export const deletePayment = async (paymentId) => {
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", paymentId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};
