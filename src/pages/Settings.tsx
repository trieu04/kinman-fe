import * as React from "react";
import { motion } from "framer-motion";
import { User, Tag, Wallet, Plus, Trash2, Save, Loader2, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../stores/authStore";
import { useExpenseStore } from "../stores/expenseStore";
import categoryService from "../services/categoryService";
import walletService from "../services/walletService";
// authService is used through auth store's updateProfile

export function Settings() {
  const { user, updateProfile } = useAuthStore();
  const { categories, wallets, fetchCategories, fetchWallets, addCategory, addWallet } = useExpenseStore();
  const [isLoading, setIsLoading] = React.useState(true);

  // Profile form
  const [name, setName] = React.useState(user?.name || "");
  const [username, setUsername] = React.useState(user?.username || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Notification settings
  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [reminderTime, setReminderTime] = React.useState("09:00");
  const [notificationPermission, setNotificationPermission] = React.useState(Notification.permission);

  // New category/wallet
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newWalletName, setNewWalletName] = React.useState("");

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchWallets()]);

      // Load notification settings
      setReminderEnabled(localStorage.getItem("reminderEnabled") === "true");
      setReminderTime(localStorage.getItem("reminderTime") || "09:00");

      setIsLoading(false);
    };
    load();
  }, [fetchCategories, fetchWallets]);

  // Save notification settings
  const handleReminderChange = async (enabled: boolean) => {
    if (enabled && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== "granted") {
        alert("Please enable notifications in your browser to use this feature.");
        return;
      }
    }
    setReminderEnabled(enabled);
    localStorage.setItem("reminderEnabled", String(enabled));
  };

  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    localStorage.setItem("reminderTime", time);
  };

  const handleTestNotification = () => {
    if (Notification.permission === "granted") {
      const n = new Notification("Test Notification", {
        body: "This is a test notification from Kinman!",
        icon: "/favicon.ico"
      });
      n.onclick = () => {
        window.focus();
        window.dispatchEvent(new CustomEvent("open-quick-add"));
      };
    } else {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          handleTestNotification();
        }
      });
    }
  };

  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setMessage(null);
    setError(null);
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), username: username.trim() });
      setMessage("Profile updated successfully.");
    }
    catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
      console.error("Failed to update profile:", err);
    }
    finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim())
      return;
    try {
      const category = await categoryService.create({ name: newCategoryName.trim() });
      addCategory(category);
      setNewCategoryName("");
    }
    catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?"))
      return;
    try {
      await categoryService.delete(id);
      await fetchCategories();
    }
    catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleAddWallet = async () => {
    if (!newWalletName.trim())
      return;
    try {
      const wallet = await walletService.create({ name: newWalletName.trim(), balance: 0, currency: "VND" });
      addWallet(wallet);
      setNewWalletName("");
    }
    catch (error) {
      console.error("Failed to create wallet:", error);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm("Delete this wallet?"))
      return;
    try {
      await walletService.delete(id);
      await fetchWallets();
    }
    catch (error) {
      console.error("Failed to delete wallet:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categoryAccents = [
    "from-amber-500/20 via-amber-500/10 to-amber-500/5 border-amber-500/30",
    "from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 border-emerald-500/30",
    "from-blue-500/20 via-blue-500/10 to-blue-500/5 border-blue-500/25",
    "from-rose-500/20 via-rose-500/10 to-rose-500/5 border-rose-500/25",
  ];

  const walletAccents = [
    "from-indigo-500/20 via-indigo-500/10 to-indigo-500/5 border-indigo-500/30",
    "from-teal-500/20 via-teal-500/10 to-teal-500/5 border-teal-500/30",
    "from-orange-500/20 via-orange-500/10 to-orange-500/5 border-orange-500/30",
    "from-cyan-500/20 via-cyan-500/10 to-cyan-500/5 border-cyan-500/30",
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-base">Manage your account and preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
      >
        <Card className="border border-primary/10 shadow-lg shadow-primary/10 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <User className="w-5 h-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground">Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  Joined
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "recently"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-border/60 bg-card/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/50 transition"
                />
                {name.trim().length === 0 && (
                  <p className="text-xs text-destructive">Name is required</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-border/60 bg-card/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/50 transition"
                />
                {username.trim().length < 3 && (
                  <p className="text-xs text-destructive">Username must be at least 3 characters</p>
                )}
              </div>
            </div>

            {(message || error) && (
              <div className={`text-sm px-3 py-2 rounded-md ${error ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                {error || message}
              </div>
            )}
            <Button
              onClick={handleSaveProfile}
              disabled={
                isSaving
                || (name.trim() === (user?.name || "").trim() && username.trim() === (user?.username || "").trim())
                || name.trim().length === 0
                || username.trim().length < 3
              }
            >
              {isSaving
                ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                )
                : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.22, ease: "easeOut" }}
      >
        <Card className="border border-purple-500/20 shadow-lg shadow-purple-500/10 bg-gradient-to-br from-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Bell className="w-5 h-5 text-purple-500" />
              Notifications
            </CardTitle>
            <CardDescription className="text-muted-foreground">Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Daily Note Reminder</div>
                <div className="text-sm text-muted-foreground">Receive a daily reminder to record your expenses</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={reminderEnabled}
                  onChange={(e) => handleReminderChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            {reminderEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reminder Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="block w-full h-10 px-3 rounded-md border border-border/60 bg-card/80 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/50 transition"
                  />
                </div>
              </motion.div>
            )}

            <div className="pt-2">
              <Button variant="outline" onClick={handleTestNotification} className="w-full sm:w-auto">
                Test Notification
              </Button>
            </div>

            {notificationPermission === 'denied' && (
              <p className="text-xs text-destructive">
                Notifications are blocked by your browser settings. Please enable them to use this feature.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <Card className="border border-amber-500/20 shadow-lg shadow-amber-500/10 bg-gradient-to-br from-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Tag className="w-5 h-5 text-amber-500" />
              Categories
            </CardTitle>
            <CardDescription className="text-muted-foreground">Manage your expense categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="flex-1 h-10 px-3 rounded-md border border-amber-500/40 bg-amber-50/30 dark:bg-slate-900/50 text-foreground dark:text-slate-100 placeholder-foreground/50 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition shadow-sm"
                onKeyDown={e => e.key === "Enter" && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {categories.map((cat, idx) => {
                const accent = categoryAccents[idx % categoryAccents.length];
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                    className={`flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r ${accent} shadow-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon || "📁"}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}
              {categories.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">
                  No categories yet. Create one to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wallets */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
      >
        <Card className="border border-indigo-500/20 shadow-lg shadow-indigo-500/10 bg-gradient-to-br from-white to-indigo-50/60 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Wallet className="w-5 h-5 text-indigo-500" />
              Wallets
            </CardTitle>
            <CardDescription className="text-muted-foreground">Manage your wallets and accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newWalletName}
                onChange={e => setNewWalletName(e.target.value)}
                placeholder="New wallet name"
                className="flex-1 h-10 px-3 rounded-md border border-indigo-500/40 bg-indigo-50/30 dark:bg-slate-900/50 text-foreground dark:text-slate-100 placeholder-foreground/50 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                onKeyDown={e => e.key === "Enter" && handleAddWallet()}
              />
              <Button onClick={handleAddWallet} disabled={!newWalletName.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {wallets.map((wallet, idx) => {
                const accent = walletAccents[idx % walletAccents.length];
                return (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                    className={`flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r ${accent} shadow-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{wallet.icon || "💳"}</span>
                      <div>
                        <span className="font-medium">{wallet.name}</span>
                        <p className="text-xs text-muted-foreground">
                          Balance:
                          {" "}
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(wallet.balance)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteWallet(wallet.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}
              {wallets.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">
                  No wallets yet. Create one to track your money!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Settings;
