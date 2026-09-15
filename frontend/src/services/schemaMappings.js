// T3.4 — Schema adapter mappings (mirrors config/schema_mappings.json)
// Source Field → Canonical Field per department, with type icons.
export const SCHEMA_MAPPINGS = {
  MH_POLICE: {
    source_type: "csv",
    fields: [
      { source: "accused_name", canonical: "Person.name", type: "person" },
      { source: "fir_number", canonical: "FIR.id", type: "id" },
      { source: "police_station", canonical: "FIR.station", type: "location" },
      { source: "offense_type", canonical: "FIR.crime_type", type: "text" },
      { source: "section_ipc", canonical: "FIR.sections", type: "law" },
      { source: "date_of_fir", canonical: "FIR.incident_date", type: "date" },
      { source: "seized_phone", canonical: "Phone.number", type: "phone" },
      { source: "vehicle_reg_no", canonical: "Vehicle.registration", type: "vehicle" },
      { source: "location_district", canonical: "Location.city", type: "location" }
    ]
  },
  KA_POLICE: {
    source_type: "json",
    fields: [
      { source: "suspect_details", canonical: "Person.name", type: "person" },
      { source: "crime_no", canonical: "FIR.id", type: "id" },
      { source: "ps_jurisdiction", canonical: "FIR.station", type: "location" },
      { source: "major_head", canonical: "FIR.crime_type", type: "text" },
      { source: "ipc_sections_invoked", canonical: "FIR.sections", type: "law" },
      { source: "reported_datetime", canonical: "FIR.incident_date", type: "date" },
      { source: "contact_number", canonical: "Phone.number", type: "phone" },
      { source: "associated_vehicle", canonical: "Vehicle.registration", type: "vehicle" },
      { source: "district", canonical: "Location.city", type: "location" }
    ]
  },
  FINANCIAL_INTEL: {
    source_type: "csv",
    fields: [
      { source: "transaction_id", canonical: "Transaction.id", type: "id" },
      { source: "sender_name", canonical: "Person.name", type: "person" },
      { source: "sender_account", canonical: "BankAccount.account_number", type: "bank" },
      { source: "receiver_name", canonical: "Person.name", type: "person" },
      { source: "receiver_account", canonical: "BankAccount.account_number", type: "bank" },
      { source: "amount_inr", canonical: "Transaction.amount", type: "money" },
      { source: "flag_reason", canonical: "Transaction.flag", type: "flag" },
      { source: "timestamp", canonical: "Transaction.date", type: "date" }
    ]
  }
};

export const TYPE_ICONS = {
  person: "👤",
  phone: "📞",
  vehicle: "🚗",
  bank: "🏦",
  money: "💰",
  law: "⚖️",
  date: "📅",
  location: "📍",
  id: "🆔",
  text: "📝",
  flag: "🚩"
};
