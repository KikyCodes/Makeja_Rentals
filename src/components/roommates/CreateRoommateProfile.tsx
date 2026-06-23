"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Loader2, MapPin, DollarSign,
  User, Briefcase, GraduationCap, Cigarette, Coffee, PawPrint,
  SparkleIcon, Moon, Sun, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MACHAKOS_AREAS } from "@/lib/utils";

// ── Step schemas ──────────────────────────────────────────────────────────────

const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  area: z.string().min(1, "Please select an area"),
  budget_min: z.coerce.number().min(500, "Minimum budget is KES 500"),
  budget_max: z.coerce.number().min(500, "Maximum budget is KES 500"),
  move_in_date: z.string().min(1, "Please select a move-in date"),
  gender_preference: z.enum(["any", "male", "female"]),
}).refine((d) => d.budget_max >= d.budget_min, {
  message: "Max budget must be ≥ min budget",
  path: ["budget_max"],
});

const step2Schema = z.object({
  description: z.string().min(20, "Tell us a bit more (at least 20 chars)").max(600),
  age: z.coerce.number().min(16).max(99).optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  occupation: z.string().max(80).optional(),
  university: z.string().max(120).optional(),
});

const step3Schema = z.object({
  smoking_pref: z.enum(["yes", "no", "occasionally", "outside_only"]),
  drinking_pref: z.enum(["yes", "no", "occasionally"]),
  pets_pref: z.enum(["yes", "no", "small_pets"]),
  cleanliness: z.enum(["very_clean", "clean", "moderate", "relaxed"]),
  sleep_schedule: z.enum(["early_bird", "night_owl", "flexible"]),
  lifestyle_tags: z.array(z.string()).optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const LIFESTYLE_TAG_OPTIONS = [
  "Student", "Professional", "Early riser", "Night owl", "Non-smoker",
  "Clean", "Quiet", "Social", "Home cook", "Gym lover", "Remote worker",
  "Pet lover", "Budget-conscious", "Couple-friendly",
];

const STEPS = ["Basics", "About You", "Lifestyle"];

// ── Field helpers ─────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
        className
      )}
    />
  );
}

function Select({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
        className
      )}
    >
      {children}
    </select>
  );
}

