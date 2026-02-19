import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Profile</h2>
      <p className={styles.email}>{user?.email}</p>
      <p className={styles.muted}>You can use this app on any device – just sign in with this account.</p>
      <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
        Sign out
      </button>
    </div>
  );
}
