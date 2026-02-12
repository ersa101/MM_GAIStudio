
import { db } from "../db";
import { toast } from "react-hot-toast";

// In a real environment, this would call /api/backup or similar.
// For this PWA, we simulate the logic of backing up all tables to a structured format.
export async function backupToCloud() {
  try {
    const data = {
      accounts: await db.accounts.toArray(),
      categories: await db.categories.toArray(),
      transactions: await db.transactions.toArray(),
      accountTypes: await db.accountTypes.toArray(),
      accountGroups: await db.accountGroups.toArray(),
      timestamp: new Date().toISOString()
    };

    // Simulate API call delay
    await new Promise(r => setTimeout(r, 1500));
    
    // In a real app, we would POST this to a server-side route.
    localStorage.setItem('money-mngr-backup', JSON.stringify(data));
    localStorage.setItem('lastBackupAt', data.timestamp);
    
    return data;
  } catch (error) {
    console.error("Backup failed", error);
    throw error;
  }
}

export async function restoreFromCloud() {
  try {
    const stored = localStorage.getItem('money-mngr-backup');
    if (!stored) throw new Error("No backup found in cloud");

    const data = JSON.parse(stored);
    
    // Replace all local data
    // Fix: Cast 'db' to any to access the 'transaction' method and avoid collision with the 'transactions' table property
    await (db as any).transaction('rw', [db.accounts, db.categories, db.transactions, db.accountTypes, db.accountGroups], async () => {
      await db.accounts.clear();
      await db.categories.clear();
      await db.transactions.clear();
      await db.accountTypes.clear();
      await db.accountGroups.clear();
      
      await db.accounts.bulkAdd(data.accounts);
      await db.categories.bulkAdd(data.categories);
      await db.transactions.bulkAdd(data.transactions);
      await db.accountTypes.bulkAdd(data.accountTypes);
      await db.accountGroups.bulkAdd(data.accountGroups);
    });

    return data;
  } catch (error) {
    console.error("Restore failed", error);
    throw error;
  }
}
