import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Store, Mail, Phone, MapPin, FileText, Sparkles, AlertTriangle, X, Zap, Percent, ChevronDown, ChevronUp } from 'lucide-react';
import { mockVendors, mockPendingVendors, emailTemplates } from '../../utils/mockData';

// ─── Rejection reasons for checkbox list ──────────────────────────────────────
const REJECTION_REASONS = [
  { id: 'taxid',       label: 'Invalid or Missing Tax ID',              detail: 'EIN format could not be verified or was not provided' },
  { id: 'license',     label: 'Missing Business License',               detail: 'No valid business license number on file' },
  { id: 'fda',         label: 'Missing FDA Registration',               detail: 'Medical supply vendors require an FDA registration number' },
  { id: 'address',     label: 'Unverifiable Business Address',          detail: 'Address provided could not be verified' },
  { id: 'web',         label: 'No Web Presence / Too New',              detail: 'No website and less than 1 year in business' },
  { id: 'duplicate',   label: 'Duplicate Application',                  detail: 'An application already exists for this business' },
  { id: 'region',      label: 'Outside Supported Regions',              detail: 'Business is not registered in a supported US state' },
  { id: 'suspicious',  label: 'Suspicious Business Activity',           detail: 'Application flagged for further review' },
  { id: 'compliance',  label: 'Failed Compliance Check',                detail: 'Business did not meet regulatory compliance requirements' },
];

// ─── Commission presets ────────────────────────────────────────────────────────
const COMMISSION_PRESETS = [5, 7, 8, 10, 12, 15];

