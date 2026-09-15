// NetSentry Canonical Financial Intelligence & Hawala Ledger Store
// FIU-IND suspicious activity reports (STR) & interstate money conduits

export const CANONICAL_TRANSACTIONS_DATABASE = [
  // Abdul Karim Telgi <-> Rehan Baig (₹1.8 Cr Bangalore Hawala Conduit)
  {
    transaction_id: "TXN-2002-HWL-00912",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_rehan_baig",
    sender_name: "Abdul Karim Telgi",
    sender_account: "Corporation Bank A/C 9901-4421 (Mumbai)",
    receiver_name: "Rehan Baig",
    receiver_account: "Canara Bank A/C 4402-8812 (Bengaluru)",
    amount: 18000000,
    amount_fmt: "₹1,80,00,000 (₹1.80 Cr)",
    date: "2002-05-11",
    timestamp: "2002-05-11 11:34:00 IST",
    channel: "Interstate Hawala Angadia / Shell Structured Remittance",
    flag_status: "SAR_FLAGGED",
    flag_reason: "Smurfed structured transfers split into sub-₹10L batches to evade FIU automated reporting thresholds.",
    evidence_type: "FINANCIAL",
    forensic_code: "PMLA-SEC-3-HAWALA"
  },
  {
    transaction_id: "TXN-2002-HWL-00945",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_rehan_baig",
    sender_name: "Abdul Karim Telgi",
    sender_account: "Cash Token 'K-78 Belgaum'",
    receiver_name: "Rehan Baig",
    receiver_account: "Apex Forex Belgaum Counter",
    amount: 4500000,
    amount_fmt: "₹45,00,000 (₹45 Lakhs)",
    date: "2002-05-28",
    timestamp: "2002-05-28 17:10:00 IST",
    channel: "Hawala Physical Courier (Cash Token Remittance)",
    flag_status: "HAWALA_SUSPECT",
    flag_reason: "Physical bearer note currency code handover matched with tapped intercept phone call #MH-55109.",
    evidence_type: "FINANCIAL",
    forensic_code: "PMLA-SEC-4-COURIER"
  },
  // Tabrez Telgi <-> Rehan Baig (Belgaum-Bangalore Cash Transfer)
  {
    transaction_id: "TXN-2002-HWL-01021",
    source_id: "person_tabrez_telgi",
    target_id: "person_rehan_baig",
    sender_name: "Tabrez Telgi",
    sender_account: "Belgaum Co-op Bank A/C 1120-9901",
    receiver_name: "Rehan Baig",
    receiver_account: "Canara Bank A/C 4402-8812 (Bengaluru)",
    amount: 2500000,
    amount_fmt: "₹25,00,000 (₹25 Lakhs)",
    date: "2002-06-03",
    timestamp: "2002-06-03 14:02:18 IST",
    channel: "NEFT / Real-Time RTGS Transit",
    flag_status: "SAR_FLAGGED",
    flag_reason: "High velocity liquidity transfer preceding Belgaum police raid by 48 hours.",
    evidence_type: "FINANCIAL",
    forensic_code: "STR-VELOCITY-ALERT"
  },
  // Abdul Karim Telgi <-> Ram Ratan Soni (Printing Die Fabrication Payments)
  {
    transaction_id: "TXN-1995-BNK-00142",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_ram_ratan_soni",
    sender_name: "Abdul Karim Telgi",
    sender_account: "Bank of India Fort A/C 3311-0982",
    receiver_name: "Ram Ratan Soni",
    receiver_account: "Soni Engravers Current A/C 8821-4401",
    amount: 1250000,
    amount_fmt: "₹12,50,000 (₹12.5 Lakhs)",
    date: "1995-09-10",
    timestamp: "1995-09-10 10:15:00 IST",
    channel: "Demand Draft / Clearing House",
    flag_status: "HIGH_VALUE_CASH",
    flag_reason: "Consideration payment for perforated watermark dies and imported 100 GSM watermarked security paper.",
    evidence_type: "FINANCIAL",
    forensic_code: "SECURITY-PRINT-CONSIDERATION"
  },
  // Abdul Karim Telgi <-> Babanrao Tukaram (Safehouse & Logistics Operating Fund)
  {
    transaction_id: "TXN-2002-BNK-00781",
    source_id: "person_abdul_karim_telgi",
    target_id: "person_babanrao_tukaram",
    sender_name: "Abdul Karim Telgi",
    sender_account: "Corporation Bank A/C 9901-4421",
    receiver_name: "Babanrao Tukaram",
    receiver_account: "Pune Peoples Co-op A/C 5521-8890",
    amount: 850000,
    amount_fmt: "₹8,50,000 (₹8.5 Lakhs)",
    date: "2002-05-30",
    timestamp: "2002-05-30 16:45:10 IST",
    channel: "Commercial Bank Wire",
    flag_status: "SAR_FLAGGED",
    flag_reason: "Operating expenses for Bund Garden safehouse lease and transport fuel logistics.",
    evidence_type: "FINANCIAL",
    forensic_code: "LOGISTICS-OPEX"
  }
];

export function getTransactionRecords(sourceId, targetId) {
  if (!sourceId || !targetId) return [];
  const s = String(sourceId).toLowerCase();
  const t = String(targetId).toLowerCase();

  return CANONICAL_TRANSACTIONS_DATABASE.filter(
    (record) =>
      (record.source_id.toLowerCase() === s && record.target_id.toLowerCase() === t) ||
      (record.source_id.toLowerCase() === t && record.target_id.toLowerCase() === s)
  );
}

export function getAllTransactionRecords() {
  return CANONICAL_TRANSACTIONS_DATABASE;
}
