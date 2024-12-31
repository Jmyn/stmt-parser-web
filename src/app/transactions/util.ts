import { v5 as uuidv5 } from "uuid";

const NAMESPACE = "26edf45b-1b4a-4211-9ca9-75e7510a708d";

export function generateUUID(...inputs: string[]): string {
  const combined = inputs.join("|"); // Combine inputs with a separator
  return uuidv5(combined, NAMESPACE); // Generate UUID version 5
}
