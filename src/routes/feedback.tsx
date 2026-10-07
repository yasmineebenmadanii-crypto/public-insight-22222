import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MessageSquare, ArrowLeft, Heart, Award, Sparkles } from "lucide-react";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { AppLogo } from "@/components/AppLogo";

const searchSchema = z.object({
  campaignId: z.string().optional(),
});

export const Route = createFileRoute("/feedback")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Campaign Feedback — Public Insight" }] }),
  component: FeedbackPage,
});

interface CampaignBasicInfo {
  id: string;
  name: string;
  organizer?: string;
  description?: string;
}

function FeedbackPage() {
  const { lang, setLang } = useI18n();
  const ar = lang === "ar";
  const L = (en: string, arT: string) => (ar ? arT : en);

  const { campaignId } = Route.useSearch();
  const [campaign, setCampaign] = useState<CampaignBasicInfo | null>(null);

  // Form State
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [q1, setQ1] = useState<string>(""); // Understood campaign message
  const [q2, setQ2] = useState<string>(""); // Changed opinion/behavior
  const [opinion, setOpinion] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Find campaign from history
    if (typeof window !== "undefined") {
      const historyRaw = localStorage.getItem("pi-campaign-history");
      if (historyRaw) {
        try {
          const history = JSON.parse(historyRaw);
          const found = history.find((c: any) => c.id === campaignId);
          if (found) {
            setCampaign({
              id: found.id,
              name: found.name,
              organizer: found.campaignObj?.organizer || found.resultObj?.organizer,
              description: found.campaignObj?.description || found.resultObj?.description,
            });
          }
        } catch (e) {
          console.error("Error parsing history in feedback page:", e);
        }
      }
    }
  }, [campaignId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !gender || !q1 || !q2) {
      alert(
        L(
          "Please answer all multiple-choice questions.",
          "يرجى الإجابة على جميع الأسئلة متعددة الخيارات.",
        ),
      );
      return;
    }

    setLoading(true);

    // Create feedback record
    const newSubmission = {
      id: "feed_" + Date.now(),
      age,
      gender,
      q1, // "yes" | "partially" | "no"
      q2, // "yes" | "no"
      opinion: opinion.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    // Save to localStorage
    const storageKey = `pi-campaign-feedback-${campaignId || "general"}`;
    const existingRaw = localStorage.getItem(storageKey);
    let currentFeedbacks = [];
    if (existingRaw) {
      try {
        currentFeedbacks = JSON.parse(existingRaw);
      } catch (err) {
        console.error("Error parsing current feedbacks", err);
      }
    }
    currentFeedbacks.push(newSubmission);
    localStorage.setItem(storageKey, JSON.stringify(currentFeedbacks));

    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const currentCampaignName = campaign
    ? campaign.name
    : L("Sart Campaign Analytics", "الحملة الإعلانية الذكية");

  const organizerName = campaign?.organizer || L("Public Insight Partner", "شريك Public Insight");

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 relative overflow-hidden"
      style={{ direction: ar ? "rtl" : "ltr" }}
    >
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Language switcher */}
      <div className="max-w-xl w-full mx-auto flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <AppLogo className="h-9 w-9" />
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">
              Public Insight
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold block uppercase tracking-wider">
              {L("Public Feedback", "رأي الجمهور العام")}
            </span>
          </div>
        </div>

        <button
          onClick={() => setLang(ar ? "en" : "ar")}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 transition"
        >
          {ar ? "English" : "العربية"}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-xl w-full mx-auto flex-grow flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="feedback-form-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Cover visual banner */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

              <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug">
                  {L("We value your opinion!", "رأيك يهمنا ويصنع الفرق!")}
                </h1>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {L(
                    `Share your feedback about "${currentCampaignName}" organized by ${organizerName}.`,
                    `يسعدنا أن تشاركنا رأيك بخصوص حملة "${currentCampaignName}" المقدمة من طرف ${organizerName}.`,
                  )}
                </p>
              </div>

              {campaign?.description && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 leading-relaxed text-center italic">
                  "{campaign.description}"
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Age Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    {L("1. Age Group", "١. الفئة العمرية")}{" "}
                    <span className="text-indigo-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["under-18", "18-24", "25-34", "35-44", "45-54", "55-plus"].map((item) => {
                      const labelText = {
                        "under-18": L("Under 18", "أقل من ١٨ سنة"),
                        "18-24": "18 - 24",
                        "25-34": "25 - 34",
                        "35-44": "35 - 44",
                        "45-54": "45 - 54",
                        "55-plus": L("55+", "+٥٥ سنة"),
                      }[item];
                      const selected = age === item;
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setAge(item)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition ${
                            selected
                              ? "bg-indigo-500/15 border-indigo-500 text-indigo-300"
                              : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400"
                          }`}
                        >
                          {labelText}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Gender Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    {L("2. Gender", "٢. الجنس")} <span className="text-indigo-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "male", text: L("Male", "ذكر"), icon: "♂" },
                      { key: "female", text: L("Female", "أنثى"), icon: "♀" },
                    ].map((item) => {
                      const selected = gender === item.key;
                      return (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => setGender(item.key)}
                          className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                            selected
                              ? "bg-indigo-500/15 border-indigo-500 text-indigo-300"
                              : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400"
                          }`}
                        >
                          <span className="text-sm opacity-80">{item.icon}</span>
                          <span>{item.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Question 1 */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 leading-normal">
                    {L(
                      "3. Did you understand the campaign's core message?",
                      "٣. هل فهمت الرسالة الأساسية للحملة الإعلانية؟",
                    )}{" "}
                    <span className="text-indigo-400">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        key: "yes",
                        text: L("Yes, perfectly clear", "نعم، كانت واضحة تماماً بالنسبة لي"),
                      },
                      {
                        key: "partially",
                        text: L("Partially clear / somewhat", "جزئياً / فهمت بعض الأجزاء فقط"),
                      },
                      {
                        key: "no",
                        text: L("No, it was ambiguous / confusing", "لا، لم تكن واضحة ومبهمة"),
                      },
                    ].map((opt) => {
                      const selected = q1 === opt.key;
                      return (
                        <button
                          type="button"
                          key={opt.key}
                          onClick={() => setQ1(opt.key)}
                          className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold text-start flex items-center gap-3 transition ${
                            selected
                              ? "bg-indigo-500/15 border-indigo-500 text-indigo-300"
                              : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${selected ? "border-indigo-500" : "border-slate-700"}`}
                          >
                            {selected && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                          </div>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Question 2 */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 leading-normal">
                    {L(
                      "4. Did this campaign alter your opinion, perception, or behavior?",
                      "٤. هل غيرت هذه الحملة من رأيك، سلوكك، أو انطباعك السابق؟",
                    )}{" "}
                    <span className="text-indigo-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        key: "yes",
                        text: L("Yes, it had an impact", "نعم، أحدثت تأثيراً وإقناعاً"),
                      },
                      { key: "no", text: L("No, no change", "لا، لم يتغير سلوكي أو رأيي") },
                    ].map((opt) => {
                      const selected = q2 === opt.key;
                      return (
                        <button
                          type="button"
                          key={opt.key}
                          onClick={() => setQ2(opt.key)}
                          className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                            selected
                              ? "bg-indigo-500/15 border-indigo-500 text-indigo-300"
                              : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${selected ? "border-indigo-500" : "border-slate-700"}`}
                          >
                            {selected && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                          </div>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Short text feedback */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 leading-normal">
                    {L(
                      "5. Write your opinion about the campaign's content or organization (Optional)",
                      "٥. اكتب رأيك أو ملاحظتك حول محتوى الحملة وتنظيمها (اختياري)",
                    )}
                  </label>
                  <textarea
                    value={opinion}
                    onChange={(e) => setOpinion(e.target.value)}
                    rows={3}
                    placeholder={L(
                      "What did you like? What can be improved?",
                      "ما الذي أعجبك؟ وما الذي يحتاج إلى تحسين في رسالة الحملة؟",
                    )}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 transition outline-none resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{L("Submit Feedback", "إرسال الرأي")}</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="feedback-success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

              <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                {L("Thank You Very Much!", "نشكرك جزيلاً على وقتك!")}
              </h2>

              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
                {L(
                  "Your feedback was recorded successfully. Your honest opinions help us optimize future campaign formats, styles, and overall messaging to deliver peak value.",
                  "تم تسجيل رأيك بنجاح وبشكل سري. تساهم مشاركتك القيمة في تحسين صياغة محتوى الحملة ورفع جودة الخدمات وتنظيمها في المستقبل المستدام.",
                )}
              </p>

              <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 inline-flex items-center gap-2 mb-8">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-300">
                  {L(
                    "Powered by Public Insight Analytics Platform",
                    "مدعوم من منصة Public Insight لتحليل الآراء",
                  )}
                </span>
              </div>

              <div>
                <a
                  href="/home"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{L("Go to Homepage", "الذهاب للرئيسية")}</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center mt-8 relative z-10">
        <p className="text-[10px] text-slate-600 font-semibold flex items-center justify-center gap-1.5">
          <span>{L("Public Insight Platform", "منصة Public Insight")}</span>
          <span>•</span>
          <span className="flex items-center gap-0.5 text-rose-500">
            <Heart className="h-3 w-3 fill-rose-500" />
          </span>
          <span>{L("Linguistic Alignment System", "نظام المواءمة اللغوية")}</span>
        </p>
      </footer>
    </div>
  );
}
