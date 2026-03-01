import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";

module {
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

  type OldAdminLog = {
    idLog : Text;
    adminPrincipalId : Text;
    action : Text;
    targetId : Text;
    createdAt : Int;
  };

  public type OldPartner = {
    idUser : Text;
    principalId : Text;
    nama : Text;
    email : Text;
    whatsapp : Text;
    kota : Text;
    level : { #junior; #senior; #expert };
    verifiedSkill : [Text];
    role : { #admin; #asistenmu; #operasional; #client; #partner; #public_ };
    status : { #pending; #active; #reject; #suspend };
    createdAt : Int;
  };

  public type NewPartner = {
    idUser : Text;
    principalId : Text;
    nama : Text;
    email : Text;
    whatsapp : Text;
    kota : Text;
    level : { #junior; #senior; #expert };
    verifiedSkill : [Text];
    role : { #admin; #asistenmu; #operasional; #client; #partner; #public_ };
    status : { #pending; #active; #reject; #suspend };
    createdAt : Int;
  };

  public type OldActor = {
    userCounter : Nat;
    partnerCounter : Nat;
    clientCounter : Nat;
    serviceCounter : Nat;
    topUpCounter : Nat;
    taskCounter : Nat;
    withdrawCounter : Nat;
    fpRequestCounter : Nat;
    logCounter : Nat;
    adminClaimed : Bool;
    users : Map.Map<Principal, { idUser : Text; principalId : Text; nama : Text; email : Text; whatsapp : Text; role : { #admin; #asistenmu; #operasional; #client; #partner; #public_ }; status : { #pending; #active; #reject; #suspend }; createdAt : Int }>;
    partners : Map.Map<Principal, OldPartner>;
    clients : Map.Map<Principal, { idUser : Text; principalId : Text; nama : Text; email : Text; whatsapp : Text; company : Text; role : { #admin; #asistenmu; #operasional; #client; #partner; #public_ }; status : { #pending; #active; #reject; #suspend }; createdAt : Int }>;
    services : Map.Map<Text, {
      idService : Text;
      tipeLayanan : { #tenang; #rapi; #fokus; #jaga; #efisien };
      clientPrincipalId : Text;
      clientNama : Text;
      asistenmuPrincipalId : Text;
      asistenmuNama : Text;
      unitLayanan : Nat;
      hargaPerLayanan : Nat;
      sharingLayanan : [{ idUser : Text; principalId : Text; nama : Text }];
      status : ServiceStatus;
      createdAt : Int;
    }>;
    topUps : Map.Map<Text, { idTopUp : Text; idService : Text; namaClient : Text; unitTambahan : Nat; createdAt : Int }>;
    tasks : Map.Map<Text, {
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
    }>;
    financialProfiles : Map.Map<Text, { namaBankEwallet : Text; nomorRekening : Text; namaRekening : Text; createdAt : Int }>;
    withdrawRequests : Map.Map<Text, {
      idWithdraw : Text;
      partnerId : Text;
      partnerNama : Text;
      namaBankEwallet : Text;
      nomorRekening : Text;
      namaRekening : Text;
      nominal : Nat;
      status : {
        #pending;
        #approved;
        #rejected;
      };
      createdAt : Int;
    }>;
    financialProfileRequests : Map.Map<
      Text,
      {
        idRequest : Text;
        partnerId : Text;
        partnerNama : Text;
        oldProfile : ?{ namaBankEwallet : Text; nomorRekening : Text; namaRekening : Text; createdAt : Int };
        newProfile : { namaBankEwallet : Text; nomorRekening : Text; namaRekening : Text; createdAt : Int };
        status : {
          #pending;
          #approved;
          #rejected;
        };
        createdAt : Int;
      }
    >;
    adminLogs : Map.Map<Text, { idLog : Text; adminPrincipalId : Text; action : Text; targetId : Text; createdAt : Int }>;
  };

  public type NewActor = {
    userCounter : Nat;
    partnerCounter : Nat;
    clientCounter : Nat;
    serviceCounter : Nat;
    topUpCounter : Nat;
    taskCounter : Nat;
    withdrawCounter : Nat;
    fpRequestCounter : Nat;
    logCounter : Nat;
    adminClaimed : Bool;
    users : Map.Map<Principal, { idUser : Text; principalId : Text; nama : Text; email : Text; whatsapp : Text; role : { #admin; #asistenmu; #operasional; #client; #partner; #public_ }; status : { #pending; #active; #reject; #suspend }; createdAt : Int }>;
    partners : Map.Map<Principal, OldPartner>;
    clients : Map.Map<Principal, { idUser : Text; principalId : Text; nama : Text; email : Text; whatsapp : Text; company : Text; role : { #admin; #asistenmu; #operasional; #client; #partner; #public_ }; status : { #pending; #active; #reject; #suspend }; createdAt : Int }>;
    services : Map.Map<Text, { idService : Text; tipeLayanan : { #tenang; #rapi; #fokus; #jaga; #efisien }; clientPrincipalId : Text; clientNama : Text; asistenmuPrincipalId : Text; asistenmuNama : Text; unitLayanan : Nat; hargaPerLayanan : Nat; sharingLayanan : [{ idUser : Text; principalId : Text; nama : Text }]; status : ServiceStatus; createdAt : Int }>;
    topUps : Map.Map<Text, { idTopUp : Text; idService : Text; namaClient : Text; unitTambahan : Nat; createdAt : Int }>;
    tasks : Map.Map<Text, { idTask : Text; judulTask : Text; detailTask : Text; deadline : Int; serviceId : Text; clientId : Text; clientNama : Text; partnerId : Text; partnerNama : Text; asistenmuId : Text; asistenmuNama : Text; notesAsistenmu : Text; jamEfektif : Nat; unitLayanan : Nat; linkGdriveInternal : Text; linkGdriveClient : Text; status : TaskStatus; createdAt : Int }>;
    financialProfiles : Map.Map<Text, { namaBankEwallet : Text; nomorRekening : Text; namaRekening : Text; createdAt : Int }>;
    withdrawRequests : Map.Map<Text, {
      idWithdraw : Text;
      partnerId : Text;
      partnerNama : Text;
      namaBankEwallet : Text;
      nomorRekening : Text;
      namaRekening : Text;
      nominal : Nat;
      status : {
        #pending;
        #approved;
        #rejected;
      };
      createdAt : Int;
    }>;
    financialProfileRequests : Map.Map<
      Text,
      {
        idRequest : Text;
        partnerId : Text;
        partnerNama : Text;
        oldProfile : ?{ namaBankEwallet : Text; nomorRekening : Text; namaRekening : Text; createdAt : Int };
        newProfile : { namaBankEwallet : Text; nomorRekening : Text; namaRekening : Text; createdAt : Int };
        status : {
          #pending;
          #approved;
          #rejected;
        };
        createdAt : Int;
      }
    >;
    adminLogs : Map.Map<Text, OldAdminLog>;
  };

  public func run(old : OldActor) : NewActor { old };
};
