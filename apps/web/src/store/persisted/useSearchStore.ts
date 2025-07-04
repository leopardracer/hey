import { createPersistedTrackedStore } from "@/store/createTrackedStore";
import { Localstorage } from "@hey/data/storage";

interface State {
  addAccount: (account: string) => void;
  clearAccount: (account: string) => void;
  clearAccounts: () => void;
  accounts: string[];
}

const { useStore: useSearchStore } = createPersistedTrackedStore<State>(
  (set) => ({
    addAccount: (account) =>
      set((state) => {
        // Remove the account if it already exists
        const filteredAccounts = state.accounts.filter((a) => a !== account);
        // Add the new account to the start of the array and ensure the total is at most 5
        return { accounts: [account, ...filteredAccounts].slice(0, 5) };
      }),
    clearAccount: (account) =>
      set((state) => ({
        accounts: state.accounts.filter((a) => a !== account)
      })),
    clearAccounts: () => set({ accounts: [] }),
    accounts: []
  }),
  { name: Localstorage.SearchStore }
);

export { useSearchStore };
