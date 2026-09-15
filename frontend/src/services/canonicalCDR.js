// NetSentry Canonical Call Detail Record (CDR) Telephony Store
// Intercepted forensic call logs across Maharashtra and Karnataka jurisdictions

export const CANONICAL_CDR_DATABASE = [
  // Abdul Karim Telgi <-> Karim Lala (Shared MSISDN + Cross-Border Alias Coordination)
  {
    call_id: "CDR-2002-MH-88192",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_karim_lala",
    caller_name: "Abdul Karim Telgi",
    caller_phone: "+91-9822019900",
    receiver_name: "Karim Lala",
    receiver_phone: "+91-9822019900",
    timestamp: "2002-05-18 21:14:02 IST",
    duration_sec: 420,
    duration_fmt: "7m 00s",
    direction: "OUTGOING",
    cell_tower: "Tower MH-PUN-019 (Bund Garden)",
    imei: "359128001928371",
    evidence_type: "CALL_OVERLAP",
    notes: "SIM cloning / multi-handset cross-state handover intercepted on Pune-Bangalore highway route."
  },
  {
    call_id: "CDR-2002-MH-88204",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_karim_lala",
    caller_name: "Abdul Karim Telgi",
    caller_phone: "+91-9822019900",
    receiver_name: "Karim Lala",
    receiver_phone: "+91-9845012345",
    timestamp: "2002-05-24 14:08:33 IST",
    duration_sec: 185,
    duration_fmt: "3m 05s",
    direction: "OUTGOING",
    cell_tower: "Tower KA-BLR-088 (MG Road / Cubbon Park)",
    imei: "359128001928371",
    evidence_type: "CALL_OVERLAP",
    notes: "Bangalore consignment delivery clearance call."
  },
  // Abdul Karim Telgi <-> Tabrez Telgi (Belgaum Transit Coordination)
  {
    call_id: "CDR-2002-MH-77112",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_tabrez_telgi",
    caller_name: "Abdul Karim Telgi",
    caller_phone: "+91-9822019900",
    receiver_name: "Tabrez Telgi",
    receiver_phone: "+91-9845099112",
    timestamp: "2002-06-01 09:30:15 IST",
    duration_sec: 530,
    duration_fmt: "8m 50s",
    direction: "OUTGOING",
    cell_tower: "Tower MH-PUN-019 (Bund Garden)",
    imei: "359128001928371",
    evidence_type: "CALL_OVERLAP",
    notes: "Instructions on transporting offset dye machinery across Belgaum border."
  },
  {
    call_id: "CDR-2002-KA-77129",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_tabrez_telgi",
    caller_name: "Tabrez Telgi",
    caller_phone: "+91-9845099112",
    receiver_name: "Abdul Karim Telgi",
    receiver_phone: "+91-9822019900",
    timestamp: "2002-06-02 23:45:00 IST",
    duration_sec: 94,
    duration_fmt: "1m 34s",
    direction: "INCOMING",
    cell_tower: "Tower KA-BEL-003 (Belgaum Central)",
    imei: "354189009823101",
    evidence_type: "CALL_OVERLAP",
    notes: "Truck MH-12-Q-4004 checkpoint confirmation."
  },
  // Abdul Karim Telgi <-> Babanrao Tukaram (Pune Logistics Command)
  {
    call_id: "CDR-2002-MH-66014",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_babanrao_tukaram",
    caller_name: "Abdul Karim Telgi",
    caller_phone: "+91-9822019900",
    receiver_name: "Babanrao Tukaram",
    receiver_phone: "+91-9820112233",
    timestamp: "2002-06-05 11:20:41 IST",
    duration_sec: 340,
    duration_fmt: "5m 40s",
    direction: "OUTGOING",
    cell_tower: "Tower MH-PUN-042 (Shivajinagar)",
    imei: "359128001928371",
    evidence_type: "CALL_OVERLAP",
    notes: "Safehouse inventory check of ₹500 and ₹100 stamp papers."
  },
  // Abdul Karim Telgi <-> Rehan Baig (Bangalore Hawala Link)
  {
    call_id: "CDR-2002-MH-55109",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_rehan_baig",
    caller_name: "Abdul Karim Telgi",
    caller_phone: "+91-9822019900",
    receiver_name: "Rehan Baig",
    receiver_phone: "+91-9845012345",
    timestamp: "2002-05-10 16:15:22 IST",
    duration_sec: 612,
    duration_fmt: "10m 12s",
    direction: "OUTGOING",
    cell_tower: "Tower MH-MUM-011 (Nariman Point)",
    imei: "359128001928371",
    evidence_type: "CALL_OVERLAP",
    notes: "Pre-settlement confirmation for ₹1.8 Crore cash courier remittance."
  },
  // Abdul Karim Telgi <-> Ram Ratan Soni (Mumbai Offset Dies)
  {
    call_id: "CDR-1995-MH-44011",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_ram_ratan_soni",
    caller_name: "Abdul Karim Telgi",
    caller_phone: "+91-9822019900",
    receiver_name: "Ram Ratan Soni",
    receiver_phone: "+91-9811099887",
    timestamp: "1995-09-08 19:40:11 IST",
    duration_sec: 245,
    duration_fmt: "4m 05s",
    direction: "OUTGOING",
    cell_tower: "Tower MH-MUM-090 (Fort / MRA Marg)",
    imei: "358911002234561",
    evidence_type: "CALL_OVERLAP",
    notes: "Ordering high-precision engraving cylinder plates matching India Security Press Nashik."
  },
  // Babanrao Tukaram <-> Sanjay Gaikwad
  {
    call_id: "CDR-2002-MH-33019",
    source_id: "person_babanrao_tukaram",
    target_id: "person_sanjay_gaikwad",
    caller_name: "Babanrao Tukaram",
    caller_phone: "+91-9820112233",
    receiver_name: "Sanjay Gaikwad",
    receiver_phone: "+91-9822033445",
    timestamp: "2002-06-06 08:14:50 IST",
    duration_sec: 190,
    duration_fmt: "3m 10s",
    direction: "OUTGOING",
    cell_tower: "Tower MH-PUN-033 (Swargate)",
    imei: "351982001129384",
    evidence_type: "CALL_OVERLAP",
    notes: "Courier pickup coordination for Maharashtra treasury distribution."
  }
];

export function getCDRRecords(sourceId, targetId) {
  if (!sourceId || !targetId) return [];
  const s = String(sourceId).toLowerCase();
  const t = String(targetId).toLowerCase();

  return CANONICAL_CDR_DATABASE.filter(
    (record) =>
      (record.source_id.toLowerCase() === s && record.target_id.toLowerCase() === t) ||
      (record.source_id.toLowerCase() === t && record.target_id.toLowerCase() === s)
  );
}

export function getAllCDRRecords() {
  return CANONICAL_CDR_DATABASE;
}
