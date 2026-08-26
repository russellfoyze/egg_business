import YolkFlowClient from "./YolkFlowClient";
import { fetchLedgerDataAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await fetchLedgerDataAction();
  const data = result.success ? result.data : [];
  return <YolkFlowClient initialData={data} />;
}
