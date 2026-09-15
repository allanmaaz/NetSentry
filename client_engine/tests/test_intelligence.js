/**
 * NetSentry — Automated Test Suite for Intelligence, ML & Graph Algorithms
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 */

import assert from 'assert';
import { predictRecordLinkage, transliterateIndicToLatin, normalizedLevenshtein, getDoubleMetaphoneTokens } from '../src/intelligence/rfAliasMatcher.js';
import { simulateSuspectArrest } from '../src/intelligence/tacticalSim.js';
import { extractEntitiesFromNarrative } from '../src/intelligence/nlpParser.js';
import { detectCrossSyndicateBridges } from '../src/intelligence/bridgeDetector.js';
import { generateLegalJustification } from '../src/intelligence/xaiExplainer.js';
import { relationshipEngine, computePageRank } from '../src/intelligence/relationshipEngine.js';
import { parseCSVToEntities } from '../src/parser/csvParser.js';
import { generateSHA256Hash } from '../src/intelligence/section65B.js';
import { CANONICAL_ENTITIES, CANONICAL_LINKS } from '../src/data/canonicalSyndicates.js';

console.log('[NetSentry Test Suite] Running algorithmic and ML unit tests...');

// 1. Test Indic Transliteration & Phonetics
console.log('Test 1: Indic Transliteration & Phonetics...');
const metaIndic = getDoubleMetaphoneTokens('अस्लम');
const metaLatin = getDoubleMetaphoneTokens('Aslam');
assert.strictEqual(metaIndic, metaLatin, 'Double Metaphone of अस्लम must match Aslam');

const lev = normalizedLevenshtein('Mohd Aslam', 'Mohd. Aslam');
assert(lev > 0.85, 'Levenshtein should be high for minor punctuation variation');
console.log('✓ Test 1 Passed.');

// 2. Test Supervised Random Forest Prediction
console.log('Test 2: Random Forest Linkage Prediction...');
const entityA = { name: 'Mohd. Aslam', phones: ['+91-9820091100'], vehicles: ['MH-01-DX-9009'] };
const entityB = { name: 'अस्लम भाई', phones: ['+91-9820091100'], vehicles: ['MH-01-DX-9009'] };
const pred = predictRecordLinkage(entityA, entityB);

assert(pred.confidenceScore >= 0.85, 'Score should trigger AUTO_MERGE for high corroboration');
assert.strictEqual(pred.decision, 'AUTO_MERGE', 'Decision should be AUTO_MERGE');
console.log(`✓ Test 2 Passed (Confidence: ${Math.round(pred.confidenceScore * 100)}%).`);

// 3. Test Tactical Arrest Simulator
console.log('Test 3: Tactical Arrest Simulator & Graph Fracture...');
const telgiNodes = CANONICAL_ENTITIES.syn_telgi;
const telgiLinks = CANONICAL_LINKS.syn_telgi;
const sim = simulateSuspectArrest('person_telgi', telgiNodes, telgiLinks);

assert.strictEqual(sim.capacityDropPct, 74.2, 'Kingpin arrest should yield 74.2% drop');
assert(sim.successorName.length > 0, 'Successor should be identified');
console.log(`✓ Test 3 Passed (Successor: ${sim.successorName}).`);

// 4. Test FIR Narrative NLP Extractor
console.log('Test 4: FIR Narrative NLP Extractor...');
const narrative = 'Accused Mohd Aslam alias Aslam Bhai fled in vehicle MH-12-Q-4004 using phone +91-9822019900 booked under IPC 420 and UAPA.';
const nlp = extractEntitiesFromNarrative(narrative);

assert(nlp.phones.includes('+919822019900') || nlp.phones.some((p) => p.includes('9822019900')), 'Phone should be extracted');
assert(nlp.vehicles.includes('MH-12-Q-4004'), 'Vehicle plate should be extracted');
assert(nlp.legalSections.some((s) => s.includes('420')), 'IPC 420 should be extracted');
console.log('✓ Test 4 Passed.');

// 5. Test Cross-Syndicate Strategic Bridge Detector
console.log('Test 5: Cross-Syndicate Strategic Bridge Detector...');
const mockMulti = {
  syn1: [{ id: 'a', canonical_name: 'Suspect A', phones: ['+91-9899001122'] }],
  syn2: [{ id: 'b', canonical_name: 'Suspect B', phones: ['+91-9899001122'] }]
};
const bridges = detectCrossSyndicateBridges(mockMulti);
assert.strictEqual(bridges.length, 1, 'Should detect 1 shared phone bridge');
console.log('✓ Test 5 Passed.');

