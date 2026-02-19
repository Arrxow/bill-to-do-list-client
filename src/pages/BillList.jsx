import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import styles from "./BillList.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "incomplete", label: "Incomplete" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

function formatMonth(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getMonthParam(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function BillList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => getMonthParam(new Date()));
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api.bills
      .list({ month, status: statusFilter || undefined })
      .then((data) => {
        if (!cancelled) setBills(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [month, statusFilter]);

  const changeStatus = async (id, newStatus) => {
    try {
      const updated = await api.bills.update(id, { status: newStatus });
      setBills((prev) => prev.map((b) => (b._id === id ? updated : b)));
    } catch (err) {
      setError(err.message);
    }
  };

  const prevMonth = () => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1, 0);
    setMonth(getMonthParam(d));
  };

  const nextMonth = () => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m, 1);
    setMonth(getMonthParam(d));
  };

  const today = new Date();
  const currentMonth = getMonthParam(today);
  const canPrev = month !== "2020-01";
  const canNext = month !== getMonthParam(new Date(today.getFullYear() + 2, 0, 1));

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.monthRow}>
          <button type="button" onClick={prevMonth} disabled={!canPrev} className={styles.monthBtn}>
            ←
          </button>
          <span className={styles.monthLabel}>{formatMonth(month)}</span>
          <button type="button" onClick={nextMonth} disabled={!canNext} className={styles.monthBtn}>
            →
          </button>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : bills.length === 0 ? (
        <p className={styles.muted}>No bills this month. <Link to="/add">Add one</Link>.</p>
      ) : (
        <ul className={styles.list}>
          {bills.map((bill) => (
            <li key={bill._id} className={styles.item}>
              <Link to={`/edit/${bill._id}`} className={styles.link}>
                <span className={styles.billTitle}>{bill.title}</span>
                <span className={styles.billDue}>
                  {new Date(bill.dueDate).toLocaleDateString()}
                  {bill.amount != null && bill.amount > 0 && (
                    <> · ${Number(bill.amount).toFixed(2)}</>
                  )}
                </span>
                <span className={`${styles.status} ${styles[bill.status]}`}>{bill.status}</span>
              </Link>
              <div className={styles.statusBtns}>
                {(["incomplete", "pending", "completed"]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeStatus(bill._id, s)}
                    className={bill.status === s ? styles.statusBtnActive : styles.statusBtn}
                    title={s}
                  >
                    {s.slice(0, 1).toUpperCase()}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
