import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { MemberPublic, MemberRegistration, UserProfile } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Role / Auth ──────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// ─── Member Registration Data ─────────────────────────────────────────────────

export function useGetMemberRegistrationData(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['memberRegistrationData', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        const { Principal } = await import('@dfinity/principal');
        return actor.getMemberRegistrationData(Principal.fromText(principal));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: false,
  });
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function useListMembers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MemberPublic[]>({
    queryKey: ['members'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMembersByName();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMember(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MemberPublic | null>({
    queryKey: ['member', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getMember(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useGetSenderDownlines(senderId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['downlines', senderId?.toString()],
    queryFn: async () => {
      if (!actor || senderId === null) return [];
      return actor.getSenderDownlines(senderId);
    },
    enabled: !!actor && !actorFetching && senderId !== null,
  });
}

// ─── Register Member ──────────────────────────────────────────────────────────

export function useRegisterMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registration: MemberRegistration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerMember(registration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

// ─── Admin Actions ────────────────────────────────────────────────────────────

export function useMarkJoiningFeePaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markJoiningFeePaid(memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useCheckMembershipStatuses() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkMembershipStatuses();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
