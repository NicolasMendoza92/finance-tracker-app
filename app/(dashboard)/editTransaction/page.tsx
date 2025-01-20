import { isTransactionType } from "@/lib/helpers";
import { getTransactionById } from "../_actions/transactions";
import EditTransactionForm from "../_components/EditTransaction";

type PageProps = {
  searchParams: Promise<{ id: string; inventoryId: string }>;
};

async function Content({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = params.id;

  if (id) {
    const res = await getTransactionById(id);
    if (res.success && res.transactionFound) {
      const { transactionFound } = res;
      const transactionType = isTransactionType(transactionFound.type)
        ? transactionFound.type
        : "expense";
      return (
        <EditTransactionForm
          transactionData={{
            id: transactionFound.id,
            type: transactionType,
            description: transactionFound.description || "",
            amount: transactionFound.amount || 0,
            category: transactionFound.category || "",
            account: transactionFound.account || "",
            date: transactionFound.date || new Date(),
          }}
        />
      );
    }
  }

  return null;
}

export default function EditTransactionPage({ searchParams }: PageProps) {
  return <Content searchParams={searchParams} />;
}
