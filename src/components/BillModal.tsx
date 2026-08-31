import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  MessageCircle, 
  CheckCircle2, 
  QrCode, 
  ArrowLeft, 
  Receipt, 
  FileCheck, 
  MapPin 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerInfo, Invoice, StoreSettings } from '../types';
import { formatCurrency, numberToIndianWords, generateInvoiceNumber, generateWhatsAppMessage, cleanPhoneNumber } from '../lib/utils';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  settings: StoreSettings;
  onOrderCompleted: (invoice: Invoice) => void;
  initialInvoice?: Invoice | null;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  items,
  settings,
  onOrderCompleted,
  initialInvoice
}) => {
  if (!isOpen) return null;

  // Step 1: Customer Details form, Step 2: Generated Tax Invoice View
  const [step, setStep] = useState<'details' | 'invoice'>(initialInvoice ? 'invoice' : 'details');

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    pincode: '845430',
    deliveryType: 'delivery',
    paymentMethod: 'cod',
    notes: ''
  });

  const [invoice, setInvoice] = useState<Invoice | null>(initialInvoice || null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialInvoice) {
        setInvoice(initialInvoice);
        setStep('invoice');
      } else {
        setInvoice(null);
        setStep('details');
      }
    }
  }, [isOpen, initialInvoice]);

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalMrp = items.reduce((sum, item) => sum + (item.product.mrp * item.quantity), 0);
  const totalDiscount = Math.max(0, totalMrp - subtotal);
  const isFreeDelivery = subtotal >= settings.minFreeDelivery;
  const deliveryFee = items.length === 0 || customer.deliveryType === 'pickup' ? 0 : (isFreeDelivery ? 0 : settings.deliveryFee);
  const taxAmount = Math.round((subtotal * 0.05) * 100) / 100; // 5% GST included
  const grandTotal = subtotal + deliveryFee;

  const handleGenerateBill = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim()) {
      alert('Kripya Customer ka Naam zaroor bharein.');
      return;
    }

    const cleanedPhone = cleanPhoneNumber(customer.phone);
    if (!cleanedPhone || cleanedPhone.length < 10) {
      alert('Kripya sahi 10-digit Mobile Number zaroor bharein.');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: generateInvoiceNumber(),
      createdAt: now.toISOString(),
      dateStr,
      timeStr,
      customer: { ...customer, phone: cleanedPhone },
      items: items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        unit: i.product.unit,
        rate: i.product.price,
        mrp: i.product.mrp,
        quantity: i.quantity,
        amount: i.product.price * i.quantity,
        image: i.product.image
      })),
      subtotal,
      discount: totalDiscount,
      deliveryFee,
      taxAmount,
      totalAmount: grandTotal,
      paymentStatus: customer.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid',
      orderStatus: 'New',
      cashierName: 'Admin Counter'
    };

    setInvoice(newInvoice);
    setStep('invoice');
    onOrderCompleted(newInvoice);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!invoice) return;
    const msg = generateWhatsAppMessage(invoice, settings);
    // Open whatsapp with customer phone if valid 10 digits, otherwise store phone
    const cleanedCustomerPhone = cleanPhoneNumber(invoice.customer.phone);
    const cleanedStorePhone = cleanPhoneNumber(settings.phone1);
    const targetPhone = cleanedCustomerPhone.length === 10 ? `91${cleanedCustomerPhone}` : `91${cleanedStorePhone}`;
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        
        {/* Modal Top Header (Hidden in Print) */}
        <div className="no-print p-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === 'invoice' && !initialInvoice && (
              <button
                onClick={() => setStep('details')}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors mr-1"
                title="Back to details"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Receipt className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                {step === 'details' ? 'Customer & Delivery Details' : 'Official Cash Bill / Tax Invoice'}
              </h2>
              <p className="text-xs text-slate-500">
                {step === 'details' ? 'Enter customer details to generate computerized bill' : `Invoice ID: ${invoice?.invoiceNumber}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {step === 'details' && items.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl border border-amber-300">
                🛒
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Cart mein koi saaman nahi hai
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bill generate karne ke liye pehle dukaan se saaman ko <strong>Cart me Add</strong> karein, uske baad Cart se <strong>Generate Bill</strong> par click karein.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#2B4430] hover:bg-[#152A1C] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Dukaan ke Saaman Dekhein (Browse Shop) →
              </button>
            </div>
          ) : step === 'details' ? (
            /* STEP 1: Customer Form */
            <form onSubmit={handleGenerateBill} className="space-y-4 max-w-xl mx-auto">
              
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500">Total Items in Bill:</span>{' '}
                  <strong className="text-slate-900">{items.length} items</strong>
                </div>
                <div>
                  <span className="text-slate-500">Payable Amount:</span>{' '}
                  <strong className="text-emerald-800 font-mono text-base font-extrabold">{formatCurrency(grandTotal)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar / Imran Khan"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Customer Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Delivery Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Order Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${customer.deliveryType === 'delivery' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={customer.deliveryType === 'delivery'}
                      onChange={() => setCustomer({ ...customer, deliveryType: 'delivery' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>🚚 Home Delivery (Ghar Tak)</span>
                  </label>

                  <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${customer.deliveryType === 'pickup' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={customer.deliveryType === 'pickup'}
                      onChange={() => setCustomer({ ...customer, deliveryType: 'pickup' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>🏪 Store Counter Pickup</span>
                  </label>
                </div>
              </div>

              {/* Address (If Delivery) */}
              {customer.deliveryType === 'delivery' && (
                <div className="space-y-3">
                  {/* Delivery Radius Notice Banner */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Delivery strictly within {settings.deliveryRadiusKm ?? 1} km radius only (दुकान से 1 किमी तक)</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Kripya dhyan dein: Home delivery keval dukaan se 1 km ke daayre mein uplabdh hai. 
                        <a 
                          href={settings.googleMapsUrl || 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-bold text-amber-950 underline ml-1 hover:text-amber-800"
                        >
                          Google Maps par shop location dekhein ↗
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Delivery Address / House No.</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. House No. 42, Gali No. 3, Near Mosque, Main Bazaar"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Water Tank"
                        value={customer.landmark}
                        onChange={(e) => setCustomer({ ...customer, landmark: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Pin Code</label>
                      <input
                        type="text"
                        placeholder="800001"
                        value={customer.pincode}
                        onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Mode Selection */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-slate-700">Payment Option</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <label className={`p-2.5 rounded-xl border cursor-pointer font-semibold flex items-center gap-2 ${customer.paymentMethod === 'cod' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={customer.paymentMethod === 'cod'}
                      onChange={() => setCustomer({ ...customer, paymentMethod: 'cod' })}
                    />
                    <span>💵 Cash on Delivery</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer font-semibold flex items-center gap-2 ${customer.paymentMethod === 'upi' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={customer.paymentMethod === 'upi'}
                      onChange={() => setCustomer({ ...customer, paymentMethod: 'upi' })}
                    />
                    <span>📱 UPI QR / GPay</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer font-semibold flex items-center gap-2 ${customer.paymentMethod === 'counter_cash' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={customer.paymentMethod === 'counter_cash'}
                      onChange={() => setCustomer({ ...customer, paymentMethod: 'counter_cash' })}
                    />
                    <span>🧾 Counter Cash</span>
                  </label>
                </div>
              </div>

              {/* Submit / Generate Bill Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileCheck className="w-5 h-5" />
                  <span>Generate Computerized Bill Now</span>
                </button>
              </div>

            </form>
          ) : (
            /* STEP 2: TAX INVOICE RECEIPT VIEW */
            invoice && (
              <div className="space-y-4">
                
                {/* Action Buttons Toolbar (Hidden on Print) */}
                <div className="no-print flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bill Successfully Generated!</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Print Button */}
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs cursor-pointer transition-colors"
                      title="Print Official Bill"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Print Bill (प्रिंट)</span>
                    </button>

                    {/* WhatsApp Bill Share */}
                    <button
                      onClick={handleWhatsAppShare}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                      title="Share Bill via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Bill</span>
                    </button>

                    {/* UPI QR Code Trigger */}
                    <button
                      onClick={() => setShowQrModal(!showQrModal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>UPI QR Pay</span>
                    </button>
                  </div>
                </div>

                {/* QR Code Quick Panel if toggled */}
                {showQrModal && (
                  <div className="no-print p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-700">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Instant UPI Payment</span>
                      <h4 className="font-bold text-base">Scan to Pay {formatCurrency(invoice.totalAmount)}</h4>
                      <p className="text-xs text-slate-300">Google Pay, PhonePe, Paytm, BHIM</p>
                      <div className="font-mono text-xs bg-black/30 px-2 py-1 rounded inline-block text-emerald-200 mt-1">
                        UPI ID: {settings.upiId}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl shadow-md shrink-0 flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=4&data=${encodeURIComponent(
                          `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.storeName)}&am=${invoice.totalAmount}&cu=INR`
                        )}`}
                        alt="UPI Payment QR Code"
                        className="w-28 h-28 object-contain rounded-lg border border-slate-200"
                        onError={(e) => {
                          // Fallback to SVG placeholder if offline
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-[11px] text-slate-900 font-bold mt-1 font-mono">₹{invoice.totalAmount}</span>
                    </div>
                  </div>
                )}

                {/* THE PRINTABLE INVOICE CONTAINER */}
                <div 
                  id="printable-invoice"
                  className="bg-white p-3.5 sm:p-7 rounded-2xl border-2 border-slate-300 text-slate-900 shadow-sm font-sans w-full max-w-full overflow-hidden"
                >
                  
                  {/* Bill Header */}
                  <div className="border-b-2 border-slate-800 pb-4 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="inline-block bg-slate-900 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest mb-1">
                          RETAIL CASH MEMO / TAX INVOICE
                        </div>
                        <h1 className="font-display text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                          {settings.storeName.toUpperCase()}
                        </h1>
                        <p className="text-xs text-slate-600 font-medium max-w-md">
                          {settings.address}, {settings.cityState}
                        </p>
                      </div>

                      {/* Store Contacts Box */}
                      <div className="text-xs text-left sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <div className="font-bold text-slate-900">
                          📞 Phone 1: <span className="font-mono">{settings.phone1}</span>
                        </div>
                        <div className="font-bold text-slate-900">
                          📞 Phone 2: <span className="font-mono">{settings.phone2}</span>
                        </div>
                        {settings.email && (
                          <div className="text-slate-600">
                            ✉️ {settings.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Meta and Customer Information Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-4">
                    <div className="space-y-1">
                      <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Customer Details</div>
                      <div className="font-bold text-slate-900 text-sm">{invoice.customer.name}</div>
                      <div>Phone: <strong className="font-mono">{invoice.customer.phone}</strong></div>
                      {invoice.customer.address && (
                        <div className="text-slate-700">Address: {invoice.customer.address} {invoice.customer.landmark ? `(Near ${invoice.customer.landmark})` : ''}</div>
                      )}
                      <div>Order Type: <strong className="uppercase">{invoice.customer.deliveryType === 'delivery' ? 'Home Delivery' : 'Counter Pickup'}</strong></div>
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Invoice Meta</div>
                      <div>Invoice No: <strong className="font-mono text-emerald-800 text-sm font-bold">{invoice.invoiceNumber}</strong></div>
                      <div>Date: <span className="font-mono font-medium">{invoice.dateStr}</span> | Time: <span className="font-mono font-medium">{invoice.timeStr}</span></div>
                      <div>Payment Status: <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">{invoice.paymentStatus}</span></div>
                      <div>Mode: <strong className="uppercase font-mono">{invoice.customer.paymentMethod}</strong></div>
                    </div>
                  </div>

                  {/* Itemized Table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-800 bg-slate-100/80 text-slate-800">
                          <th className="py-2 px-2 text-center w-10">S.N.</th>
                          <th className="py-2 px-3">Item Description (Saaman)</th>
                          <th className="py-2 px-2 text-center">Unit</th>
                          <th className="py-2 px-2 text-right">MRP (₹)</th>
                          <th className="py-2 px-2 text-right">Rate (₹)</th>
                          <th className="py-2 px-2 text-center">Qty</th>
                          <th className="py-2 px-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {invoice.items.map((item, index) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-2 text-center text-slate-500 font-mono">{index + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {item.name}
                            </td>
                            <td className="py-2 px-2 text-center text-slate-600 font-mono">{item.unit}</td>
                            <td className="py-2 px-2 text-right text-slate-400 font-mono line-through">₹{item.mrp}</td>
                            <td className="py-2 px-2 text-right font-mono text-slate-800">₹{item.rate}</td>
                            <td className="py-2 px-2 text-center font-bold text-slate-900 font-mono">{item.quantity}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-950 font-mono">₹{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculation and Total Section */}
                  <div className="border-t-2 border-slate-800 pt-3 grid grid-cols-1 sm:grid-cols-12 gap-4">
                    
                    {/* Left: Terms & Signature Box */}
                    <div className="sm:col-span-7 space-y-2 text-[11px] text-slate-600">
                      <div>
                        <span className="font-bold text-slate-800">Amount in Words:</span>
                        <div className="font-semibold text-emerald-900 italic mt-0.5 bg-emerald-50/70 p-1.5 rounded border border-emerald-200/50">
                          {numberToIndianWords(invoice.totalAmount)}
                        </div>
                      </div>

                      <div className="text-[10px] space-y-0.5 pt-1 text-slate-500">
                        <p>1. Shuddh aur taaza saaman ki 100% guarantee.</p>
                        <p>2. Goods once sold can be replaced within 2 days with bill.</p>
                        <p>3. All disputes subject to local jurisdiction.</p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-slate-400 text-[10px]">Cashier / Billed By</div>
                          <div className="font-bold text-slate-700">Khurshid Store Staff</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400 text-[10px]">Authorized Signatory</div>
                          <div className="font-bold text-slate-800 font-display">For Khurshid General Store</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Calculations Totals */}
                    <div className="sm:col-span-5 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Items Subtotal:</span>
                        <span className="font-mono font-semibold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
                      </div>

                      {invoice.discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Total Savings / Discount:</span>
                          <span className="font-mono">- {formatCurrency(invoice.discount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-600">
                        <span>Delivery Charges:</span>
                        <span className="font-mono">
                          {invoice.deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatCurrency(invoice.deliveryFee)}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Taxes (GST 5% Included):</span>
                        <span className="font-mono">{formatCurrency(invoice.taxAmount)}</span>
                      </div>

                      <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                        <span>FINAL PAYABLE:</span>
                        <span className="font-mono text-emerald-800 text-lg">{formatCurrency(invoice.totalAmount)}</span>
                      </div>
                    </div>

                  </div>

                  {/* Footer Greetings */}
                  <div className="text-center text-xs font-semibold text-slate-700 mt-5 pt-3 border-t border-dashed border-slate-300">
                    🙏 Aapke Vishwas ke Liye Dhanyawaad! Visit Again! 🙏
                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
};
