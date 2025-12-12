import * as React from "react";
import { User, Tag, Wallet, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../stores/authStore";
import { useExpenseStore } from "../stores/expenseStore";
import categoryService from "../services/categoryService";
import walletService from "../services/walletService";
import authService from "../services/authService";

export function Settings() {
  const { user } = useAuthStore();
  const { categories, wallets, fetchCategories, fetchWallets, addCategory, addWallet } = useExpenseStore();
  const [isLoading, setIsLoading] = React.useState(true);

  // Profile form
  const [name, setName] = React.useState(user?.name || "");
  const [username, setUsername] = React.useState(user?.username || "");
  const [isSaving, setIsSaving] = React.useState(false);

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
    setIsSaving(true);
    try {
      await authService.updateProfile({ name, username });
    }
    catch (error) {
      console.error("Failed to update profile:", error);
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
      const wallet = await walletService.create({ name: newWalletName.trim() });
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-base">Manage your account and preferences</p>
      </div>

      {/* Profile */}
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
                className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-border bg-card text-sm"
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving}>
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

      {/* Categories */}
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
            {categories.map(cat => (
              <div
                key={cat.id}
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
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center py-4 text-muted-foreground">
                No categories yet. Create one to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wallets */}
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
            {wallets.map(wallet => (
              <div
                key={wallet.id}
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
              </div>
            ))}
            {wallets.length === 0 && (
              <p className="text-center py-4 text-muted-foreground">
                No wallets yet. Create one to track your money!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
