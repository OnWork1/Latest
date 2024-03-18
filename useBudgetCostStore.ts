import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Cost } from '~/interfaces/models/cost';

export const useBudgetCostStore = defineStore('budgetCostStore', () => {
  const endpoint = 'budget-costs';
  const costList = ref<Cost[] | null>(null);

  const { fetchById } = useFetchData<Cost[]>();

  const fetchCostByBudgetId = async (budgetId: number) => {
    const response = await fetchById(endpoint, budgetId);
    costList.value = response || null;
  };

  return {
    costList,
    fetchCostByBudgetId,
  };
});
