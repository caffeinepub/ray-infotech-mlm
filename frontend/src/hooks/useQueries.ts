import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { MemberPublic, MemberRegistration, UserProfile } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing, identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString() ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !isInitializing,
    retry: false,
  });

  return {
    ...query,
    isLoading: isInitializing || actorFetching || query.isLoading,
    isFetched: !isInitializing && !actorFetching && !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['currentUserProfile', identity?.getPrincipal().toString() ?? 'anonymous'],
      });
    },
  });
}

// ─── Admin / Role ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing, identity } = useInternetIdentity();

  const principal = identity?.getPrincipal().toString();
  const isAuthenticated = !!identity && !!principal && principal !== 'anonymous';

  const query = useQuery<boolean>({
    // Include principal in key so the query resets when identity changes
    queryKey: ['isCallerAdmin', principal ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    // Only run after:
    // 1. Identity is fully restored (not initializing)
    // 2. We have a real authenticated identity (not anonymous)
    // 3. The actor is ready and not currently fetching
    enabled: !!actor && !actorFetching && !isInitializing && isAuthenticated,
    retry: false,
    staleTime: 0, // Always refetch when key changes
  });

  return {
    ...query,
    isLoading: isInitializing || actorFetching || (isAuthenticated && query.isLoading),
    isFetched: !isInitializing && !actorFetching && (isAuthenticated ? query.isFetched : true),
    // Expose whether we have a real authenticated identity
    isAuthenticated,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing, identity } = useInternetIdentity();

  const principal = identity?.getPrincipal().toString();

  const query = useQuery({
    queryKey: ['callerUserRole', principal ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && !isInitializing,
    retry: false,
    staleTime: 0,
  });

  return {
    ...query,
    isLoading: isInitializing || actorFetching || query.isLoading,
    isFetched: !isInitializing && !actorFetching && !!actor && query.isFetched,
  };
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function useListMembers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery<MemberPublic[]>({
    queryKey: ['members'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMembersByName();
    },
    enabled: !!actor && !actorFetching && !isInitializing,
  });
}

export function useGetMember(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery<MemberPublic | null>({
    queryKey: ['member', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getMember(id);
    },
    enabled: !!actor && !actorFetching && !isInitializing && id !== null,
  });
}

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

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (memberId: bigint) => {
      // Always read the freshest actor from the query cache at mutation time
      // so we use the authenticated actor, not a stale anonymous one
      const principal = identity?.getPrincipal().toString();
      const actorQueryKey = ['actor', principal];
      const actor = queryClient.getQueryData<import('../backend').backendInterface>(actorQueryKey);

      if (!actor) throw new Error('Actor not available — please ensure you are logged in');
      return actor.deleteMember(memberId);
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

export function useGetSenderDownlines(senderId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery<bigint[]>({
    queryKey: ['downlines', senderId?.toString()],
    queryFn: async () => {
      if (!actor || senderId === null) return [];
      return actor.getSenderDownlines(senderId);
    },
    enabled: !!actor && !actorFetching && !isInitializing && senderId !== null,
  });
}

export function useCalculateCommissions() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery({
    queryKey: ['commissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.calculateCommissions(BigInt(2750));
    },
    enabled: !!actor && !actorFetching && !isInitializing,
  });
}
