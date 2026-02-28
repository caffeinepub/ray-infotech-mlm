import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type OldMember = {
    id : Nat;
    memberIdStr : Text;
    name : Text;
    contactInfo : Text;
    sponsorId : ?Nat;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Time.Time;
    matrixPosition : {
      memberId : Nat;
      level : Nat;
      position : Nat;
    };
    commissions : [{
      memberId : Nat;
      amount : Nat;
      level : Nat;
      timestamp : Time.Time;
    }];
    directDownlines : [Nat];
    membershipDeadline : Time.Time;
    isCancelled : Bool;
  };

  type OldActor = {
    members : Map.Map<Nat, OldMember>;
    nextMemberId : Nat;
  };

  type NewMember = {
    id : Nat;
    memberIdStr : Text;
    name : Text;
    contactInfo : Text;
    sponsorId : ?Nat;
    uplineId : ?Nat;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Time.Time;
    matrixPosition : {
      memberId : Nat;
      level : Nat;
      position : Nat;
    };
    commissions : [{
      memberId : Nat;
      amount : Nat;
      level : Nat;
      timestamp : Time.Time;
    }];
    directDownlines : [Nat];
    membershipDeadline : Time.Time;
    isCancelled : Bool;
  };

  type NewActor = {
    members : Map.Map<Nat, NewMember>;
    nextMemberId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newMembers = old.members.map<Nat, OldMember, NewMember>(
      func(_, oldMember) {
        { oldMember with uplineId = null };
      }
    );
    { old with members = newMembers };
  };
};