// ── Step 1 ────────────────────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: (data: Step1Data) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <Label required>Post title</Label>
        <Input
          {...register("title")}
          placeholder="e.g. University student looking for roommate near campus"
        />
        <FieldError msg={errors.title?.message} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Area</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Select {...register("area")} className="pl-9">
              <option value="">Select area…</option>
              {MACHAKOS_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </div>
          <FieldError msg={errors.area?.message} />
        </div>

        <div>
          <Label required>Gender preference</Label>
          <Select {...register("gender_preference")}>
            <option value="any">Open to all</option>
            <option value="male">Male only</option>
            <option value="female">Female only</option>
          </Select>
          <FieldError msg={errors.gender_preference?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Min budget (KES/mo)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input {...register("budget_min")} type="number" min={500} step={500} className="pl-9" placeholder="3000" />
          </div>
          <FieldError msg={errors.budget_min?.message} />
        </div>
        <div>
          <Label required>Max budget (KES/mo)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input {...register("budget_max")} type="number" min={500} step={500} className="pl-9" placeholder="8000" />
          </div>
          <FieldError msg={errors.budget_max?.message} />
        </div>
      </div>

      <div>
        <Label required>Move-in date</Label>
        <Input
          {...register("move_in_date")}
          type="date"
          min={new Date().toISOString().split("T")[0]}
        />
        <FieldError msg={errors.move_in_date?.message} />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors"
      >
        Next: About You <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

function Step2({
  onNext,
  onBack,
}: {
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <Label required>Bio / description</Label>
        <textarea
          {...register("description")}
          rows={4}
          maxLength={600}
          placeholder="Tell potential roommates about yourself — your habits, schedule, what you're looking for…"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
        />
        <FieldError msg={errors.description?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Age</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input {...register("age")} type="number" min={16} max={99} className="pl-9" placeholder="24" />
          </div>
          <FieldError msg={errors.age?.message} />
        </div>
        <div>
          <Label>Gender</Label>
          <Select {...register("gender")}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          <FieldError msg={errors.gender?.message} />
        </div>
      </div>

      <div>
        <Label>Occupation</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input {...register("occupation")} className="pl-9" placeholder="e.g. Software Engineer, Student" />
        </div>
        <FieldError msg={errors.occupation?.message} />
      </div>

      <div>
        <Label>University / Institution</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input {...register("university")} className="pl-9" placeholder="e.g. Machakos University" />
        </div>
        <FieldError msg={errors.university?.message} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors"
        >
          Next: Lifestyle <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function Step3({
  onSubmit,
  onBack,
  submitting,
}: {
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      smoking_pref: "no",
      drinking_pref: "no",
      pets_pref: "no",
      cleanliness: "clean",
      sleep_schedule: "flexible",
      lifestyle_tags: [],
    },
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const onFormSubmit = (data: Step3Data) => {
    onSubmit({ ...data, lifestyle_tags: selectedTags });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Smoking</Label>
          <div className="relative">
            <Cigarette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Select {...register("smoking_pref")} className="pl-9">
              <option value="no">Non-smoker</option>
              <option value="occasionally">Occasionally</option>
              <option value="outside_only">Outside only</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
          <FieldError msg={errors.smoking_pref?.message} />
        </div>

        <div>
          <Label>Drinking</Label>
          <div className="relative">
            <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Select {...register("drinking_pref")} className="pl-9">
              <option value="no">Non-drinker</option>
              <option value="occasionally">Occasionally</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
          <FieldError msg={errors.drinking_pref?.message} />
        </div>

        <div>
          <Label>Pets</Label>
          <div className="relative">
            <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Select {...register("pets_pref")} className="pl-9">
              <option value="no">No pets</option>
              <option value="small_pets">Small pets OK</option>
              <option value="yes">Pets welcome</option>
            </Select>
          </div>
          <FieldError msg={errors.pets_pref?.message} />
        </div>

        <div>
          <Label>Cleanliness</Label>
          <div className="relative">
            <SparkleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Select {...register("cleanliness")} className="pl-9">
              <option value="very_clean">Very clean</option>
              <option value="clean">Clean</option>
              <option value="moderate">Moderate</option>
              <option value="relaxed">Relaxed</option>
            </Select>
          </div>
          <FieldError msg={errors.cleanliness?.message} />
        </div>
      </div>

      <div>
        <Label>Sleep schedule</Label>
        <div className="flex gap-3">
          {[
            { value: "early_bird", label: "Early bird", icon: <Sun className="w-4 h-4" /> },
            { value: "flexible", label: "Flexible", icon: <SparkleIcon className="w-4 h-4" /> },
            { value: "night_owl", label: "Night owl", icon: <Moon className="w-4 h-4" /> },
          ].map((opt) => (
            <label key={opt.value} className="flex-1 cursor-pointer">
              <input {...register("sleep_schedule")} type="radio" value={opt.value} className="sr-only" />
              <div className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium text-center has-[:checked]:border-purple-500 has-[:checked]:text-purple-600 has-[:checked]:bg-purple-50 dark:has-[:checked]:bg-purple-950 transition-all">
                {opt.icon}
                {opt.label}
              </div>
            </label>
          ))}
        </div>
        <FieldError msg={errors.sleep_schedule?.message} />
      </div>

      <div>
        <Label>Lifestyle tags</Label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Select all that apply
        </p>
        <div className="flex flex-wrap gap-2">
          {LIFESTYLE_TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedTags.includes(tag)
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-600"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-purple-400 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</>
          ) : (
            <><Check className="w-4 h-4" /> Post Profile</>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CreateRoommateProfile() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(1);
  };

  const handleStep2 = (data: Step2Data) => {
    setStep2Data(data);
    setStep(2);
  };

  const handleStep3 = async (data: Step3Data) => {
    if (!step1Data || !step2Data) return;
    setSubmitting(true);
    setSubmitError("");

    const payload = {
      ...step1Data,
      ...step2Data,
      ...data,
    };

    try {
      const res = await fetch("/api/roommates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create post");
      }

      const { data: created } = await res.json();
      router.push(`/roommates/${created.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[11px] mt-1 font-medium",
                  i === step ? "text-purple-600" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mb-5 mx-1 rounded-full",
                  i < step ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                Basic information
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                Where you want to live and your budget range.
              </p>
              <Step1 onNext={handleStep1} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                About you
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                Help potential roommates get to know you.
              </p>
              <Step2 onNext={handleStep2} onBack={() => setStep(0)} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                Lifestyle preferences
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                These help us calculate compatibility scores.
              </p>
              <Step3 onSubmit={handleStep3} onBack={() => setStep(1)} submitting={submitting} />
              {submitError && (
                <p className="mt-3 text-red-500 text-sm text-center">{submitError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
