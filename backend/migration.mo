import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";

module {
  type MemberId = Nat;
  type TreeLevel = Nat;

  type Commission = {
    memberId : MemberId;
    amount : Nat;
    level : TreeLevel;
    timestamp : Int;
  };

  type MLMTreePosition = {
    memberId : MemberId;
    level : TreeLevel;
    position : Nat;
  };

  // Old member type.
  type OldMember = {
    id : MemberId;
    name : Text;
    contactInfo : Text;
    sponsorId : ?MemberId;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Int;
    matrixPosition : MLMTreePosition;
    commissions : [Commission];
    directDownlines : [MemberId];
    membershipDeadline : Int;
    isCancelled : Bool;
  };

  // Old actor type
  type OldActor = {
    members : Map.Map<MemberId, OldMember>;
    nextMemberId : Nat;
  };

  // New member type with memberId field.
  type NewMember = {
    id : MemberId;
    memberIdStr : Text;
    name : Text;
    contactInfo : Text;
    sponsorId : ?MemberId;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Int;
    matrixPosition : MLMTreePosition;
    commissions : [Commission];
    directDownlines : [MemberId];
    membershipDeadline : Int;
    isCancelled : Bool;
  };

  // New actor type
  type NewActor = {
    members : Map.Map<MemberId, NewMember>;
    nextMemberId : Nat;
  };

  public func formatMemberId(id : Nat) : Text {
    let numStr = id.toText();
    let paddedId = switch (numStr.size()) {
      case (0) { "000000000" };
      case (1) { "00000000" # numStr };
      case (2) { "0000000" # numStr };
      case (3) { "000000" # numStr };
      case (4) { "00000" # numStr };
      case (5) { "0000" # numStr };
      case (6) { "000" # numStr };
      case (7) { "00" # numStr };
      case (8) { "0" # numStr };
      case (9) { numStr };
      case (_) { numStr };
    };
    "RI " # paddedId;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    let newMembers = old.members.map<MemberId, OldMember, NewMember>(
      func(_id, oldMember) {
        {
          oldMember with
          memberIdStr = formatMemberId(oldMember.id);
        };
      }
    );
    { old with members = newMembers };
  };
};
