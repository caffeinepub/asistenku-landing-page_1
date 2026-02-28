module {
  type OldActor = {};
  type NewActor = {
    stableUsers : [(Principal, User)];
    stablePartners : [(Principal, Partner)];
    stableClients : [(Principal, Client)];
    stableServices : [(Text, Service)];
    stableTopUps : [(Text, TopUp)];
    stableTasks : [(Text, Task)];
    stableFinancialProfiles : [(Text, FinancialProfile)];
    stableWithdrawRequests : [(Text, WithdrawRequest)];
    stableFinancialProfileRequests : [(Text, FinancialProfileRequest)];
    stableAdminLogs : [(Text, AdminLog)];
  };

  type Role = {
    #admin;
    #asistenmu;
    #operasional;
    #client;
    #partner;
    #public_;
  };

  type Status = {
    #pending;
    #active;
    #reject;
    #suspend;
  };

  type LevelPartner = {
    #junior;
    #senior;
    #expert;
  };

  type TipeLayanan = {
    #tenang;
    #rapi;
    #fokus;
    #jaga;
    #efisien;
  };

  type ServiceStatus = { #active; #inactive };
  type TaskStatus = {
    #permintaanbaru;
    #onprogress;
    #reviewclient;
    #qaasistenmu;
    #revisi;
    #ditolak;
    #selesai;
  };

  type WithdrawStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type FPRequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type SharingEntry = {
    idUser : Text;
    principalId : Text;
    nama : Text;
  };

  type User = {
    idUser : Text;
    principalId : Text;
    nama : Text;
    email : Text;
    whatsapp : Text;
    role : Role;
    status : Status;
    createdAt : Int;
  };

  type Partner = {
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

  type Client = {
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

  type Service = {
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

  type TopUp = {
    idTopUp : Text;
    idService : Text;
    namaClient : Text;
    unitTambahan : Nat;
    createdAt : Int;
  };

  type Task = {
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

  type FinancialProfile = {
    namaBankEwallet : Text;
    nomorRekening : Text;
    namaRekening : Text;
    createdAt : Int;
  };

  type WithdrawRequest = {
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

  type FinancialProfileRequest = {
    idRequest : Text;
    partnerId : Text;
    partnerNama : Text;
    oldProfile : ?FinancialProfile;
    newProfile : FinancialProfile;
    status : FPRequestStatus;
    createdAt : Int;
  };

  type AdminLog = {
    idLog : Text;
    adminPrincipalId : Text;
    action : Text;
    targetId : Text;
    createdAt : Int;
  };

  public func run(_ : OldActor) : NewActor {
    {
      stableUsers = [];
      stablePartners = [];
      stableClients = [];
      stableServices = [];
      stableTopUps = [];
      stableTasks = [];
      stableFinancialProfiles = [];
      stableWithdrawRequests = [];
      stableFinancialProfileRequests = [];
      stableAdminLogs = [];
    };
  };
};
