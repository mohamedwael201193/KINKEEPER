import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { DataProof } from "@/components/data-proof";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { PageHeader } from "@/layouts/app-shell";
import { PageTransition } from "@/components/motion/primitives";
import { api } from "@/services/api-client";
import { cn } from "@/lib/utils";
import { AudioUploadPanel, SuccessBanner } from "@/components/audio-upload-panel";
import { NextStepBanner } from "@/components/onboarding-progress";

const elderSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthYear: z.coerce.number().min(1900).max(new Date().getFullYear()),
  timezone: z.string().min(1),
});

const caregiverSchema = z.object({
  email: z.string().email(),
});

const STEPS = [
  { id: "elder", label: "Add elder", icon: Heart, description: "Who KINKEEPER protects" },
  { id: "caregiver", label: "Add caregiver", icon: Users, description: "Who receives alerts" },
  { id: "telegram", label: "Connect Telegram", icon: MessageCircle, description: "Autonomous notifications" },
  { id: "baselineScan", label: "Baseline cognition", icon: Brain, description: "Voice fingerprint" },
  { id: "protectionActivated", label: "Protection live", icon: Shield, description: "Pipeline armed" },
] as const;

function StepRail({
  steps,
  currentStep,
  progress,
}: {
  steps: Record<string, boolean>;
  currentStep: string;
  progress: number;
}) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Protection setup</p>
          <p className="font-display text-2xl text-ink">Activate your family shield</p>
        </div>
        <Badge variant="outline" className="tabular-nums">
          {progress}% complete
        </Badge>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/8">
        <motion.div
          className="h-full rounded-full bg-ink"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        className="grid gap-2 md:grid-cols-5"
      >
        {STEPS.map((step, index) => {
          const done = steps[step.id];
          const active = currentStep === step.id;
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0 },
              }}
              className={cn(
                "rounded-2xl border p-3 transition-colors",
                done ? "border-trust-safe/30 bg-trust-safe/5" : active ? "border-ink bg-white shadow-soft" : "border-ink/8 bg-white/60",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                    done ? "bg-trust-safe text-white" : active ? "bg-ink text-canvas" : "bg-ink/8 text-ink-muted",
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <Icon className="h-4 w-4 text-ink-muted" />
              </div>
              <p className="mt-2 text-sm font-medium">{step.label}</p>
              <p className="text-xs text-ink-faint">{step.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function GuidedActivation({
  title,
  description,
  actionLabel,
  onAction,
  endpoint,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  endpoint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-accent/30 bg-gradient-to-br from-accent/5 to-transparent p-8 text-center"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
        <Sparkles className="h-6 w-6 text-accent" />
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      {endpoint ? (
        <div className="mt-4 flex justify-center">
          <DataProof endpoint={endpoint} />
        </div>
      ) : null}
      {onAction && actionLabel ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      ) : null}
    </motion.div>
  );
}

export function FamilyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const onboardingQuery = useQuery({
    queryKey: ["onboarding"],
    queryFn: api.getOnboarding,
    refetchInterval: (query) =>
      query.state.data?.currentStep === "telegram" || query.state.data?.currentStep === "baselineScan"
        ? 5000
        : false,
  });
  const eldersQuery = useQuery({ queryKey: ["elders"], queryFn: api.listElders });
  const telegramQuery = useQuery({
    queryKey: ["telegram-status"],
    queryFn: api.telegramStatus,
    refetchInterval: (query) =>
      query.state.data?.linked ? false : 5000,
  });
  const elderForm = useForm<z.infer<typeof elderSchema>>({
    resolver: zodResolver(elderSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthYear: 1945,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const caregiverForm = useForm<z.infer<typeof caregiverSchema>>({
    resolver: zodResolver(caregiverSchema),
    defaultValues: { email: "" },
  });

  const createElder = useMutation({
    mutationFn: api.createElder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["elders"] });
      void queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      elderForm.reset();
      setSuccessMessage("Elder saved. Next: invite a caregiver who can respond to alerts.");
    },
  });

  const inviteCaregiver = useMutation({
    mutationFn: api.inviteCaregiver,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      caregiverForm.reset();
      setSuccessMessage("Invite sent. Next: connect Telegram for instant phone alerts.");
    },
  });

  const baselineUpload = useMutation({
    mutationFn: ({ elderId, file }: { elderId: string; file: File }) =>
      api.uploadCognoscenteCheckIn(elderId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      setSuccessMessage("Baseline uploaded. AI is analyzing the voice check-in — this step completes automatically.");
    },
  });

  const telegramLink = useMutation({
    mutationFn: api.telegramLink,
  });

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const currentStep = onboardingQuery.data?.currentStep ?? "elder";

  useEffect(() => {
    if (telegramQuery.data?.linked) {
      void queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      setSuccessMessage("Telegram connected. You'll get one-tap alert buttons on your phone.");
    }
  }, [telegramQuery.data?.linked, queryClient]);

  useEffect(() => {
    if (currentStep !== "protectionActivated") return;
    const timer = setTimeout(() => {
      void navigate({ to: "/app" });
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentStep, navigate]);

  if (onboardingQuery.isLoading || eldersQuery.isLoading) {
    return (
      <PageTransition>
        <PageHeader title="Family protection" />
        <Skeleton className="h-96" />
      </PageTransition>
    );
  }

  if (onboardingQuery.error) {
    return (
      <PageTransition>
        <PageHeader title="Family protection" />
        <ErrorState message={onboardingQuery.error.message} retry={() => void onboardingQuery.refetch()} />
      </PageTransition>
    );
  }

  const onboarding = onboardingQuery.data!;

  return (
    <PageTransition>
      <PageHeader
        title="Family setup"
        description="Four quick steps: who you protect, who gets alerts, Telegram, and a baseline voice sample."
      />

      {successMessage ? (
        <SuccessBanner message={successMessage} onDismiss={() => setSuccessMessage(null)} />
      ) : null}

      <NextStepBanner onboarding={onboarding} />

      <StepRail steps={onboarding.steps} currentStep={onboarding.currentStep} progress={onboarding.progress} />

      <div className="mb-4">
        <DataProof endpoint="GET /families/current/onboarding" value={`step=${onboarding.currentStep} · ${onboarding.progress}%`} />
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "elder" && (
          <motion.div key="elder" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <Card>
                <CardHeader>
                  <CardTitle>Step 1 · Add elder</CardTitle>
                  <CardDescription>The person KINKEEPER monitors for scams and cognitive drift</CardDescription>
                </CardHeader>
                <CardContent>
                  {eldersQuery.data?.length ? (
                    <div className="space-y-3">
                      {eldersQuery.data.map((elder) => (
                        <div key={elder.id} className="rounded-xl border border-trust-safe/20 bg-trust-safe/5 p-4">
                          <p className="font-medium">
                            {elder.firstName} {elder.lastName}
                          </p>
                          <p className="text-xs text-ink-muted">Born {elder.birthYear} · {elder.timezone}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <GuidedActivation
                      title="Start with who you protect"
                      description="Add a parent or grandparent. Sentinel listens for scam calls; Cognoscente tracks cognitive baseline from their voice."
                      actionLabel="Use the form"
                      endpoint="GET /families/current/elders"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Elder profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={elderForm.handleSubmit((values) => createElder.mutate(values))}>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" {...elderForm.register("firstName")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" {...elderForm.register("lastName")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthYear">Birth year</Label>
                      <Input id="birthYear" type="number" {...elderForm.register("birthYear")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" {...elderForm.register("timezone")} />
                    </div>
                    <Button type="submit" disabled={createElder.isPending} className="w-full">
                      Save elder & continue
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {currentStep === "caregiver" && (
          <motion.div key="caregiver" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Step 2 · Add caregiver</CardTitle>
                <CardDescription>Invite someone who receives Telegram alerts and can acknowledge incidents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {onboarding.caregiverInviteEmail ? (
                  <div className="rounded-xl border border-trust-safe/20 bg-trust-safe/5 p-4 text-sm">
                    Invited <strong>{onboarding.caregiverInviteEmail}</strong>. They join when they sign in with Privy using that email.
                  </div>
                ) : (
                  <GuidedActivation
                    title="You shouldn't be the only responder"
                    description="Add a sibling, spouse, or trusted contact. KINKEEPER records the invite and completes this step for your household."
                    endpoint="POST /families/current/onboarding/caregiver-invite"
                  />
                )}
                <form className="space-y-4" onSubmit={caregiverForm.handleSubmit((values) => inviteCaregiver.mutate(values.email))}>
                  <div className="space-y-2">
                    <Label htmlFor="caregiverEmail">Caregiver email</Label>
                    <Input id="caregiverEmail" type="email" {...caregiverForm.register("email")} placeholder="caregiver@family.com" />
                  </div>
                  <Button type="submit" disabled={inviteCaregiver.isPending} className="w-full">
                    Send invite & continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === "telegram" && (
          <motion.div key="telegram" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Step 3 · Connect Telegram</CardTitle>
                <CardDescription>Autonomous caregiver notifications when Sentinel flags a scam call</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {telegramQuery.data?.linked ? (
                  <div className="rounded-xl border border-trust-safe/20 bg-trust-safe/5 p-4 text-sm">
                    Telegram linked {telegramQuery.data.linkedAt ? `on ${new Date(telegramQuery.data.linkedAt).toLocaleDateString()}` : ""}.
                  </div>
                ) : (
                  <GuidedActivation
                    title="Alerts that reach you instantly"
                    description="Generate a one-time link token and send it to the KINKEEPER bot. No mock status — live from /telegram/status."
                    endpoint="GET /telegram/status"
                  />
                )}
                <Button
                  className="w-full"
                  disabled={telegramLink.isPending}
                  onClick={async () => {
                    const result = await telegramLink.mutateAsync();
                    setLinkToken(result.token);
                    setDeepLinkUrl(result.deepLinkUrl ?? null);
                  }}
                >
                  Get Telegram link
                </Button>
                {linkToken ? (
                  <div className="rounded-xl border border-ink/10 bg-canvas-muted/40 p-4 text-sm space-y-3">
                    <p className="font-medium">Connect in one tap</p>
                    <p className="text-ink-muted">
                      Open Telegram — no typing commands. The bot will show buttons for Status and Alerts.
                    </p>
                    {deepLinkUrl ? (
                      <Button asChild className="w-full">
                        <a href={deepLinkUrl} target="_blank" rel="noopener noreferrer">
                          Open in Telegram
                        </a>
                      </Button>
                    ) : null}
                    <p className="text-xs text-ink-faint">Or copy this code and send /link CODE to @{telegramLink.data?.botUsername ?? "KINKEEPERxbot"}</p>
                    <code className="block break-all rounded-lg bg-white p-3 text-xs">/link {linkToken}</code>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/app/telegram">Telegram settings</Link>
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === "baselineScan" && (
          <motion.div key="baseline" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <Card className="max-w-xl" id="baseline">
              <CardHeader>
                <CardTitle>Step 4 · Baseline voice check-in</CardTitle>
                <CardDescription>
                  Upload a short recording of your parent speaking normally — about 30 seconds. This teaches the AI what
                  their healthy voice sounds like.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eldersQuery.data?.[0] ? (
                  <AudioUploadPanel
                    label="Upload baseline recording"
                    description={`Record ${eldersQuery.data[0].firstName} saying hello, what they ate today, and how they feel.`}
                    disabled={baselineUpload.isPending}
                    isUploading={baselineUpload.isPending}
                    successMessage={baselineUpload.isSuccess ? successMessage : null}
                    onUpload={async (file) => {
                      await baselineUpload.mutateAsync({ elderId: eldersQuery.data![0]!.id, file });
                    }}
                  />
                ) : (
                  <GuidedActivation
                    title="Add an elder first"
                    description="We need to know who this baseline belongs to."
                    actionLabel="Add elder"
                    onAction={() => void navigate({ to: "/app/family" })}
                  />
                )}
                <p className="text-xs text-ink-faint">
                  Processing runs on your local AI engine — usually under a minute. This step completes automatically when
                  analysis finishes.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === "protectionActivated" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-trust-safe/30 bg-gradient-to-br from-trust-safe/10 to-white p-12 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-trust-safe text-white"
            >
              <Shield className="h-10 w-10" />
            </motion.div>
            <h2 className="font-display text-3xl">Protection activated</h2>
            <p className="mx-auto mt-3 max-w-lg text-ink-muted">
              Elder profile, caregiver invite, Telegram, and baseline scan are configured. Opening your Family Safety Timeline…
            </p>
            <Button asChild className="mt-8">
              <Link to="/app">Go to timeline</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export function CaregiversPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["members"],
    queryFn: api.listMembers,
  });

  if (isLoading) {
    return (
      <PageTransition>
        <PageHeader title="Caregivers" />
        <Skeleton className="h-64" />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <PageHeader title="Caregivers" />
        <ErrorState message={error.message} retry={() => void refetch()} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader title="Caregivers" description="Family members with access to alerts, evidence, and Telegram notifications." />

      {!data?.length ? (
        <GuidedActivation
          title="Build your response circle"
          description="Complete Step 2 in Family protection to invite caregivers, or share your household Privy sign-in flow."
          actionLabel="Open setup"
          onAction={() => {
            void navigate({ to: "/app/family" });
          }}
          endpoint="GET /families/current/members"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-sm text-ink-muted">{member.user.email}</p>
                  </div>
                  <Badge variant="outline">{member.role}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant={member.telegramLinked ? "success" : "outline"}>
                    Telegram {member.telegramLinked ? "linked" : "not linked"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