console.log('\n========================================');
console.log('ALL 5 UNIT TESTS PASSED WITH 100% SUCCESS');
console.log('========================================\n');

// 6. Test Cross-Jurisdiction Link Detection (same phone → linked)
console.log('Test 6: Cross-Jurisdiction Link Detection...');
const mockJuris = {
  mh: [{ id: 'mh1', canonical_name: 'Operative MH', phones: ['+91-9811223344'] }],
  ka: [{ id: 'ka1', canonical_name: 'Operative KA', phones: ['+91-9811223344'] }]
};
const jurisBridges = detectCrossSyndicateBridges(mockJuris);
assert(jurisBridges.length >= 1, 'Two nodes sharing a phone number must link across jurisdictions');
console.log(`✓ Test 6 Passed (${jurisBridges.length} cross-jurisdiction link).`);

// 7. Test XAI Plain-English Generator Output
console.log('Test 7: XAI Plain-English Justification Generator...');
const xaiEntity = {
  id: 'x1', canonical_name: 'Test Kingpin', betweenness: 0.9, risk_score: 95,
  risk_tier: 'critical', aliases: ['TK', 'Big T'], phones: ['+91-9800000001', '+91-9800000002'],
  agencies: ['MH_POLICE', 'NIA'], firs: ['FIR 1/24', 'FIR 2/24']
};
const justification = generateLegalJustification(xaiEntity, [xaiEntity, { id: 'x2', betweenness: 0.1 }]);
assert(typeof justification === 'string' && justification.length > 0, 'XAI output must be non-empty');
assert(justification.toUpperCase().includes('CRITICAL'), 'XAI output must contain the risk tier');
console.log('✓ Test 7 Passed.');

// 8. Test Isolation Forest Anomaly Scorer (high-degree node > 70)
console.log('Test 8: Isolation Forest Anomaly Scorer...');
const quietNodes = [1, 2, 3, 4, 5].map((i) => ({
  id: `q${i}`, betweenness: 0.1, phones: ['+91-9000000001'], agencies: ['MH_POLICE'],
  firs: ['FIR 1/24'], burstDelta: 0
}));
const hubNode = {
  id: 'hub', betweenness: 0.9,
  phones: ['+91-9111111111', '+91-9222222222', '+91-9333333333', '+91-9444444444', '+91-9555555555'],
  agencies: ['MH_POLICE', 'KA_POLICE', 'NIA'],
  firs: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'],
  burstDelta: 5
};
const hubLinks = quietNodes.map((q) => ({ source: 'hub', target: q.id }));
const hubScore = relationshipEngine.isolationScore(hubNode, [...quietNodes, hubNode], hubLinks);
assert(hubScore > 70, `High-degree hub node must score > 70 (got ${hubScore})`);
console.log(`✓ Test 8 Passed (Anomaly Score: ${hubScore}).`);

// 9. Test CDR + FIU Data Ingestion Pipeline (5 rows → 5 entities)
console.log('Test 9: CDR + FIU Ingestion Pipeline...');
const ingestCsv = `id,name,alias,threat,role,jurisdiction,fir,notes
ING-01,Ravi Shankar,Ravi Anna,HIGH,Courier,Maharashtra,FIR 201/25,Cash conduit
ING-02,Salim Sheikh,Salim Bhai,MEDIUM,Mule,Karnataka,FIR 202/25,Account layer
ING-03,Deepak Rao,Deepu,HIGH,Coordinator,Maharashtra,FIR 203/25,Logistics head
ING-04,Farhan Qureshi,Farhan,MEDIUM,Runner,Delhi,FIR 204/25,Interstate runner
ING-05,Kiran Nair,Kanna,CRITICAL,Financier,Kerala,FIR 205/25,Hawala banker`;
const ingested = parseCSVToEntities(ingestCsv);
assert.strictEqual(ingested.length, 5, 'Parsing 5 CSV rows must create 5 entities');
console.log('✓ Test 9 Passed.');

// 10. Test Section 65B SHA-256 Hash Integrity
console.log('Test 10: Section 65B SHA-256 Hash Integrity...');
const knownHash = await generateSHA256Hash('abc');
assert.strictEqual(
  knownHash,
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  'SHA-256 of known input must match the expected digest'
);
console.log('✓ Test 10 Passed.');

console.log('\n========================================');
console.log('ALL 10 UNIT TESTS PASSED WITH 100% SUCCESS');
console.log('========================================\n');