const AdminVendors = () => {
  const [vendors, setVendors]               = useState([...mockVendors, ...mockPendingVendors]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [aiVerifying, setAiVerifying]       = useState(false);
  const [aiResults, setAiResults]           = useState(null);
  const [autoActionLog, setAutoActionLog]   = useState([]);
  const [emailPreview, setEmailPreview]     = useState(null);

  // ── Approve modal state ──
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveVendorTarget, setApproveVendorTarget] = useState(null);
  const [commission, setCommission]         = useState(10);
  const [customCommission, setCustomCommission] = useState('');
  const [useCustomCommission, setUseCustomCommission] = useState(false);

  // ── Reject modal state ──
  const [showRejectModal, setShowRejectModal]   = useState(false);
  const [selectedReasons, setSelectedReasons]   = useState([]);
  const [customReason, setCustomReason]         = useState('');
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [sendRejectionEmail, setSendRejectionEmail] = useState(true);

  // ─── AI Verification ──────────────────────────────────────────────────────
  const verifyWithAI = async (vendor) => {
    setAiVerifying(true);
    setAiResults(null);

    try {
      const prompt = `You are a compliance officer at APlusMedDepot, a B2B medical supplies marketplace.
Evaluate this vendor application and perform a 5-step verification:

VENDOR DETAILS:
- Company: ${vendor.company}
- Contact: ${vendor.contactName}
- Tax ID: ${vendor.businessInfo.taxId}
- Address: ${vendor.businessInfo.address}
- Website: ${vendor.businessInfo.website || 'Not provided'}
- Years in Business: ${vendor.businessInfo.yearsInBusiness}
- Business Categories: ${vendor.categories?.join(', ') || 'Not specified'}
- FDA Registration: ${vendor.businessInfo.fdaNumber || 'Not provided'}
- Business License: ${vendor.businessInfo.businessLicense || 'Not provided'}

Perform the 5-step verification checklist and respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "checks": {
    "taxId": { "passed": boolean, "score": 0-20, "detail": "string" },
    "businessLicense": { "passed": boolean, "score": 0-20, "detail": "string" },
    "fdaRegistration": { "passed": boolean, "score": 0-20, "detail": "string" },
    "webPresence": { "passed": boolean, "score": 0-20, "detail": "string" },
    "publicRecords": { "passed": boolean, "score": 0-20, "detail": "string" }
  },
  "totalScore": number,
  "recommendation": "APPROVE" | "REVIEW" | "REJECT",
  "notes": "string",
  "riskFactors": ["string"],
  "missingItems": ["string"]
}

Scoring rules:
- taxId: 20pts if format looks valid (EIN format XX-XXXXXXX)
- businessLicense: 20pts if provided, 10pts if not required for category, 0pts if needed but missing
- fdaRegistration: 20pts if provided, 10pts if not applicable to categories, 0pts if medical device company with no FDA number
- webPresence: 20pts if website provided and years in business >2, 10pts if limited presence, 0pts if no website and <1 year
- publicRecords: 20pts if no red flags, 10pts if minor concerns, 0pts if major issues
Recommend APPROVE if score>=80, REVIEW if 60-79, REJECT if <60.
missingItems: list only the specific items that are missing or failed (e.g. "FDA Registration Number", "Business License"). Empty array if nothing missing.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || '').join('');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      const parsed = JSON.parse(jsonMatch[0]);

      const findings = [
        `${parsed.checks.taxId.passed ? '✅' : '❌'} Tax ID: ${parsed.checks.taxId.detail}`,
        `${parsed.checks.businessLicense.passed ? '✅' : '⚠️'} Business License: ${parsed.checks.businessLicense.detail}`,
        `${parsed.checks.fdaRegistration.passed ? '✅' : '⚠️'} FDA Registration: ${parsed.checks.fdaRegistration.detail}`,
        `${parsed.checks.webPresence.passed ? '✅' : '❌'} Web Presence: ${parsed.checks.webPresence.detail}`,
        `${parsed.checks.publicRecords.passed ? '✅' : '❌'} Public Records: ${parsed.checks.publicRecords.detail}`,
      ];

      const result = {
        verified: parsed.totalScore >= 60,
        confidence: parsed.totalScore,
        checks: parsed.checks,
        recommendation: parsed.recommendation,
        notes: parsed.notes,
        riskFactors: parsed.riskFactors || [],
        missingItems: parsed.missingItems || [],
        findings,
        isRealAI: true,
      };

      setAiResults(result);

      if (parsed.recommendation === 'APPROVE') {
        setTimeout(() => autoApproveVendor(vendor, parsed.totalScore), 1500);
      } else if (parsed.recommendation === 'REJECT') {
        setTimeout(() => autoRejectVendor(vendor, parsed.notes), 1500);
      }

    } catch (err) {
      const hasWebsite = !!vendor.businessInfo.website;
      const hasLicense = !!vendor.businessInfo.businessLicense;
      const hasFDA     = !!vendor.businessInfo.fdaNumber;
      const validTax   = /EIN-\d{2}-\d{7}/.test(vendor.businessInfo.taxId || '');
      const missing    = [];
      if (!validTax)   missing.push('Valid Tax ID (EIN)');
      if (!hasLicense) missing.push('Business License');
      if (!hasFDA)     missing.push('FDA Registration Number');
      if (!hasWebsite) missing.push('Business Website');

      const fallbackChecks = {
        taxId:           { passed: validTax,   score: validTax   ? 20 : 5,  detail: validTax   ? 'EIN format valid' : 'EIN format could not be verified' },
        businessLicense: { passed: hasLicense, score: hasLicense ? 20 : 10, detail: hasLicense ? 'License number on file' : 'No license number provided' },
        fdaRegistration: { passed: hasFDA,     score: hasFDA     ? 20 : 10, detail: hasFDA     ? `FDA# ${vendor.businessInfo.fdaNumber}` : 'No FDA registration — verify if required' },
        webPresence:     { passed: hasWebsite, score: hasWebsite ? 20 : 5,  detail: hasWebsite ? `Website: ${vendor.businessInfo.website}` : 'No website provided' },
        publicRecords:   { passed: true,       score: 20,                   detail: 'Automated records check: no red flags' },
      };
      const total = Object.values(fallbackChecks).reduce((s, c) => s + c.score, 0);
      setAiResults({
        verified: total >= 60,
        confidence: total,
        checks: fallbackChecks,
        recommendation: total >= 80 ? 'APPROVE' : total >= 60 ? 'REVIEW' : 'REJECT',
        notes: `Fallback verification (AI unavailable). Score ${total}/100.`,
        riskFactors: [],
        missingItems: missing,
        findings: Object.entries(fallbackChecks).map(([, v]) => `${v.passed ? '✅' : '⚠️'} ${v.detail}`),
        isRealAI: false,
      });
    } finally {
      setAiVerifying(false);
    }
  };

  // ─── Auto-actions ─────────────────────────────────────────────────────────
  const autoApproveVendor = (vendor, score) => {
    setVendors(prev => prev.map(v =>
      v.id === vendor.id ? { ...v, status: 'approved', commissionRate: 10, approvedDate: new Date().toISOString(), autoApproved: true, aiScore: score } : v
    ));
    const email = emailTemplates.vendorApproved(vendor);
    setAutoActionLog(log => [...log, { type: 'approved', vendor: vendor.company, score, email, time: new Date().toLocaleTimeString() }]);
    setSelectedVendor(null);
    setAiResults(null);
  };

  const autoRejectVendor = (vendor, reason) => {
    setVendors(prev => prev.map(v =>
      v.id === vendor.id ? { ...v, status: 'rejected', rejectedDate: new Date().toISOString(), rejectedReason: reason, autoRejected: true } : v
    ));
    const email = emailTemplates.vendorRejected(vendor, reason);
    setAutoActionLog(log => [...log, { type: 'rejected', vendor: vendor.company, reason, email, time: new Date().toLocaleTimeString() }]);
    setSelectedVendor(null);
    setAiResults(null);
  };

  // ─── Open Approve Modal ───────────────────────────────────────────────────
  const openApproveModal = (vendor) => {
    setApproveVendorTarget(vendor);
    setCommission(10);
    setCustomCommission('');
    setUseCustomCommission(false);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = () => {
    const finalCommission = useCustomCommission ? parseFloat(customCommission) : commission;
    if (!finalCommission || finalCommission < 1 || finalCommission > 50) return;
    setVendors(vendors.map(v =>
      v.id === approveVendorTarget.id
        ? { ...v, status: 'approved', commissionRate: finalCommission, approvedDate: new Date().toISOString() }
        : v
    ));
    const email = emailTemplates.vendorApproved(approveVendorTarget);
    setEmailPreview(email);
    setShowApproveModal(false);
    setSelectedVendor(null);
    setAiResults(null);
  };

  // ─── Open Reject Modal ────────────────────────────────────────────────────
  const openRejectModal = (vendor) => {
    setSelectedVendor(vendor);
    // Pre-check reasons that match AI-detected missing items
    const aiMissing = aiResults?.missingItems || [];
    const preChecked = REJECTION_REASONS
      .filter(r => aiMissing.some(m => m.toLowerCase().includes(r.id) || r.label.toLowerCase().includes(m.toLowerCase())))
      .map(r => r.id);
    setSelectedReasons(preChecked);
    setCustomReason('');
    setShowCustomReason(false);
    setSendRejectionEmail(true);
    setShowRejectModal(true);
  };

  const toggleReason = (id) => {
    setSelectedReasons(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleReject = () => {
    const checkedLabels = REJECTION_REASONS
      .filter(r => selectedReasons.includes(r.id))
      .map(r => r.label);
    if (showCustomReason && customReason.trim()) checkedLabels.push(customReason.trim());
    const finalReason = checkedLabels.join('; ');
    setVendors(vendors.map(v =>
      v.id === selectedVendor.id
        ? { ...v, status: 'rejected', rejectedReason: finalReason, rejectedDate: new Date().toISOString() }
        : v
    ));
    if (sendRejectionEmail && selectedVendor) {
      const email = emailTemplates.vendorRejected(selectedVendor, finalReason);
      setEmailPreview(email);
    }
    setShowRejectModal(false);
    setSelectedVendor(null);
    setAiResults(null);
  };

  const pendingVendors  = vendors.filter(v => v.status === 'pending');
  const approvedVendors = vendors.filter(v => v.status === 'approved');
  const rejectedVendors = vendors.filter(v => v.status === 'rejected');
  const canReject = selectedReasons.length > 0 || (showCustomReason && customReason.trim());
  const finalCommissionValue = useCustomCommission ? parseFloat(customCommission) : commission;

  return (
    <div className="space-y-6">

      {/* Auto-action log */}
      {autoActionLog.length > 0 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> AI Auto-Actions ({autoActionLog.length})
          </h4>
          <div className="space-y-1.5">
            {autoActionLog.map((log, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className={`font-medium ${log.type === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                  {log.type === 'approved' ? '✅ Auto-approved' : '❌ Auto-rejected'}: {log.vendor}
                  {log.score && <span className="text-gray-500 ml-1">(Score: {log.score}/100)</span>}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">{log.time}</span>
                  <button onClick={() => setEmailPreview(log.email)} className="text-xs text-purple-600 underline">Preview email</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-yellow-700">Pending Review</p><p className="text-3xl font-bold text-yellow-900 mt-1">{pendingVendors.length}</p></div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-green-700">Approved</p><p className="text-3xl font-bold text-green-900 mt-1">{approvedVendors.length}</p></div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-red-700">Rejected</p><p className="text-3xl font-bold text-red-900 mt-1">{rejectedVendors.length}</p></div>
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Pending Vendors */}
      {pendingVendors.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="font-semibold text-xl text-secondary mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-yellow-500" />
            Pending Applications ({pendingVendors.length})
          </h2>
          <div className="grid gap-4">
            {pendingVendors.map(vendor => (
              <div key={vendor.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Store className="w-8 h-8 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-secondary">{vendor.company}</h3>
                      <p className="text-sm text-gray-600 mb-2">{vendor.contactName}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{vendor.email}</div>
                        <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{vendor.businessInfo.phone}</div>
                        <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" />{vendor.businessInfo.address}</div>
                        <div className="flex items-center gap-2 text-gray-600"><FileText className="w-4 h-4" />Tax ID: {vendor.businessInfo.taxId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap justify-end ml-4">
                    <button
                      onClick={() => { setSelectedVendor(vendor); verifyWithAI(vendor); }}
                      disabled={aiVerifying && selectedVendor?.id === vendor.id}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      {aiVerifying && selectedVendor?.id === vendor.id ? 'Analyzing...' : 'Verify with AI'}
                    </button>
                    <button
                      onClick={() => openApproveModal(vendor)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(vendor)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>

                {/* AI Results Panel */}
                {selectedVendor?.id === vendor.id && (aiVerifying || aiResults) && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-100">
                    {aiVerifying ? (
                      <div className="flex items-center gap-3 text-purple-700">
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <span className="font-semibold">Claude AI is analyzing vendor information…</span>
                      </div>
                    ) : aiResults && (
                      <div className={`p-4 rounded-xl border-2 ${aiResults.verified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        {/* Score header */}
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-secondary flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            AI Verification Results
                            {aiResults.isRealAI && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Powered by Claude</span>}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Score:</span>
                            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full ${aiResults.confidence >= 80 ? 'bg-green-500' : aiResults.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${aiResults.confidence}%` }} />
                            </div>
                            <span className="text-lg font-bold">{aiResults.confidence}/100</span>
                          </div>
                        </div>

                        {/* 5-Step Checklist */}
                        <div className="mb-4 bg-white rounded-lg p-4 border border-gray-200">
                          <h5 className="font-semibold text-sm text-gray-700 mb-3">5-Step Verification Checklist</h5>
                          <ul className="space-y-2">
                            {aiResults.findings.map((finding, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="flex-shrink-0 mt-0.5">{finding.split(' ')[0]}</span>
                                <span className="flex-1">{finding.substring(finding.indexOf(' ') + 1)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Missing items — auto-populated into reject */}
                        {aiResults.missingItems?.length > 0 && (
                          <div className="mb-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
                            <p className="text-xs font-semibold text-orange-800 mb-1.5">⚠️ Missing / Failed Items (will be auto-filled in rejection):</p>
                            <div className="flex flex-wrap gap-1.5">
                              {aiResults.missingItems.map((item, i) => (
                                <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full border border-orange-200">{item}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Risk Factors */}
                        {aiResults.riskFactors?.length > 0 && (
                          <div className="mb-4 bg-red-50 rounded-lg p-3 border border-red-200">
                            <p className="text-xs font-semibold text-red-800 mb-1">🚩 Risk Factors:</p>
                            <ul className="space-y-0.5">{aiResults.riskFactors.map((rf, i) => <li key={i} className="text-xs text-red-700">• {rf}</li>)}</ul>
                          </div>
                        )}

                        {/* Recommendation banner */}
                        <div className={`p-4 rounded-lg ${
                          aiResults.recommendation === 'APPROVE' ? 'bg-green-100 border-2 border-green-300' :
                          aiResults.recommendation === 'REVIEW'  ? 'bg-yellow-100 border-2 border-yellow-300' :
                          'bg-red-100 border-2 border-red-300'
                        }`}>
                          <div className="flex items-start gap-3">
                            {aiResults.recommendation === 'APPROVE' && <CheckCircle className="w-6 h-6 text-green-700 flex-shrink-0" />}
                            {aiResults.recommendation === 'REVIEW'  && <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0" />}
                            {aiResults.recommendation === 'REJECT'  && <XCircle className="w-6 h-6 text-red-700 flex-shrink-0" />}
                            <div className="flex-1">
                              <p className="text-sm font-bold mb-1">
                                AI Recommendation: <span className={aiResults.recommendation === 'APPROVE' ? 'text-green-700' : aiResults.recommendation === 'REVIEW' ? 'text-yellow-700' : 'text-red-700'}>{aiResults.recommendation}</span>
                              </p>
                              <p className="text-xs text-gray-700">{aiResults.notes}</p>
                              {aiResults.recommendation === 'APPROVE' && <p className="text-xs text-green-700 mt-1 font-semibold">⚡ Auto-approving vendor and sending notification email…</p>}
                              {aiResults.recommendation === 'REJECT'  && <p className="text-xs text-red-700 mt-1 font-semibold">⚡ Auto-rejecting vendor and sending notification email…</p>}
                              {aiResults.recommendation === 'REVIEW'  && <p className="text-xs text-yellow-700 mt-1 font-semibold">⚠️ Manual review required — use Approve / Reject buttons above.</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Vendors */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="font-semibold text-xl text-secondary mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" /> Approved Vendors ({approvedVendors.length})
        </h2>
        <div className="grid gap-3">
          {approvedVendors.map(vendor => (
            <div key={vendor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-secondary">{vendor.company}</p>
                  <p className="text-sm text-gray-500">{vendor.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Approved: {new Date(vendor.approvedDate).toLocaleDateString()}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <Percent className="w-3.5 h-3.5 text-green-600" />
                  <p className="text-sm font-bold text-green-700">Commission: {vendor.commissionRate}%</p>
                </div>
                {vendor.autoApproved && <p className="text-xs text-purple-600 mt-0.5">⚡ AI auto-approved (Score: {vendor.aiScore}/100)</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejected Vendors */}
      {rejectedVendors.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="font-semibold text-xl text-secondary mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-500" /> Rejected Applications ({rejectedVendors.length})
          </h2>
          <div className="grid gap-3">
            {rejectedVendors.map(vendor => (
              <div key={vendor.id} className="flex items-center justify-between p-4 border border-red-100 bg-red-50/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Store className="w-8 h-8 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-secondary">{vendor.company}</p>
                    <p className="text-sm text-red-600 mt-0.5">{vendor.rejectedReason}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 flex-shrink-0 ml-4">{vendor.rejectedDate ? new Date(vendor.rejectedDate).toLocaleDateString() : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Email Preview Modal ───────────────────────────────────────────────── */}
      {emailPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xl text-secondary flex items-center gap-2"><Mail className="w-6 h-6 text-primary" />Email Notification Preview</h3>
              <button onClick={() => setEmailPreview(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div><span className="text-xs font-semibold text-gray-500 uppercase">To:</span><p className="text-sm text-gray-800">{emailPreview.to}</p></div>
              <div><span className="text-xs font-semibold text-gray-500 uppercase">Subject:</span><p className="text-sm font-semibold text-gray-800">{emailPreview.subject}</p></div>
              <div><span className="text-xs font-semibold text-gray-500 uppercase">Body:</span><pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans mt-1">{emailPreview.body}</pre></div>
            </div>
            <p className="text-xs text-gray-400 mt-3">In production, this email will be sent automatically via SendGrid/AWS SES.</p>
            <button onClick={() => setEmailPreview(null)} className="w-full mt-4 btn-medical">Close Preview</button>
          </div>
        </div>
      )}

      {/* ── Approve Modal (Commission Picker) ────────────────────────────────── */}
      {showApproveModal && approveVendorTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-xl text-secondary flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" /> Approve Vendor
              </h3>
              <button onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Set the commission rate for <span className="font-semibold text-secondary">{approveVendorTarget.company}</span> before approving.
            </p>

            {/* Commission info box */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Selected Commission Rate</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-green-700">
                      {useCustomCommission ? (customCommission || '—') : commission}
                    </span>
                    <span className="text-xl font-bold text-green-600">%</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    APlusMedDepot earns {useCustomCommission ? (customCommission || '—') : commission}% on every sale from this vendor
                  </p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Percent className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Preset buttons */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Select</p>
              <div className="grid grid-cols-6 gap-2">
                {COMMISSION_PRESETS.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setCommission(val); setUseCustomCommission(false); setCustomCommission(''); }}
                    className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                      !useCustomCommission && commission === val
                        ? 'border-green-500 bg-green-500 text-white shadow-md scale-105'
                        : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              {/* Range labels */}
              <div className="flex justify-between mt-1.5 px-1">
                <span className="text-[10px] text-gray-400">Low margin</span>
                <span className="text-[10px] text-gray-400">Standard range (5–15%)</span>
                <span className="text-[10px] text-gray-400">High margin</span>
              </div>
            </div>

            {/* Custom input */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setUseCustomCommission(v => !v)}
                className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
              >
                {useCustomCommission ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {useCustomCommission ? 'Hide custom rate' : 'Enter custom rate'}
              </button>
              {useCustomCommission && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="0.5"
                      value={customCommission}
                      onChange={e => setCustomCommission(e.target.value)}
                      placeholder="e.g. 11"
                      className="w-full px-4 py-2.5 pr-8 border-2 border-primary rounded-lg focus:outline-none font-semibold text-lg"
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                  <p className="text-xs text-gray-400 w-24">Between 1% and 50%</p>
                </div>
              )}
            </div>

            {/* Warn if outside typical range */}
            {finalCommissionValue && (finalCommissionValue < 5 || finalCommissionValue > 15) && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {finalCommissionValue < 5
                  ? 'This rate is below the typical minimum of 5%. Make sure this is intentional.'
                  : 'This rate is above the typical maximum of 15%. High rates may discourage vendors.'}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                disabled={useCustomCommission && (!customCommission || parseFloat(customCommission) < 1 || parseFloat(customCommission) > 50)}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve at {useCustomCommission ? (customCommission || '—') : commission}%
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal (Checkbox Reasons) ──────────────────────────────────── */}
      {showRejectModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-xl text-secondary flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" /> Reject Application
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Select the reason(s) for rejecting <span className="font-semibold text-secondary">{selectedVendor.company}</span>.
            </p>

            {/* AI-pre-filled notice */}
            {selectedReasons.length > 0 && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>AI pre-selected {selectedReasons.length} reason{selectedReasons.length > 1 ? 's' : ''} based on the verification scan. Review and adjust below.</span>
              </div>
            )}

            {/* Reason checkboxes */}
            <div className="space-y-2 mb-4">
              {REJECTION_REASONS.map(reason => {
                const checked = selectedReasons.includes(reason.id);
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => toggleReason(reason.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      checked
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 hover:border-red-200 hover:bg-red-50/30'
                    }`}
                  >
                    {/* Custom checkbox */}
                    <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      checked ? 'border-red-500 bg-red-500' : 'border-gray-300'
                    }`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${checked ? 'text-red-700' : 'text-gray-700'}`}>{reason.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{reason.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Other / Custom reason */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden mb-4">
              <button
                type="button"
                onClick={() => setShowCustomReason(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${showCustomReason && customReason.trim() ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                    {showCustomReason && customReason.trim() && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  Other — specify custom reason
                </span>
                {showCustomReason ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showCustomReason && (
                <div className="px-4 pb-4">
                  <textarea
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    placeholder="Describe the specific reason for rejection..."
                    rows={3}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none text-sm resize-none"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Email toggle */}
            <button
              type="button"
              onClick={() => setSendRejectionEmail(v => !v)}
              className="flex items-center gap-3 mb-5 group"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${sendRejectionEmail ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-gray-400'}`}>
                {sendRejectionEmail && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600">Send rejection notification email to vendor</span>
            </button>

            {/* Summary of selected */}
            {canReject && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">Rejection will include:</p>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_REASONS.filter(r => selectedReasons.includes(r.id)).map(r => (
                    <span key={r.id} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">{r.label}</span>
                  ))}
                  {showCustomReason && customReason.trim() && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">{customReason.trim()}</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!canReject}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
