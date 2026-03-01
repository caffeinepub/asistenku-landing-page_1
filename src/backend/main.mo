import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
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

  public type ServiceStatus = { #active; #inactive };
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

  stable var userCounter : Nat = 0;
  stable var partnerCounter : Nat = 0;
  stable var clientCounter : Nat = 0;
  stable var serviceCounter : Nat = 0;
  stable var topUpCounter : Nat = 0;
  stable var taskCounter : Nat = 0;
  stable var withdrawCounter : Nat = 0;
  stable var fpRequestCounter : Nat = 0;
  stable var logCounter : Nat = 0;
  stable var adminClaimed : Bool = false;

  stable var stableUsers : [(Principal, User)] = [];
  stable var stablePartners : [(Principal, Partner)] = [];
  stable var stableClients : [(Principal, Client)] = [];
  stable var stableServices : [(Text, Service)] = [];
  stable var stableTopUps : [(Text, TopUp)] = [];
  stable var stableTasks : [(Text, Task)] = [];
  stable var stableFinancialProfiles : [(Text, FinancialProfile)] = [];
  stable var stableWithdrawRequests : [(Text, WithdrawRequest)] = [];
  stable var stableFinancialProfileRequests : [(Text, FinancialProfileRequest)] = [];
  stable var stableAdminLogs : [(Text, AdminLog)] = [];

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

  public query ({ caller }) func getUsers() : async [User] {
    checkAdmin(caller);
    users.values().toArray();
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    checkAdmin(caller);
    users.values().toArray();
  };

  public query ({ caller }) func getAllPartners() : async [Partner] {
    checkAdmin(caller);
    partners.values().toArray();
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    checkAdmin(caller);
    clients.values().toArray();
  };

  public query ({ caller }) func getClients() : async [Client] {
    checkAdmin(caller);
    clients.values().toArray();
  };

  public query ({ caller }) func getPartners() : async [Partner] {
    checkAdmin(caller);
    partners.values().toArray();
  };

  public query ({ caller }) func getAsistenmu() : async [User] {
    checkAdmin(caller);
    users.values().toArray().filter(
      func(user) {
        user.role == #asistenmu and user.status == #active;
      }
    );
  };

  public query ({ caller }) func getServices() : async [Service] {
    checkAdmin(caller);
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
    checkAdmin(caller);
    topUps.values().toArray();
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    checkAdmin(caller);
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

  public query ({ caller }) func getTasksByAsistenmu() : async [Task] {
    let callerText = caller.toText();
    tasks.values().toArray().filter(
      func(task) {
        task.asistenmuId == callerText and task.status == #permintaanbaru;
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
    checkAdmin(caller);
    withdrawRequests.values().toArray();
  };

  public query ({ caller }) func getFinancialProfileRequests() : async [FinancialProfileRequest] {
    checkAdmin(caller);
    financialProfileRequests.values().toArray();
  };

  public query ({ caller }) func getAdminLogs() : async [AdminLog] {
    checkAdmin(caller);
    let logs = adminLogs.values().toArray();

    func compare(t1 : AdminLog, t2 : AdminLog) : Order.Order {
      Nat.compare(t2.createdAt.toNat(), t1.createdAt.toNat());
    };

    logs.sort();
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

  // Call mutations
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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

  public shared ({ caller }) func topUpService(idService : Text, unitTambahan : Nat) : async Text {
    checkAdmin(caller);
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
    checkAdmin(caller);
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
          status = #onprogress;
        };
        tasks.add(idTask, updatedTask);
        await addAdminLog(caller, "Task delegated", idTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  public shared ({ caller }) func updateTaskStatus(idTask : Text, status : TaskStatus) : async () {
    checkAdmin(caller);
    switch (tasks.get(idTask)) {
      case (?task) {
        let updatedTask = { task with status };
        tasks.add(idTask, updatedTask);
        await addAdminLog(caller, "Updated task status", idTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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
    checkAdmin(caller);
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

  func genUserId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 4 - numStr.size();
    var result = "INT-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };

  func genPartnerId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 4 - numStr.size();
    var result = "PA-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };

  func genClientId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 4 - numStr.size();
    var result = "CA-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };

  func genServiceId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "SA-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };

  func genTopUpId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "TU-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };

  func genTaskId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "TSK-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };

  func genWithdrawId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "WD-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };

  func genFpRequestId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "FP-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };

  func genLogId(num : Nat) : Text {
    let numStr = num.toText();
    let zerosToPad = 5 - numStr.size();
    var result = "LOG-";
    for (i in Nat.range(0, zerosToPad)) {
      result #= "\u{30}";
    };
    result # numStr;
  };
};
