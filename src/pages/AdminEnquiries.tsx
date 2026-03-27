import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Mail, 
  Download,
  Loader2,
  User,
  Calendar,
  Phone,
  Tag,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  category: string;
  user_text: string;
  created_at: string;
}

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_us")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async (id: number) => {
    // if (!confirm("Remove this enquiry?")) return;
    try {
      const { error } = await supabase
        .from("contact_us")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      setEnquiries(prev => prev.filter(e => e.id !== id));
      toast.success("Enquiry removed");
    } catch (error: any) {
      toast.error("Delete failed");
    }
  };

  const handleExport = () => {
    const headers = ["Name", "Email", "Phone", "Category", "Message", "Date"];
    const csvContent = [
      headers.join(","),
      ...enquiries.map(e => `"${e.name}","${e.email}","${e.phone_number || ""}","${e.category || ""}","${e.user_text.replace(/"/g, '""')}","${e.created_at}"`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `salmara_enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  const filteredEnquiries = enquiries.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[#C5A059] font-sans-clean text-[10px] font-bold uppercase tracking-[0.3em]">Communication</p>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-[#1A2E35]">Enquiries</h1>
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
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-1">Total Enquiries</p>
              <p className="text-2xl font-[Inter] font-semibold text-[#1A2E35] tracking-tight">{enquiries.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-[#F2EDE4] flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 mb-1">Latest Submission</p>
              <p className="text-sm font-bold text-[#1A2E35]">
                {enquiries.length > 0 ? new Date(enquiries[0].created_at).toLocaleDateString() : "No data"}
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
              placeholder="Search by name, email or category..." 
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
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic">Sender</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic">Contact Info</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic">Message</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/40 italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#5A7A5C] mx-auto" />
                    <p className="mt-4 text-xs font-bold text-[#1A2E35]/20 uppercase tracking-widest">Loading entries...</p>
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="h-16 w-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-[#1A2E35]/5" />
                    </div>
                    <p className="text-sm font-display text-[#1A2E35]/40 italic">No enquiries found.</p>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDFBF7]/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#1A2E35]/5 flex items-center justify-center text-[#1A2E35]/20 group-hover:bg-[#5A7A5C]/10 group-hover:text-[#5A7A5C] transition-all">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A2E35]">{item.name}</p>
                          <span className={`inline-block mt-1 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            item.category === 'Feedback' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            item.category === 'Support' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-gray-50 text-gray-600 border-gray-100'
                          }`}>
                            {item.category || 'General'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-[#1A2E35]/60">
                          <Mail className="h-3 w-3" />
                          <span className="font-medium">{item.email}</span>
                        </div>
                        {item.phone_number && (
                          <div className="flex items-center gap-2 text-xs text-[#1A2E35]/60">
                            <Phone className="h-3 w-3" />
                            <span className="font-medium">{item.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-md">
                         <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3 text-[#1A2E35]/20" />
                            <span className="text-[10px] font-bold text-[#1A2E35]/20 uppercase tracking-widest">
                               {new Date(item.created_at).toLocaleDateString()}
                            </span>
                         </div>
                        <p className="text-sm text-[#1A2E35]/70 font-sans-clean leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          {item.user_text}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-[#1A2E35]/20 hover:text-red-500 transition-colors"
                        title="Delete enquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-[#FDFBF7]/30 border-t border-[#F2EDE4] flex justify-between items-center">
           <p className="text-[10px] font-bold text-[#1A2E35]/20 uppercase tracking-widest">
             Showing {filteredEnquiries.length} of {enquiries.length} entries
           </p>
           <div className="flex gap-2">
             <button disabled className="px-4 py-2 border border-[#F2EDE4] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/20">Prev</button>
             <button disabled className="px-4 py-2 border border-[#F2EDE4] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#1A2E35]/20">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
