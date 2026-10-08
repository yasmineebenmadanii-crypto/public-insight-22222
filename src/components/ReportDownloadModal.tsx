import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Printer,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { downloadPDFDirectly, printReportDocument } from "@/lib/pdfGenerator";
import { useI18n } from "@/lib/i18n";

export interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  fileName: string;
  blobUrl: string;
  dataUri?: string;
  pdfBlob?: Blob;
  containerHtml?: string;
  score?: number;
  mode?: "pre" | "post";
  totalPages?: number;
}

export function ReportDownloadModal({
  isOpen,
  onClose,
  campaignName,
  fileName,
  blobUrl,
  dataUri = "",
  pdfBlob,
  containerHtml = "",
  score,
  mode = "post",
  totalPages = 2,
}: ReportDownloadModalProps) {
  const { lang } = useI18n();
  const isArabic = lang === "ar";
  const L = (en: string, ar: string) => (isArabic ? ar : en);

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleDownloadToPC = async () => {
    if (pdfBlob) {
      const ok = await downloadPDFDirectly(pdfBlob, dataUri, fileName);
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } else {
      // Fallback
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 2000);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    }
  };

  const handlePrintToPDF = () => {
    if (containerHtml) {
      printReportDocument(containerHtml, fileName);
    } else {
      window.print();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(blobUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-surface border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Header Banner */}
          <div className="gradient-primary p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-white/80 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  {L("Official PDF Report Ready", "تقرير الـ PDF الفني المعتمد جاهز")}
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold leading-tight">
                  {L("Save PDF Report to Your Computer", "حفظ وتنزيل تقرير PDF على جهازك")}
                </h2>
              </div>
            </div>
            <p className="text-xs text-white/85 max-w-lg mt-1">
              {L(
                "Full comprehensive intelligence report containing strategy evaluation, Algerian Wilayas performance, SWOT, demographic insights, and recommendations.",
                "تقرير تحليلي استراتيجي شامل يتضمن تقييم الجاهزية، تحليل الولايات الجزائرية، نقاط القوة والضعف، والتوصيات الفنية المعتمدة.",
              )}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            {/* Campaign Summary Card */}
            <div className="glass-card p-4 border border-border/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  {L("Campaign Name & File", "اسم الحملة والملف")}
                </div>
                <div className="font-display font-bold text-base text-foreground">
                  {campaignName}
                </div>
                <div className="text-xs font-mono text-primary font-semibold break-all">
                  {fileName}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {score !== undefined && (
                  <div className="text-center px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">
                      {L("Score", "الدرجة")}
                    </div>
                    <div className="font-display font-extrabold text-lg text-primary leading-none">
                      {score}/100
                    </div>
                  </div>
                )}
                <div className="text-center px-3 py-1.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase">
                    {L("Pages", "الصفحات")}
                  </div>
                  <div className="font-display font-extrabold text-lg text-foreground leading-none">
                    {totalPages} {L("A4", "A4")}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification / Success Status */}
            {downloadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-medium"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  {L(
                    "Download triggered! The PDF file has been sent to your PC's Downloads folder.",
                    "تم إرسال الملف! تحقق من مجلد التنزيلات (Downloads) على جهازك للحصول على ملف الـ PDF.",
                  )}
                </span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {L("Choose how to save to your PC:", "اختر طريقة الحفظ على حاسوبك:")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Method 1: Direct PC Download */}
                <button
                  onClick={handleDownloadToPC}
                  className="w-full py-4 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                >
                  <Download className="h-5 w-5 shrink-0" />
                  <div className="text-left rtl:text-right">
                    <div>{L("Download PDF to PC", "تحميل ملف PDF إلى الحاسوب")}</div>
                    <div className="text-[11px] font-normal text-white/80">
                      {L("Direct file download (.pdf)", "تنزيل مباشر إلى مجلد Downloads")}
                    </div>
                  </div>
                </button>

                {/* Method 2: Browser Native Print to PDF */}
                <button
                  onClick={handlePrintToPDF}
                  className="w-full py-4 px-5 rounded-2xl bg-surface-elevated hover:bg-surface border border-border hover:border-primary/50 text-foreground font-bold text-sm flex items-center justify-center gap-3 shadow-md hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                >
                  <Printer className="h-5 w-5 shrink-0 text-primary" />
                  <div className="text-left rtl:text-right">
                    <div>{L("Save as PDF via Print", "حفظ كـ PDF عبر الطباعة")}</div>
                    <div className="text-[11px] font-normal text-muted-foreground">
                      {L("Native browser print dialog", "حفظ فوري بجودة متجهة فائقة")}
                    </div>
                  </div>
                </button>
              </div>

              {/* Utility secondary actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold px-2 py-1.5 rounded-lg hover:bg-surface-elevated transition cursor-pointer"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>{L("Hide Report Preview", "إخفاء معاينة التقرير")}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>{L("Preview Report Pages", "معاينة صفحات التقرير")}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-semibold px-2 py-1.5 rounded-lg hover:bg-primary/5 transition cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{L("Open in Browser Tab", "فتح في لسان جديد")}</span>
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-semibold px-2 py-1.5 rounded-lg hover:bg-surface-elevated transition cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{L("Copied!", "تم النسخ!")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{L("Copy Blob Link", "نسخ الرابط")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* In-Modal PDF Preview if requested */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-inner"
              >
                <div className="text-[11px] font-bold text-slate-700 px-2 py-1 bg-slate-100 rounded-t-lg border-b border-slate-200 flex items-center justify-between">
                  <span>{L("Report Document Viewer", "معاينة صفحات التقرير")}</span>
                  <span className="font-mono text-[10px] text-slate-500">{fileName}</span>
                </div>
                <iframe
                  src={blobUrl}
                  title="PDF Preview"
                  className="w-full h-80 rounded-b-lg border-0 bg-white"
                />
              </motion.div>
            )}

            {/* Pro-tip Notice */}
            <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">
                {L("💡 Pro-Tip for Saving to PC: ", "💡 نصيحة هامة لحفظ الملف: ")}
              </span>
              {L(
                "Clicking 'Download PDF to PC' downloads the file directly. If your browser restricts downloads from iframe previews, click 'Save as PDF via Print' — in the print dialog, select destination 'Save as PDF' to save immediately to any folder on your computer.",
                "النقر على «تحميل ملف PDF إلى الحاسوب» يحفظ الملف فوراً في مجلد التنزيلات. إذا قيّد المتصفح التنزيل التلقائي، اختر «حفظ كـ PDF عبر الطباعة» وحدد الوجهة «Save as PDF» ليتم الحفظ مباشرة على جهازك دون أي قيود.",
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-surface-elevated/40 border-t border-border/60 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {L(
                "Public Insight Analytics Center • Official Intelligence",
                "مركز تحليلات Public Insight • وثيقة فنية معتمدة",
              )}
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-border hover:bg-surface-elevated text-xs font-semibold text-foreground transition cursor-pointer"
            >
              {L("Done", "تم")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
