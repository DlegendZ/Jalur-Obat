"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./bottomNav.module.css";

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div className={styles.bottomNav}>
            <div className={pathname === "/update_journey" ? `${styles.navItem} ${styles.activeNav}` : styles.navItem}>
                <Link href="/update_journey" className={styles.navLink}>
                    <img src="/Update.png" className={styles.navIcon} alt="Update" />
                    <span>Journey Update</span>
                </Link>
            </div>

            <div className={pathname === "/list_journey" ? `${styles.navItem} ${styles.activeNav}` : styles.navItem}>
                <Link href="/list_journey" className={styles.navLink}>
                    <img src="/List.png" className={styles.navIcon} alt="List" />
                    <span>Journey List</span>
                </Link>
            </div>
        </div>
    );
}