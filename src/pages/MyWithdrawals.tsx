import { useQuery } from "@tanstack/react-query";
import { withdrawalsAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Banknote, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    pending_transfer: {
      label: "Pending Transfer",
      variant: "outline",
      icon: Clock,
    },
    paid: {
      label: "Paid",
      variant: "default",
      icon: CheckCircle,
    },
    failed: {
      label: "Failed",
      variant: "destructive",
      icon: XCircle,
    },
    canceled: {
      label: "Canceled",
      variant: "secondary",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status] || {
    label: status,
    variant: "outline" as const,
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export default function MyWithdrawals() {
  const { data, isLoading } = useQuery({ queryKey: ["withdrawals"], queryFn: () => withdrawalsAPI.listMine({ limit: 50 }) });
  const items = data?.data?.withdrawals || [];
  const navigate = useNavigate();

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
              onClick={() => navigate("/host/wallet")}
              className="bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </Button>
          </div>
          <PageHeader
            title={
              <>
                <Banknote className="w-10 h-10 inline-block mr-3 text-primary" />
                Withdrawal History
              </>
            }
            description="Track your withdrawal requests and their statuses."
          />
        </div>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Loading withdrawals...</p>
                </CardContent>
              </Card>
            ) : items.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Banknote className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Withdrawals Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Request your first withdrawal from the Wallet page.
                  </p>
                  <Button onClick={() => navigate("/host/wallet")} variant="hero">
                    Go to Wallet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-6 py-4 font-semibold text-foreground">Created</th>
                          <th className="text-left px-6 py-4 font-semibold text-foreground">Amount</th>
                          <th className="text-left px-6 py-4 font-semibold text-foreground">Status</th>
                          <th className="text-left px-6 py-4 font-semibold text-foreground">ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((w: any) => (
                          <tr
                            key={w._id}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4 text-foreground">
                              {new Date(w.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-foreground">
                                ETB {(w.amountCents / 100).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={w.status} />
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-muted-foreground">{w._id}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
