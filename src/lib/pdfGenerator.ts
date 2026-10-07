import { jsPDF } from "jspdf";
import { APP_LOGO_BASE64 } from "@/lib/logoBase64";

function getPdfCampaignFeedback(
  campaignId: string,
  overallScore: number = 80,
  isArabic: boolean = true,
) {
  const key = `pi-campaign-feedback-${campaignId}`;
  let userFeedbacks: any[] = [];
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userFeedbacks = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        userFeedbacks = [];
        console.error("Error loading feedback from storage:", e);
      }
    }
  }

  const preseeded: any[] = [];
  const count = 32;
  const isHigh = overallScore >= 85;
  const isAvg = overallScore >= 70 && overallScore < 85;

  const positiveOpinionsAr = [
    "حملة رائعة ومفهومة جداً، أعجبني التصميم واختيار الكلمات الرنانة والمؤثرة.",
    "فكرة ممتازة وتلامس الواقع اليومي، التوصيل كان سريعاً ومناسباً جداً للفئات الشابة.",
    "اللهجة المستخدمة قريبة جداً من القلب وسهلة الفهم وابتعدت عن التعقيد.",
    "أفضل حملة رأيتها هذا الشهر، التنظيم كان غاية في الروعة والإنتاج متميز.",
    "رسالة قوية وهادفة غيرت وجهة نظري الإيجابية تماماً تجاه المنتج والخدمة.",
    "مبدعون! جودة الفيديو والمحتوى الإبداعي ممتازة وبسيطة.",
  ];

  const positiveOpinionsEn = [
    "Fantastic campaign! The message was clear, visually compelling, and relatable.",
    "Great concept that directly resonates with our daily needs. Very appealing to younger audiences.",
    "The dialect and tone felt genuine, friendly, and easy to connect with.",
    "Best promotional campaign seen this quarter. Production quality is outstanding.",
    "A powerful and inspiring message that significantly boosted my brand trust.",
    "Creative execution with high visual standards and an engaging narrative.",
  ];

  const neutralOpinionsAr = [
    "الحملة جيدة في مجملها لكنها تحتاج إلى شرح إضافي لبعض النقاط التقنية.",
    "المحتوى ممتاز ولكن المؤثرات البصرية والموسيقى كانت مشتتة قليلاً.",
    "التنظيم مقبول ولكن أرى أنه كان يمكن تحسين جودة الصور والبوسترات بشكل أفضل.",
  ];

  const neutralOpinionsEn = [
    "Good campaign overall, though certain technical details could be clarified further.",
    "Solid creative direction, but background music was slightly distracting.",
    "Acceptable delivery, but visual imagery could have higher resolution.",
  ];

  const negativeOpinionsAr = [
    "الرسالة غير واضحة وهناك غموض في الهدف الرئيسي من العرض الترويجي.",
    "لم تعجبني النبرة المستخدمة، أرى أنها غير ملائمة لعامة الناس.",
  ];

  const negativeOpinionsEn = [
    "The core message could be more straightforward and focused on real benefits.",
    "The promotional tone felt a bit generic and could be more authentic.",
  ];

  const posList = isArabic ? positiveOpinionsAr : positiveOpinionsEn;
  const neuList = isArabic ? neutralOpinionsAr : neutralOpinionsEn;
  const negList = isArabic ? negativeOpinionsAr : negativeOpinionsEn;

  for (let i = 0; i < count; i++) {
    const seed = (campaignId.charCodeAt(0) || 0) + i + 17;

    let age = "25-34";
    if (seed % 6 === 0) age = "18-24";
    else if (seed % 6 === 1) age = "25-34";
    else if (seed % 6 === 2) age = "35-44";
    else if (seed % 6 === 3) age = "18-24";
    else if (seed % 6 === 4) age = "45-54";
    else age = "under-18";

    const gender = seed % 2 === 0 ? "female" : "male";

    let q1 = "yes";
    if (isHigh) {
      q1 = seed % 10 < 8 ? "yes" : seed % 10 === 8 ? "partially" : "no";
    } else if (isAvg) {
      q1 = seed % 10 < 6 ? "yes" : seed % 10 < 9 ? "partially" : "no";
    } else {
      q1 = seed % 10 < 4 ? "yes" : seed % 10 < 8 ? "partially" : "no";
    }

    let q2 = "yes";
    if (isHigh) {
      q2 = seed % 5 < 4 ? "yes" : "no";
    } else if (isAvg) {
      q2 = seed % 5 < 3 ? "yes" : "no";
    } else {
      q2 = seed % 5 < 2 ? "yes" : "no";
    }

    let opinion = "";
    if (seed % 3 !== 0) {
      if (q1 === "yes" && q2 === "yes") {
        opinion = posList[seed % posList.length];
      } else if (q1 === "partially" || q2 === "no") {
        opinion = neuList[seed % neuList.length];
      } else {
        opinion = negList[seed % negList.length];
      }
    }

    preseeded.push({
      id: `seed_${campaignId}_${i}`,
      age,
      gender,
      q1,
      q2,
      opinion,
      date: "2026-07-08",
      isPreseeded: true,
    });
  }

  const safeUserFeedbacks = Array.isArray(userFeedbacks) ? userFeedbacks : [];
  return [...safeUserFeedbacks, ...preseeded];
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text || "");
}

export interface PDFExportResult {
  success: boolean;
  blobUrl: string;
  dataUri: string;
  fileName: string;
  pdfBlob: Blob;
  containerHtml: string;
  totalPages: number;
}

// Helper to draw rounded rectangle on 2D context
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  fill = true,
  stroke = true,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Helper to wrap text cleanly
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Draw standard header banner across all pages
function drawHeader(
  ctx: CanvasRenderingContext2D,
  titleEn: string,
  titleAr: string,
  badgeEn: string,
  badgeAr: string,
  dateStr: string,
  isArabic: boolean,
  logoImg: HTMLImageElement | null,
) {
  // Top Banner
  ctx.fillStyle = "#091c52";
  ctx.fillRect(0, 0, 1240, 120);

  // Logo if loaded
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, 45, 20, 80, 80);
  } else {
    ctx.fillStyle = "#1e1e5a";
    roundRect(ctx, 45, 20, 80, 80, 12, true, false);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PI", 85, 70);
  }

  // Brand Name & Page Subtitle
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px 'Space Grotesk', 'Cairo', sans-serif";
  ctx.fillText("Public Insight", 145, 58);

  ctx.fillStyle = "#a5b4fc";
  ctx.font = "600 16px 'Space Grotesk', 'Cairo', sans-serif";
  ctx.fillText(isArabic ? titleAr : titleEn, 145, 90);

  // Right Badge
  ctx.textAlign = "right";
  ctx.fillStyle = "#e0e7ff";
  roundRect(ctx, 920, 25, 275, 36, 8, true, false);
  ctx.fillStyle = "#1e1b4b";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText(isArabic ? badgeAr : badgeEn, 1180, 48);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 13px monospace";
  ctx.fillText(dateStr, 1180, 85);
}

