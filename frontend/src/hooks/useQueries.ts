import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { MemberPublic, UserProfile, LevelCommission } from '../backend';

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

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

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
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    retry: 2,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    retry: 2,
  });
}

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

  return useQuery<LevelCommission[]>({
    queryKey: ['commissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.calculateCommissions(BigInt(2750));
    },
    enabled: !!actor && !actorFetching,
  });
}
