import { useMutation, useQuery } from "@tanstack/react-query";
import { adminPayoutsAPI } from "@/lib/api";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, DollarSign, FileText, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Row = {
  withdrawalId: string;
  hostId: string;
  amountCents: number;
  accountName?: string;
  accountNumberLast4?: string;
  routingLast4?: string;
  memo?: string;
};

function parseCsv(csv: string): Row[] {
  if (!csv) return [];
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const header = lines[0].split(",");
  const idx = (name: string) => header.indexOf(name);
  const iId = idx("withdrawalId"), iHost = idx("hostId"), iAmt = idx("amountCents"), iAccName = idx("accountName"), iAccLast4 = idx("accountNumberLast4"), iRouting = idx("routingLast4"), iMemo = idx("memo");
  return lines.slice(1).map((line) => {
    const cols = line.match(/((?:\"[^\"]*\")|[^,])+/g) || line.split(",");
    const clean = (v: string | undefined) => (v ? v.replace(/^\"|\"$/g, '').replace(/\"\"/g, '"') : "");
    return {
      withdrawalId: clean(cols[iId] as string),
      hostId: clean(cols[iHost] as string),
      amountCents: Number(clean(cols[iAmt] as string) || 0),
      accountName: clean(cols[iAccName] as string),
      accountNumberLast4: clean(cols[iAccLast4] as string),
      routingLast4: clean(cols[iRouting] as string),
      memo: clean(cols[iMemo] as string),
    } as Row;
  });
}

function StatusHint({ count }: { count: number }) {
  return (
    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
      <Clock className="w-3 h-3 mr-1" />
      Pending: {count}
    </Badge>
  );
}

export default function AdminPayouts() {
  const [csv, setCsv] = useState("");
  const [reason, setReason] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // History lists
  const pendingQuery = useQuery({ queryKey: ["admin-withdrawals", "pending_transfer"], queryFn: () => adminPayoutsAPI.listWithdrawals("pending_transfer") });
  const paidQuery = useQuery({ queryKey: ["admin-withdrawals", "paid"], queryFn: () => adminPayoutsAPI.listWithdrawals("paid") });

  const exportMutation = useMutation({
    mutationFn: adminPayoutsAPI.createExport,
    onSuccess: (res) => {
      setCsv(res?.data?.csv || "");
      toast({
        title: "CSV Generated",
        description: "Pending withdrawals CSV has been generated successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to generate CSV",
        variant: "destructive",
      });
    },
  });

  const rows = useMemo(() => parseCsv(csv), [csv]);

  const markPaid = useMutation({
    mutationFn: (id: string) => adminPayoutsAPI.markPaid(id),
    onSuccess: () => {
      exportMutation.mutate();
      toast({
        title: "Success",
        description: "Withdrawal marked as paid",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to mark as paid",
        variant: "destructive",
      });
    },
  });

  const markFailed = useMutation({
    mutationFn: (id: string) => adminPayoutsAPI.markFailed(id, reason),
    onSuccess: () => {
      exportMutation.mutate();
      setReason("");
      toast({
        title: "Success",
        description: "Withdrawal marked as failed",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to mark as failed",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Header */}
        <div className="relative">
          <div className="absolute top-6 left-4 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <PageHeader
            title={
              <>
                <DollarSign className="w-10 h-10 inline-block mr-3 text-primary" />
                Payouts Management
              </>
            }
            description="Export pending withdrawals and reconcile payments sent to CBE."
          />
        </div>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 space-y-6">
            {/* Pending Withdrawals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-secondary" />
                    Pending Withdrawals
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => exportMutation.mutate()}
                      disabled={exportMutation.isLoading}
                      variant="hero"
                      size="sm"
                    >
                      {exportMutation.isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Load Pending
                        </>
                      )}
                    </Button>
                    {rows.length > 0 && <StatusHint count={rows.length} />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {rows.length > 0 ? (
                  <div className="rounded-lg border overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-foreground">Withdrawal</th>
                          <th className="text-left px-4 py-3 font-semibold text-foreground">Host</th>
                          <th className="text-left px-4 py-3 font-semibold text-foreground">Amount</th>
                          <th className="text-left px-4 py-3 font-semibold text-foreground">Bank / Account</th>
                          <th className="text-left px-4 py-3 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.withdrawalId} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.withdrawalId}</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.hostId}</td>
                            <td className="px-4 py-3 font-semibold text-foreground">ETB {(r.amountCents / 100).toFixed(2)}</td>
                            <td className="px-4 py-3 text-foreground">
                              CBE {r.accountName || ''} {r.accountNumberLast4 ? `(****${r.accountNumberLast4})` : ''}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => markPaid.mutate(r.withdrawalId)}
                                  disabled={markPaid.isLoading}
                                  size="sm"
                                  variant="outline"
                                  className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark Paid
                                </Button>
                                <Input
                                  placeholder="Reason if failed"
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                  className="h-8 w-32 text-xs"
                                />
                                <Button
                                  onClick={() => markFailed.mutate(r.withdrawalId)}
                                  disabled={markFailed.isLoading || !reason}
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive hover:bg-destructive/10"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Mark Failed
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border p-8 text-center">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No pending withdrawals loaded yet. Click "Load Pending" to fetch data.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Withdrawal History
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Recent pending and paid withdrawals</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pending */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        Pending
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-80 overflow-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">ID</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Amount</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(pendingQuery.data?.data?.withdrawals || []).map((w: any) => (
                              <tr key={w._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{w._id}</td>
                                <td className="px-3 py-2 font-semibold text-foreground">ETB {(w.amountCents / 100).toFixed(2)}</td>
                                <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                            {!(pendingQuery.data?.data?.withdrawals || []).length && (
                              <tr>
                                <td className="px-3 py-4 text-sm text-muted-foreground text-center" colSpan={3}>
                                  No pending withdrawals
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Paid */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Paid
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-80 overflow-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">ID</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Amount</th>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Processed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(paidQuery.data?.data?.withdrawals || []).map((w: any) => (
                              <tr key={w._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{w._id}</td>
                                <td className="px-3 py-2 font-semibold text-foreground">ETB {(w.amountCents / 100).toFixed(2)}</td>
                                <td className="px-3 py-2 text-xs text-muted-foreground">{w.processedAt ? new Date(w.processedAt).toLocaleString() : '-'}</td>
                              </tr>
                            ))}
                            {!(paidQuery.data?.data?.withdrawals || []).length && (
                              <tr>
                                <td className="px-3 py-4 text-sm text-muted-foreground text-center" colSpan={3}>
                                  No paid withdrawals
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* CSV Export */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    CSV Export (for finance)
                  </CardTitle>
                  <Button
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isLoading}
                    variant="hero"
                    size="sm"
                  >
                    {exportMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate CSV
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {csv && (
                  <div className="space-y-2">
                    <Label>Generated CSV</Label>
                    <Textarea
                      className="w-full h-60 font-mono text-xs border-border"
                      readOnly
                      value={csv}
                    />
                  </div>
                )}
                {!csv && (
                  <p className="text-sm text-muted-foreground">Click "Generate CSV" to create a CSV file for finance reconciliation.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
