import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api-client";

export function usePublicProof() {
  return useQuery({
    queryKey: ["public-proof"],
    queryFn: api.publicProof,
    staleTime: 60_000,
  });
}

export function usePublicRuntime() {
  return useQuery({
    queryKey: ["public-runtime"],
    queryFn: api.publicRuntime,
    staleTime: 30_000,
  });
}
