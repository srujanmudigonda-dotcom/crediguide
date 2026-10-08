import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getLoans, createLoan, updateLoan, deleteLoan } from "../services/loanService";
import { generateLoanReminders } from "../services/reminderService";

function Loans() {
  const [loans, setLoans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [editingLoanId, setEditingLoanId] = useState(null);

  const [formData, setFormData] = useState({
    loanType: "Gold Loan",
    loanName: "",
    totalAmount: "",
    amountPaid: "",
    emiAmount: "",
    dueDate: "",
    startDate: "",
    endDate: "",
    status: "Active",
    reminderEnabled: true,
  });

  const emptyForm = {
    loanType: "Gold Loan",
    loanName: "",
    totalAmount: "",
    amountPaid: "",
    emiAmount: "",
    dueDate: "",
    startDate: "",
    endDate: "",
    status: "Active",
    reminderEnabled: true,
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLoans();

      if (response.success) {
        setLoans(response.loans || []);
      } else {
        setError(
          response.message || "Failed to load loans."
        );
      }
    } catch (err) {
      console.error("Loans Error:", err);

      setError(
        err.message ||
          "Unable to load loans."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadLoansAndReminders = async () => {
      try {
        await generateLoanReminders();
      } catch (err) {
        console.error(
          "Loan reminder check failed:",
          err
        );
      }

      await fetchLoans();
    };

    loadLoansAndReminders();
  }, []);

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatInputDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
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

    try {
      setSaving(true);
      setError("");

      const loanData = {
        loanType: formData.loanType,
        loanName: formData.loanName,
        totalAmount: Number(formData.totalAmount),
        amountPaid: Number(formData.amountPaid || 0),
        emiAmount: Number(formData.emiAmount || 0),
        dueDate: formData.dueDate,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        status: formData.status,
        reminderEnabled: formData.reminderEnabled,
      };

      let response;

      if (editingLoanId) {
        response = await updateLoan(editingLoanId, loanData);
      } else {
        response = await createLoan(loanData);
      }

      if (response.success) {
        setFormData(emptyForm);
        setEditingLoanId(null);
        setShowForm(false);

        await fetchLoans();
      } else {
        setError(
          response.message ||
            (editingLoanId
              ? "Failed to update loan."
              : "Failed to add loan.")
        );
      }
    } catch (err) {
      console.error(
        editingLoanId
          ? "Update Loan Error:"
          : "Create Loan Error:",
        err
      );

      setError(
        err.message ||
          (editingLoanId
            ? "Unable to update loan."
            : "Unable to add loan.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddLoan = () => {
    setEditingLoanId(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLoanId(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleEdit = (loan) => {
    setFormData({
      loanType: loan.loanType || "Gold Loan",
      loanName: loan.loanName || "",
      totalAmount: loan.totalAmount ?? "",
      amountPaid: loan.amountPaid ?? "",
      emiAmount: loan.emiAmount ?? "",
      dueDate: formatInputDate(loan.dueDate),
      startDate: formatInputDate(loan.startDate),
      endDate: formatInputDate(loan.endDate),
      status: loan.status || "Active",
      reminderEnabled:
        loan.reminderEnabled !== undefined
          ? loan.reminderEnabled
          : true,
    });

    setEditingLoanId(loan._id);
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCloseLoan = async (loan) => {
    const confirmed = window.confirm(
      `Are you sure you want to close "${loan.loanName}"? This will mark the loan as fully paid.`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await updateLoan(loan._id, {
          loanType: loan.loanType,
          loanName: loan.loanName,
          totalAmount: Number(loan.totalAmount),
          amountPaid: Number(loan.totalAmount),
          emiAmount: Number(loan.emiAmount || 0),
          dueDate: loan.dueDate,
          startDate: loan.startDate || null,
          endDate: loan.endDate || null,
          status: "Paid",
          reminderEnabled: false,
        }
      );

      if (response.success) {
        await fetchLoans();
      } else {
        setError(
          response.message ||
            "Failed to close loan."
        );
      }
    } catch (err) {
      console.error("Close Loan Error:", err);

      setError(
        err.message ||
          "Unable to close loan."
      );
    }
  };

  const handleDelete = async (loanId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this loan?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await deleteLoan(loanId);

      if (response.success) {
        await fetchLoans();
      } else {
        setError(
          response.message ||
            "Failed to delete loan."
        );
      }
    } catch (err) {
      console.error("Delete Loan Error:", err);

      setError(
        err.message ||
          "Unable to delete loan."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Loans & Dues
                </h2>

                <p className="mt-2 text-gray-500">
                  Monitor your loans, EMIs, payments and due dates.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  showForm
                    ? handleCloseForm
                    : handleAddLoan
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {showForm
                  ? "Close Form"
                  : "+ Add Loan"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Add / Edit Loan Form */}
            {showForm && (
              <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingLoanId
                    ? "Edit Loan"
                    : "Add New Loan"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {editingLoanId
                    ? "Update your loan and EMI details."
                    : "Enter your loan and EMI details."}
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-6"
                >
                  <div className="grid gap-5 md:grid-cols-2">

                    {/* Loan Type */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Loan Type
                      </label>

                      <select
                        name="loanType"
                        value={formData.loanType}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                        required
                      >
                        <option value="Gold Loan">
                          Gold Loan
                        </option>

                        <option value="Personal Loan">
                          Personal Loan
                        </option>

                        <option value="Home Loan">
                          Home Loan
                        </option>

                        <option value="Vehicle Loan">
                          Vehicle Loan
                        </option>

                        <option value="Education Loan">
                          Education Loan
                        </option>

                        <option value="Credit Card">
                          Credit Card
                        </option>

                        <option value="Other Finance">
                          Other Finance
                        </option>
                      </select>
                    </div>

                    {/* Loan Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Loan Name
                      </label>

                      <input
                        type="text"
                        name="loanName"
                        value={formData.loanName}
                        onChange={handleChange}
                        placeholder="Example: SBI Gold Loan"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Total Amount */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Total Loan Amount
                      </label>

                      <input
                        type="number"
                        name="totalAmount"
                        value={formData.totalAmount}
                        onChange={handleChange}
                        placeholder="Example: 500000"
                        min="0"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Amount Paid */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Amount Already Paid
                      </label>

                      <input
                        type="number"
                        name="amountPaid"
                        value={formData.amountPaid}
                        onChange={handleChange}
                        placeholder="Example: 100000"
                        min="0"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* EMI */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Monthly EMI
                      </label>

                      <input
                        type="number"
                        name="emiAmount"
                        value={formData.emiAmount}
                        onChange={handleChange}
                        placeholder="Example: 15000"
                        min="0"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Next Due Date
                      </label>

                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Start Date
                      </label>

                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        End Date
                      </label>

                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </label>

                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Paid">
                          Paid
                        </option>

                        <option value="Overdue">
                          Overdue
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Reminder */}
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="reminderEnabled"
                      checked={formData.reminderEnabled}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />

                    <span className="text-sm text-gray-700">
                      Enable due-date reminders
                    </span>
                  </label>

                  {/* Form Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? "Saving..."
                        : editingLoanId
                        ? "Update Loan"
                        : "Save Loan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-gray-500">
                  Loading loans...
                </p>
              </div>
            )}

            {/* No Loans */}
            {!loading &&
              !error &&
              loans.length === 0 && (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-700">
                    No loans added yet
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Your Gold Loans, Personal Loans,
                    Home Loans, EMIs and other finance
                    details will appear here.
                  </p>
                </div>
              )}

            {/* Loan Cards */}
            {!loading &&
              !error &&
              loans.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                  {loans.map((loan) => (
                    <div
                      key={loan._id}
                      className="rounded-2xl bg-white p-6 shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500">
                            {loan.loanType}
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-gray-800">
                            {loan.loanName}
                          </h3>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            loan.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : loan.status === "Overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {loan.status}
                        </span>
                      </div>

                      {/* Loan Details */}
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Total Amount
                          </p>

                          <p className="mt-1 font-semibold text-gray-800">
                            {formatAmount(
                              loan.totalAmount
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Amount Paid
                          </p>

                          <p className="mt-1 font-semibold text-green-600">
                            {formatAmount(
                              loan.amountPaid
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Remaining
                          </p>

                          <p className="mt-1 font-semibold text-gray-800">
                            {formatAmount(
                              loan.remainingAmount
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            EMI
                          </p>

                          <p className="mt-1 font-semibold text-gray-800">
                            {formatAmount(
                              loan.emiAmount
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Paid Percentage */}
                      <div className="mt-6">
                        <div className="mb-2 flex justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Amount Paid
                          </span>

                          <span className="text-sm font-bold text-gray-800">
                            {loan.paidPercentage}%
                          </span>
                        </div>

                        <div className="h-3 rounded-full bg-gray-200">
                          <div
                            className="h-3 rounded-full bg-green-500"
                            style={{
                              width: `${loan.paidPercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="mt-6 border-t pt-4">
                        <p className="text-sm text-gray-500">
                          Next Due Date
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {formatDate(loan.dueDate)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-wrap gap-3">

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(loan)
                          }
                          className="flex-1 rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit Loan
                        </button>

                        {/* Close Loan */}
                        {loan.status !== "Paid" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCloseLoan(loan)
                            }
                            className="flex-1 rounded-xl border border-green-600 px-4 py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-50"
                          >
                            Close Loan
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(loan._id)
                          }
                          className="flex-1 rounded-xl border border-red-600 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete Loan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Loans;