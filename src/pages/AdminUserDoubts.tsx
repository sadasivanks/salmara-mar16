import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Mail, 
  Download,
  Loader2,
  User,
  Calendar,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserDoubt {
  id: number;
  name: string;
  email: string;
  message: string;
  status?: 'pending' | 'resolved';
  created_at: string;
}

const AdminUserDoubts = () => {
  const [doubts, setDoubts] = useState<UserDoubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_doubt")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoubts(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch user doubts");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus?: string) => {
    const isPending = !currentStatus || currentStatus === "pending" || currentStatus === "active";
    const newStatus = isPending ? "resolved" : "pending";
    try {
      const { error } = await supabase
        .from("user_doubt")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      setDoubts(prev => prev.map(d => d.id === id ? { ...d, status: newStatus as any } : d));
      toast.success(`Marked as ${newStatus}`);
    } catch (error: any) {
      console.error("Status update error:", error);
      toast.error("Status update failed. Please ensure 'status' column exists in Supabase.");
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleDelete = async (id: number) => {
    // if (!confirm("Remove this entry?")) return;
    try {
      const { error } = await supabase
        .from("user_doubt")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      setDoubts(prev => prev.filter(d => d.id !== id));
      toast.success("Entry removed");
    } catch (error: any) {
      toast.error("Delete failed");
    }
  };

  const handleExport = () => {
    const headers = ["Name", "Email", "Message", "Date"];
    const csvContent = [
      headers.join(","),
      ...doubts.map(d => `"${d.name}","${d.email}","${d.message.replace(/"/g, '""')}","${d.created_at}"`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `salmara_user_doubts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  const filteredDoubts = doubts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[#C5A059] font-sans-clean text-[10px] font-bold uppercase tracking-[0.3em]">Support</p>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-[#1A2E35]">User Doubts</h1>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white text-[#1A2E35] border border-[#F2EDE4] px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-[#5A7A5C] hover:text-[#5A7A5C] transition-all flex items-center gap-3 shadow-sm"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-[#F2EDE4] flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-[#5A7A5C]/10 flex items-center justify-center text-[#5A7A5C]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-1">Total Inquiries</p>
              <p className="text-2xl font-[Inter] font-semibold text-[#1A2E35] tracking-tight">{doubts.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-[#F2EDE4] flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-1">Latest Submission</p>
              <p className="text-sm font-bold text-[#1A2E35]">
                {doubts.length > 0 ? new Date(doubts[0].created_at).toLocaleDateString() : "No data"}
              </p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#F2EDE4] shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-4 border-b border-[#F2EDE4] bg-[#FDFBF7]/30">
          <div className="flex-1 flex items-center gap-3 bg-white border border-[#F2EDE4] rounded-2xl px-4 py-2 focus-within:border-[#5A7A5C] transition-all">
            <Search className="h-4 w-4 text-[#1A2E35]/20" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7]/50 border-b border-[#F2EDE4]">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic">User</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic">Inquiry/Message</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic">Submitted At</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#5A7A5C] mx-auto" />
                    <p className="mt-4 text-xs font-bold text-[#1A2E35]/20 uppercase tracking-widest">Fetching data...</p>
                  </td>
                </tr>
              ) : filteredDoubts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="h-16 w-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-[#1A2E35]/5" />
                    </div>
                    <p className="text-sm font-display text-[#1A2E35]/40 italic">No inquiries found.</p>
                  </td>
                </tr>
              ) : (
                filteredDoubts.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDFBF7]/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#1A2E35]/5 flex items-center justify-center text-[#1A2E35]/20 group-hover:bg-[#5A7A5C]/10 group-hover:text-[#5A7A5C] transition-all">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A2E35]">{item.name}</p>
                          <p className="text-[10px] text-[#1A2E35]/40 uppercase tracking-widest font-sans-clean break-all">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-md">
                        <p className="text-sm text-[#1A2E35]/70 font-sans-clean leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          {item.message}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all ${
                          item.status === 'resolved'
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100 italic'
                            : 'text-amber-600 bg-amber-50 border-amber-100'
                        }`}
                      >
                        {item.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1A2E35]/40 uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={`mailto:${item.email}?subject=Regarding your inquiry at Salmara Ayurveda`}
                          className="p-2 text-[#1A2E35]/20 hover:text-[#5A7A5C] transition-colors"
                          title="Reply via Email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-[#1A2E35]/20 hover:text-red-500 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-[#FDFBF7]/30 border-t border-[#F2EDE4]">
           <p className="text-[10px] font-bold text-[#1A2E35]/20 uppercase tracking-widest text-center italic">
             End of list — Showing all {filteredDoubts.length} inquiries
           </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDoubts;
