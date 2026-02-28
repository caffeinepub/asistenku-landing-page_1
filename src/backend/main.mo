import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Char "mo:core/Char";



actor {
  public type User = {
    idUser : Text;
    principalId : Text;
    nama : Text;
    email : Text;
    whatsapp : Text;
    role : Role;
    status : Status;
    createdAt : Int;
  };

  public type Role = {
    #admin;
    #asistenmu;
  };

  public type Status = {
    #pending;
    #active;
  };

  // Persistent state
  var userCounter = 0;
  var adminClaimed = false;
  let users = Map.empty<Principal, User>();

  // Query/GET endpoints
  public query ({ caller }) func isAdminClaimed() : async Bool {
    adminClaimed;
  };

  public query ({ caller }) func isAdmin(user : Principal) : async Bool {
    switch (users.get(user)) {
      case (?user) { user.role == #admin };
      case (null) { false };
    };
  };

  public query ({ caller }) func getMyRole() : async ?Role {
    switch (users.get(caller)) {
      case (?user) { ?user.role };
      case (null) { null };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?User {
    users.get(caller);
  };

  public query ({ caller }) func getUsers() : async [User] {
    checkAdmin(caller);
    users.values().toArray();
  };

  // Call/POST endpoints
  public shared ({ caller }) func claimAdmin() : async () {
    if (adminClaimed) { Runtime.trap("Admin already claimed") };
    adminClaimed := true;
    // Create admin user record
    let adminUser : User = {
      idUser = "INT-0001";
      principalId = caller.toText();
      nama = "";
      email = "";
      whatsapp = "";
      role = #admin;
      status = #active;
      createdAt = Time.now();
    };
    users.add(caller, adminUser);
  };

  public shared ({ caller }) func registerUser(nama : Text, email : Text, whatsapp : Text) : async Text {
    if (users.containsKey(caller)) {
      Runtime.trap("User already registered");
    };
    userCounter += 1;
    let idUser = genUserId(userCounter);
    let newUser : User = {
      idUser;
      principalId = caller.toText();
      nama;
      email;
      whatsapp;
      role = #asistenmu;
      status = #pending;
      createdAt = Time.now();
    };
    users.add(caller, newUser);
    idUser;
  };

  // Helper functions

  func checkAdmin(p : Principal) {
    switch (users.get(p)) {
      case (?user) {
        if (user.role != #admin) {
          Runtime.trap("Caller is not admin");
        };
      };
      case (null) { Runtime.trap("Caller not found") };
    };
  };

  func genUserId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 4 - numStr.size();
    var result = "INT-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };
};