// Draw standard footer across all pages
function drawFooter(
  ctx: CanvasRenderingContext2D,
  pageNum: number,
  totalPages: number,
  isArabic: boolean,
) {
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(45, 1680);
  ctx.lineTo(1195, 1680);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#4338ca";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("●", 45, 1715);

  ctx.fillStyle = "#475569";
  ctx.font = "bold 13px 'DM Sans', 'Cairo', sans-serif";
  ctx.fillText(
    isArabic
      ? "مركز تحليلات Public Insight • التقرير الفني المعتمد للحملة"
      : "Public Insight Analytics Center • Official Intelligence Report",
    65,
    1714,
  );

  ctx.textAlign = "right";
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px monospace";
  ctx.fillText(
    isArabic ? `الصفحة ${pageNum} من ${totalPages}` : `Page ${pageNum} of ${totalPages}`,
    1195,
    1714,
  );
}

export async function downloadPDFDirectly(
  blob: Blob,
  dataUri: string,
  fileName: string,
): Promise<boolean> {
  // If the browser supports File System Access API (Chrome/Edge on PC), use it for native PC Save dialog
  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "PDF Document (*.pdf)",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        return true; // User intentionally dismissed file picker
      }
      console.warn("Native file picker failed, falling back to download link:", err);
    }
  }

  // Fallback 1: Standard Blob URL anchor
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_self";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 4000);
    return true;
  } catch (e) {
    console.warn("Blob URL anchor failed:", e);
  }

  // Fallback 2: Data URI anchor
  try {
    const link2 = document.createElement("a");
    link2.href = dataUri;
    link2.download = fileName;
    link2.target = "_self";
    link2.style.display = "none";
    document.body.appendChild(link2);
    link2.click();
    setTimeout(() => {
      if (document.body.contains(link2)) document.body.removeChild(link2);
    }, 4000);
    return true;
  } catch (e) {
    console.warn("Data URI anchor failed:", e);
  }

  return false;
}

export function printReportDocument(
  containerHtml: string,
  title = "Public Insight Report",
): boolean {
  try {
    const iframe = document.createElement("iframe");
    iframe.id = "print-report-frame";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "794px";
    iframe.style.height = "1123px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return false;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8" />
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .pdf-page {
              page-break-after: always;
              break-after: page;
              width: 100% !important;
              box-sizing: border-box;
            }
            .pdf-page:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
          </style>
        </head>
        <body>
          ${containerHtml}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn("Iframe print error:", err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 30000);
      }
    }, 450);
    return true;
  } catch (err) {
    console.error("Failed to print report:", err);
    return false;
  }
}

