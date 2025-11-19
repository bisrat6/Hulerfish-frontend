import { useMutation, useQuery } from "@tanstack/react-query";
import { walletAPI, withdrawalsAPI } from "@/lib/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Wallet as WalletIcon, DollarSign, AlertCircle, CheckCircle, Banknote, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function genRequestId() {
  return `wd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["wallet"], queryFn: walletAPI.getMy });
  const [amount, setAmount] = useState(0);
  const hasCbe = Boolean(user?.cbeAccountName && user?.cbeAccountNumber);
  const last4 = user?.cbeAccountNumber ? String(user.cbeAccountNumber).slice(-4) : '';

  const createMutation = useMutation({
    mutationFn: () =>
      withdrawalsAPI.create({
        amountCents: Math.round(amount * 100),
        clientRequestId: genRequestId(),
      }),
    onSuccess: () => {
      refetch();
      setAmount(0);
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to request withdrawal",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading wallet...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || user.role === 'admin' || user.hostStatus !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-sm text-muted-foreground">Only approved hosts can access the wallet.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const wallet = data?.data?.wallet;
  const available = (wallet?.availableBalanceCents ?? 0) / 100;
  const pending = (wallet?.pendingPayoutCents ?? 0) / 100;
  const canRequest = hasCbe && amount > 0 && amount <= available && amount >= 10;

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
              onClick={() => navigate("/profile")}
              className="bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
          <PageHeader
            title={
              <>
                <WalletIcon className="w-10 h-10 inline-block mr-3 text-primary" />
                My Wallet
              </>
            }
            description="Manage your balance and request payouts to your CBE account."
          />
        </div>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Available Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">
                    ETB {available.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Ready to withdraw</p>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Payout
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">
                    ETB {pending.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Processing</p>
                </CardContent>
              </Card>
            </div>

            {/* Withdrawal Request */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-primary" />
                  Request Withdrawal
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Minimum withdrawal: ETB 10.00</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasCbe ? (
                  <div className="rounded-lg border border-secondary/50 bg-secondary/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">No CBE Account Configured</p>
                        <p className="text-sm text-muted-foreground">
                          You need to add your CBE account information before you can request withdrawals.{' '}
                          <Link to="/profile" className="text-primary hover:underline font-medium">
                            Add CBE account in Profile
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Destination Account</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">{user?.cbeAccountName}</span> (CBE) • Account ****{last4 || '____'}
                        </p>
                      </div>
                      <Link to="/profile">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ETB)</Label>
                  <div className="flex gap-3">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min={0}
                      max={available}
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value || '0'))}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <Button
                      disabled={createMutation.isLoading || !canRequest}
                      onClick={() => createMutation.mutate()}
                      variant="hero"
                      className="min-w-[140px]"
                    >
                      {createMutation.isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>
                          <Banknote className="w-4 h-4 mr-2" />
                          Request Withdrawal
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can withdraw up to ETB {available.toFixed(2)}. Minimum withdrawal is ETB 10.00.
                  </p>
                </div>

                {/* Validation Messages */}
                {amount > available && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Amount exceeds available balance.
                    </p>
                  </div>
                )}
                {amount > 0 && amount < 10 && (
                  <div className="rounded-lg border border-secondary/50 bg-secondary/10 p-3">
                    <p className="text-sm text-secondary flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Minimum withdrawal is ETB 10.00.
                    </p>
                  </div>
                )}
                {createMutation.isError && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">
                      {(createMutation.error as any)?.response?.data?.message || "Request failed. Please try again."}
                    </p>
                  </div>
                )}
                {createMutation.isSuccess && (
                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-50 p-3">
                    <p className="text-sm text-emerald-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Withdrawal requested successfully!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/host/withdrawals")}
                className="flex-1"
              >
                <Banknote className="w-4 h-4 mr-2" />
                View Withdrawal History
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
