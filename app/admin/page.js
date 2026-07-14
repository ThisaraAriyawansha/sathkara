"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [busyUid, setBusyUid] = useState(null);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.push("/");
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (loading || profile?.role !== "admin") return;
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setUsersLoading(false);
      }
    };
    load();
  }, [loading, profile]);

  if (loading || !user || profile?.role !== "admin") {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-slate py-20">...</p>
      </main>
    );
  }

  const toggleRole = async (target) => {
    setBusyUid(target.uid);
    try {
      const newRole = target.role === "admin" ? "user" : "admin";
      await updateDoc(doc(db, "users", target.uid), { role: newRole });
      setUsers((prev) => prev.map((u) => (u.uid === target.uid ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error(err);
    } finally {
      setBusyUid(null);
    }
  };

  const toggleDisabled = async (target) => {
    setBusyUid(target.uid);
    try {
      const newDisabled = !target.disabled;
      await updateDoc(doc(db, "users", target.uid), { disabled: newDisabled });
      setUsers((prev) => prev.map((u) => (u.uid === target.uid ? { ...u, disabled: newDisabled } : u)));
    } catch (err) {
      console.error(err);
    } finally {
      setBusyUid(null);
    }
  };

  return (
    <main className="min-h-screen pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-primary mb-8">{t("admin.title")}</h1>

        {usersLoading ? (
          <p className="text-center text-slate py-10">...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => {
              const isSelf = u.uid === user.uid;
              const avatar =
                u.profilePicUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(u.name || "?");
              return (
                <div
                  key={u.uid}
                  className="flex items-center gap-3 p-3 rounded-card border border-border bg-surface"
                >
                  <img src={avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">
                      {u.name}
                      {u.role === "admin" && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {t("admin.adminBadge")}
                        </span>
                      )}
                      {u.disabled && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-error/10 text-error">
                          {t("admin.disabledBadge")}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate truncate">{u.email}</p>
                  </div>

                  {!isSelf && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={busyUid === u.uid}
                        className="min-h-[36px] px-3 rounded-card border border-border text-xs font-medium disabled:opacity-60"
                      >
                        {u.role === "admin" ? t("admin.demote") : t("admin.promote")}
                      </button>
                      <button
                        onClick={() => toggleDisabled(u)}
                        disabled={busyUid === u.uid}
                        className={`min-h-[36px] px-3 rounded-card border text-xs font-medium disabled:opacity-60 ${
                          u.disabled ? "border-border text-primary" : "border-border text-error"
                        }`}
                      >
                        {u.disabled ? t("admin.enable") : t("admin.disable")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
