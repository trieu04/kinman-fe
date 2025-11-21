import { useState } from "react";
import { TransactionList } from "../transactions/components/TransactionList";
import { TransactionForm } from "../transactions/components/TransactionForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, List } from "lucide-react";

export function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddTransaction, setShowAddTransaction] = useState(false); // Changed from showForm to showAddTransaction

  // handleSuccess is no longer directly used in the same way,
  // the onSuccess prop is now an inline arrow function.

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        {/* Add more summary cards here */}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={() => setShowAddTransaction(!showAddTransaction)}>
          {showAddTransaction ? <List className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAddTransaction ? "View Transactions" : "Add Transaction"}
        </Button>
      </div>

      {showAddTransaction ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm onSuccess={() => {
              setShowAddTransaction(false);
              setRefreshKey((prev) => prev + 1); // Added refreshKey update here
            }} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList key={refreshKey} /> {/* Added key for refresh */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
