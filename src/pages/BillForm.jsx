import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import styles from "./BillForm.module.css";

function getMonthParam(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function BillForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => getMonthParam(new Date()));
  const [status, setStatus] = useState("incomplete");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api.bills
      .get(id)
      .then((bill) => {
        setTitle(bill.title);
        setDueDate(bill.dueDate ? getMonthParam(new Date(bill.dueDate)) : getMonthParam(new Date()));
        setStatus(bill.status || "incomplete");
        setAmount(bill.amount != null ? String(bill.amount) : "");
        setNotes(bill.notes || "");
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = {
        title: title.trim(),
        dueDate: new Date(dueDate).toISOString(),
        status,
        amount: amount === "" ? undefined : parseFloat(amount),
        notes: notes.trim() || undefined,
      };
      if (isEdit) {
        await api.bills.update(id, body);
      } else {
        await api.bills.create(body);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>{isEdit ? "Edit bill" : "Add bill"}</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Electric bill"
          required
          className={styles.input}
        />
        <label className={styles.label}>Due date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.input}
        />
        <label className={styles.label}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.input}>
          <option value="incomplete">Incomplete</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <label className={styles.label}>Amount (optional)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className={styles.input}
        />
        <label className={styles.label}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes…"
          rows={2}
          className={styles.input}
        />
        <div className={styles.actions}>
          <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Saving…" : isEdit ? "Update" : "Add bill"}
          </button>
        </div>
      </form>
    </div>
  );
}
