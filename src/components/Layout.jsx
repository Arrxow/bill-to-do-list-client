import { Outlet, NavLink } from "react-router-dom";
import styles from "./Layout.module.css";

export default function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bills</h1>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : "")} end>List</NavLink>
          <NavLink to="/add" className={({ isActive }) => (isActive ? styles.active : "")}>Add</NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? styles.active : "")}>Profile</NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
