import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Automatically run migration if data structure changes between versions
(with migration = Migration.run)
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
    memberIdStr : Text; // Store string formatted id
    name : Text;
    contactInfo : Text;
    sponsorId : ?MemberId;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Time.Time;
    matrixPosition : MLMTreePosition;
    commissions : [Commission];
    directDownlines : [MemberId];
    membershipDeadline : Time.Time;
    isCancelled : Bool;
  };

  public type MemberPublic = {
    id : Nat;
    memberIdStr : Text; // Add string id to query result
    name : Text;
    contactInfo : Text;
    sponsorId : ?Nat;
    joiningFeePaid : Bool;
    feeRefunded : Bool;
    registrationTimestamp : Time.Time;
    matrixPosition : MLMTreePosition;
    directDownlines : [MemberId];
    membershipDeadline : Time.Time;
    isCancelled : Bool;
  };

  public type MemberRegistration = {
    name : Text;
    contactInfo : Text;
    sponsorId : ?MemberId;
  };

  public type MemberRegistrationResult = {
    id : MemberId;
    memberId : Text;
  };

  let members = Map.empty<MemberId, Member>();
  var nextMemberId = 1;

  let threeDaysInNanoseconds = 3 * 24 * 60 * 60 * 1_000_000_000;

  func formatMemberId(id : Nat) : Text {
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

  public shared ({ caller }) func registerMember(registration : MemberRegistration) : async MemberRegistrationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can register members");
    };

    let name = registration.name;
    if (name.size() == 0 or name.size() > 100) {
      Runtime.trap("Member name must be between 1 and 100 characters. Input: " # registration.name);
    };

    let newMemberId = nextMemberId;
    let uplineId = switch (registration.sponsorId) {
      case (null) { newMemberId };
      case (?id) { id };
    };

    if (uplineId != newMemberId and not members.containsKey(uplineId)) {
      Runtime.trap("Sponsor (upline) must be an existing member of the matrix. Upline Id: " # uplineId.toText());
    };

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

    let newMatrixPosition = findNextMatrixSlot(uplineId, newMemberId);

    let currentTime = Time.now();
    let membershipDeadline = currentTime + threeDaysInNanoseconds;
    let memberIdStr = formatMemberId(newMemberId);

    let newMemberRecord : Member = {
      id = newMemberId;
      memberIdStr; // Add formatted id to record
      name;
      contactInfo = registration.contactInfo;
      sponsorId = registration.sponsorId;
      joiningFeePaid = true;
      feeRefunded = false;
      registrationTimestamp = currentTime;
      matrixPosition = newMatrixPosition;
      commissions = [];
      directDownlines = [];
      membershipDeadline;
      isCancelled = false;
    };

    persistNewMember(newMemberRecord, uplineId);
    nextMemberId += 1;

    if (uplineId != newMemberId) {
      processCommissionsAndRefunds(uplineId, newMatrixPosition);
    };

    {
      id = newMemberId;
      memberId = memberIdStr;
    };
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

  public shared ({ caller }) func checkMembershipStatuses() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can run status check");
    };
    checkAndExpireMembers();
  };

  func toPublic(record : Member) : MemberPublic {
    {
      id = record.id;
      memberIdStr = record.memberIdStr;
      name = record.name;
      contactInfo = record.contactInfo;
      sponsorId = record.sponsorId;
      joiningFeePaid = record.joiningFeePaid;
      feeRefunded = record.feeRefunded;
      registrationTimestamp = record.registrationTimestamp;
      matrixPosition = record.matrixPosition;
      directDownlines = record.directDownlines;
      membershipDeadline = record.membershipDeadline;
      isCancelled = record.isCancelled;
    };
  };

  func findNextMatrixSlot(sponsorId : MemberId, newMemberId : MemberId) : MLMTreePosition {
    if (sponsorId == newMemberId) {
      return { memberId = newMemberId; level = 1; position = 0 };
    };

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
    members.add(member.id, member);

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

    var currentId = uplineId;
    var depth = 1;

    label commissionLoop while (depth <= 9) {
      switch (members.get(currentId)) {
        case (null) { break commissionLoop };
        case (?currentMember) {
          if (depth >= 2 and currentMember.feeRefunded) {
            let commissionPercent = 10 - depth;
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

  func checkAndExpireMembers() {
    let currentTime = Time.now();
    let memberEntries = members.toArray();
    for ((id, member) in memberEntries.values()) {
      if (not member.isCancelled and currentTime > member.membershipDeadline) {
        if (member.directDownlines.size() < 3) {
          let updatedMember = {
            member with isCancelled = true
          };
          members.add(id, updatedMember);
        };
      };
    };
  };
};