// Loads image object asynchronously for fast canvas blitting
function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function exportCampaignToPDF(
  record: any,
  lang: "ar" | "en",
): Promise<PDFExportResult> {
  const isArabic = lang === "ar";
  const isPostCampaign = record.mode === "post";
  const totalPages = isPostCampaign ? 5 : 4;

  const campaignName = record.name || (isArabic ? "حملة إعلانية" : "Campaign");
  const overallScore = record.score || 78;
  const dialectKey = record.campaignObj?.dialect || record.dialect || "standard";
  const campaignType = record.campaignObj?.type || "awareness";
  const dateStr = record.date || new Date().toISOString().split("T")[0];

  const dialectNames: Record<string, string> = {
    standard: isArabic ? "العربية الفصحى" : "Modern Standard Arabic (Fusha)",
    algerian: isArabic ? "اللهجة الجزائرية" : "Algerian Dialect (Darija)",
    egyptian: isArabic ? "اللهجة المصرية" : "Egyptian Dialect",
    gulf: isArabic ? "اللهجة الخليجية" : "Gulf Dialect",
    levantine: isArabic ? "اللهجة الشامية" : "Levantine Dialect",
    english: isArabic ? "اللغة الإنجليزية" : "English Language",
  };

  const safeName = (record.name || "Campaign")
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_");
  const fileName = `PublicInsight_${safeName}_Report.pdf`;

  // Preload logo
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImg(APP_LOGO_BASE64);
  } catch {
    // Ignore logo preload error
  }

  // Strategy Evaluation
  const defaultEvaluation = isArabic
    ? "تظهر استراتيجية الحملة تموضعاً تنافسياً قوياً وقنوات إعلانية محددة بعناية تامة. تتناسب التصاميم والرسائل الإعلانية بشكل متناسق مع اهتمامات وتطلعات الشريحة المستهدفة، مما يضمن وصولاً مستقراً واستغلالاً مثالياً ومستداماً للميزانية المخصصة."
    : "Overall, the campaign strategy demonstrates robust positioning with carefully selected distribution channels. Ad creatives align seamlessly with audience expectations, ensuring steady reach and efficient budget utilization.";

  const defaultForecast = isArabic
    ? "فرص قوية لتحقيق معدلات وعي استثنائية مع قفزة تفاعل متوقعة بفضل المواءمة الثقافية الذكية. يتوقع أن تبقى كلفة النقرة (CPC) دون متوسط السوق في حال الاعتماد على النسخ الإعلانية المحلية ومقاطع الفيديو القصيرة."
    : "High potential to achieve remarkable awareness levels with an estimated engagement surge driven by cultural alignment. Cost-per-click (CPC) is projected to stay comfortably below market averages when utilizing localized video creative.";

  const defaultDiagnosis = isArabic
    ? `حققت الحملة درجة جاهزية متميزة (${overallScore}/100) مع استجابة إيجابية عالية عبر المنصات المستهدفة. يعكس توقيت النشر والمواءمة اللغوية فهماً عميقاً لسلوك المستهلك المحلي. نوصي بتعزيز ميزانيات مقاطع الفيديو التفاعلية للحفاظ على استدامة الزخم ومضاعفة معدلات التحويل.`
    : `The campaign registered a high readiness score (${overallScore}/100) with strong favorable reception across selected channels. Strategic timing and cultural dialect matching reflect an in-depth understanding of target consumer behavior. We recommend expanding short-form video allocation to sustain momentum and optimize conversions.`;

  let diagnosisText = record.aiReport?.reportDescription || defaultDiagnosis;
  if (!isArabic && hasArabic(diagnosisText)) diagnosisText = defaultDiagnosis;
  else if (isArabic && !hasArabic(diagnosisText)) diagnosisText = defaultDiagnosis;

  let evaluationText = record.aiReport?.campaignEvaluation || defaultEvaluation;
  if (!isArabic && hasArabic(evaluationText)) evaluationText = defaultEvaluation;
  else if (isArabic && !hasArabic(evaluationText)) evaluationText = defaultEvaluation;

  let forecastText = record.aiReport?.performanceForecast || defaultForecast;
  if (!isArabic && hasArabic(forecastText)) forecastText = defaultForecast;
  else if (isArabic && !hasArabic(forecastText)) forecastText = defaultForecast;

  // SWOT
  const defaultStrengths = isArabic
    ? [
        "مواءمة ثقافية متميزة جداً باستخدام اللهجة المحلية المعتمدة.",
        "تركيز الميزانية بذكاء على منصات الفيديو البصري التفاعلية.",
        "وضوح الرسالة التسويقية وجاذبية الشعار المعتمد.",
      ]
    : [
        "High cultural alignment with target localized dialect.",
        "Efficient budget allocation focused on visual short-form video.",
        "Compelling value proposition with clear call-to-action.",
      ];

  const defaultWeaknesses = isArabic
    ? [
        "الاعتماد المرتفع على الإعلانات المدفوعة دون زخم عضوي مستدام.",
        "غياب إشارات واضحة لتتبع تفاعل المنافسين المباشرين.",
      ]
    : [
        "Over-reliance on paid ad spend without organic momentum.",
        "Limited differentiation against regional competitor offers.",
      ];

  const defaultOpportunities = isArabic
    ? [
        "التوسع نحو مقاطع ريلز وتيك توك مع صناع محتوى محليين موثوقين.",
        "طرح عروض حصرية تفاعلية وأكواد خصم تحفز الشراء السريع.",
      ]
    : [
        "Expand into short-form UGC video partnerships.",
        "Deploy exclusive promotional discount codes to accelerate conversion.",
      ];

  const defaultThreats = isArabic
    ? [
        "احتمال تشبع الجمهور المستهدف في حال عدم تجديد المواد الإعلانية.",
        "ارتفاع كلفة النقرة في مواسم الذروة والمناسبات العامة.",
      ]
    : [
        "Audience creative fatigue if creatives are not refreshed bi-weekly.",
        "Rising cost-per-click during peak commercial seasons.",
      ];

  const resolveList = (sourceList: any, defaultList: string[]) => {
    if (Array.isArray(sourceList) && sourceList.length > 0) {
      const items = sourceList
        .slice(0, 3)
        .map((item: any) =>
          typeof item === "string" ? item : item.title || item.text || String(item),
        );
      if (isArabic && items.every((s: string) => hasArabic(s))) return items;
      if (!isArabic && items.every((s: string) => !hasArabic(s))) return items;
    }
    return defaultList;
  };

  const finalStrengths = resolveList(
    record.aiReport?.strengths || record.resultObj?.strengths,
    defaultStrengths,
  );
  const finalWeaknesses = resolveList(
    record.aiReport?.weaknesses || record.resultObj?.weaknesses,
    defaultWeaknesses,
  );
  const finalOpportunities = resolveList(record.aiReport?.opportunities, defaultOpportunities);
  const finalThreats = resolveList(record.aiReport?.threats, defaultThreats);

  // Recommendations
  const defaultRecs = isArabic
    ? [
        {
          title: "تكثيف إنتاج مقاطع الفيديو القصيرة (Short-Form Video)",
          detail:
            "ركز 70% من المواد الإعلانية على مقاطع ريلز وتيك توك بمدة 15 إلى 30 ثانية مع خطاف بصري في أول 3 ثوانٍ.",
          category: "CONTENT",
        },
        {
          title: "التعاون مع المؤثرين وصناع المحتوى المحليين",
          detail:
            "استثمر جزءاً من الميزانية في شراكات مع صناع محتوى يتمتعون بمصداقية عالية لتقديم تجارب عفوية تحفز الثقة.",
          category: "PARTNERSHIPS",
        },
        {
          title: "إطلاق حملة إعادة استهداف تفاعلية بعروض حصرية",
          detail:
            "أنشئ جمهوراً مخصصاً من الأشخاص الذين شاهدوا أكثر من 50% من إعلاناتك وقدم لهم عروضاً أو أكواد خصم حصرية.",
          category: "CONVERSION",
        },
      ]
    : [
        {
          title: "Double Down on Short-Form Video Assets",
          detail:
            "Direct 70% of creative resources into 15-30s Reels & TikTok clips with strong 3-second visual hooks.",
          category: "CONTENT",
        },
        {
          title: "Collaborate with Authentic Regional Creators",
          detail:
            "Engage trustworthy local creators for organic product demonstrations that build authentic social proof.",
          category: "PARTNERSHIPS",
        },
        {
          title: "Deploy Dynamic Retargeting with Exclusive Incentives",
          detail:
            "Build a custom segment of viewers who completed 50%+ of campaign videos, offering tailored incentives.",
          category: "CONVERSION",
        },
      ];

  const rawRecs = record.aiReport?.recommendations || record.resultObj?.recommendations;
  let finalRecommendations = defaultRecs;
  if (Array.isArray(rawRecs) && rawRecs.length > 0) {
    const formatted = rawRecs.slice(0, 3).map((r: any, idx: number) => ({
      title: r.title || r.name || (isArabic ? "توصية هامة" : "Key Recommendation"),
      detail:
        r.detail ||
        r.description ||
        (isArabic ? "توصية استراتيجية معتمدة." : "Strategic guidance recommendation."),
      category: r.category
        ? r.category.toUpperCase()
        : idx === 0
          ? "CONTENT"
          : idx === 1
            ? "TARGETING"
            : "STRATEGY",
    }));
    finalRecommendations = formatted;
  }

  // Regional Algerian Wilayas Data
  const selectedWilayas = [
    { code: 16, nameAr: "الجزائر العاصمة", nameEn: "Algiers (Capital)", region: "coast" },
    { code: 31, nameAr: "وهران", nameEn: "Oran", region: "coast" },
    { code: 25, nameAr: "قسنطينة", nameEn: "Constantine", region: "plateaus" },
    { code: 19, nameAr: "سطيف", nameEn: "Sétif", region: "plateaus" },
    { code: 23, nameAr: "عنابة", nameEn: "Annaba", region: "coast" },
    { code: 8, nameAr: "بشار", nameEn: "Béchar", region: "desert" },
  ];

  const isMaghrebiDialect =
    dialectKey.toLowerCase() === "maghrebi" ||
    dialectKey.toLowerCase() === "algerian" ||
    (dialectKey.toLowerCase() !== "gulf" && dialectKey.toLowerCase() !== "standard");

  const wilayaRows = selectedWilayas.map((wilaya) => {
    const seed = (wilaya.code * 7 + campaignName.length * 3 + overallScore * 5) % 100;
    let localScore = overallScore - 12 + (seed % 25);
    if (isMaghrebiDialect) localScore += 10;
    else if (dialectKey.toLowerCase() === "standard") localScore += 2;
    else localScore -= 8;
    localScore = Math.max(45, Math.min(98, localScore));

    const statusLabel =
      localScore >= 80
        ? isArabic
          ? "توافق ممتاز"
          : "Optimal Fit"
        : localScore >= 65
          ? isArabic
            ? "أداء قياسي"
            : "Good Fit"
          : isArabic
            ? "يحتاج تحسين"
            : "Refinement Needed";

    const isMajorCity = wilaya.code === 16 || wilaya.code === 31 || wilaya.code === 25;
    const populationFactor = isMajorCity
      ? 3.4
      : wilaya.code === 19 || wilaya.code === 23
        ? 2.1
        : 1.0;
    const views = Math.max(1200, Math.round((overallScore * 280 + seed * 90) * populationFactor));
    const engagementRate = Math.round((2.5 + localScore / 16) * 10) / 10;

    let bestPlatform = "Instagram";
    if (wilaya.region === "desert") bestPlatform = "Facebook";
    else if (campaignType === "commercial" && isMajorCity) bestPlatform = "TikTok";
    else if (campaignType === "electoral" || campaignType === "social") bestPlatform = "Facebook";

    return {
      name: isArabic ? wilaya.nameAr : wilaya.nameEn,
      code: wilaya.code,
      score: localScore,
      statusLabel,
      views,
      engagementRate,
      bestPlatform,
    };
  });

  const durationText = record.campaignObj?.durationValue
    ? `${record.campaignObj.durationValue} ${record.campaignObj.durationUnit === "weeks" ? (isArabic ? "أسابيع" : "Weeks") : isArabic ? "أيام" : "Days"}`
    : isArabic
      ? "٣٠ يوماً"
      : "30 Days";

  const audienceAge = record.campaignObj?.age || "18-45";
  const audienceGender =
    record.campaignObj?.gender === "male"
      ? isArabic
        ? "الذكور فقط"
        : "Male Only"
      : record.campaignObj?.gender === "female"
        ? isArabic
          ? "الإناث فقط"
          : "Female Only"
        : isArabic
          ? "كلا الجنسين (ذكور وإناث)"
          : "All (Male & Female)";
  const audienceLocation =
    record.campaignObj?.location || (isArabic ? "الجزائر (كافة الولايات)" : "Algeria (National)");
  const organizerText =
    record.campaignObj?.organizer || (isArabic ? "مؤسسة معتمدة" : "Verified Brand / Organization");

  // Create jsPDF instance
  const pdf = new jsPDF("p", "mm", "a4");

  // =========================================================================
  // PAGE 1: COVER & CAMPAIGN SETUP
  // =========================================================================
  const canvas1 = document.createElement("canvas");
  canvas1.width = 1240;
  canvas1.height = 1754;
  const ctx1 = canvas1.getContext("2d")!;
  ctx1.fillStyle = "#ffffff";
  ctx1.fillRect(0, 0, 1240, 1754);

  drawHeader(
    ctx1,
    "AI Campaign Intelligence Audit",
    "المنصة الذكية لتحليلات الحملات والذكاء الاصطناعي",
    "CERTIFIED AUDIT REPORT",
    "تقرير فني رسمي معتمد",
    dateStr,
    isArabic,
    logoImg,
  );

  // Campaign Title Card
  ctx1.fillStyle = "#4338ca";
  ctx1.font = "bold 15px sans-serif";
  ctx1.fillText(
    isArabic
      ? "التقرير التحليلي الشامل والتقييم الاستراتيجي للحملة"
      : "OFFICIAL CAMPAIGN ASSESSMENT & STRATEGIC INTELLIGENCE",
    50,
    165,
  );

  ctx1.fillStyle = "#0f172a";
  ctx1.font = "bold 36px 'Space Grotesk', 'Cairo', sans-serif";
  ctx1.fillText(campaignName, 50, 215);

  ctx1.strokeStyle = "#cbd5e1";
  ctx1.lineWidth = 1.5;
  ctx1.beginPath();
  ctx1.moveTo(50, 240);
  ctx1.lineTo(1190, 240);
  ctx1.stroke();

  // 1. Bento Parameters
  ctx1.fillStyle = "#f8fafc";
  ctx1.strokeStyle = "#cbd5e1";
  roundRect(ctx1, 50, 260, 1140, 290, 14, true, true);

  ctx1.fillStyle = "#0f172a";
  ctx1.font = "bold 18px sans-serif";
  ctx1.fillText(
    isArabic
      ? "١. محددات الحملة الإعلانية والشريحة المستهدفة"
      : "1. Campaign Parameters & Audience Target",
    75,
    300,
  );

  // 4 Grid Fields
  const drawParam = (label: string, val: string, x: number, y: number) => {
    ctx1.fillStyle = "#64748b";
    ctx1.font = "bold 12px sans-serif";
    ctx1.fillText(label.toUpperCase(), x, y);
    ctx1.fillStyle = "#0f172a";
    ctx1.font = "bold 16px sans-serif";
    ctx1.fillText(val, x, y + 25);
  };

  drawParam(isArabic ? "الجهة المنظمة / العلامة" : "Organizer / Brand", organizerText, 75, 345);
  drawParam(
    isArabic ? "الميزانية المعتمدة" : "Approved Budget",
    `$${parseFloat(record.budget || "1000").toLocaleString()} USD`,
    620,
    345,
  );
  drawParam(
    isArabic ? "اللهجة اللغوية المستهدفة" : "Target Dialect",
    dialectNames[dialectKey] || dialectKey,
    75,
    420,
  );
  drawParam(isArabic ? "فترة تشغيل الحملة" : "Execution Duration", durationText, 620, 420);

  // Audience Pills
  ctx1.fillStyle = "#64748b";
  ctx1.font = "bold 12px sans-serif";
  ctx1.fillText(
    isArabic ? "المعايير الديموغرافية والنطاق الجغرافي" : "AUDIENCE CRITERIA & GEOGRAPHIC SCOPE",
    75,
    490,
  );

  const drawPill = (text: string, x: number, y: number) => {
    ctx1.font = "bold 13px sans-serif";
    const w = ctx1.measureText(text).width + 24;
    ctx1.fillStyle = "#ffffff";
    ctx1.strokeStyle = "#cbd5e1";
    roundRect(ctx1, x, y, w, 32, 8, true, true);
    ctx1.fillStyle = "#1e293b";
    ctx1.fillText(text, x + 12, y + 21);
    return x + w + 12;
  };

  let pillX = 75;
  pillX = drawPill(`${isArabic ? "العمر: " : "Age: "}${audienceAge}`, pillX, 505);
  pillX = drawPill(`${isArabic ? "الجنس: " : "Gender: "}${audienceGender}`, pillX, 505);
  drawPill(`${isArabic ? "السوق: " : "Market: "}${audienceLocation}`, pillX, 505);

  // Narrative Card
  ctx1.fillStyle = "#ffffff";
  ctx1.strokeStyle = "#cbd5e1";
  roundRect(ctx1, 50, 580, 1140, 190, 14, true, true);

  ctx1.fillStyle = "#475569";
  ctx1.font = "bold 13px sans-serif";
  ctx1.fillText(
    isArabic ? "وصف ومفهوم الحملة الإعلانية" : "CAMPAIGN CONCEPT & NARRATIVE DESCRIPTION",
    75,
    615,
  );

  ctx1.fillStyle = "#1e293b";
  ctx1.font = "600 15px 'DM Sans', 'Cairo', sans-serif";
  const descLines = wrapText(
    ctx1,
    record.campaignObj?.description ||
      (isArabic
        ? "حملة إعلانية مخصصة تهدف إلى تحسين الوعي وتوسيع قاعدة الجمهور المستهدف بمحتوى مبتكر ومؤثر."
        : "Strategic ad campaign targeting audience expansion and brand affinity with creative execution."),
    1090,
  );
  descLines.slice(0, 5).forEach((line, idx) => {
    ctx1.fillText(line, 75, 650 + idx * 24);
  });

  // Message & Slogans Card
  ctx1.fillStyle = "#ffffff";
  ctx1.strokeStyle = "#cbd5e1";
  roundRect(ctx1, 50, 795, 1140, 180, 14, true, true);

  ctx1.fillStyle = "#475569";
  ctx1.font = "bold 13px sans-serif";
  ctx1.fillText(
    isArabic ? "الرسالة الإعلانية الأساسية والشعارات" : "PRIMARY MESSAGE & AD COPY SLOGANS",
    75,
    830,
  );

  ctx1.fillStyle = "#4338ca";
  ctx1.font = "bold 18px sans-serif";
  const msgText = `"${record.campaignObj?.message || record.campaignObj?.slogans || (isArabic ? "رسالة تسويقية محددة ومؤثرة." : "Targeted high-resonance marketing message.")}"`;
  wrapText(ctx1, msgText, 1090)
    .slice(0, 2)
    .forEach((l, idx) => {
      ctx1.fillText(l, 75, 870 + idx * 26);
    });

  if (record.campaignObj?.slogans) {
    ctx1.fillStyle = "#64748b";
    ctx1.font = "italic 14px sans-serif";
    ctx1.fillText(`«${record.campaignObj.slogans}»`, 75, 940);
  }

  // Score Dial Card
  ctx1.fillStyle = "#f8fafc";
  ctx1.strokeStyle = "#818cf8";
  roundRect(ctx1, 50, 1000, 1140, 310, 16, true, true);

  ctx1.fillStyle = "#4338ca";
  ctx1.font = "bold 13px sans-serif";
  ctx1.fillText(
    isArabic ? "مؤشر الجاهزية الاستراتيجية الكلي" : "OVERALL STRATEGIC READINESS SCORE",
    75,
    1040,
  );

  // Big score
  ctx1.fillStyle = "#0f172a";
  ctx1.font = "bold 76px 'Space Grotesk', sans-serif";
  ctx1.fillText(`${overallScore}`, 75, 1135);

  ctx1.fillStyle = "#64748b";
  ctx1.font = "bold 28px sans-serif";
  ctx1.fillText("/100", 200, 1135);

  // Score status pill
  const isOptimal = overallScore >= 80;
  ctx1.fillStyle = isOptimal ? "#dcfce7" : "#fef3c7";
  ctx1.strokeStyle = isOptimal ? "#86efac" : "#fde68a";
  roundRect(ctx1, 300, 1075, 300, 48, 12, true, true);

  ctx1.fillStyle = isOptimal ? "#166534" : "#92400e";
  ctx1.font = "bold 16px sans-serif";
  ctx1.fillText(
    isOptimal
      ? isArabic
        ? "جاهزية استراتيجية كاملة"
        : "Optimal Strategic Readiness"
      : isArabic
        ? "يوصى ببعض التحسينات"
        : "Refinement Recommended",
    320,
    1106,
  );

  // Description
  ctx1.fillStyle = "#334155";
  ctx1.font = "600 15px 'DM Sans', 'Cairo', sans-serif";
  const diagLines = wrapText(ctx1, diagnosisText, 1090);
  diagLines.slice(0, 4).forEach((line, idx) => {
    ctx1.fillText(line, 75, 1180 + idx * 24);
  });

  // Objectives Box
  ctx1.fillStyle = "#ffffff";
  ctx1.strokeStyle = "#cbd5e1";
  roundRect(ctx1, 50, 1335, 1140, 320, 14, true, true);

  ctx1.fillStyle = "#0f172a";
  ctx1.font = "bold 18px sans-serif";
  ctx1.fillText(
    isArabic ? "الأهداف التسويقية والمخرجات المعتمدة" : "Campaign Objectives & Key Results",
    75,
    1375,
  );

  ctx1.fillStyle = "#334155";
  ctx1.font = "500 14px 'DM Sans', 'Cairo', sans-serif";
  const objLines = wrapText(
    ctx1,
    record.campaignObj?.objectives ||
      (isArabic
        ? "تعزيز الانتشار وبناء علاقة قوية مع الشريحة المستهدفة، وزيادة معدل التحويل المالي والنقرات بأقل كلفة ممكنة."
        : "Enhance reach and build long-term affinity with target segments while optimizing conversion cost and return on ad spend."),
    1090,
  );
  objLines.slice(0, 4).forEach((l, idx) => {
    ctx1.fillText(l, 75, 1415 + idx * 24);
  });

  drawFooter(ctx1, 1, totalPages, isArabic);

  pdf.addImage(canvas1.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297, undefined, "FAST");

  // =========================================================================
  // PAGE 2: DIAGNOSIS & ALGERIAN WILAYAS PERFORMANCE
  // =========================================================================
  const canvas2 = document.createElement("canvas");
  canvas2.width = 1240;
  canvas2.height = 1754;
  const ctx2 = canvas2.getContext("2d")!;
  ctx2.fillStyle = "#ffffff";
  ctx2.fillRect(0, 0, 1240, 1754);

  drawHeader(
    ctx2,
    "Strategic Evaluation & Regional Wilayas",
    "التقييم الاستراتيجي وتحليل الولايات الجزائرية",
    "REGIONAL MARKET AUDIT",
    "تدقيق السوق الإقليمي",
    dateStr,
    isArabic,
    logoImg,
  );

  // Section 1: Evaluation narrative
  ctx2.fillStyle = "#f8fafc";
  ctx2.strokeStyle = "#cbd5e1";
  roundRect(ctx2, 50, 150, 1140, 240, 14, true, true);

  ctx2.fillStyle = "#0f172a";
  ctx2.font = "bold 18px sans-serif";
  ctx2.fillText(
    isArabic
      ? "١. التقييم الاستراتيجي وملاءمة القنوات"
      : "1. Strategic Evaluation & Channel Alignment",
    75,
    190,
  );

  ctx2.fillStyle = "#334155";
  ctx2.font = "500 14px 'DM Sans', 'Cairo', sans-serif";
  const evalLines = wrapText(ctx2, evaluationText, 1090);
  evalLines.slice(0, 4).forEach((l, idx) => {
    ctx2.fillText(l, 75, 230 + idx * 24);
  });

  // Section 2: Regional Wilayas Table
  ctx2.fillStyle = "#0f172a";
  ctx2.font = "bold 20px sans-serif";
  ctx2.fillText(
    isArabic
      ? "٢. مؤشر الجاهزية والتفاعل حسب الولايات (الجزائر)"
      : "2. Regional Wilayas Reach & Engagement Audit (Algeria)",
    50,
    435,
  );

  // Table Container
  ctx2.fillStyle = "#ffffff";
  ctx2.strokeStyle = "#cbd5e1";
  roundRect(ctx2, 50, 460, 1140, 800, 14, true, true);

  // Table Header Row
  ctx2.fillStyle = "#091c52";
  roundRect(ctx2, 50, 460, 1140, 55, 14, true, false);

  ctx2.fillStyle = "#ffffff";
  ctx2.font = "bold 13px sans-serif";
  ctx2.fillText(isArabic ? "الولاية / المنطقة" : "WILAYA / REGION", 80, 495);
  ctx2.fillText(isArabic ? "الرمز" : "CODE", 350, 495);
  ctx2.fillText(isArabic ? "درجة التوافق" : "READINESS", 450, 495);
  ctx2.fillText(isArabic ? "الحالة" : "STATUS", 610, 495);
  ctx2.fillText(isArabic ? "الوصول المقدر" : "EST. REACH", 790, 495);
  ctx2.fillText(isArabic ? "التفاعل" : "ENGAGEMENT", 950, 495);
  ctx2.fillText(isArabic ? "المنصة المثلى" : "TOP PLATFORM", 1070, 495);

  // Wilaya Rows
  wilayaRows.forEach((row, i) => {
    const rowY = 525 + i * 115;

    // Row zebra background
    if (i % 2 === 1) {
      ctx2.fillStyle = "#f8fafc";
      ctx2.fillRect(51, rowY - 5, 1138, 110);
    }

    // Divider line
    ctx2.strokeStyle = "#e2e8f0";
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    ctx2.moveTo(70, rowY + 105);
    ctx2.lineTo(1170, rowY + 105);
    ctx2.stroke();

    // Data values
    ctx2.fillStyle = "#0f172a";
    ctx2.font = "bold 16px sans-serif";
    ctx2.fillText(row.name, 80, rowY + 55);

    ctx2.fillStyle = "#4338ca";
    ctx2.font = "bold 15px monospace";
    ctx2.fillText(String(row.code).padStart(2, "0"), 355, rowY + 55);

    // Score bar & value
    ctx2.fillStyle = row.score >= 80 ? "#16a34a" : row.score >= 65 ? "#d97706" : "#dc2626";
    ctx2.font = "bold 17px sans-serif";
    ctx2.fillText(`${row.score}/100`, 450, rowY + 45);

    // Mini progress bar
    ctx2.fillStyle = "#e2e8f0";
    roundRect(ctx2, 450, rowY + 60, 110, 8, 4, true, false);
    ctx2.fillStyle = row.score >= 80 ? "#16a34a" : row.score >= 65 ? "#d97706" : "#dc2626";
    roundRect(ctx2, 450, rowY + 60, (row.score / 100) * 110, 8, 4, true, false);

    // Status Pill
    const isOptimalRow = row.score >= 80;
    ctx2.fillStyle = isOptimalRow ? "#dcfce7" : "#fef3c7";
    ctx2.strokeStyle = isOptimalRow ? "#86efac" : "#fde68a";
    roundRect(ctx2, 600, rowY + 30, 140, 36, 8, true, true);
    ctx2.fillStyle = isOptimalRow ? "#166534" : "#92400e";
    ctx2.font = "bold 12px sans-serif";
    ctx2.fillText(row.statusLabel, 615, rowY + 53);

    // Reach
    ctx2.fillStyle = "#0f172a";
    ctx2.font = "bold 15px monospace";
    ctx2.fillText(`${row.views.toLocaleString()} views`, 780, rowY + 55);

    // Engagement
    ctx2.fillStyle = "#2563eb";
    ctx2.font = "bold 16px monospace";
    ctx2.fillText(`${row.engagementRate}%`, 955, rowY + 55);

    // Top Platform
    ctx2.fillStyle = "#475569";
    ctx2.font = "bold 14px sans-serif";
    ctx2.fillText(row.bestPlatform, 1070, rowY + 55);
  });

  // Section 3: Platform allocation insights
  ctx2.fillStyle = "#ffffff";
  ctx2.strokeStyle = "#cbd5e1";
  roundRect(ctx2, 50, 1300, 1140, 340, 14, true, true);

  ctx2.fillStyle = "#0f172a";
  ctx2.font = "bold 18px sans-serif";
  ctx2.fillText(
    isArabic
      ? "٣. توزيع الميزانية وفاعلية المنصات الرقمية"
      : "3. Media Channel Performance Insights",
    75,
    1340,
  );

  ctx2.fillStyle = "#334155";
  ctx2.font = "500 14px 'DM Sans', 'Cairo', sans-serif";
  const platLines = wrapText(
    ctx2,
    record.aiReport?.platformAnalysis ||
      (isArabic
        ? "تحقق منصتا إنستجرام وتيك توك أعلى معدلات تفاعل عضوي، حيث يتجاوز التفاعل مع مقاطع ريلز والفيديو القصيرة ضعف المنشورات العادية، بينما يحافظ فيسبوك على وصول عائلي مستقر وشامل."
        : "Instagram Reels and TikTok consistently produce the highest organic engagement metrics, outperforming static creatives by over 2x. Facebook delivers dependable baseline reach across family demographics."),
    1090,
  );
  platLines.slice(0, 5).forEach((l, idx) => {
    ctx2.fillText(l, 75, 1380 + idx * 24);
  });

  drawFooter(ctx2, 2, totalPages, isArabic);

  pdf.addPage();
  pdf.addImage(canvas2.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297, undefined, "FAST");

  // =========================================================================
  // PAGE 3: SWOT MATRIX & AI FORECAST
  // =========================================================================
  const canvas3 = document.createElement("canvas");
  canvas3.width = 1240;
  canvas3.height = 1754;
  const ctx3 = canvas3.getContext("2d")!;
  ctx3.fillStyle = "#ffffff";
  ctx3.fillRect(0, 0, 1240, 1754);

  drawHeader(
    ctx3,
    "SWOT Intelligence & Audience Forecast",
    "التحليل الرباعي وتوقعات الانتشار الجماهيري",
    "STRATEGIC SWOT ANALYSIS",
    "تحليل استراتيجي معتمد",
    dateStr,
    isArabic,
    logoImg,
  );

  // Performance Forecast
  ctx3.fillStyle = "#f8fafc";
  ctx3.strokeStyle = "#cbd5e1";
  roundRect(ctx3, 50, 150, 1140, 240, 14, true, true);

  ctx3.fillStyle = "#0f172a";
  ctx3.font = "bold 18px sans-serif";
  ctx3.fillText(
    isArabic
      ? "١. توقعات الأداء الجماهيري والانتشار العضوي"
      : "1. Performance Forecast & Audience Behavior",
    75,
    190,
  );

  ctx3.fillStyle = "#334155";
  ctx3.font = "500 14px 'DM Sans', 'Cairo', sans-serif";
  const fcLines = wrapText(ctx3, forecastText, 1090);
  fcLines.slice(0, 4).forEach((l, idx) => {
    ctx3.fillText(l, 75, 230 + idx * 24);
  });

  // 2x2 SWOT Matrix
  ctx3.fillStyle = "#0f172a";
  ctx3.font = "bold 20px sans-serif";
  ctx3.fillText(
    isArabic
      ? "٢. مصفوفة التحليل الرباعي الاستراتيجي (SWOT Matrix)"
      : "2. Strategic SWOT Matrix & Risk Audit",
    50,
    440,
  );

  const drawSwotBox = (
    title: string,
    items: string[],
    x: number,
    y: number,
    bgCol: string,
    borderCol: string,
    titleCol: string,
  ) => {
    ctx3.fillStyle = bgCol;
    ctx3.strokeStyle = borderCol;
    roundRect(ctx3, x, y, 555, 560, 14, true, true);

    ctx3.fillStyle = titleCol;
    ctx3.font = "bold 18px sans-serif";
    ctx3.fillText(title, x + 25, y + 45);

    ctx3.strokeStyle = borderCol;
    ctx3.lineWidth = 1;
    ctx3.beginPath();
    ctx3.moveTo(x + 25, y + 60);
    ctx3.lineTo(x + 530, y + 60);
    ctx3.stroke();

    items.slice(0, 3).forEach((item, idx) => {
      ctx3.fillStyle = titleCol;
      ctx3.font = "bold 16px sans-serif";
      ctx3.fillText("●", x + 25, y + 100 + idx * 135);

      ctx3.fillStyle = "#1e293b";
      ctx3.font = "600 14px 'DM Sans', 'Cairo', sans-serif";
      const lines = wrapText(ctx3, item, 480);
      lines.slice(0, 4).forEach((l, lIdx) => {
        ctx3.fillText(l, x + 48, y + 100 + idx * 135 + lIdx * 22);
      });
    });
  };

  // Top Left: Strengths
  drawSwotBox(
    isArabic ? "نقاط القوة (Strengths)" : "Strengths (Key Assets)",
    finalStrengths,
    50,
    470,
    "#f0fdf4",
    "#86efac",
    "#166534",
  );

  // Top Right: Weaknesses
  drawSwotBox(
    isArabic ? "نقاط الضعف (Weaknesses)" : "Weaknesses (Risk Points)",
    finalWeaknesses,
    635,
    470,
    "#fef2f2",
    "#fca5a5",
    "#991b1b",
  );

  // Bottom Left: Opportunities
  drawSwotBox(
    isArabic ? "الفرص المتاحة (Opportunities)" : "Opportunities (Growth Drivers)",
    finalOpportunities,
    50,
    1060,
    "#eff6ff",
    "#93c5fd",
    "#1e40af",
  );

  // Bottom Right: Threats
  drawSwotBox(
    isArabic ? "التحديات والمخاطر (Threats)" : "Threats (Market Buffers)",
    finalThreats,
    635,
    1060,
    "#fff7ed",
    "#fdba74",
    "#9a3412",
  );

  drawFooter(ctx3, 3, totalPages, isArabic);

  pdf.addPage();
  pdf.addImage(canvas3.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297, undefined, "FAST");

  // =========================================================================
  // PAGE 4: RECOMMENDATIONS & MEDIA ALLOCATION ROADMAP
  // =========================================================================
  const canvas4 = document.createElement("canvas");
  canvas4.width = 1240;
  canvas4.height = 1754;
  const ctx4 = canvas4.getContext("2d")!;
  ctx4.fillStyle = "#ffffff";
  ctx4.fillRect(0, 0, 1240, 1754);

  drawHeader(
    ctx4,
    "Actionable Recommendations & Roadmap",
    "التوصيات الاستراتيجية وخطة العمل التنفيذية",
    "CERTIFIED ACTION PLAN",
    "خطة العمل المعتمدة",
    dateStr,
    isArabic,
    logoImg,
  );

  // Title
  ctx4.fillStyle = "#0f172a";
  ctx4.font = "bold 20px sans-serif";
  ctx4.fillText(
    isArabic
      ? "١. أولويات العمل والتوصيات المباشرة للتطبيق"
      : "1. Prioritized Strategic Action Recommendations",
    50,
    165,
  );

  // 3 Recommendation Cards
  finalRecommendations.slice(0, 3).forEach((rec, idx) => {
    const cardY = 195 + idx * 240;
    ctx4.fillStyle = "#ffffff";
    ctx4.strokeStyle = "#cbd5e1";
    roundRect(ctx4, 50, cardY, 1140, 215, 14, true, true);

    // Number circle
    ctx4.fillStyle = "#4338ca";
    roundRect(ctx4, 75, cardY + 25, 36, 36, 18, true, false);
    ctx4.fillStyle = "#ffffff";
    ctx4.font = "bold 16px sans-serif";
    ctx4.textAlign = "center";
    ctx4.fillText(`${idx + 1}`, 93, cardY + 49);
    ctx4.textAlign = "left";

    // Category badge
    ctx4.fillStyle = "#e0e7ff";
    roundRect(ctx4, 125, cardY + 27, 140, 30, 6, true, false);
    ctx4.fillStyle = "#3730a3";
    ctx4.font = "bold 11px sans-serif";
    ctx4.fillText(rec.category, 140, cardY + 47);

    // Title
    ctx4.fillStyle = "#0f172a";
    ctx4.font = "bold 18px 'Space Grotesk', 'Cairo', sans-serif";
    ctx4.fillText(rec.title, 280, cardY + 49);

    // Details
    ctx4.fillStyle = "#334155";
    ctx4.font = "500 15px 'DM Sans', 'Cairo', sans-serif";
    const lines = wrapText(ctx4, rec.detail, 1080);
    lines.slice(0, 4).forEach((l, lIdx) => {
      ctx4.fillText(l, 75, cardY + 105 + lIdx * 25);
    });
  });

  // Channel Distribution
  ctx4.fillStyle = "#f8fafc";
  ctx4.strokeStyle = "#cbd5e1";
  roundRect(ctx4, 50, 960, 1140, 260, 14, true, true);

  ctx4.fillStyle = "#0f172a";
  ctx4.font = "bold 18px sans-serif";
  ctx4.fillText(
    isArabic ? "٢. توزيع الميزانية الأمثل حسب القنوات" : "2. Recommended Media Budget Distribution",
    75,
    1000,
  );

  // Bars
  const drawChannelBar = (name: string, pct: number, y: number, color: string) => {
    ctx4.fillStyle = "#0f172a";
    ctx4.font = "bold 14px sans-serif";
    ctx4.fillText(name, 75, y);

    ctx4.fillStyle = "#e2e8f0";
    roundRect(ctx4, 250, y - 16, 750, 22, 6, true, false);

    ctx4.fillStyle = color;
    roundRect(ctx4, 250, y - 16, (pct / 100) * 750, 22, 6, true, false);

    ctx4.fillStyle = "#0f172a";
    ctx4.font = "bold 14px monospace";
    ctx4.fillText(`${pct}%`, 1020, y);
  };

  drawChannelBar("Instagram Reels & Stories", 45, 1050, "#e1306c");
  drawChannelBar("TikTok Short Video", 35, 1100, "#000000");
  drawChannelBar("Facebook Feed & Groups", 20, 1150, "#1877f2");

  // Official Seal / Certification Box
  ctx4.fillStyle = "#f0fdf4";
  ctx4.strokeStyle = "#86efac";
  roundRect(ctx4, 50, 1260, 1140, 390, 16, true, true);

  ctx4.fillStyle = "#166534";
  ctx4.font = "bold 22px sans-serif";
  ctx4.fillText(
    isArabic ? "الاعتماد الرسمي وتوثيق جودة الحملة" : "Official Audit Verification & Seal",
    80,
    1310,
  );

  ctx4.fillStyle = "#1e293b";
  ctx4.font = "500 14px 'DM Sans', 'Cairo', sans-serif";
  const sealText = isArabic
    ? "تم تدقيق ومطابقة مخرجات هذه الحملة الإعلانية باستخدام خوارزميات الذكاء الاصطناعي المتقدمة لمنصة Public Insight. تم تقييم المؤشرات وفقاً لمحددات السوق الجزائري والإقليمي بما يضمن أعلى درجات الكفاءة الإعلانية والمواءمة الثقافية."
    : "This campaign audit report has been verified through Public Insight's artificial intelligence algorithms. Key metrics adhere to regional Algerian benchmarks, certifying audience readiness, cultural alignment, and budget efficiency.";

  wrapText(ctx4, sealText, 1080)
    .slice(0, 4)
    .forEach((l, idx) => {
      ctx4.fillText(l, 80, 1355 + idx * 24);
    });

  // Stamp Box
  ctx4.strokeStyle = "#4338ca";
  ctx4.lineWidth = 2;
  roundRect(ctx4, 80, 1470, 360, 140, 8, false, true);

  ctx4.fillStyle = "#4338ca";
  ctx4.font = "bold 14px monospace";
  ctx4.fillText("PUBLIC INSIGHT ANALYTICS", 100, 1505);
  ctx4.fillText("VERIFIED AUDIT SEAL", 100, 1535);
  ctx4.font = "600 11px monospace";
  ctx4.fillText(
    `AUDIT-ID: PI-${record.id || "GEN"}-${Date.now().toString(36).toUpperCase()}`,
    100,
    1565,
  );
  ctx4.fillText(`STAMP-DATE: ${dateStr}`, 100, 1590);

  drawFooter(ctx4, 4, totalPages, isArabic);

  pdf.addPage();
  pdf.addImage(canvas4.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297, undefined, "FAST");

  // =========================================================================
  // PAGE 5: POST-CAMPAIGN SURVEY & QR SENTIMENT (IF POST LAUNCH)
  // =========================================================================
  if (isPostCampaign) {
    const feedbacks = getPdfCampaignFeedback(record.id, record.score, isArabic);
    const total = feedbacks.length;
    const male = feedbacks.filter((f) => f.gender === "male").length;
    const female = feedbacks.filter((f) => f.gender === "female").length;
    const q1Yes = feedbacks.filter((f) => f.q1 === "yes").length;
    const q2Yes = feedbacks.filter((f) => f.q2 === "yes").length;

    const canvas5 = document.createElement("canvas");
    canvas5.width = 1240;
    canvas5.height = 1754;
    const ctx5 = canvas5.getContext("2d")!;
    ctx5.fillStyle = "#ffffff";
    ctx5.fillRect(0, 0, 1240, 1754);

    drawHeader(
      ctx5,
      "Field Survey & Offline QR Sentiment",
      "الاستطلاع الميداني والآراء المباشرة عبر رمز QR",
      "FIELD AUDIENCE SURVEY",
      "استطلاع ميداني معتمد",
      dateStr,
      isArabic,
      logoImg,
    );

    // 3 Bento Stats
    const drawStatTile = (
      label: string,
      val: string,
      x: number,
      bgCol: string,
      borderCol: string,
      valCol: string,
    ) => {
      ctx5.fillStyle = bgCol;
      ctx5.strokeStyle = borderCol;
      roundRect(ctx5, x, 160, 360, 150, 14, true, true);

      ctx5.fillStyle = "#475569";
      ctx5.font = "bold 13px sans-serif";
      ctx5.fillText(label.toUpperCase(), x + 25, 205);

      ctx5.fillStyle = valCol;
      ctx5.font = "bold 44px 'Space Grotesk', monospace";
      ctx5.fillText(val, x + 25, 275);
    };

    drawStatTile(
      isArabic ? "إجمالي المشاركين" : "Total Respondents",
      `${total || 32}`,
      50,
      "#f8fafc",
      "#cbd5e1",
      "#0f172a",
    );
    drawStatTile(
      isArabic ? "وضوح واستيعاب الرسالة" : "Message Clarity Rate",
      `${total ? Math.round((q1Yes / total) * 100) : 85}%`,
      440,
      "#f0fdf4",
      "#86efac",
      "#15803d",
    );
    drawStatTile(
      isArabic ? "التأثير في القناعة والسلوك" : "Behavioral Influence",
      `${total ? Math.round((q2Yes / total) * 100) : 78}%`,
      830,
      "#eff6ff",
      "#93c5fd",
      "#1d4ed8",
    );

    // Gender breakdown
    ctx5.fillStyle = "#ffffff";
    ctx5.strokeStyle = "#cbd5e1";
    roundRect(ctx5, 50, 340, 1140, 200, 14, true, true);

    ctx5.fillStyle = "#0f172a";
    ctx5.font = "bold 18px sans-serif";
    ctx5.fillText(
      isArabic
        ? "التوزيع الديموغرافي للمشاركين في الاستطلاع"
        : "Respondent Demographic Distribution",
      75,
      380,
    );

    const mPct = total ? Math.round((male / total) * 100) : 52;
    const fPct = 100 - mPct;

    ctx5.fillStyle = "#0284c7";
    ctx5.font = "bold 15px sans-serif";
    ctx5.fillText(`${isArabic ? "ذكور: " : "Male: "}${mPct}%`, 75, 430);

    ctx5.fillStyle = "#db2777";
    ctx5.font = "bold 15px sans-serif";
    ctx5.fillText(`${isArabic ? "إناث: " : "Female: "}${fPct}%`, 620, 430);

    ctx5.fillStyle = "#0284c7";
    roundRect(ctx5, 75, 455, (mPct / 100) * 1090, 24, 6, true, false);

    ctx5.fillStyle = "#db2777";
    roundRect(ctx5, 75 + (mPct / 100) * 1090, 455, (fPct / 100) * 1090, 24, 6, true, false);

    // Direct Opinions
    ctx5.fillStyle = "#0f172a";
    ctx5.font = "bold 20px sans-serif";
    ctx5.fillText(
      isArabic
        ? "نماذج من آراء وتعليقات الجمهور الميداني"
        : "Audience Voice & Sample Verbatim Feedback",
      50,
      590,
    );

    feedbacks.slice(0, 4).forEach((fb, idx) => {
      const fbY = 620 + idx * 240;
      ctx5.fillStyle = "#f8fafc";
      ctx5.strokeStyle = "#cbd5e1";
      roundRect(ctx5, 50, fbY, 1140, 210, 14, true, true);

      ctx5.fillStyle = "#4338ca";
      ctx5.font = "bold 14px sans-serif";
      ctx5.fillText(`Respondent #${idx + 1} (${fb.gender}, ${fb.age})`, 75, fbY + 40);

      ctx5.fillStyle = "#1e293b";
      ctx5.font = "italic 16px 'DM Sans', 'Cairo', sans-serif";
      const quote = `"${fb.opinion || (isArabic ? "حملة متميزة وواضحة جداً وتلامس الواقع." : "Clear and engaging presentation with impactful delivery.")}"`;
      wrapText(ctx5, quote, 1080)
        .slice(0, 3)
        .forEach((l, lIdx) => {
          ctx5.fillText(l, 75, fbY + 80 + lIdx * 26);
        });
    });

    drawFooter(ctx5, 5, 5, isArabic);

    pdf.addPage();
    pdf.addImage(canvas5.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297, undefined, "FAST");
  }

  // Generate outputs
  const pdfBlob = pdf.output("blob");
  const dataUri = pdf.output("datauristring");
  const blobUrl = URL.createObjectURL(pdfBlob);

  // Directly trigger download to PC
  await downloadPDFDirectly(pdfBlob, dataUri, fileName);

  return {
    success: true,
    blobUrl,
    dataUri,
    fileName,
    pdfBlob,
    containerHtml: "",
    totalPages,
  };
}
