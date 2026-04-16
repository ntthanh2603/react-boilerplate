import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import {
  useReferrersControllerGetAll,
  useReferrersControllerCreate,
  useReferrersControllerUpdate,
  useReferrersControllerDelete,
} from "@/services/apis/gen/queries";
import type { Referrer } from "@/services/apis/gen/queries";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit2,
  History,
  Copy,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ReferrersList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(
    null,
  );

  // API Hooks
  const {
    data: referrersData,
    isLoading,
    refetch,
  } = useReferrersControllerGetAll({
    search,
    page,
    limit: 10,
  });

  const createMutation = useReferrersControllerCreate();
  const updateMutation = useReferrersControllerUpdate();
  const deleteMutation = useReferrersControllerDelete();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    code: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: formData,
      });
      toast.success("Referrer created successfully");
      setIsCreateOpen(false);
      setFormData({ name: "", email: "", phone: "", code: "" });
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create referrer");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferrer) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedReferrer.id,
        data: formData,
      });
      toast.success("Referrer updated successfully");
      setIsEditOpen(false);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update referrer");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this referrer?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Referrer deleted successfully");
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete referrer");
    }
  };

  const openEdit = (referrer: Referrer) => {
    setSelectedReferrer(referrer);
    setFormData({
      name: referrer.name,
      email: referrer.email,
      phone: referrer.phone,
      code: referrer.code || "",
    });
    setIsEditOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Referral code copied!");
  };

  return (
    <>
      <AppHeader title="Referrers Management" />
      <div className="flex flex-1 flex-col gap-6 p-6 mesh-gradient/10 min-h-full">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-gradient">
              Referrers
            </h2>
            <p className="text-muted-foreground">
              Manage your referral partners and track their performance.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                <Plus className="size-4 mr-2" />
                Add Referrer
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-primary/10 rounded-3xl sm:max-w-[425px]">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    Add Referrer
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the partner details to create a new referral
                    account.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="rounded-xl"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="rounded-xl"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="0912345678"
                      className="rounded-xl"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="code">Referral Code (Optional)</Label>
                    <Input
                      id="code"
                      placeholder="JD01"
                      className="rounded-xl"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      maxLength={4}
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                      4 characters (A-Z, 0-9). Leave blank to auto-generate.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-xl w-full"
                  >
                    {createMutation.isPending
                      ? "Creating..."
                      : "Create Referrer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters/Search */}
        <div className="glass rounded-2xl p-4 flex items-center gap-4 border-primary/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-10 border-none bg-primary/5 rounded-xl focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table/List */}
        <div className="glass rounded-3xl overflow-hidden border-primary/5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/5 bg-primary/5">
                  <th className="px-6 py-4 text-sm font-semibold">Partner</th>
                  <th className="px-6 py-4 text-sm font-semibold">Contact</th>
                  <th className="px-6 py-4 text-sm font-semibold">Code</th>
                  <th className="px-6 py-4 text-sm font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-primary/5 animate-shimmer"
                    >
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-primary/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-40 bg-primary/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-primary/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-8 ml-auto bg-primary/10 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : referrersData?.data?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No referrers found.
                    </td>
                  </tr>
                ) : (
                  referrersData?.data?.map((referrer: Referrer) => (
                    <tr
                      key={referrer.id}
                      className="border-b border-primary/5 hover:bg-primary/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">
                            {referrer.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {referrer.id?.split("-")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm">
                          <span>{referrer.email}</span>
                          <span className="text-muted-foreground">
                            {referrer.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className="font-mono px-2 py-1 flex items-center gap-2 w-fit bg-primary/10 text-primary border-none"
                        >
                          {referrer.code}
                          <button
                            onClick={() =>
                              referrer.code && copyToClipboard(referrer.code)
                            }
                            className="hover:text-foreground"
                          >
                            <Copy className="size-3" />
                          </button>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-primary/10"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="glass border-primary/10 rounded-xl"
                          >
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-primary/10" />
                            <DropdownMenuItem
                              onClick={() => openEdit(referrer)}
                              className="rounded-lg gap-2 cursor-pointer"
                            >
                              <Edit2 className="size-4 text-blue-500" /> Edit
                              Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              asChild
                              className="rounded-lg gap-2 cursor-pointer"
                            >
                              <Link to={`/referrers/${referrer.id}/history`}>
                                <History className="size-4 text-primary" /> View
                                History
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-primary/10" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(referrer.id)}
                              className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {referrersData?.pageCount !== undefined &&
            referrersData.pageCount > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-primary/5">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {referrersData?.pageCount ?? 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={page === (referrersData?.pageCount ?? 1)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass border-primary/10 rounded-3xl sm:max-w-[425px]">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Edit Referrer
              </DialogTitle>
              <DialogDescription>
                Update the partner information for {selectedReferrer?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  className="rounded-xl"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  className="rounded-xl"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  className="rounded-xl"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Referral Code</Label>
                <Input
                  id="edit-code"
                  className="rounded-xl"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  maxLength={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-xl w-full"
              >
                {updateMutation.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
