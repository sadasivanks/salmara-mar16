import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  Loader2, 
  AlertCircle,
  Calendar,
  Box,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TimelineStep, TrackingEvent } from '@/types/tracking';
import { markCurrentStep } from '@/lib/utils';


const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const awbParam = searchParams.get('awb');
  const orderIdParam = searchParams.get('order');
  const emailParam = searchParams.get('email');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [shopifyOrder, setShopifyOrder] = useState<any>(null);
  const [awb, setAwb] = useState<string | null>(awbParam);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let awbToUse = awbParam;
        let finalOrder = null;

        // If we don't have an AWB but have order + email, fetch order first
        if (!awbToUse && orderIdParam && emailParam) {
          // Attempt 1: Fetch by exact GID
          const fetchById = async (id: string) => {
            const res = await fetch('/api/shopify-admin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  query getOrder($id: ID!) {
                    order(id: $id) {
                      id
                      name
                      email
                      processedAt
                      displayFulfillmentStatus
                      fulfillments(first: 5) {
                        trackingInfo(first: 5) {
                          number
                        }
                      }
                    }
                  }
                `,
                variables: { id: id.startsWith('gid://') ? id : `gid://shopify/Order/${id}` }
              })
            });
            return (await res.json())?.data?.order;
          };

          // Attempt 2: Search by Name (fallback for users entering #1069)
          const fetchByName = async (name: string) => {
            const formattedName = name.startsWith('#') ? name : `#${name}`;
            const res = await fetch('/api/shopify-admin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  query findOrder($query: String!) {
                    orders(first: 1, query: $query) {
                      edges {
                        node {
                          id
                          name
                          email
                          processedAt
                          displayFulfillmentStatus
                          fulfillments(first: 5) {
                            trackingInfo(first: 5) {
                              number
                            }
                          }
                        }
                      }
                    }
                  }
                `,
                variables: { query: `name:${formattedName}` }
              })
            });
            return (await res.json())?.data?.orders?.edges?.[0]?.node;
          };

          finalOrder = await fetchById(orderIdParam);
          if (!finalOrder) {
            finalOrder = await fetchByName(orderIdParam);
          }

          if (!finalOrder) {
            setError('Order not found. Please check the Order Number.');
            setLoading(false);
            return;
          }

          // Security check: simple email match
          if (finalOrder.email.toLowerCase() !== emailParam.toLowerCase()) {
            setError('Package shipped! We are currently coordinating with our courier to secure your tracking number. This usually takes 3–5 minutes');
            setLoading(false);
            return;
          }

          setShopifyOrder(finalOrder);
          
          const fulfillmentStatus = (finalOrder.displayFulfillmentStatus || '').toUpperCase();
          const isActuallyFulfilled = fulfillmentStatus === 'FULFILLED' || fulfillmentStatus === 'PARTIALLY_FULFILLED';

          // Find the latest AWB from any fulfillment
          const trackingNumbers = finalOrder.fulfillments
            ?.flatMap((f: any) => f.trackingInfo?.map((t: any) => t.number))
            .filter(Boolean);
          
          // ⚠️ Sync Logic: If an order ID exists and it's NOT fulfilled, we IGNORE the AWB param
          // This prevents stale dashboards or old links from forcing an old AWB on a reset order.
          if (isActuallyFulfilled) {
            awbToUse = awbParam || trackingNumbers?.[trackingNumbers.length - 1] || null;
          } else if (awbParam && !orderIdParam) {
            // Direct AWB search with no order context - allow it as a direct lookup
            awbToUse = awbParam;
          } else {
            // Unfulfilled or reset order - force AWB to null to show fresh timeline
            awbToUse = null;
          }
          
          setAwb(awbToUse);
        }

        if (!awbToUse) {
          if (finalOrder || orderIdParam) {
            // Order found but no shipping label yet
            setLoading(false);
            return;
          }
          setError('Invalid tracking request. Please provide an AWB or Order Number.');
          setLoading(false);
          return;
        }

        // Fetch Shiprocket Data
        try {
          const trackRes = await fetch(`/api/shiprocket?action=track&awb=${awbToUse}`);
          
          if (!trackRes.ok) {
            // Handle case where Shiprocket returns an error (like 404 or 401)
            const errorData = await trackRes.json().catch(() => ({}));
            console.warn('Shiprocket tracking fetch failed, using fallback:', errorData);
            setTrackingData({ 
              status: 'Awaiting Pickup', 
              awb: awbToUse,
              message: 'Tracking information is not yet active. This usually happens right after an order is fulfilled and can take 24-48 hours to update.'
            });
            setLoading(false);
            return;
          }

          const shipData = await trackRes.json();
          if (shipData.status === 200 && shipData.tracking_data) {
            setTrackingData(shipData.tracking_data);
          } else {
            // If Shiprocket fails logic but we have AWB, it's likely just generated/pending
            setTrackingData({ 
              status: 'Awaiting Pickup', 
              awb: awbToUse,
              message: shipData.message || 'The logistics provider has assigned a tracking ID, but the package is still awaiting pickup.'
            });
          }
        } catch (shipErr) {
          console.error('Shiprocket Fetch Error:', shipErr);
          // Don't set global error here, just show "Awaiting Pickup" as it's the safest fallback for a valid AWB
          setTrackingData({ status: 'Awaiting Pickup', awb: awbToUse });
        }
      } catch (err: any) {
        console.error('Tracking Overall Error:', err);
        setError(err.message || 'Something went wrong while retrieving your order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [awbParam, orderIdParam, emailParam]);

  const mapShiprocketStatus = (status: string): string => {
    const s = status?.toUpperCase() || '';
    if (s.includes('DELIVERED')) return 'Delivered';
    if (s.includes('OFD') || s.includes('OUT FOR DELIVERY')) return 'Out for Delivery';
    if (s.includes('TRANSIT')) return 'In Transit';
    if (s.includes('SHIPPED') || s.includes('AWB') || s.includes('NEW') || s.includes('PICKED UP') || s.includes('PICKUP')) return 'Shipped';
    if (s.includes('CANCEL')) return 'Cancelled';
    if (s.includes('RTO') || s.includes('RETURN') || s.includes('NFI')) return 'Returned to Origin';
    return 'In Transit'; // Default for logistics
  };

  const generateTimeline = (): TimelineStep[] => {
    const isPaid = (shopifyOrder?.displayFinancialStatus || '').toUpperCase() === 'PAID';
    const isFulfilled = (shopifyOrder?.displayFulfillmentStatus || '').toUpperCase() === 'FULFILLED';
    const hasShipment = !!awb;

    // 1. Initial Shopify Steps
    const steps: TimelineStep[] = [
      {
        status: 'Order Placed',
        completed: true,
        date: shopifyOrder?.processedAt || null,
        icon: <Package className="h-5 w-5" />,
      },
      {
        status: 'Payment Confirmed',
        completed: isPaid,
        icon: <CheckCircle2 className="h-5 w-5" />,
      },
      {
        status: 'Preparing for Shipment',
        completed: isPaid && (isFulfilled || hasShipment),
        icon: <Box className="h-5 w-5" />,
      },
    ];

    // 🚫 If no shipment yet OR if Shopify says the order is not yet fulfilled (ignore stale AWBs) → return only Shopify steps
    // Unless the user explicitly entered an AWB in the URL
    const isExplicitAwb = !!awbParam;
    const fulfillmentStatus = (shopifyOrder?.displayFulfillmentStatus || '').toUpperCase();
    const isNotFulfilled = fulfillmentStatus !== 'FULFILLED' && fulfillmentStatus !== 'PARTIALLY_FULFILLED';

    if ((!hasShipment && !trackingData) || (isNotFulfilled && !isExplicitAwb)) {
      return markCurrentStep(steps);
    }

    // 🔄 Shiprocket status mapping
    const srStatusRaw = trackingData?.track_status || trackingData?.status || 'AWAITING PICKUP';
    const mappedStatus = mapShiprocketStatus(srStatusRaw);

    // ❌ Handle Hard States
    if (mappedStatus === 'Cancelled') {
      steps.push({
        status: 'Cancelled',
        completed: true,
        icon: <AlertCircle className="h-5 w-5" />,
        isError: true,
      });
      return markCurrentStep(steps);
    }

    if (mappedStatus === 'Returned to Origin') {
      steps.push({
        status: 'Returned to Origin',
        completed: true,
        icon: <AlertCircle className="h-5 w-5" />,
        isError: true,
      });
      return markCurrentStep(steps);
    }

    // 🚚 Logistics Sequence
    const logisticsMilestones = [
      { status: 'Shipped', icon: <Truck className="h-5 w-5" /> },
      { status: 'In Transit', icon: <MapPin className="h-5 w-5" /> },
      { status: 'Out for Delivery', icon: <Truck className="h-5 w-5" /> },
      { status: 'Delivered', icon: <CheckCircle2 className="h-5 w-5" /> },
    ];

    const milestoneOrder = ['Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
    const currentIndex = milestoneOrder.indexOf(mappedStatus);

    // 📏 Cumulative Correction:
    // If we have reached ANY logistics status (Shipped or later), 
    // force "Preparing for Shipment" to be completed.
    if (currentIndex >= 0) {
      steps[2].completed = true;
    }

    logisticsMilestones.forEach((step, idx) => {
      const isCompleted = currentIndex >= idx;
      const isCurrent = currentIndex === idx;

      let stageDate = null;
      if (isCompleted && trackingData?.shipment_track_activities?.length) {
        const activities = [...trackingData.shipment_track_activities].reverse();
        const match = activities.find(a => {
          const act = (a.activity || a.status || '').toUpperCase();
          if (step.status === 'Shipped') return act.includes('PICKED UP') || act.includes('SHIPPED') || act.includes('MANIFEST') || act.includes('AWB');
          if (step.status === 'In Transit') return act.includes('TRANSIT') || act.includes('ARRIVED') || act.includes('DEPARTED') || act.includes('HUB');
          if (step.status === 'Out for Delivery') return act.includes('OUT FOR DELIVERY') || act.includes('OFD');
          if (step.status === 'Delivered') return act.includes('DELIVERED') || act.includes('DLVD');
          return false;
        });
        stageDate = match?.date || trackingData.shipment_track_activities[0]?.date;
      }

      steps.push({
        ...step,
        completed: isCompleted,
        isCurrent: isCurrent,
        date: stageDate,
      });
    });

    return markCurrentStep(steps);
  };

  const timeline = generateTimeline();
  const currentStatus = trackingData?.track_status || trackingData?.status || 'Processing';
  const trackUrl = trackingData?.track_url || shopifyOrder?.fulfillments?.[0]?.trackingInfo?.[0]?.url;
  const events: TrackingEvent[] = trackingData?.shipment_track_activities || [];
  const estDeliveryDate = trackingData?.expected_delivery_date || trackingData?.etd;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />

      <main className="py-6 md:py-8 lg:py-10 xl:py-12">
        <div className="container px-4 mx-auto max-w-4xl">
          {/* Back Link */}
          <Link 
            to={localStorage.getItem('shopify_customer_session') ? "/dashboard?tab=orders" : "/shop"} 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 hover:text-[#5A7A5C] mb-6 md:mb-8 transition-all group"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
            {localStorage.getItem('shopify_customer_session') ? "Back to Dashboard" : "Back to Shop"}
          </Link>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 text-[#5A7A5C] animate-spin" />
              <p className="text-sm text-[#1A2E35]/40 font-sans-clean">Retrieving live tracking updates...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-[#F2EDE4] space-y-6">
              <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-medium text-[#1A2E35]">Tracking Unavailable</h1>
                <p className="text-sm text-[#1A2E35]/60 mt-2">{error}</p>
              </div>
              <Link 
                to={localStorage.getItem('shopify_customer_session') ? "/dashboard" : "/shop"} 
                className="inline-block px-8 py-4 bg-[#5A7A5C] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#4a654c] transition-all"
              >
                {localStorage.getItem('shopify_customer_session') ? "Go to Dashboard" : "Browse Products"}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Compact Header Card */}
              <div className="bg-[#1A2E35] rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-[#1A2E35]/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex px-2.5 py-1 bg-[#5A7A5C] rounded-md text-[8px] font-bold uppercase tracking-[0.2em]">
                      {currentStatus}
                    </div>
                    <div>
                  <h1 className="text-2xl md:text-4xl font-display font-medium text-white mb-2">
  {shopifyOrder?.name ? (
    <span className="font-mono tracking-wider">
      {shopifyOrder.name}
    </span>
  ) : orderIdParam ? (
    <span className="font-mono tracking-wider">
      #{orderIdParam}
    </span>
  ) : awbParam ? (
    <span className="font-mono tracking-wider">
      {awbParam}
    </span>
  ) : (
    'Order Tracking'
  )}
</h1>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] md:text-xs text-white/50 font-sans-clean">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" /> 
                          <span>Ordered: {new Date(shopifyOrder?.processedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {(awbParam || trackingData?.awb) && (
                          <div className="flex items-center gap-2 border-l border-white/10 pl-5">
                            <Box className="h-3.5 w-3.5" /> 
                            <span className="font-mono text-[10px] tracking-wider">{awbParam || trackingData?.awb}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {trackUrl && (
                    <a 
                      href={trackUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all backdrop-blur-sm border border-white/5"
                    >
                      Track via Partner <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Assistance Row */}
              <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-[#F2EDE4]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-[#C5A059]/5 rounded-lg flex items-center justify-center text-[#C5A059]">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1A2E35] uppercase tracking-widest">Need help?</span>
                </div>
                <a 
                  href="https://wa.me/919353436373"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[#5A7A5C] uppercase tracking-widest border-b border-transparent hover:border-[#5A7A5C] transition-all"
                >
                  WhatsApp Support
                </a>
              </div>

              {/* Timeline Section */}
              <div className="bg-white rounded-[40px] p-6 md:p-8 lg:p-10 xl:p-12 border border-[#F2EDE4] relative overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 lg:mb-10 xl:mb-12 gap-4">
                  <div>
                    <h2 className="text-2xl font-display font-medium text-[#1A2E35]">Delivery Progress</h2>
                    {estDeliveryDate && (
                      <p className="text-xs text-[#5A7A5C] font-bold uppercase tracking-widest mt-1">
                        Estimated Delivery: {new Date(estDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-[#5A7A5C]/5 px-4 py-2 rounded-xl border border-[#5A7A5C]/10 w-fit">
                    <div className="h-2 w-2 bg-[#5A7A5C] rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-[#5A7A5C] uppercase tracking-widest">Live Updates</span>
                  </div>
                </div>

                {trackingData?.message && (
                  <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start animate-in fade-in slide-in-from-top-4 duration-500">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed font-sans-clean">
                      <span className="font-bold uppercase tracking-wider block mb-1">Update</span>
                      {trackingData.message}
                    </p>
                  </div>
                )}

                <div className="relative space-y-0">
                  {timeline.map((step, idx) => (
                    <div key={idx} className="flex gap-8 relative pb-12 last:pb-0">
                      {/* Vertical Line */}
                      {idx !== timeline.length - 1 && (
                        <div className={`absolute left-5 top-10 w-[2px] h-full ${
                          step.completed ? 'bg-[#5A7A5C]' : 'bg-[#F2EDE4]'
                        }`} />
                      )}

                      {/* Icon Circle */}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center relative z-10 shrink-0 shadow-lg transition-all duration-500 ${
                        step.completed 
                          ? step.isError ? 'bg-red-500 text-white shadow-red-200' : 'bg-[#5A7A5C] text-white shadow-[#5A7A5C]/20' 
                          : step.isCurrent ? 'bg-[#5A7A5C] text-white shadow-[#5A7A5C]/20' : 'bg-slate-100 text-slate-300 shadow-none border border-slate-200'
                      }`}>
                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                      </div>

                      {/* Content */}
                      <div className="pt-1.5 space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className={`text-lg font-display font-medium transition-colors ${
                            step.completed || step.isCurrent ? 'text-[#1A2E35]' : 'text-slate-400'
                          }`}>
                            {step.status}
                          </h4>
                          {step.date && (
                            <span className="text-[10px] text-[#1A2E35]/30 font-sans-clean">
                              {new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-sans-clean max-w-md transition-colors ${
                          step.completed || step.isCurrent ? 'text-[#1A2E35]/50' : 'text-slate-300'
                        }`}>
                          {step.status === 'Order Placed' && "Your order has been confirmed and we're starting the wellness journey."}
                          {step.status === 'Payment Confirmed' && "Payment successfully received and verified."}
                          {step.status === 'Preparing for Shipment' && "Our quality team is verifying and packing your items for safe transit."}
                          {step.status === 'Shipped' && (step.completed ? "The package has been handed over to our logistics partner." : "Awaiting pickup by our courier partner.")}
                          {step.status === 'In Transit' && (step.completed ? "Your package is moving through our logistics network." : "Updates will appear as the package moves.")}
                          {step.status === 'Out for Delivery' && (step.completed ? "Your package is with the delivery executive." : "Almost there! Delivery scheduled soon.")}
                          {step.status === 'Delivered' && (step.completed ? "Successfully delivered to your destination." : "Expected arrival today.")}
                          {step.status === 'Cancelled' && "This order has been cancelled."}
                          {step.status === 'Returned to Origin' && "The package is being returned to our warehouse."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking Events Fallback/Expansion */}
                {events.length > 5 && (
                  <div className="mt-6 md:mt-8 lg:mt-10 xl:mt-12 pt-6 md:pt-8 lg:pt-10 xl:pt-12 border-t border-[#F2EDE4]">
                    <h3 className="text-xs font-bold text-[#1A2E35]/40 uppercase tracking-widest mb-6">Detailed Activity</h3>
                    <div className="space-y-6">
                      {events.slice(0, 5).map((event, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#5A7A5C] mt-2 shrink-0" />
                          <div>
                            <p className="text-sm text-[#1A2E35] font-medium">{event.activity || event.status}</p>
                            <p className="text-[10px] text-[#1A2E35]/40 uppercase tracking-wider mt-0.5">
                              {event.location && `${event.location} • `} 
                              {new Date(event.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
