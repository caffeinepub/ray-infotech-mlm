import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  public type UserProfile = {
    name : Text;
    contactInfo : Text;
  };

  type MemberId = Nat;
  type TreeLevel = Nat;
  type MatrixPosition = Nat;

  type Commission = {
    memberId : MemberId;
    amount : Nat;
    level : TreeLevel;
    timestamp : Time.Time;
  };

  type MLMTreePosition = {
    memberId : MemberId;
    level : TreeLevel;
    position : MatrixPosition;
  };

  public type LevelCommission = {
    level : TreeLevel;
    levelMembers : Nat;
    commissionAmount : Nat;
    levelPercentage : Nat;
    totalLevelEarnings : Nat;
  };

  public type Member = {
    id : MemberId;
    memberIdStr : Text;
    name : Text;
    contactInfo : Text;
    sponsorId : ?MemberId;
    uplineId : ?MemberId;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Time.Time;
    matrixPosition : MLMTreePosition;
    commissions : [Commission];
    directDownlines : [MemberId];
    membershipDeadline : Time.Time;
    isCancelled : Bool;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    members : Map.Map<MemberId, Member>;
    nextMemberId : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    members : Map.Map<MemberId, Member>;
    nextMemberId : Nat;
  };

  // Migration function to convert old actor state to new state
  public func run(old : OldActor) : NewActor {
    old;
  };
};
