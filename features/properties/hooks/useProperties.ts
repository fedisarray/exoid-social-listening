"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProperties } from "../actions/listProperties";
import { deleteProperty } from "../actions/deleteProperty";
import { addProperty } from "../actions/addProperty";
import type { PropertySummary } from "../schemas/listPropertiesOutput";
export function useProperties(initial?: PropertySummary[]) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["properties"],
    queryFn: () => listProperties({}),
    initialData: initial,
  });
  const add = useMutation({
    mutationFn: addProperty,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["properties"] });
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProperty({ id });
      if (!result.ok) throw new Error(result.code);
      return id;
    },
    onSuccess: async (id) => {
      client.setQueryData<PropertySummary[]>(["properties"], (saved) =>
        saved?.filter((property) => property.id !== id),
      );
      client.removeQueries({ queryKey: ["review-dashboard", id] });
      await client.invalidateQueries({ queryKey: ["properties"] });
    },
  });
  return { query, add, remove };
}
