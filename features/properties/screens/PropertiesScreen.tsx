import { listProperties } from "../queries/listProperties";
import { PropertiesDashboard } from "./PropertiesDashboard";

export async function PropertiesScreen() {
  const properties = await listProperties({});
  return <PropertiesDashboard initial={properties} />;
}
