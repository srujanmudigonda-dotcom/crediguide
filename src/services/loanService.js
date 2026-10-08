import { supabase } from "../lib/supabaseClient";

/*
|--------------------------------------------------------------------------
| Loans & Dues — Supabase
|--------------------------------------------------------------------------
| Rows are mapped back to the camelCase shape (with computed
| paidPercentage / remainingAmount) the Loans page was built
| against, so the page UI did not need to change.
*/

const mapLoan = (row) => {
  const totalAmount = Number(row.total_amount) || 0;
  const amountPaid = Number(row.amount_paid) || 0;
  const paidPercentage =
    totalAmount > 0
      ? Math.min(100, Math.round((amountPaid / totalAmount) * 100))
      : 0;

  return {
    _id: row.id,
    id: row.id,
    loanType: row.loan_type,
    loanName: row.loan_name,
    totalAmount,
    amountPaid,
    emiAmount: Number(row.emi_amount) || 0,
    dueDate: row.due_date,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    reminderEnabled: row.reminder_enabled,
    paidPercentage,
    remainingPercentage: 100 - paidPercentage,
    remainingAmount: Math.max(0, totalAmount - amountPaid),
    createdAt: row.created_at,
  };
};

const toRow = (loan) => ({
  loan_type: loan.loanType,
  loan_name: loan.loanName,
  total_amount: Number(loan.totalAmount),
  amount_paid: Number(loan.amountPaid || 0),
  emi_amount: Number(loan.emiAmount || 0),
  due_date: loan.dueDate,
  start_date: loan.startDate || null,
  end_date: loan.endDate || null,
  status: loan.status || "Active",
  reminder_enabled:
    loan.reminderEnabled !== undefined ? loan.reminderEnabled : true,
});

export const getLoans = async () => {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, loans: (data || []).map(mapLoan) };
};

export const createLoan = async (loanData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("loans")
    .insert({ user_id: user.id, ...toRow(loanData) })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, loan: mapLoan(data) };
};

export const updateLoan = async (loanId, loanData) => {
  const { data, error } = await supabase
    .from("loans")
    .update(toRow(loanData))
    .eq("id", loanId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, loan: mapLoan(data) };
};

export const deleteLoan = async (loanId) => {
  const { error } = await supabase.from("loans").delete().eq("id", loanId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};
