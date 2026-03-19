import { useActor } from "./useActor";

export function useBackend() {
  const { actor, isFetching } = useActor();
  return { backend: actor, isFetching };
}
