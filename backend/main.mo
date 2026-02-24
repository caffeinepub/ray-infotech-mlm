import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    contactInfo : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type MemberId = Nat;
  type TreeLevel = Nat;

  type Commission = {
    memberId : MemberId;
    amount : Nat;
    level : TreeLevel;
    timestamp : Time.Time;
  };

  type MLMTreePosition = {
    memberId : MemberId;
    level : TreeLevel;
    position : Nat;
  };

  type Member = {
    id : MemberId;
    name : Text;
    contactInfo : Text;
    sponsorId : ?MemberId;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Time.Time;
    matrixPosition : MLMTreePosition;
    commissions : [Commission];
    directDownlines : [MemberId];
  };

  public type MemberPublic = {
    id : Nat;
    name : Text;
    contactInfo : Text;
    sponsorId : ?Nat;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Time.Time;
    matrixPosition : MLMTreePosition;
    directDownlines : [MemberId];
  };

  public type MemberRegistration = {
    name : Text;
    contactInfo : Text;
    sponsorId : ?MemberId;
  };

  type TransactionAmount = Nat;
  type CreditTransaction = {
    memberId : MemberId;
    amount : TransactionAmount;
    transactionType : {
      #joiningFeeRefund;
      #commission : TreeLevel;
    };
    sourceCommissionee : ?MemberId;
    timestamp : Time.Time;
  };

  let members = Map.empty<MemberId, Member>();
  var nextMemberId = 1;

  public shared ({ caller }) func registerMember(registration : MemberRegistration) : async MemberId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can register members");
    };

    // Validate name
    let name = registration.name;
    if (name.size() == 0 or name.size() > 100) {
      Runtime.trap("Member name must be between 1 and 100 characters. Input: " # registration.name);
    };

    let newMemberId = nextMemberId;

    // Determine upline
    let uplineId = switch (registration.sponsorId) {
      case (null) { newMemberId }; // first/root member sponsors themselves
      case (?id) { id };
    };

    // Verify upline exists (unless this is the root member)
    if (uplineId != newMemberId and not members.containsKey(uplineId)) {
      Runtime.trap("Sponsor (upline) must be an existing member of the matrix. Upline Id: " # uplineId.toText());
    };

    // Verify upline has room (max 3 direct downlines)
    if (uplineId != newMemberId) {
      switch (members.get(uplineId)) {
        case (null) { Runtime.trap("Upline not found") };
        case (?upline) {
          if (upline.directDownlines.size() >= 3) {
            Runtime.trap("Sponsor already has 3 direct downlines and cannot accept more");
          };
        };
      };
    };

    // Find position in matrix
    let newMatrixPosition = findNextMatrixSlot(uplineId, newMemberId);

    let newMemberRecord : Member = {
      id = newMemberId;
      name;
      contactInfo = registration.contactInfo;
      sponsorId = registration.sponsorId;
      joiningFeePaid = true;
      feeRefunded = false;
      registrationTimestamp = Time.now();
      matrixPosition = newMatrixPosition;
      commissions = [];
      directDownlines = [];
    };

    persistNewMember(newMemberRecord, uplineId);
    nextMemberId += 1;

    if (uplineId != newMemberId) {
      processCommissionsAndRefunds(uplineId, newMatrixPosition);
    };

    newMemberId;
  };

  public query ({ caller }) func getMember(id : MemberId) : async ?MemberPublic {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view member details");
    };
    switch (members.get(id)) {
      case (null) { null };
      case (?record) {
        ?toPublic(record);
      };
    };
  };

  public query ({ caller }) func listMembersByName() : async [MemberPublic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can list members");
    };
    members.values().toArray().map(func(m) { toPublic(m) });
  };

  public query ({ caller }) func getSenderDownlines(senderId : MemberId) : async [MemberId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view downlines");
    };

    let idList = List.empty<MemberId>();

    func traverse(memberId : MemberId) {
      switch (members.get(memberId)) {
        case (null) {};
        case (?member) {
          for (downlineId in member.directDownlines.values()) {
            idList.add(downlineId);
            traverse(downlineId);
          };
        };
      };
    };

    traverse(senderId);
    idList.toArray();
  };

  public shared ({ caller }) func markJoiningFeePaid(memberId : MemberId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can mark joining fees as paid");
    };
    switch (members.get(memberId)) {
      case (null) { Runtime.trap("Member not found: " # memberId.toText()) };
      case (?record) {
        members.add(memberId, { record with joiningFeePaid = true });
      };
    };
  };

  func toPublic(record : Member) : MemberPublic {
    {
      id = record.id;
      name = record.name;
      contactInfo = record.contactInfo;
      sponsorId = record.sponsorId;
      joiningFeePaid = record.joiningFeePaid;
      feeRefunded = record.feeRefunded;
      registrationTimestamp = record.registrationTimestamp;
      matrixPosition = record.matrixPosition;
      directDownlines = record.directDownlines;
    };
  };

  func findNextMatrixSlot(sponsorId : MemberId, newMemberId : MemberId) : MLMTreePosition {
    // If this is the root (no real sponsor), place at level 1 position 0
    if (sponsorId == newMemberId) {
      return { memberId = newMemberId; level = 1; position = 0 };
    };

    // BFS from sponsor to find first node with fewer than 3 children
    let queue = List.empty<(MemberId, TreeLevel)>();
    queue.add((sponsorId, 1));

    var result : MLMTreePosition = { memberId = sponsorId; level = 1; position = 0 };
    var found = false;

    label bfsLoop while (queue.size() > 0 and not found) {
      switch (queue.first()) {
        case (null) { break bfsLoop };
        case (?(nodeId, nodeLevel)) {
          switch (members.get(nodeId)) {
            case (null) {};
            case (?node) {
              if (node.directDownlines.size() < 3) {
                result := {
                  memberId = nodeId;
                  level = nodeLevel + 1;
                  position = node.directDownlines.size();
                };
                found := true;
              } else {
                for (childId in node.directDownlines.values()) {
                  queue.add((childId, nodeLevel + 1));
                };
              };
            };
          };
        };
      };
    };

    result;
  };

  func persistNewMember(member : Member, uplineId : MemberId) {
    // Add new member record
    members.add(member.id, member);

    // Update upline's downlines list (skip if root member)
    if (uplineId != member.id) {
      switch (members.get(uplineId)) {
        case (null) { Runtime.trap("Upline must exist already") };
        case (?uplineRecord) {
          let updatedDownlines = uplineRecord.directDownlines.concat([member.id]);
          let updatedUpline = {
            uplineRecord with
            directDownlines = updatedDownlines;
          };
          members.add(uplineId, updatedUpline);
        };
      };
    };
  };

  func processCommissionsAndRefunds(uplineId : MemberId, _newMemberPosition : MLMTreePosition) {
    // Check if upline now has exactly 3 direct downlines → refund joining fee
    switch (members.get(uplineId)) {
      case (null) { Runtime.trap("Upline must exist") };
      case (?uplineRecord) {
        if (not uplineRecord.feeRefunded and uplineRecord.directDownlines.size() == 3) {
          let updatedUpline = {
            uplineRecord with
            feeRefunded = true;
          };
          members.add(uplineId, updatedUpline);
        };
      };
    };

    // Walk up the tree to calculate level-based commissions
    // Level 2 = 9%, Level 3 = 8%, ..., Level 10 = 1%
    // "Level" here refers to how many levels above the new member the ancestor is.
    // After fee refund (level 1 full), subsequent completed levels earn commissions.
    var currentId = uplineId;
    var depth = 1; // depth 1 = direct sponsor

    label commissionLoop while (depth <= 10) {
      switch (members.get(currentId)) {
        case (null) { break commissionLoop };
        case (?currentMember) {
          // Commissions start at depth 2 (level 2 = 9%) after fee is refunded
          if (depth >= 2 and currentMember.feeRefunded) {
            let commissionPercent = if (depth <= 10) { 10 - depth } else { 0 };
            if (commissionPercent > 0) {
              let commissionAmount = (2750 * commissionPercent) / 100;
              let newCommission : Commission = {
                memberId = currentId;
                amount = commissionAmount;
                level = depth;
                timestamp = Time.now();
              };
              let updatedCommissions = currentMember.commissions.concat([newCommission]);
              members.add(currentId, { currentMember with commissions = updatedCommissions });
            };
          };

          // Move up to sponsor
          switch (currentMember.sponsorId) {
            case (null) { break commissionLoop };
            case (?sponsorId) {
              currentId := sponsorId;
              depth += 1;
            };
          };
        };
      };
    };
  };
};
