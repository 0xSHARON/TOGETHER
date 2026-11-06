import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { 
  Crown, 
  Check, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Copy, 
  CheckCheck, 
  Download, 
  Printer, 
  QrCode, 
  CreditCard, 
  Server, 
  User, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';
import { useAuth } from '../context/AuthContext';

export default function PremiumPage({ initialTab = 'plans' }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || initialTab); // 'plans' | 'redeem' | 'invoice'
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  // Checkout & Order State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  // Redeem State
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemGuildId, setRedeemGuildId] = useState('');
  const [redeemGuilds, setRedeemGuilds] = useState([]);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);
  const [redeemError, setRedeemError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Invoice Lookup State
  const [searchInvoiceId, setSearchInvoiceId] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchStatus();
    fetchUserGuilds();
  }, []);

  async function fetchPlans() {
    try {
      const resp = await axios.get('/api/premium/plans');
      if (resp.data?.plans) {
        setPlans(resp.data.plans);
      }
    } catch (err) {
      console.warn("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStatus() {
    try {
      const resp = await axios.get('/api/premium/status', { withCredentials: true });
      if (resp.data?.success) {
        setStatus(resp.data);
      }
    } catch {}
  }

  async function fetchUserGuilds() {
    try {
      const resp = await axios.get('/api/guilds', { withCredentials: true });
      const list = resp.data?.mutualGuilds || resp.data?.guilds || [];
      setRedeemGuilds(list);
      if (list.length > 0 && !redeemGuildId) {
        setRedeemGuildId(list[0].id);
      }
    } catch {}
  }

  async function handleBuyPlan(plan) {
    setSelectedPlan(plan);
    setCheckoutLoading(true);
    setCheckoutResult(null);

    try {
      // 1. Create Order on Backend
      const orderResp = await axios.post('/api/premium/create-order', {
        planId: plan.id,
        currency
      }, { withCredentials: true });

      const orderData = orderResp.data;

      // 2. Complete / Verify Payment (Handles Gateway / Sandbox instant delivery)
      const verifyResp = await axios.post('/api/premium/verify-payment', {
        planId: plan.id,
        currency,
        orderId: orderData.orderId,
        paymentId: `PAY_${Date.now()}`
      }, { withCredentials: true });

      setCheckoutResult(verifyResp.data);
      setInvoiceData({
        invoiceNumber: verifyResp.data.invoiceId,
        date: verifyResp.data.purchasedAt,
        planName: verifyResp.data.planName,
        scope: verifyResp.data.scope,
        durationDays: verifyResp.data.durationDays,
        amount: verifyResp.data.amountPaid,
        currency: verifyResp.data.currency,
        paymentId: verifyResp.data.paymentId,
        code: verifyResp.data.code,
        purchaser: {
          id: user?.id,
          name: user?.username
        },
        company: {
          name: "TOGETHER TECHNOLOGIES // AUDIO OS",
          website: "https://dash.together.dpdns.org",
          support: "https://help.together.dpdns.org"
        }
      });

      await fetchStatus();
    } catch (err) {
      alert(`Checkout failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleRedeemSubmit(e) {
    if (e) e.preventDefault();
    const clean = redeemCode.trim();
    if (!clean || redeemLoading) return;

    setRedeemLoading(true);
    setRedeemResult(null);
    setRedeemError('');

    try {
      const selectedGuild = redeemGuilds.find(g => g.id === redeemGuildId);
      const resp = await axios.post('/api/premium/redeem', {
        code: clean,
        guildId: redeemGuildId || null,
        guildName: selectedGuild?.name || null
      }, { withCredentials: true });

      setRedeemResult(resp.data);
      setRedeemCode('');
      await fetchStatus();
    } catch (err) {
      setRedeemError(err.response?.data?.error || err.message || "Failed to redeem code.");
    } finally {
      setRedeemLoading(false);
    }
  }

  async function handleLookupInvoice(e) {
    if (e) e.preventDefault();
    if (!searchInvoiceId.trim() || invoiceLoading) return;

    setInvoiceLoading(true);
    try {
      const resp = await axios.get(`/api/premium/invoice/${searchInvoiceId.trim()}`, { withCredentials: true });
      if (resp.data?.invoice) {
        setInvoiceData(resp.data.invoice);
      }
    } catch (err) {
      alert(`Invoice lookup failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setInvoiceLoading(false);
    }
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono">
      {/* ─── Level 1: Top Hero Banner ─────────────────────────────── */}
      <div className="border-2 border-brutal-accent bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs uppercase text-brutal-accent font-black tracking-widest">
              OFFICIAL MONETIZATION // 320KBPS LOSSLESS SUITE
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-brutal-text uppercase tracking-tight">
            TOGETHER PREMIUM PASS
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-1 max-w-2xl">
            Upgrade your Discord server or user account. Unlock 24/7 channel locking, full 10-band DSP filters, 200% volume boost, and instant activation keys with official tax invoices.
          </p>
        </div>

        {/* Currency Switcher & User Status Pill */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="border-2 border-black bg-black p-1 flex items-center">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 text-xs font-black uppercase transition-all ${
                currency === 'INR' ? 'bg-brutal-accent text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-black uppercase transition-all ${
                currency === 'USD' ? 'bg-brutal-accent text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>

          {status?.user?.isPremium && (
            <span className="px-3 py-1.5 bg-amber-400 text-black border-2 border-black font-black text-[11px] uppercase flex items-center gap-1.5 shadow-brutal-sm">
              <Crown className="w-3.5 h-3.5" />
              USER VIP ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* ─── Navigation Tabs: Neo-Brutalist Segmented Control ──────── */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-brutal-border pb-3">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 text-xs font-black uppercase border-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'plans'
              ? 'border-brutal-accent bg-brutal-accent text-black shadow-brutal-sm'
              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>[ 1. PRICING PLANS ]</span>
        </button>

        <button
          onClick={() => setActiveTab('redeem')}
          className={`px-4 py-2 text-xs font-black uppercase border-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'redeem'
              ? 'border-amber-400 bg-amber-400 text-black shadow-brutal-sm'
              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>[ 2. REDEEM ACTIVATION CODE ]</span>
        </button>

        <button
          onClick={() => setActiveTab('invoice')}
          className={`px-4 py-2 text-xs font-black uppercase border-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'invoice'
              ? 'border-cyan-400 bg-cyan-400 text-black shadow-brutal-sm'
              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>[ 3. DIGITAL INVOICE VIEWER ]</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: PRICING CARDS & INSTANT CHECKOUT                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'plans' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => {
              const priceDisplay = currency === 'USD' ? `$${p.priceUSD}` : `₹${p.priceINR}`;
              const isGuild = p.scope === 'guild';

              return (
                <div 
                  key={p.id}
                  className={`border-2 flex flex-col justify-between p-6 bg-brutal-surface transition-all ${
                    p.popular 
                      ? 'border-brutal-accent shadow-brutal ring-1 ring-brutal-accent' 
                      : 'border-brutal-border shadow-brutal hover:border-zinc-500'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black ${
                        p.popular ? 'bg-brutal-accent text-black' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {p.badge}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                        {isGuild ? <Server className="w-3 h-3 text-cyan-400" /> : <User className="w-3 h-3 text-purple-400" />}
                        {p.scope.toUpperCase()} PASS
                      </span>
                    </div>

                    {/* Plan Name & Price */}
                    <div>
                      <h3 className="font-display font-black text-xl text-white uppercase">{p.name}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="font-display font-black text-3xl text-brutal-accent">{priceDisplay}</span>
                        <span className="font-mono text-xs text-zinc-500">
                          {p.durationDays === 0 ? '/ ONE-TIME' : '/ 30 DAYS'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Perks Bullet List */}
                    <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-xs">
                      {p.perks.map((perk, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-brutal-accent shrink-0 mt-0.5" />
                          <span className="text-zinc-300 text-[11px]">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buy Button */}
                  <div className="pt-6 mt-6 border-t border-zinc-800">
                    <BrutButton
                      onClick={() => handleBuyPlan(p)}
                      disabled={checkoutLoading}
                      variant={p.popular ? "primary" : "secondary"}
                      className="w-full py-3 text-xs flex items-center justify-center gap-2"
                    >
                      {checkoutLoading && selectedPlan?.id === p.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>INITIALIZING...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4" />
                          <span>GET PASS ({priceDisplay})</span>
                        </>
                      )}
                    </BrutButton>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Payment Gateway Info Notice */}
          <div className="p-4 bg-zinc-950 border-2 border-brutal-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-brutal-accent shrink-0" />
              <div>
                <strong className="text-white block font-bold">100% SECURE CHECKOUT // ZERO HIDDEN FEES</strong>
                <span>Supports all Indian UPI apps (GPay, PhonePe, Paytm), Netbanking, and International Debit/Credit cards.</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">
              INSTANT KEY REDEMPTION + OFFICIAL BILL
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: REDEEM ACTIVATION CODE                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'redeem' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <BrutCard 
            title="REDEEM ACTIVATION KEY" 
            subtitle="Enter your 16-character TOGETHER PREMIUM key obtained after payment or from Discord"
          >
            <form onSubmit={handleRedeemSubmit} className="space-y-4">
              {redeemError && (
                <div className="p-3 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs">
                  ❌ {redeemError}
                </div>
              )}

              {redeemResult && (
                <div className="p-4 bg-emerald-950/80 border-2 border-brutal-accent text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <CheckCheck className="w-5 h-5 text-brutal-accent" />
                    <span>PREMIUM ACTIVATION SUCCESSFUL!</span>
                  </div>
                  <p>{redeemResult.message}</p>
                  <p className="text-[11px] text-zinc-300">
                    Plan: <strong className="text-white uppercase">{redeemResult.plan}</strong> • Target: <strong className="text-white">{redeemResult.targetName}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  16-CHARACTER ACTIVATION KEY
                </label>
                <input 
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="TOGETHER-PREM-XXXX-XXXX"
                  className="w-full bg-zinc-900 border-2 border-brutal-border text-white px-4 py-3 font-mono text-sm tracking-wider font-bold focus:border-amber-400 focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  APPLY TO DISCORD SERVER (IF SERVER KEY)
                </label>
                <select
                  value={redeemGuildId}
                  onChange={(e) => setRedeemGuildId(e.target.value)}
                  className="w-full bg-zinc-900 border-2 border-brutal-border text-white px-3 py-2.5 font-mono text-xs font-bold focus:border-amber-400 focus:outline-none"
                >
                  {redeemGuilds.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.id})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Note: If the key is for a User Account, it activates on your account globally regardless of server selected.
                </span>
              </div>

              <BrutButton
                type="submit"
                disabled={redeemLoading || !redeemCode.trim()}
                variant="primary"
                className="w-full py-3 text-xs flex items-center justify-center gap-2 mt-4"
              >
                {redeemLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>VERIFYING KEY WITH MONGODB...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>ACTIVATE PREMIUM NOW</span>
                  </>
                )}
              </BrutButton>
            </form>
          </BrutCard>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 3: DIGITAL TAX INVOICE & RECEIPT                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {(activeTab === 'invoice' || invoiceData) && (
        <div className="space-y-6 animate-fade-in">
          {/* Invoice Search Bar */}
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleLookupInvoice} className="flex gap-2">
              <input 
                type="text"
                value={searchInvoiceId}
                onChange={(e) => setSearchInvoiceId(e.target.value)}
                placeholder="Search by Invoice ID (e.g. INV-XXXXX)..."
                className="flex-1 bg-zinc-900 border-2 border-brutal-border text-white px-3 py-2 font-mono text-xs focus:border-cyan-400 focus:outline-none uppercase"
              />
              <BrutButton type="submit" disabled={invoiceLoading || !searchInvoiceId.trim()} variant="secondary">
                {invoiceLoading ? "SEARCHING..." : "VIEW BILL"}
              </BrutButton>
            </form>
          </div>

          {/* The Digital Brutalist Bill / Receipt Document */}
          {invoiceData && (
            <div className="max-w-3xl mx-auto border-4 border-black bg-white text-black p-8 shadow-2xl font-mono text-xs space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Receipt Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-black pb-6">
                <div>
                  <h2 className="font-display font-black text-2xl tracking-wider uppercase">
                    TOGETHER TECHNOLOGIES
                  </h2>
                  <p className="text-[11px] text-zinc-600 font-bold uppercase mt-1">
                    AUDIO CLUSTER // DIGITAL TAX INVOICE
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    URL: https://dash.together.dpdns.org
                  </p>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto">
                  <span className="px-3 py-1 bg-black text-white font-black text-[10px] uppercase inline-block">
                    PAID & VERIFIED
                  </span>
                  <p className="font-bold text-sm mt-1">{invoiceData.invoiceNumber}</p>
                  <p className="text-[10px] text-zinc-500">
                    {invoiceData.date ? new Date(invoiceData.date).toLocaleString() : new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Billed To / Transaction Metadata */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-300 text-xs">
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] font-bold block">BILLED TO CUSTOMER:</span>
                  <p className="font-bold text-sm mt-0.5">{invoiceData.purchaser?.name || user?.username || "Verified Member"}</p>
                  <p className="text-zinc-600 text-[11px]">Discord ID: {invoiceData.purchaser?.id || user?.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 uppercase text-[10px] font-bold block">PAYMENT GATEWAY REF:</span>
                  <p className="font-bold text-xs mt-0.5">{invoiceData.paymentId || "ONLINE_GATEWAY"}</p>
                  <p className="text-zinc-600 text-[11px]">Status: Captured 100%</p>
                </div>
              </div>

              {/* Line Item Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black text-[10px] uppercase font-bold text-zinc-600">
                    <th className="py-2">DESCRIPTION</th>
                    <th className="py-2">SCOPE</th>
                    <th className="py-2">DURATION</th>
                    <th className="py-2 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr>
                    <td className="py-3 font-bold text-sm">
                      {invoiceData.planName || "TOGETHER PREMIUM PASS"}
                    </td>
                    <td className="py-3 uppercase text-xs">
                      {invoiceData.scope}
                    </td>
                    <td className="py-3 text-xs">
                      {invoiceData.durationDays === 0 ? "Lifetime" : `${invoiceData.durationDays} Days`}
                    </td>
                    <td className="py-3 text-right font-bold text-sm">
                      {invoiceData.currency} {invoiceData.amount}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Key Box on Receipt */}
              <div className="p-4 bg-zinc-100 border-2 border-black space-y-2">
                <span className="text-[10px] text-zinc-600 font-bold uppercase block">
                  YOUR REDEEM CODE:
                </span>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-lg text-black tracking-widest select-all">
                    {invoiceData.code}
                  </span>
                  <button
                    onClick={() => handleCopy(invoiceData.code)}
                    className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase hover:bg-zinc-800 transition-colors flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? "COPIED" : "COPY KEY"}</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Redeem via Discord: <code>/redeem {invoiceData.code}</code> or on the Redeem tab.
                </p>
              </div>

              {/* Total & Print Actions */}
              <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border-2 border-black bg-black text-white text-xs font-bold uppercase hover:bg-zinc-800 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PRINT / SAVE PDF</span>
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-zinc-600 text-[10px] font-bold block uppercase">TOTAL AMOUNT PAID:</span>
                  <span className="font-display font-black text-2xl text-black">
                    {invoiceData.currency} {invoiceData.amount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
