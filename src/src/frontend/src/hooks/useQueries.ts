// Stub - not used in this app
export function useGetCallerUserProfile() {
  return { data: null, isLoading: false, isFetched: true };
}
export function useGetCallerUserRole() {
  return { data: null, isLoading: false, isFetched: true };
}
export function useGetMember(_id: unknown) {
  return { data: null, isLoading: false };
}
export function useRegisterMember() {
  return {
    mutateAsync: async () => ({ id: BigInt(0), memberId: "" }),
    isPending: false,
  };
}
