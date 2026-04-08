import { useActor as useActorBase } from "@caffeineai/core-infrastructure";
import type { Backend } from "../backend";
import { createActor } from "../backend";

export function useActor(): { actor: Backend | null; isFetching: boolean } {
  return useActorBase<Backend>((canisterId, _upload, _download, options) =>
    createActor(canisterId, _upload, _download, {
      agentOptions: options?.agentOptions,
      actorOptions: options?.actorOptions,
    }),
  );
}
