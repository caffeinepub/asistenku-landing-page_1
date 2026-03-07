import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";



actor {
  public type Role = {
    #admin;
    #asistenmu;
    #operasional;
    #client;
    #partner;
    #public_;
  };

  public type Status = {
    #pending;
    #active;
    #reject;
    #suspend;
  };

  public type LevelPartner = {
    #junior;
    #senior;
    #expert;
  };

  public type TipeLayanan = {
    #tenang;
    #rapi;
    #fokus;
    #jaga;
    #efisien;
  };

  public type ServiceStatus = {
    #active;
    #inactive;
  };

  public type TaskStatus = {
    #permintaanbaru;
    #onprogress;
    #reviewclient;
    #qaasistenmu;
    #revisi;
    #ditolak;
    #selesai;
  };

  public type WithdrawStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type FPRequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type SharingEntry = {
    idUser : Text;
    principalId : Text;
    nama : Text;
  };

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

  public type Partner = {
    idUser : Text;
    principalId : Text;
    nama : Text;
    email : Text;
    whatsapp : Text;
    kota : Text;
    level : LevelPartner;
    verifiedSkill : [Text];
    role : Role;
    status : Status;
    createdAt : Int;
  };

  public type Client = {
    idUser : Text;
    principalId : Text;
    nama : Text;
    email : Text;
    whatsapp : Text;
    company : Text;
    role : Role;
    status : Status;
    createdAt : Int;
  };

  public type Service = {
    idService : Text;
    tipeLayanan : TipeLayanan;
    clientPrincipalId : Text;
    clientNama : Text;
    asistenmuPrincipalId : Text;
    asistenmuNama : Text;
    unitLayanan : Nat;
    hargaPerLayanan : Nat;
    sharingLayanan : [SharingEntry];
    status : ServiceStatus;
    createdAt : Int;
  };

  public type TopUp = {
    idTopUp : Text;
    idService : Text;
    namaClient : Text;
    unitTambahan : Nat;
    createdAt : Int;
  };

  public type Task = {
    idTask : Text;
    judulTask : Text;
    detailTask : Text;
    deadline : Int;
    serviceId : Text;
    clientId : Text;
    clientNama : Text;
    partnerId : Text;
    partnerNama : Text;
    asistenmuId : Text;
    asistenmuNama : Text;
    notesAsistenmu : Text;
    jamEfektif : Nat;
    unitLayanan : Nat;
    linkGdriveInternal : Text;
    linkGdriveClient : Text;
    status : TaskStatus;
    createdAt : Int;
  };

  public type FinancialProfile = {
    namaBankEwallet : Text;
    nomorRekening : Text;
    namaRekening : Text;
    createdAt : Int;
  };

  public type WithdrawRequest = {
    idWithdraw : Text;
    partnerId : Text;
    partnerNama : Text;
    namaBankEwallet : Text;
    nomorRekening : Text;
    namaRekening : Text;
    nominal : Nat;
    status : WithdrawStatus;
    createdAt : Int;
  };

  public type FinancialProfileRequest = {
    idRequest : Text;
    partnerId : Text;
    partnerNama : Text;
    oldProfile : ?FinancialProfile;
    newProfile : FinancialProfile;
    status : FPRequestStatus;
    createdAt : Int;
  };

  public type AdminLog = {
    idLog : Text;
    adminPrincipalId : Text;
    action : Text;
    targetId : Text;
    createdAt : Int;
  };

  public type WalletInfo = {
    saldoTersedia : Nat;
    saldoPengajuan : Nat;
  };

  public type AdminSummary = {
    gmvTotal : Nat;
    gmvTenang : Nat;
    gmvRapi : Nat;
    gmvFokus : Nat;
    gmvJaga : Nat;
    gmvEfisien : Nat;
    totalSaldoPartner : Nat;
    totalSudahWithdraw : Nat;
    margin : Nat;
    totalLayananAktif : Nat;
    layananAktifTenang : Nat;
    layananAktifRapi : Nat;
    layananAktifFokus : Nat;
    layananAktifJaga : Nat;
    layananAktifEfisien : Nat;
    totalUnitAktif : Nat;
    totalUnitOnHold : Nat;
    totalTaskOnProgress : Nat;
    totalTaskRevisi : Nat;
    totalTaskSelesai : Nat;
  };

  // Stable variables
  var userCounter : Nat = 0;
  var partnerCounter : Nat = 0;
  var clientCounter : Nat = 0;
  var serviceCounter : Nat = 0;
  var topUpCounter : Nat = 0;
  var taskCounter : Nat = 0;
  var withdrawCounter : Nat = 0;
  var fpRequestCounter : Nat = 0;
  var logCounter : Nat = 0;
  var adminClaimed : Bool = false;

  var stableUsers : [(Principal, User)] = [];
  var stablePartners : [(Principal, Partner)] = [];
  var stableClients : [(Principal, Client)] = [];
  var stableServices : [(Text, Service)] = [];
  var stableTopUps : [(Text, TopUp)] = [];
  var stableTasks : [(Text, Task)] = [];
  var stableFinancialProfiles : [(Text, FinancialProfile)] = [];
  var stableWithdrawRequests : [(Text, WithdrawRequest)] = [];
  var stableFinancialProfileRequests : [(Text, FinancialProfileRequest)] = [];
  var stableAdminLogs : [(Text, AdminLog)] = [];
  var stableArchivedServices : [(Text, Service)] = [];

  // Persistent Maps
  let users = Map.fromIter<Principal, User>(
    stableUsers.values()
  );

  let partners = Map.fromIter<Principal, Partner>(
    stablePartners.values()
  );

  let clients = Map.fromIter<Principal, Client>(
    stableClients.values()
  );

  let services = Map.fromIter<Text, Service>(
    stableServices.values()
  );

  let topUps = Map.fromIter<Text, TopUp>(
    stableTopUps.values()
  );

  let tasks = Map.fromIter<Text, Task>(
    stableTasks.values()
  );

  let financialProfiles = Map.fromIter<Text, FinancialProfile>(
    stableFinancialProfiles.values()
  );

  let withdrawRequests = Map.fromIter<Text, WithdrawRequest>(
    stableWithdrawRequests.values()
  );

  let financialProfileRequests = Map.fromIter<Text, FinancialProfileRequest>(
    stableFinancialProfileRequests.values()
  );

  let adminLogs = Map.fromIter<Text, AdminLog>(
    stableAdminLogs.values()
  );

  let archivedServices = Map.fromIter<Text, Service>(
    stableArchivedServices.values()
  );

  /// System
  system func preupgrade() {
    stableUsers := users.toArray();
    stablePartners := partners.toArray();
    stableClients := clients.toArray();
    stableServices := services.toArray();
    stableTopUps := topUps.toArray();
    stableTasks := tasks.toArray();
    stableFinancialProfiles := financialProfiles.toArray();
    stableWithdrawRequests := withdrawRequests.toArray();
    stableFinancialProfileRequests := financialProfileRequests.toArray();
    stableAdminLogs := adminLogs.toArray();
    stableArchivedServices := archivedServices.toArray();
  };

  system func postupgrade() {
    stableUsers := [];
    stablePartners := [];
    stableClients := [];
    stableServices := [];
    stableTopUps := [];
    stableTasks := [];
    stableFinancialProfiles := [];
    stableWithdrawRequests := [];
    stableFinancialProfileRequests := [];
    stableAdminLogs := [];
    stableArchivedServices := [];
  };

  // === CANISTER ENTRYPOINTS (Public Functions) ===

  /// Admin Functions
  public shared ({ caller }) func forceClaimAdmin(nama : Text, email : Text, whatsapp : Text) : async () {
    let usersToRemove = List.empty<Principal>();

    for ((principalId, user) in users.entries()) {
      if (user.role == #admin) {
        usersToRemove.add(principalId);
      };
    };

    for (pid in usersToRemove.values()) {
      users.remove(pid);
    };

    adminClaimed := true;
    userCounter += 1;

    let adminUser : User = {
      idUser = genUserId(userCounter);
      principalId = caller.toText();
      nama = if (nama == "") { "Admin Asistenku" } else { nama };
      email = if (email == "") { "admasistenku@gmail.com" } else { email };
      whatsapp = if (whatsapp == "") { "08817743613" } else { whatsapp };
      role = #admin;
      status = #active;
      createdAt = Time.now();
    };

    users.add(caller, adminUser);
  };

  /// Check admin or operational role
  func checkAdminOrOperasional(p : Principal) {
    switch (users.get(p)) {
      case (?user) {
        switch (user.role) {
          case (#admin) {};
          case (#operasional) {};
          case (_) { Runtime.trap("Caller is not admin or operasional") };
        };
      };
      case (null) { Runtime.trap("Caller not found") };
    };
  };

  public query ({ caller }) func isAdminClaimed() : async Bool {
    adminClaimed;
  };

  public query ({ caller }) func isAdmin(user : Principal) : async Bool {
    switch (users.get(user)) {
      case (?user) { user.role == #admin };
      case (null) { false };
    };
  };

  /// Get role of the caller
  public query ({ caller }) func getMyRole() : async ?Role {
    switch (users.get(caller)) {
      case (?user) { ?user.role };
      case (null) {
        switch (partners.get(caller)) {
          case (?partner) { ?partner.role };
          case (null) {
            switch (clients.get(caller)) {
              case (?client) { ?client.role };
              case (null) { null };
            };
          };
        };
      };
    };
  };

  /// Get status of user by principal
  public query func getUserStatus(principal : Principal) : async ?Status {
    switch (users.get(principal)) {
      case (?user) { ?user.status };
      case (null) {
        switch (partners.get(principal)) {
          case (?partner) { ?partner.status };
          case (null) {
            switch (clients.get(principal)) {
              case (?client) { ?client.status };
              case (null) { null };
            };
          };
        };
      };
    };
  };

  public query func getServiceStatus(idService : Text) : async ?ServiceStatus {
    switch (services.get(idService)) {
      case (?service) { ?service.status };
      case (null) { null };
    };
  };

  public query func getTaskStatus(idTask : Text) : async ?TaskStatus {
    switch (tasks.get(idTask)) {
      case (?task) { ?task.status };
      case (null) { null };
    };
  };

  public query func getWithdrawStatus(idWithdraw : Text) : async ?WithdrawStatus {
    switch (withdrawRequests.get(idWithdraw)) {
      case (?req) { ?req.status };
      case (null) { null };
    };
  };

  public query func getFPRequestStatus(idRequest : Text) : async ?FPRequestStatus {
    switch (financialProfileRequests.get(idRequest)) {
      case (?req) { ?req.status };
      case (null) { null };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?User {
    users.get(caller);
  };

  public query ({ caller }) func getMyPartnerProfile() : async ?Partner {
    partners.get(caller);
  };

  public shared ({ caller }) func updateMyPartnerProfile(nama : Text, email : Text, whatsapp : Text, kota : Text) : async () {
    switch (partners.get(caller)) {
      case (?partner) {
        let updatedPartner = {
          partner with
          nama;
          email;
          whatsapp;
          kota;
        };
        partners.add(caller, updatedPartner);
      };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  /// NEW FUNCTION: Get client profile of the caller
  public query ({ caller }) func getMyClientProfile() : async ?Client {
    clients.get(caller);
  };

  /// Get all users, partners, clients, services, topups, etc.
  public query ({ caller }) func getUsers() : async [User] {
    checkAdminOrOperasional(caller);
    users.values().toArray();
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    checkAdminOrOperasional(caller);
    users.values().toArray();
  };

  public query ({ caller }) func getAllPartners() : async [Partner] {
    checkAdminOrOperasional(caller);
    partners.values().toArray();
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    checkAdminOrOperasional(caller);
    clients.values().toArray();
  };

  public query ({ caller }) func getClients() : async [Client] {
    checkAdminOrOperasional(caller);
    clients.values().toArray();
  };

  public query ({ caller }) func getPartners() : async [Partner] {
    checkAdminOrOperasional(caller);
    partners.values().toArray();
  };

  public query ({ caller }) func getAsistenmu() : async [User] {
    checkAdminOrOperasional(caller);
    users.values().toArray().filter(
      func(user) {
        user.role == #asistenmu and user.status == #active;
      }
    );
  };

  public query ({ caller }) func getServices() : async [Service] {
    checkAdminOrOperasional(caller);
    services.values().toArray();
  };

  public query ({ caller }) func getMyServicesAsAsistenmu() : async [Service] {
    let callerText = caller.toText();
    services.values().toArray().filter(
      func(service) {
        service.asistenmuPrincipalId == callerText;
      }
    );
  };

  public query ({ caller }) func getTopUps() : async [TopUp] {
    checkAdminOrOperasional(caller);
    topUps.values().toArray();
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    checkAdminOrOperasional(caller);
    tasks.values().toArray();
  };

  public query ({ caller }) func getTasksByPartner() : async [Task] {
    let callerText = caller.toText();
    tasks.values().toArray().filter(
      func(task) {
        task.partnerId == callerText;
      }
    );
  };

  /// NEW FUNCTION: Get tasks for the currently logged in partner
  public query ({ caller }) func getMyTasksAsPartner() : async [Task] {
    let callerText = caller.toText();
    tasks.values().toArray().filter(
      func(task) {
        task.partnerId == callerText;
      }
    );
  };

  /// NEW FUNCTION: Get tasks for the currently logged in client
  public query ({ caller }) func getMyTasksAsClient() : async [Task] {
    let callerText = caller.toText();
    switch (clients.get(caller)) {
      case (?_) {
        tasks.values().toArray().filter(
          func(task) {
            task.clientId == callerText;
          }
        );
      };
      case (null) {
        Runtime.trap("Caller is not a valid client");
      };
    };
  };

  public query ({ caller }) func getTasksByAsistenmu() : async [Task] {
    let callerText = caller.toText();
    tasks.values().toArray().filter(
      func(task) {
        task.asistenmuId == callerText and task.status == #permintaanbaru;
      }
    );
  };

  public query ({ caller }) func getAllTasksByAsistenmu() : async [Task] {
    let callerText = caller.toText();
    tasks.values().toArray().filter(
      func(task) {
        task.asistenmuId == callerText;
      }
    );
  };

  public query ({ caller }) func getMyFinancialProfile() : async ?FinancialProfile {
    financialProfiles.get(caller.toText());
  };

  public query ({ caller }) func getFinancialProfileByPartnerId(partnerId : Text) : async ?FinancialProfile {
    checkAdmin(caller);
    financialProfiles.get(partnerId);
  };

  public query ({ caller }) func getWithdrawRequests() : async [WithdrawRequest] {
    checkAdminOrOperasional(caller);
    withdrawRequests.values().toArray();
  };

  public query ({ caller }) func getFinancialProfileRequests() : async [FinancialProfileRequest] {
    checkAdminOrOperasional(caller);
    financialProfileRequests.values().toArray();
  };

  public query ({ caller }) func getAdminLogs() : async [AdminLog] {
    checkAdminOrOperasional(caller);
    let logs = adminLogs.values().toArray();

    func compareByCreatedAt(log1 : AdminLog, log2 : AdminLog) : Order.Order {
      Nat.compare(log2.createdAt.toNat(), log1.createdAt.toNat());
    };

    logs.sort(
      compareByCreatedAt
    );
  };

  public query ({ caller }) func getMyWallet() : async WalletInfo {
    let callerText = caller.toText();
    var rate = 0;
    switch (partners.get(caller)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?p) {
        rate := switch (p.level) {
          case (#junior) { 35000 };
          case (#senior) { 55000 };
          case (#expert) { 75000 };
        };
      };
    };

    let tasksForCaller = tasks.values().toArray().filter(
      func(task) {
        task.partnerId == callerText and task.status == #selesai
      }
    );
    var saldoKotor = 0;
    for (t in tasksForCaller.values()) {
      saldoKotor += t.jamEfektif * rate;
    };

    let withdrawRequestsForCaller = withdrawRequests.values().toArray().filter(
      func(wr) {
        wr.partnerId == callerText
      }
    );
    var saldoApproved = 0;
    var saldoPengajuan = 0;
    for (wr in withdrawRequestsForCaller.values()) {
      switch (wr.status) {
        case (#pending) { saldoPengajuan += wr.nominal };
        case (#approved) { saldoApproved += wr.nominal };
        case (_) {};
      };
    };

    var saldoTersedia : Int = saldoKotor - saldoApproved - saldoPengajuan;
    if (saldoTersedia < 0) { saldoTersedia := 0 };

    {
      saldoTersedia = saldoTersedia.toNat();
      saldoPengajuan;
    };
  };

  // === Service Archiving ===

  /// Archive a service (admin/operasional only)
  public shared ({ caller }) func archiveService(idService : Text) : async () {
    checkAdminOrOperasional(caller);

    switch (services.get(idService)) {
      case (null) { Runtime.trap("Service not found") };
      case (?service) {
        services.remove(idService);
        archivedServices.add(idService, service);

        await addAdminLog(
          caller,
          "Archived service",
          idService,
        );
      };
    };
  };

  /// Get all archived services (admin/operasional only)
  public query ({ caller }) func getArchivedServices() : async [Service] {
    checkAdminOrOperasional(caller);
    archivedServices.values().toArray();
  };

  // === User registration and approval ===

  public shared ({ caller }) func claimAdmin(nama : Text, email : Text, whatsapp : Text) : async () {
    if (adminClaimed) { Runtime.trap("Admin already claimed") };
    adminClaimed := true;
    userCounter += 1;
    let adminUser : User = {
      idUser = genUserId(userCounter);
      principalId = caller.toText();
      nama = if (nama == "") { "Admin Asistenku" } else { nama };
      email = if (email == "") { "admasistenku@gmail.com" } else { email };
      whatsapp = if (whatsapp == "") { "08817743613" } else { whatsapp };
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
      role = #public_;
      status = #pending;
      createdAt = Time.now();
    };
    users.add(caller, newUser);
    idUser;
  };

  public shared ({ caller }) func registerPartner(nama : Text, email : Text, whatsapp : Text, kota : Text) : async Text {
    if (partners.containsKey(caller)) { Runtime.trap("Partner already exists") };
    partnerCounter += 1;
    let idUser = genPartnerId(partnerCounter);
    let newPartner : Partner = {
      idUser;
      principalId = caller.toText();
      nama;
      email;
      whatsapp;
      kota;
      level = #junior;
      verifiedSkill = [];
      role = #partner;
      status = #pending;
      createdAt = Time.now();
    };
    partners.add(caller, newPartner);
    idUser;
  };

  public shared ({ caller }) func registerClient(nama : Text, email : Text, whatsapp : Text, company : Text) : async Text {
    if (clients.containsKey(caller)) { Runtime.trap("Client already exists") };
    clientCounter += 1;
    let idUser = genClientId(clientCounter);
    let newClient : Client = {
      idUser;
      principalId = caller.toText();
      nama;
      email;
      whatsapp;
      company;
      role = #client;
      status = #pending;
      createdAt = Time.now();
    };
    clients.add(caller, newClient);
    idUser;
  };

  public shared ({ caller }) func approveInternalUser(principalId : Principal, role : Role) : async () {
    checkAdminOrOperasional(caller);
    switch (users.get(principalId)) {
      case (?user) {
        let updatedUser = { user with role; status = #active };
        users.add(principalId, updatedUser);
        await addAdminLog(caller, "Approved internal user", principalId.toText());
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func rejectUser(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (users.get(principalId)) {
      case (?user) {
        let updatedUser = { user with status = #reject };
        users.add(principalId, updatedUser);
        await addAdminLog(caller, "Rejected user", principalId.toText());
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func suspendUser(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (users.get(principalId)) {
      case (?user) {
        let updatedUser = { user with status = #suspend };
        users.add(principalId, updatedUser);
        await addAdminLog(caller, "Suspended user", principalId.toText());
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func reactivateUser(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (users.get(principalId)) {
      case (?user) {
        let updatedUser = { user with status = #active };
        users.add(principalId, updatedUser);
        await addAdminLog(caller, "Reactivated user", principalId.toText());
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func approveClient(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (clients.get(principalId)) {
      case (?client) {
        let updatedClient = { client with status = #active };
        clients.add(principalId, updatedClient);
        await addAdminLog(caller, "Approved client", principalId.toText());
      };
      case (null) { Runtime.trap("Client not found") };
    };
  };

  public shared ({ caller }) func rejectClient(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (clients.get(principalId)) {
      case (?client) {
        let updatedClient = { client with status = #reject };
        clients.add(principalId, updatedClient);
        await addAdminLog(caller, "Rejected client", principalId.toText());
      };
      case (null) { Runtime.trap("Client not found") };
    };
  };

  public shared ({ caller }) func suspendClient(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (clients.get(principalId)) {
      case (?client) {
        let updatedClient = { client with status = #suspend };
        clients.add(principalId, updatedClient);
        await addAdminLog(caller, "Suspended client", principalId.toText());
      };
      case (null) { Runtime.trap("Client not found") };
    };
  };

  public shared ({ caller }) func reactivateClient(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (clients.get(principalId)) {
      case (?client) {
        let updatedClient = { client with status = #active };
        clients.add(principalId, updatedClient);
        await addAdminLog(caller, "Reactivated client", principalId.toText());
      };
      case (null) { Runtime.trap("Client not found") };
    };
  };

  public shared ({ caller }) func approvePartner(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (partners.get(principalId)) {
      case (?partner) {
        let updatedPartner = { partner with status = #active };
        partners.add(principalId, updatedPartner);
        await addAdminLog(caller, "Approved partner", principalId.toText());
      };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  public shared ({ caller }) func rejectPartner(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (partners.get(principalId)) {
      case (?partner) {
        let updatedPartner = { partner with status = #reject };
        partners.add(principalId, updatedPartner);
        await addAdminLog(caller, "Rejected partner", principalId.toText());
      };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  public shared ({ caller }) func suspendPartner(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (partners.get(principalId)) {
      case (?partner) {
        let updatedPartner = { partner with status = #suspend };
        partners.add(principalId, updatedPartner);
        await addAdminLog(caller, "Suspended partner", principalId.toText());
      };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  public shared ({ caller }) func reactivatePartner(principalId : Principal) : async () {
    checkAdminOrOperasional(caller);
    switch (partners.get(principalId)) {
      case (?partner) {
        let updatedPartner = { partner with status = #active };
        partners.add(principalId, updatedPartner);
        await addAdminLog(caller, "Reactivated partner", principalId.toText());
      };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  public shared ({ caller }) func updatePartnerDetails(principalId : Principal, level : LevelPartner, verifiedSkill : [Text]) : async () {
    checkAdminOrOperasional(caller);
    switch (partners.get(principalId)) {
      case (?partner) {
        let updatedPartner = {
          partner with
          level;
          verifiedSkill;
        };
        partners.add(principalId, updatedPartner);
        await addAdminLog(caller, "Updated partner details", principalId.toText());
      };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  // === Service-related ===

  public shared ({ caller }) func aktivasiLayanan(
    tipe : TipeLayanan,
    clientPrincipalId : Text,
    clientNama : Text,
    asistenmuPrincipalId : Text,
    asistenmuNama : Text,
    unitLayanan : Nat,
    hargaPerLayanan : Nat,
    sharingLayanan : [SharingEntry]
  ) : async Text {
    checkAdminOrOperasional(caller);
    serviceCounter += 1;
    let idService = genServiceId(serviceCounter);
    let newService : Service = {
      idService;
      tipeLayanan = tipe;
      clientPrincipalId;
      clientNama;
      asistenmuPrincipalId;
      asistenmuNama;
      unitLayanan;
      hargaPerLayanan;
      sharingLayanan;
      status = #active;
      createdAt = Time.now();
    };
    services.add(idService, newService);
    await addAdminLog(caller, "Activated service", idService);
    idService;
  };

  public shared ({ caller }) func updateService(
    idService : Text,
    newStatus : ServiceStatus,
    newSharing : [SharingEntry],
  ) : async () {
    checkAdminOrOperasional(caller);

    switch (services.get(idService)) {
      case (null) { Runtime.trap("Service not found") };
      case (?existingService) {
        let updatedService = {
          existingService with
          status = newStatus;
          sharingLayanan = newSharing;
        };

        services.add(idService, updatedService);
        await addAdminLog(caller, "Updated service", idService);
      };
    };
  };

  public shared ({ caller }) func topUpService(idService : Text, unitTambahan : Nat) : async Text {
    checkAdminOrOperasional(caller);
    switch (services.get(idService)) {
      case (?service) {
        let updatedService = {
          service with unitLayanan = service.unitLayanan + unitTambahan
        };
        services.add(idService, updatedService);
        topUpCounter += 1;
        let idTopUp = genTopUpId(topUpCounter);
        let newTopUp : TopUp = {
          idTopUp;
          idService;
          namaClient = service.clientNama;
          unitTambahan;
          createdAt = Time.now();
        };
        topUps.add(idTopUp, newTopUp);
        await addAdminLog(caller, "Service top-up", idService);
        idTopUp;
      };
      case (null) { Runtime.trap("Service not found") };
    };
  };

  public shared ({ caller }) func createTask(
    judulTask : Text,
    detailTask : Text,
    deadline : Int,
    serviceId : Text,
    clientId : Text,
    clientNama : Text,
    asistenmuId : Text,
    asistenmuNama : Text
  ) : async Text {
    taskCounter += 1;
    let idTask = genTaskId(taskCounter);
    let newTask : Task = {
      idTask;
      judulTask;
      detailTask;
      deadline;
      serviceId;
      clientId;
      clientNama;
      partnerId = "";
      partnerNama = "";
      asistenmuId;
      asistenmuNama;
      notesAsistenmu = "";
      jamEfektif = 0;
      unitLayanan = 0;
      linkGdriveInternal = "";
      linkGdriveClient = "";
      status = #permintaanbaru;
      createdAt = Time.now();
    };
    tasks.add(idTask, newTask);
    idTask;
  };

  public shared ({ caller }) func delegasiTask(
    idTask : Text,
    partnerId : Text,
    partnerNama : Text,
    jamEfektif : Nat,
    unitLayanan : Nat,
    notesAsistenmu : Text,
    linkGdriveInternal : Text,
    linkGdriveClient : Text
  ) : async () {
    checkAdminOrOperasional(caller);
    switch (tasks.get(idTask)) {
      case (?task) {
        let updatedTask = {
          task with
          partnerId;
          partnerNama;
          jamEfektif;
          unitLayanan;
          notesAsistenmu;
          linkGdriveInternal;
          linkGdriveClient;
          status = #permintaanbaru;
        };
        tasks.add(idTask, updatedTask);
        await addAdminLog(caller, "Task delegated", idTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  public shared ({ caller }) func updateTaskStatus(idTask : Text, status : TaskStatus) : async () {
    checkAdminOrOperasional(caller);
    switch (tasks.get(idTask)) {
      case (?task) {
        var updatedTask = { task with status };

        if (status == #selesai and task.status != #selesai and task.unitLayanan > 0) {
          switch (services.get(task.serviceId)) {
            case (?service) {
              let newUnits = if (service.unitLayanan >= task.unitLayanan) {
                service.unitLayanan - task.unitLayanan;
              } else { 0 };
              let updatedService = {
                service with unitLayanan = newUnits
              };
              services.add(task.serviceId, updatedService);
            };
            case (null) {};
          };
        };

        tasks.add(idTask, updatedTask);
        await addAdminLog(caller, "Updated task status", idTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  // === (NEW) TASK PARTNER FUNCTIONS ===

  public shared ({ caller }) func terimaTask(idTask : Text) : async () {
    func checkPartnerOwnership(task : Task) {
      if (task.partnerId != caller.toText()) {
        Runtime.trap("Task does not belong to caller");
      };
    };

    switch (tasks.get(idTask)) {
      case (?task) {
        if (task.status != #permintaanbaru) {
          Runtime.trap("Task is not in permintaanbaru status");
        };
        // If checkPartnerOwnership fails, the trap message will propagate
        checkPartnerOwnership(task);

        let updatedTask = { task with status = #onprogress };
        tasks.add(idTask, updatedTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  public shared ({ caller }) func tolakTask(idTask : Text) : async () {
    func checkPartnerOwnership(task : Task) {
      if (task.partnerId != caller.toText()) {
        Runtime.trap("Task does not belong to caller");
      };
    };

    switch (tasks.get(idTask)) {
      case (?task) {
        checkPartnerOwnership(task);
        let updatedTask = { task with status = #ditolak };
        tasks.add(idTask, updatedTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  public shared ({ caller }) func updateTaskStatusAsPartner(idTask : Text, status : TaskStatus) : async () {
    func checkPartnerOwnership(task : Task) {
      if (task.partnerId != caller.toText()) {
        Runtime.trap("Task does not belong to caller");
      };
    };

    switch (tasks.get(idTask)) {
      case (?task) {
        checkPartnerOwnership(task);
        let updatedTask = { task with status };
        tasks.add(idTask, updatedTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  public shared ({ caller }) func updateTaskStatusAsAsistenmu(idTask : Text, status : TaskStatus) : async () {
    func checkAsistenmuOwnership(task : Task) {
      if (task.asistenmuId != caller.toText()) {
        Runtime.trap("Task does not belong to caller as Asistenmu");
      };
    };

    switch (tasks.get(idTask)) {
      case (?task) {
        checkAsistenmuOwnership(task);

        let updatedTask = { task with status };

        if (status == #selesai and task.status != #selesai and task.unitLayanan > 0) {
          switch (services.get(task.serviceId)) {
            case (?service) {
              let newUnits = if (service.unitLayanan >= task.unitLayanan) {
                service.unitLayanan - task.unitLayanan;
              } else { 0 };
              let updatedService = {
                service with unitLayanan = newUnits
              };
              services.add(task.serviceId, updatedService);
            };
            case (null) {};
          };
        };

        tasks.add(idTask, updatedTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  public shared ({ caller }) func delegasiTaskAsAsistenmu(
    idTask : Text,
    partnerId : Text,
    partnerNama : Text,
    jamEfektif : Nat,
    unitLayanan : Nat,
    notesAsistenmu : Text,
    linkGdriveInternal : Text,
    linkGdriveClient : Text
  ) : async () {
    switch (tasks.get(idTask)) {
      case (?task) {
        if (task.asistenmuId != caller.toText()) {
          Runtime.trap("Task does not belong to caller as Asistenmu");
        };

        let updatedTask = {
          task with
          partnerId;
          partnerNama;
          jamEfektif;
          unitLayanan;
          notesAsistenmu;
          linkGdriveInternal;
          linkGdriveClient;
          status = #permintaanbaru;
        };

        tasks.add(idTask, updatedTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  // === FINANCIALS ===

  public shared ({ caller }) func requestFinancialProfile(namaBankEwallet : Text, nomorRekening : Text, namaRekening : Text) : async Text {
    switch (partners.get(caller)) {
      case (null) { Runtime.trap("Caller is not a valid partner") };
      case (?partner) {
        let partnerNama = partner.nama;
        let oldProfile = financialProfiles.get(caller.toText());
        fpRequestCounter += 1;
        let idRequest = genFpRequestId(fpRequestCounter);
        let newProfile : FinancialProfile = {
          namaBankEwallet;
          nomorRekening;
          namaRekening;
          createdAt = Time.now();
        };
        let newRequest : FinancialProfileRequest = {
          idRequest;
          partnerId = caller.toText();
          partnerNama;
          oldProfile;
          newProfile;
          status = #pending;
          createdAt = Time.now();
        };
        financialProfileRequests.add(idRequest, newRequest);
        idRequest;
      };
    };
  };

  public shared ({ caller }) func approveFinancialProfileRequest(idRequest : Text) : async () {
    checkAdminOrOperasional(caller);
    switch (financialProfileRequests.get(idRequest)) {
      case (?request) {
        let updatedRequest = { request with status = #approved };
        financialProfileRequests.add(idRequest, updatedRequest);
        financialProfiles.add(request.partnerId, request.newProfile);
        await addAdminLog(caller, "Approved financial profile request", idRequest);
      };
      case (null) { Runtime.trap("Financial profile request not found") };
    };
  };

  public shared ({ caller }) func rejectFinancialProfileRequest(idRequest : Text) : async () {
    checkAdminOrOperasional(caller);
    switch (financialProfileRequests.get(idRequest)) {
      case (?request) {
        let updatedRequest = { request with status = #rejected };
        financialProfileRequests.add(idRequest, updatedRequest);
        await addAdminLog(caller, "Rejected financial profile request", idRequest);
      };
      case (null) { Runtime.trap("Financial profile request not found") };
    };
  };

  public shared ({ caller }) func requestWithdraw(nominal : Nat) : async Text {
    let profileOpt = financialProfiles.get(caller.toText());
    switch (partners.get(caller)) {
      case (?partner) {
        switch (profileOpt) {
          case (?profile) {
            withdrawCounter += 1;
            let idWithdraw = genWithdrawId(withdrawCounter);
            let newRequest : WithdrawRequest = {
              idWithdraw;
              partnerId = caller.toText();
              partnerNama = partner.nama;
              namaBankEwallet = profile.namaBankEwallet;
              nomorRekening = profile.nomorRekening;
              namaRekening = profile.namaRekening;
              nominal;
              status = #pending;
              createdAt = Time.now();
            };
            withdrawRequests.add(idWithdraw, newRequest);
            idWithdraw;
          };
          case (null) { Runtime.trap("No financial profile found") };
        };
      };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  public shared ({ caller }) func approveWithdraw(idWithdraw : Text) : async () {
    checkAdminOrOperasional(caller);
    switch (withdrawRequests.get(idWithdraw)) {
      case (?request) {
        let updatedRequest = { request with status = #approved };
        withdrawRequests.add(idWithdraw, updatedRequest);
        await addAdminLog(caller, "Approved withdraw request", idWithdraw);
      };
      case (null) { Runtime.trap("Withdraw request not found") };
    };
  };

  public shared ({ caller }) func rejectWithdraw(idWithdraw : Text) : async () {
    checkAdminOrOperasional(caller);
    switch (withdrawRequests.get(idWithdraw)) {
      case (?request) {
        let updatedRequest = { request with status = #rejected };
        withdrawRequests.add(idWithdraw, updatedRequest);
        await addAdminLog(caller, "Rejected withdraw request", idWithdraw);
      };
      case (null) { Runtime.trap("Withdraw request not found") };
    };
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

  func addAdminLog(caller : Principal, action : Text, targetId : Text) : async () {
    logCounter += 1;
    let idLog = genLogId(logCounter);
    let newLog : AdminLog = {
      idLog;
      adminPrincipalId = caller.toText();
      action;
      targetId;
      createdAt = Time.now();
    };
    adminLogs.add(idLog, newLog);
  };

  // ID generation functions
  func genUserId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 4 - numStr.size();
    var result = "INT-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  func genPartnerId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 4 - numStr.size();
    var result = "PA-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  func genClientId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 4 - numStr.size();
    var result = "CA-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  func genServiceId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "SA-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  func genTopUpId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "TU-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  func genTaskId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "TSK-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  func genWithdrawId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "WD-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  func genFpRequestId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "FP-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  func genLogId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "LOG-";
    for (_ in Nat.range(0, zerosToPad)) {
      result #= "0";
    };
    result # numStr;
  };

  // === NEW FUNCTIONS ===

  public query ({ caller }) func getMyServicesAsClient() : async [Service] {
    let callerText = caller.toText();
    var resultList = List.empty<Service>();

    // Add all services where caller is direct owner
    for (service in services.values()) {
      if (service.clientPrincipalId == callerText) {
        resultList.add(service);
      };
    };

    // Add services where caller is in sharingLayanan by principalId
    for (service in services.values()) {
      for (sharing in service.sharingLayanan.values()) {
        if (sharing.principalId == callerText) {
          resultList.add(service);
        };
      };
    };

    // Add services where caller's idUser (from clients map) is in sharingLayanan
    switch (clients.get(caller)) {
      case (?client) {
        let callerIdUser = client.idUser;
        for (service in services.values()) {
          for (sharing in service.sharingLayanan.values()) {
            if (sharing.idUser == callerIdUser) {
              resultList.add(service);
            };
          };
        };
      };
      case (null) {};
    };

    let result = resultList.toArray();

    // Deduplicate by idService
    let uniqueServicesMap = Map.empty<Text, Service>();
    for (svc in result.values()) {
      uniqueServicesMap.add(svc.idService, svc);
    };
    uniqueServicesMap.values().toArray();
  };

  public query ({ caller }) func getMyWithdrawRequests() : async [WithdrawRequest] {
    let callerText = caller.toText();
    withdrawRequests.values().toArray().filter(
      func(req) {
        req.partnerId == callerText;
      }
    );
  };

  public query ({ caller }) func getPartnersAsAsistenmu() : async [Partner] {
    let callerText = caller.toText();
    switch (users.get(caller)) {
      case (?user) {
        if (user.role != #asistenmu or user.status != #active) {
          Runtime.trap("Not authorized (must be active asistenmu)");
        };
      };
      case (null) { Runtime.trap("Not authorized (must be active asistenmu)") };
    };

    partners.values().toArray().filter(
      func(p) {
        p.status == #active;
      }
    );
  };

  public shared ({ caller }) func updateTaskStatusAsClient(idTask : Text, status : TaskStatus) : async () {
    switch (clients.get(caller)) {
      case (null) { Runtime.trap("Not a valid client") };
      case (?_) {
        switch (tasks.get(idTask)) {
          case (?task) {
            if (task.clientId != caller.toText()) {
              Runtime.trap("Task does not belong to caller");
            };

            switch (status) {
              case (#revisi) {};
              case (#selesai) {
                if (task.status != #selesai and task.unitLayanan > 0) {
                  switch (services.get(task.serviceId)) {
                    case (?service) {
                      let newUnits = if (service.unitLayanan >= task.unitLayanan) {
                        service.unitLayanan - task.unitLayanan;
                      } else { 0 };
                      let updatedService = {
                        service with unitLayanan = newUnits
                      };
                      services.add(task.serviceId, updatedService);
                    };
                    case (null) {};
                  };
                };
              };
              case (_) { Runtime.trap("Not allowed") };
            };

            let updatedTask = { task with status };
            tasks.add(idTask, updatedTask);
          };
          case (null) { Runtime.trap("Task not found") };
        };
      };
    };
  };

  public shared ({ caller }) func cancelTask(idTask : Text) : async () {
    switch (clients.get(caller)) {
      case (null) { Runtime.trap("Not a valid client") };
      case (?_) {
        switch (tasks.get(idTask)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) {
            if (task.clientId != caller.toText()) {
              Runtime.trap("Task does not belong to caller");
            };
            if (task.partnerId != "") {
              Runtime.trap("Task already delegated to partner, cannot cancel");
            };
            tasks.remove(idTask);
          };
        };
      };
    };
  };

  public query ({ caller }) func getAdminSummary() : async AdminSummary {
    checkAdminOrOperasional(caller);

    // GMV from services: sum(unitLayanan * hargaPerLayanan) per tipe
    var gmvTenang = 0; var gmvRapi = 0; var gmvFokus = 0; var gmvJaga = 0; var gmvEfisien = 0;
    var layananAktifTenang = 0; var layananAktifRapi = 0; var layananAktifFokus = 0; var layananAktifJaga = 0; var layananAktifEfisien = 0;
    var totalUnitAktif = 0;

    for (svc in services.values()) {
      let val = svc.unitLayanan * svc.hargaPerLayanan;
      switch (svc.tipeLayanan) {
        case (#tenang) { gmvTenang += val };
        case (#rapi) { gmvRapi += val };
        case (#fokus) { gmvFokus += val };
        case (#jaga) { gmvJaga += val };
        case (#efisien) { gmvEfisien += val };
      };
      if (svc.status == #active) {
        totalUnitAktif += svc.unitLayanan;
        switch (svc.tipeLayanan) {
          case (#tenang) { layananAktifTenang += 1 };
          case (#rapi) { layananAktifRapi += 1 };
          case (#fokus) { layananAktifFokus += 1 };
          case (#jaga) { layananAktifJaga += 1 };
          case (#efisien) { layananAktifEfisien += 1 };
        };
      };
    };

    // Also add GMV from topups: need hargaPerLayanan from the service
    for (tu in topUps.values()) {
      switch (services.get(tu.idService)) {
        case (?svc) {
          let val = tu.unitTambahan * svc.hargaPerLayanan;
          switch (svc.tipeLayanan) {
            case (#tenang) { gmvTenang += val };
            case (#rapi) { gmvRapi += val };
            case (#fokus) { gmvFokus += val };
            case (#jaga) { gmvJaga += val };
            case (#efisien) { gmvEfisien += val };
          };
        };
        case (null) {};
      };
    };

    let gmvTotal = gmvTenang + gmvRapi + gmvFokus + gmvJaga + gmvEfisien;

    // Total unit on hold: sum unitLayanan of tasks with onprogress status
    var totalUnitOnHold = 0;
    var totalTaskOnProgress = 0;
    var totalTaskRevisi = 0;
    var totalTaskSelesai = 0;
    var totalKonversi = 0; // total jam*rate for selesai tasks

    for (task in tasks.values()) {
      switch (task.status) {
        case (#onprogress) {
          totalUnitOnHold += task.unitLayanan;
          totalTaskOnProgress += 1;
        };
        case (#revisi) { totalTaskRevisi += 1 };
        case (#selesai) {
          totalTaskSelesai += 1;
          // compute rate from partner level
          switch (partners.get(Principal.fromText(task.partnerId))) {
            case (?p) {
              let rate = switch (p.level) {
                case (#junior) { 35000 };
                case (#senior) { 55000 };
                case (#expert) { 75000 };
              };
              totalKonversi += task.jamEfektif * rate;
            };
            case (null) {};
          };
        };
        case (_) {};
      };
    };

    // Total saldo partner = sum of (earnings - approved withdrawals) for all active partners
    var totalSaldoPartner = 0;
    var totalSudahWithdraw = 0;

    for (wr in withdrawRequests.values()) {
      if (wr.status == #approved) {
        totalSudahWithdraw += wr.nominal;
      };
    };

    // Partner saldo = totalKonversi - totalSudahWithdraw - pending withdrawals
    // Simplified: total saldo = sum of each partner's (earned - approved_withdraw)
    // We already have totalKonversi as total earned by all partners
    // and totalSudahWithdraw as total approved withdrawals
    var pendingWithdraw = 0;
    for (wr in withdrawRequests.values()) {
      if (wr.status == #pending) {
        pendingWithdraw += wr.nominal;
      };
    };
    let rawSaldo : Int = totalKonversi - totalSudahWithdraw - pendingWithdraw;
    totalSaldoPartner := if (rawSaldo > 0) { rawSaldo.toNat() } else { 0 };

    let rawMargin : Int = gmvTotal - totalKonversi;
    let margin = if (rawMargin > 0) { rawMargin.toNat() } else { 0 };

    let totalLayananAktif = layananAktifTenang + layananAktifRapi + layananAktifFokus + layananAktifJaga + layananAktifEfisien;

    {
      gmvTotal;
      gmvTenang;
      gmvRapi;
      gmvFokus;
      gmvJaga;
      gmvEfisien;
      totalSaldoPartner;
      totalSudahWithdraw;
      margin;
      totalLayananAktif;
      layananAktifTenang;
      layananAktifRapi;
      layananAktifFokus;
      layananAktifJaga;
      layananAktifEfisien;
      totalUnitAktif;
      totalUnitOnHold;
      totalTaskOnProgress;
      totalTaskRevisi;
      totalTaskSelesai;
    };
  };
};
