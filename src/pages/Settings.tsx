import * as React from "react";
import { motion } from "framer-motion";
import { User, Tag, Wallet, Plus, Trash2, Save, Loader2 } from "lucide-react";
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

  // New category/wallet
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newWalletName, setNewWalletName] = React.useState("");

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchWallets()]);
      setIsLoading(false);
    };
    load();
  }, [fetchCategories, fetchWallets]);

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
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
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
                className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm"
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
                className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm"
              />
              {username.trim().length < 3 && (
                <p className="text-xs text-destructive">Username must be at least 3 characters</p>
              )}
            </div>
          </div>

          {(message || error) && (
            <div className={`text-sm ${error ? "text-destructive" : "text-success"}`}>
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

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Categories
          </CardTitle>
          <CardDescription>Manage your expense categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-1 h-10 px-3 rounded-md border border-border bg-card text-sm"
              onKeyDown={e => e.key === "Enter" && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.icon || "📁"}</span>
                  <span className="font-medium">{cat.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallets
          </CardTitle>
          <CardDescription>Manage your wallets and accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newWalletName}
              onChange={e => setNewWalletName(e.target.value)}
              placeholder="New wallet name"
              className="flex-1 h-10 px-3 rounded-md border border-border bg-card text-sm"
              onKeyDown={e => e.key === "Enter" && handleAddWallet()}
            />
            <Button onClick={handleAddWallet} disabled={!newWalletName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {wallets.map((wallet, idx) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
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
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDeleteWallet(wallet.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
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
