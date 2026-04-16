import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppHeader } from "@/components/app-header";
import { useReferrersControllerGetHistory } from "@/services/apis/gen/queries";
import type { ReferralHistory } from "@/services/apis/gen/queries";
import { 
  ArrowLeft, 
  Search, 
  Calendar,
  Building2,
  Mail,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ReferrersHistory() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: historyData, isLoading } = useReferrersControllerGetHistory(
    id!,
    {
      search,
      page,
      limit: 10
    }
  );

  return (
    <>
      <AppHeader title="Referral History" />
      <div className="flex flex-1 flex-col gap-6 p-6 mesh-gradient/10 min-h-full">
        {/* Navigation / Header */}
        <div className="flex flex-col gap-4">
          <Link 
            to="/referrers" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to Referrers
          </Link>
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-gradient">Referral History</h2>
            <p className="text-muted-foreground">Detailed log of all businesses registered through this partner.</p>
          </div>
        </div>

        {/* Filter */}
        <div className="glass rounded-2xl p-4 flex items-center gap-4 border-primary/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search by business name or email..." 
              className="pl-10 border-none bg-primary/5 rounded-xl focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* History Grid/List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 h-40 animate-shimmer" />
            ))
          ) : historyData?.data?.length === 0 ? (
            <div className="col-span-full glass rounded-3xl p-12 text-center flex flex-col items-center gap-4 text-muted-foreground">
               <div className="p-4 rounded-full bg-primary/5">
                  <UserCheck className="size-12 opacity-20" />
               </div>
               <p>No referral history found for this partner.</p>
            </div>
          ) : (
            historyData?.data?.map((history: ReferralHistory) => (
              <div key={history.id} className="glass rounded-2xl p-6 border-primary/5 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-primary/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <Badge className={history.role === 'merchant' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'}>
                    {history.role.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-bold text-lg mb-1 truncate">{history.name}</h3>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="size-3" />
                    <span>{history.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-primary/5">
                    <Calendar className="size-3" />
                    <span>Registered on {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(history.createdAt))}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!!historyData?.pageCount && historyData.pageCount > 1 && (
          <div className="flex items-center justify-between mt-4">
             <span className="text-sm text-muted-foreground">
                Showing {historyData.data.length} of {historyData.total} results
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg"
                  disabled={page === historyData.pageCount}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
          </div>
        )}
      </div>
    </>
  );
}
