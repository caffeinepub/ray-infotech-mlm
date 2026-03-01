import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { MemberPublic, UserProfile, LevelCommission } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
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
    isFetched: !isInitializing && !!actor && query.isFetched,
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

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const result = await actor.isCallerAdmin();
        return result;
      } catch {
        return false;
      }
    },
    // Do NOT run until identity initialization is complete — prevents anonymous actor from caching false
    enabled: !!actor && !actorFetching && !isInitializing,
    staleTime: 30_000,
    retry: 2,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    // Do NOT run until identity initialization is complete — prevents anonymous actor from caching guest
    enabled: !!actor && !actorFetching && !isInitializing,
    staleTime: 30_000,
    retry: 2,
  });
}

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

export function useRegisterMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registration: {
      name: string;
      contactInfo: string;
      sponsorId?: bigint;
      uplineId?: bigint;
    }) => {
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

export function useDeleteMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMember(memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useCalculateCommissions() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery<LevelCommission[]>({
    queryKey: ['commissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.calculateCommissions(BigInt(2750));
    },
    enabled: !!actor && !actorFetching && !isInitializing,
  });
}
