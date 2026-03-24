import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import VarArray "mo:core/VarArray";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Enable data migration with with-clause

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Use UserRole type from AccessControl component
  type UserRole = AccessControl.UserRole;

  public type UserProfile = {
    name : Text;
    contactInfo : Text;
  };

  // Change userProfiles to persistent Map
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users with role 'user' can fetch their own profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can fetch other users' profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users with role 'user' can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getMemberRegistrationData(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap(
        "Unauthorized: Can only view your own registration data. Click the account icon on the right to switch between admin and user mode."
      );
    };
    userProfiles.get(user);
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

  public type CommissionCalculationResult = {
    totalCommissions : Nat;
    levelCommissions : [LevelCommission];
  };

  public type LevelCommission = {
    level : TreeLevel;
    levelMembers : Nat;
    commissionAmount : Nat;
    levelPercentage : Nat;
    totalLevelEarnings : Nat;
  };

  type DownlinePosition = {
    memberId : MemberId;
    position : MatrixPosition;
    level : TreeLevel;
  };

  type DownlineSlot = {
    level : TreeLevel;
    index : Nat;
    position : MatrixPosition;
    isFilled : Bool;
  };

  type DownlinePositionInfo = {
    position : MLMTreePosition;
    pathToMember : [DownlinePosition];
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

  public type MemberPublic = {
    id : Nat;
    memberIdStr : Text;
    name : Text;
    contactInfo : Text;
    sponsorId : ?Nat;
    uplineId : ?Nat;
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
    uplineId : ?MemberId;
  };

  public type MemberRegistrationResult = {
    id : MemberId;
    memberId : Text;
  };

  public type MLMError = Text;

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

  public shared ({ caller }) func registerMember(registration : MemberRegistration) : async MemberRegistrationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only registered users can register members. Click the account icon on the right to switch between admin and user mode."
      );
    };

    let name = registration.name;
    if (name.size() == 0 or name.size() > 100) {
      Runtime.trap("Member name must be between 1 and 100 characters. Input: " # registration.name);
    };

    let newMemberId = nextMemberId;

    let uplineId = switch (registration.sponsorId, registration.uplineId) {
      case (null, null) { newMemberId };
      case (null, ?uid) { uid };
      case (?sid, null) { sid };
      case (?_, ?uid) { uid };
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
      memberIdStr;
      name;
      contactInfo = registration.contactInfo;
      sponsorId = registration.sponsorId;
      uplineId = registration.uplineId;
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

    {
      id = newMemberId;
      memberId = memberIdStr;
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

  public query ({ caller }) func getMember(id : MemberId) : async ?MemberPublic {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only registered users can view member details. Click the account icon in the top right to switch user mode."
      );
    };

    switch (members.get(id)) {
      case (null) { null };
      case (?record) { ?toPublic(record) };
    };
  };

  public query ({ caller }) func listMembersByName() : async [MemberPublic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only registered users can list members. Click the account icon in the top right to switch user mode."
      );
    };

    members.values().toArray().map(func(record) { toPublic(record) });
  };

  public query ({ caller }) func getSenderDownlines(senderId : MemberId) : async [MemberId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only registered users can view downlines. Click the account icon in the top right to switch user mode."
      );
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark joining fees as paid. Switch to admin mode in the top right menu.");
    };

    switch (members.get(memberId)) {
      case (null) { Runtime.trap("Member not found: " # memberId.toText()) };
      case (?record) {
        members.add(memberId, { record with joiningFeePaid = true });
      };
    };
  };

  public shared ({ caller }) func checkMembershipStatuses() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can run status check. Switch to admin mode in the top right menu.");
    };
    checkAndExpireMembers();
  };

  public shared ({ caller }) func deleteMember(memberId : MemberId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete members");
    };

    if (not members.containsKey(memberId)) {
      Runtime.trap("Member does not exist: " # memberId.toText());
    };

    switch (members.get(memberId)) {
      case (?member) {
        switch (member.uplineId) {
          case (?uplineId) {
            switch (members.get(uplineId)) {
              case (?uplineMember) {
                let remainingDownlines = uplineMember.directDownlines.filter(
                  func(id) { id != memberId }
                );
                let updatedUpline = {
                  uplineMember with
                  directDownlines = remainingDownlines;
                };
                members.add(uplineId, updatedUpline);
              };
              case (null) {};
            };
          };
          case (null) {};
        };
      };
      case (null) {};
    };

    members.remove(memberId);
  };

  func toPublic(record : Member) : MemberPublic {
    {
      id = record.id;
      memberIdStr = record.memberIdStr;
      name = record.name;
      contactInfo = record.contactInfo;
      sponsorId = record.sponsorId;
      uplineId = record.uplineId;
      joiningFeePaid = record.joiningFeePaid;
      feeRefunded = record.feeRefunded;
      registrationTimestamp = record.registrationTimestamp;
      matrixPosition = record.matrixPosition;
      directDownlines = record.directDownlines;
      membershipDeadline = record.membershipDeadline;
      isCancelled = record.isCancelled;
    };
  };

  func checkAndExpireMembers() {
    let currentTime = Time.now();
    let memberEntries = members.toArray();
    for ((id, member) in memberEntries.values()) {
      if (not member.isCancelled and currentTime > member.membershipDeadline) {
        if (member.directDownlines.size() < 3) {
          let updatedMember = {
            member with
            isCancelled = true;
          };
          members.add(id, updatedMember);
        };
      };
    };
  };

  let commissionRates : [Nat] = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  let joiningFee : Nat = 2750;

  func calculateCommissionsInternal(_amount : Nat) : [LevelCommission] {
    let commissionVarArray = VarArray.repeat<LevelCommission>({ level = 1; levelMembers = 0; commissionAmount = 0; levelPercentage = 0; totalLevelEarnings = 0 }, commissionRates.size());

    for (i in Nat.range(0, commissionRates.size())) {
      let percentage = commissionRates[i];
      commissionVarArray[i] := {
        commissionVarArray[i] with
        commissionAmount = (joiningFee * percentage) / 100;
        levelPercentage = percentage;
        level = i + 1;
      };
    };

    commissionVarArray.toArray();
  };

  public query ({ caller }) func calculateCommissions(_amount : Nat) : async [LevelCommission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only registered users can view commission calculations. Click the account icon in the top right to switch user mode."
      );
    };
    calculateCommissionsInternal(joiningFee);
  };
};

