import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  CalendarDays,
  CreditCard,
  CircleDollarSign,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  getPayments,
  createPayment,
  markPaymentAsPaid,
  deletePayment,
} from "../services/paymentService";
import { generatePaymentReminders } from "../services/reminderService";

const statusStyles = {
  Upcoming: "bg-orange-100 text-orange-600",
  "Due Soon": "bg-red-100 text-red-600",
  Overdue: "bg-red-100 text-red-600",
  Paid: "bg-green-100 text-green-600",
};

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [formData, setFormData] = useState({
    type: "Credit Card",
    title: "",
    amount: "",
    dueDate: "",
    reminderEnabled: true,
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPayments();

      if (response.success) {
        setPayments(response.payments || []);
      } else {
        setError(response.message || "Failed to load payments.");
      }
    } catch (err) {
      console.error("Payments Error:", err);
      setError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await generatePaymentReminders();
      } catch (err) {
        console.error("Payment reminder check failed:", err);
      }

      await fetchPayments();
    };

    load();
  }, []);

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (date) => {
    if (!date) return "Not available";

    const [y, m, d] = String(date).split("-").map(Number);
    const parsed = y && m && d ? new Date(y, m - 1, d) : new Date(date);

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.amount || !formData.dueDate) {
      setError("Please fill in the payment title, amount and due date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createPayment({
        type: formData.type,
        title: formData.title,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        reminderEnabled: formData.reminderEnabled,
      });

      setFormData({
        type: "Credit Card",
        title: "",
        amount: "",
        dueDate: "",
        reminderEnabled: true,
      });
      setShowForm(false);

      await fetchPayments();
    } catch (err) {
      console.error("Create Payment Error:", err);
      setError(err.message || "Unable to add payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async (payment) => {
    try {
      setUpdatingId(payment._id);
      setError("");

      await markPaymentAsPaid(payment._id);

      await fetchPayments();
    } catch (err) {
      console.error("Mark Paid Error:", err);
      setError(err.message || "Unable to update payment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Delete "${payment.title}"?`)) return;

    try {
      setUpdatingId(payment._id);
      setError("");

      await deletePayment(payment._id);

      await fetchPayments();
    } catch (err) {
      console.error("Delete Payment Error:", err);
      setError(err.message || "Unable to delete payment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const upcoming = payments.filter((p) => p.status !== "Paid");
  const paid = payments.filter((p) => p.status === "Paid");
  const totalUpcoming = upcoming.reduce((sum, p) => sum + p.amount, 0);
  const nextDue = upcoming.length > 0 ? upcoming[0] : null;

  const renderPayment = (payment) => {
    const Icon = payment.type === "EMI" ? CircleDollarSign : CreditCard;
    const iconStyle =
      payment.type === "EMI"
        ? "bg-purple-100 text-purple-600"
        : "bg-blue-100 text-blue-600";

    return (
      <div
        key={payment._id}
        className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconStyle}`}
          >
            <Icon size={20} />
          </div>

          <div>
            <p className="font-semibold text-gray-800">{payment.title}</p>

            <p className="mt-1 text-sm text-gray-500">
              {payment.type} · Due {formatDate(payment.dueDate)}
              {payment.status === "Paid" && payment.paidAt
                ? ` · Paid ${new Date(payment.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-lg font-bold text-gray-800">
            {formatAmount(payment.amount)}
          </p>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[payment.status] || "bg-gray-100 text-gray-600"}`}
          >
            {payment.status}
          </span>

          {payment.status !== "Paid" && (
            <button
              type="button"
              onClick={() => handleMarkAsPaid(payment)}
              disabled={updatingId === payment._id}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle size={14} />
              Mark Paid
            </button>
          )}

          <button
            type="button"
            onClick={() => handleDelete(payment)}
            disabled={updatingId === payment._id}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
            aria-label="Delete payment"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Payments</h2>

                <p className="mt-2 text-gray-500">
                  Track your credit card bills and EMI payments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm((previous) => !previous)}
                className="flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:self-auto"
              >
                <Plus size={17} />
                {showForm ? "Close Form" : "Add Payment"}
              </button>
            </div>

            {/* Summary */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Total Upcoming</p>
                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {formatAmount(totalUpcoming)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Across {upcoming.length} unpaid payment
                  {upcoming.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Next Due</p>
                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {nextDue ? formatAmount(nextDue.amount) : "—"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <CalendarDays size={13} />
                  {nextDue
                    ? `${nextDue.title} · ${formatDate(nextDue.dueDate)}`
                    : "No upcoming payments"}
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Add Payment Form */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mb-6 rounded-2xl bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-700">
                  Add a Payment
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      <option>Credit Card</option>
                      <option>EMI</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Example: HDFC Credit Card Bill"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      min="0"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Example: 8500"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="reminderEnabled"
                    checked={formData.reminderEnabled}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  Enable due-date reminders
                </label>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Payment"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Lists */}
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <h3 className="mb-3 text-lg font-semibold text-gray-700">
                  Upcoming Payments
                </h3>

                {upcoming.length === 0 ? (
                  <div className="mb-6 rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                    No upcoming payments. Use "Add Payment" to track a bill
                    or EMI.
                  </div>
                ) : (
                  <div className="mb-8 space-y-3">
                    {upcoming.map(renderPayment)}
                  </div>
                )}

                <h3 className="mb-3 text-lg font-semibold text-gray-700">
                  Payment History
                </h3>

                {paid.length === 0 ? (
                  <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                    No payments marked as paid yet.
                  </div>
                ) : (
                  <div className="space-y-3">{paid.map(renderPayment)}</div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Payments;
