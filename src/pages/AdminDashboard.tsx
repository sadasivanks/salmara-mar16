import React, { useState, useEffect } from "react";
import { 
  Users, 
  MessageSquare, 
  Clock,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    testimonials: 0,
    subscribers: 0,
  });
  const [doubtsCount, setDoubtsCount] = useState(0);
  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: testimonialCount } = await supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true });
        
        const { count: activeSubscribers } = await supabase
          .from("subscribes")
          .select("*", { count: "exact", head: true })
          .eq("is_subscribed", true);

        const { count: doubts } = await supabase.from('user_doubt').select('*', { count: 'exact', head: true });
        const { count: enquiries } = await supabase.from('contact_us').select('*', { count: 'exact', head: true });
        
        setStats({
          testimonials: testimonialCount || 0,
          subscribers: activeSubscribers || 0,
        });
        setDoubtsCount(doubts || 0);
        setEnquiriesCount(enquiries || 0);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, label, value, path, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] border border-[#F2EDE4] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110 ${color.split(' ')[0]}`} />
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <Link to={path} className="p-2 text-[#1A2E35]/10 hover:text-[#C5A059] transition-colors">
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-1">{label}</p>
      <h3 className="text-4xl font-[Inter] font-semibold text-[#1A2E35] tracking-tight">
        {loading ? "..." : value}
      </h3>
    </motion.div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[#C5A059] font-sans-clean text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            Overview
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-medium text-[#1A2E35]"
          >
            Dashboard
          </motion.h1>
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#F2EDE4] rounded-2xl px-6 py-3 shadow-sm">
          <Clock className="h-4 w-4 text-[#1A2E35]/30" />
          <span className="text-sm font-bold text-[#1A2E35]">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={MessageSquare} 
          label="Testimonials" 
          value={stats.testimonials} 
          path="/admin-salmara/testimonials"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={Users} 
          label="Active Subscribers" 
          value={stats.subscribers} 
          path="/admin-salmara/subscribers"
          color="bg-[#5A7A5C]/10 text-[#5A7A5C]"
        />
        <StatCard 
          icon={HelpCircle} 
          label="User Doubts" 
          value={doubtsCount} 
          path="/admin-salmara/user-doubts"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard 
          icon={MessageSquare} 
          label="General Enquiries" 
          value={enquiriesCount} 
          path="/admin-salmara/enquiries"
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#FDFBF7] border border-[#F2EDE4] rounded-[2.5rem] p-10 flex flex-col justify-between group"
        >
          <div className="space-y-4">
             <div className="h-12 w-12 rounded-2xl bg-white border border-[#F2EDE4] flex items-center justify-center text-[#C5A059] group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
             </div>
             <div>
                <h4 className="text-2xl font-display font-medium text-[#1A2E35]">Engagement Insights</h4>
                <p className="text-sm text-[#1A2E35]/40 italic mt-2 leading-relaxed">
                   Your community is growing. We've seen a consistent flow of inquiries and feedback this week.
                </p>
             </div>
          </div>
          <Link to="/admin-salmara/testimonials" className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35] group-hover:text-[#C5A059] transition-colors">
             Manage Proof <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A2E35] rounded-[2.5rem] p-10 text-white flex flex-col justify-between group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-[#C5A059]/20 transition-all duration-700" />
          <div className="space-y-4 relative z-10">
             <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.3em]">Next Steps</p>
             <h4 className="text-2xl font-display font-medium">Ready for your next campaign?</h4>
             <p className="text-[#F2EDE4]/40 text-sm italic leading-relaxed">
                Export your current subscriber list to reach out with personalized Ayurvedic wisdom.
             </p>
          </div>
          <Link to="/admin-salmara/subscribers" className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#C5A059] group-hover:text-white transition-colors relative z-10">
             Export Audience <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;

