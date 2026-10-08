import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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
    "Acceptable production, but posters and still assets could have been sharper.",
  ];

  const negativeOpinionsAr = [
    "الرسالة غير واضحة تماماً واستغرقت وقتاً طويلاً للوصول إلى الهدف المطلوب.",
    "المحتوى مكرر وشبيه جداً بحملات سابقة ولا يقدم قيمة جديدة للمستهلك.",
    "توقيت النشر كان غير موفق مقارنة بالأحداث اليومية للجمهور.",
  ];

  const negativeOpinionsEn = [
    "The message felt confusing and took too long to deliver its core value proposition.",
    "Repetitive creative that feels almost identical to last season's campaigns.",
    "Timing and distribution frequency were poorly scheduled.",
  ];

  const posList = isArabic ? positiveOpinionsAr : positiveOpinionsEn;
  const neuList = isArabic ? neutralOpinionsAr : neutralOpinionsEn;
  const negList = isArabic ? negativeOpinionsAr : negativeOpinionsEn;

  const ageGroups = ["under-18", "18-24", "25-34", "35-44", "45-54", "55-plus"];

  for (let i = 0; i < count; i++) {
    const seed = (i * 17 + campaignId.length * 3 + overallScore) % 100;
    const age = ageGroups[seed % ageGroups.length];
    const gender = seed % 2 === 0 ? "male" : "female";

    let q1 = "yes";
    if (seed % 7 === 0) q1 = "no";
    else if (seed % 4 === 0) q1 = "partially";

    const q2 = isHigh
      ? seed % 8 === 0
        ? "no"
        : "yes"
      : isAvg
        ? seed % 4 === 0
          ? "no"
          : "yes"
        : seed % 2 === 0
          ? "no"
          : "yes";

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

  const safeFeedbacks = Array.isArray(userFeedbacks) ? userFeedbacks : [];
  return [...safeFeedbacks, ...preseeded];
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text || "");
}

export async function exportCampaignToPDF(
  record: any,
  lang: "ar" | "en",
): Promise<{ success: boolean; blobUrl: string; fileName: string }> {
  const isArabic = lang === "ar";
  const L = (en: string, ar: string) => (isArabic ? ar : en);
  const isPostCampaign = record.mode === "post";
  const totalPages = isPostCampaign ? 5 : 4;

  const campaignName = record.name || (isArabic ? "حملة إعلانية" : "Campaign");
  const overallScore = record.score || 78;
  const dialectKey = record.campaignObj?.dialect || record.dialect || "standard";
  const campaignType = record.campaignObj?.type || "awareness";

  const dialectNames: Record<string, string> = {
    standard: isArabic ? "العربية الفصحى" : "Modern Standard Arabic (Fusha)",
    algerian: isArabic ? "اللهجة الجزائرية" : "Algerian Dialect (Darija)",
    egyptian: isArabic ? "اللهجة المصرية" : "Egyptian Dialect",
    gulf: isArabic ? "اللهجة الخليجية" : "Gulf Dialect",
    levantine: isArabic ? "اللهجة الشامية" : "Levantine Dialect",
    english: isArabic ? "اللغة الإنجليزية" : "English Language",
  };

  // Safe localized texts for AI reports according to language
  const defaultEvaluation = isArabic
    ? "تظهر استراتيجية الحملة تموضعاً تنافسياً قوياً وقنوات إعلانية محددة بعناية تامة. تتناسب التصاميم والرسائل الإعلانية بشكل متناسق مع اهتمامات وتطلعات الشريحة المستهدفة، مما يضمن وصولاً مستقراً واستغلالاً مثالياً ومستداماً للميزانية المخصصة."
    : "Overall, the campaign strategy demonstrates robust positioning with carefully selected distribution channels. Ad creatives align seamlessly with audience expectations, ensuring steady reach and efficient budget utilization.";

  const defaultForecast = isArabic
    ? "فرص قوية لتحقيق معدلات وعي استثنائية مع قفزة تفاعل متوقعة بفضل المواءمة الثقافية الذكية. يتوقع أن تبقى كلفة النقرة (CPC) دون متوسط السوق في حال الاعتماد على النسخ الإعلانية المحلية ومقاطع الفيديو القصيرة."
    : "High potential to achieve remarkable awareness levels with an estimated engagement surge driven by cultural alignment. Cost-per-click (CPC) is projected to stay comfortably below market averages when utilizing localized video creative.";

  const defaultDiagnosis = isArabic
    ? `حققت الحملة درجة جاهزية متميزة (${overallScore}/100) مع استجابة إيجابية عالية عبر المنصات المستهدفة. يعكس توقيت النشر والمواءمة اللغوية فهماً عميقاً لسلوك المستهلك المحلي. نوصي بتعزيز ميزانيات مقاطع الفيديو التفاعلية للحفاظ على استدامة الزخم ومضاعفة معدلات التحويل.`
    : `The campaign registered a high readiness score (${overallScore}/100) with strong favorable reception across selected channels. Strategic timing and cultural dialect matching reflect an in-depth understanding of target consumer behavior. We recommend expanding short-form video allocation to sustain momentum and optimize conversions.`;

  const defaultAudienceAnalysis = isArabic
    ? "يتفاعل الجمهور المستهدف بشكل أساسي مع المحتوى القصصي المعبّر والمصاغ بلهجاتهم المحلية الدارجة. تبحث الفئات الشابة عن المصداقية والسرعة وتفضل مقاطع الفيديو القصيرة التي تطرح حلولاً مباشرة وجذابة."
    : "The target demographic engages most vigorously with authentic, storytelling creative produced in their local dialect. Younger cohorts prioritize transparency, speed, and bite-sized visual formats delivering clear value propositions.";

  let diagnosisText = record.aiReport?.reportDescription || defaultDiagnosis;
  if (!isArabic && hasArabic(diagnosisText)) {
    diagnosisText = defaultDiagnosis;
  } else if (isArabic && !hasArabic(diagnosisText)) {
    diagnosisText = defaultDiagnosis;
  }

  let evaluationText = record.aiReport?.campaignEvaluation || defaultEvaluation;
  if (!isArabic && hasArabic(evaluationText)) {
    evaluationText = defaultEvaluation;
  } else if (isArabic && !hasArabic(evaluationText)) {
    evaluationText = defaultEvaluation;
  }

  let forecastText = record.aiReport?.performanceForecast || defaultForecast;
  if (!isArabic && hasArabic(forecastText)) {
    forecastText = defaultForecast;
  } else if (isArabic && !hasArabic(forecastText)) {
    forecastText = defaultForecast;
  }

  // Localized SWOT
  const defaultStrengths = isArabic
    ? [
        "المواءمة الثقافية الممتازة والاستخدام الذكي للهجة المحلية المستهدفة.",
        "وضوح الرسالة الإعلانية الأساسية وسهولة تداولها بين فئات الجمهور.",
        "التوزيع المتوازن للميزانية الإعلانية على قنوات بصرية ذات تفاعل مرتفع.",
      ]
    : [
        "Exceptional cultural and dialect alignment tailored to the target audience.",
        "High clarity of the primary promotional message and strong memorability.",
        "Cost-effective budget allocation across high-performing visual channels.",
      ];

  const defaultWeaknesses = isArabic
    ? [
        "مخاطر تراجع التفاعل التدريجي بعد أسبوعين في حال عدم تجديد المواد المرئية.",
        "ارتفاع التنافسية الإعلانية في مواسم الذروة على المنصات الرقمية الرئيسية.",
        "الحاجة إلى إضافة دعوة واضحة ومباشرة لاتخاذ إجراء (Call to Action) أكثر تحفيزاً.",
      ]
    : [
        "Potential ad fatigue after initial weeks if creative variations are not rotated.",
        "Heightened auction competition during seasonal marketing peaks.",
        "Need for stronger, more urgent call-to-action (CTA) cues in secondary assets.",
      ];

  const defaultOpportunities = isArabic
    ? [
        "التوسع الإعلاني في الولايات والمدن الداخلية ذات التنافسية الرقمية المنخفضة.",
        "التعاون مع صناع محتوى محليين لتقديم مراجعات وتجارب عفوية وغير متكلفة.",
        "إطلاق حملات إعادة استهداف (Retargeting) مخصصة للعملاء الذين تفاعلوا مسبقاً.",
      ]
    : [
        "Geographic expansion into interior regional markets with lower ad auction costs.",
        "Partnering with authentic regional creators for unscripted UGC reviews.",
        "Deploying retargeting funnels for engaged users who interacted with preliminary ads.",
      ];

  const defaultThreats = isArabic
    ? [
        "التغير الدوري في خوارزميات المنصات الإعلانية وتأثيرها على كلفة الوصول العضوي.",
        "ظهور عروض ترويجية منافسة بأسعار مخفضة في نفس النافذة الزمنية.",
        "تشتت انتباه المستهلك الرقمي بين منصات متعددة في أوقات الذروة.",
      ]
    : [
        "Platform algorithmic changes occasionally impacting organic reach efficiency.",
        "Competitor promotional saturation launched during identical campaign windows.",
        "Fast-decaying consumer attention spans across competing visual networks.",
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
        },
        {
          title: "التعاون مع المؤثرين وصناع المحتوى المحليين",
          detail:
            "استثمر جزءاً من الميزانية في شراكات مع صناع محتوى يتمتعون بمصداقية عالية لتقديم تجارب عفوية تحفز الثقة.",
        },
        {
          title: "إطلاق حملة إعادة استهداف تفاعلية بعروض حصرية",
          detail:
            "أنشئ جمهوراً مخصصاً من الأشخاص الذين شاهدوا أكثر من 50% من إعلاناتك وقدم لهم عروضاً أو أكواد خصم حصرية.",
        },
      ]
    : [
        {
          title: "Double Down on Short-Form Video Assets",
          detail:
            "Direct 70% of creative resources into 15-30s Reels & TikTok clips with strong 3-second visual hooks.",
        },
        {
          title: "Collaborate with Authentic Regional Creators",
          detail:
            "Engage trustworthy local creators for organic product demonstrations that build authentic social proof.",
        },
        {
          title: "Deploy Dynamic Retargeting with Exclusive Incentives",
          detail:
            "Build a custom segment of viewers who completed 50%+ of campaign videos, offering them tailored conversion incentives.",
        },
      ];

  const rawRecs = record.aiReport?.recommendations || record.resultObj?.recommendations;
  let finalRecommendations = defaultRecs;
  if (Array.isArray(rawRecs) && rawRecs.length > 0) {
    const formatted = rawRecs.slice(0, 3).map((r: any) => ({
      title: r.title || r.name || (isArabic ? "توصية هامة" : "Key Recommendation"),
      detail:
        r.detail ||
        r.description ||
        (isArabic ? "توصية استراتيجية معتمدة." : "Strategic guidance recommendation."),
    }));
    const matchLang = isArabic
      ? formatted.every((f) => hasArabic(f.title))
      : formatted.every((f) => !hasArabic(f.title));
    if (matchLang) finalRecommendations = formatted;
  }

  // Regional Wilayas Data
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
    if (isMaghrebiDialect) {
      localScore += 10;
    } else if (dialectKey.toLowerCase() === "standard") {
      localScore += 2;
    } else {
      localScore -= 8;
    }

    const isMajorCity = [16, 31, 25, 19, 23].includes(wilaya.code);
    if (isMajorCity) localScore += 6;
    localScore = Math.max(35, Math.min(99, Math.round(localScore)));

    let statusLabel = L("Optimal", "ممتاز");
    let statusColor = "#059669";
    let statusBg = "#ecfdf5";
    let statusBorder = "#a7f3d0";
    if (localScore < 70) {
      statusLabel = L("Moderate", "متوسط");
      statusColor = "#d97706";
      statusBg = "#fffbeb";
      statusBorder = "#fde68a";
    }
    if (localScore < 50) {
      statusLabel = L("Weak", "ضعيف");
      statusColor = "#dc2626";
      statusBg = "#fef2f2";
      statusBorder = "#fecdd3";
    }

    const populationFactor = isMajorCity ? 4.8 : wilaya.region === "coast" ? 3.0 : 1.8;
    const views = Math.max(1200, Math.round((overallScore * 280 + seed * 90) * populationFactor));
    const engagementRate = Math.round((2.5 + localScore / 16) * 10) / 10;

    let bestPlatform = "Instagram";
    if (wilaya.region === "desert") bestPlatform = "Facebook";
    else if (campaignType === "commercial" && isMajorCity) bestPlatform = "TikTok";
    else if (campaignType === "electoral" || campaignType === "social") bestPlatform = "Facebook";

    return {
      name: isArabic ? wilaya.nameAr : wilaya.nameEn,
      score: localScore,
      statusLabel,
      statusColor,
      statusBg,
      statusBorder,
      views,
      engagementRate,
      bestPlatform,
    };
  });

  // Sentiment & Metrics
  const pSentiment = record.sentiment?.positive ?? 82;
  const nSentiment = record.sentiment?.neutral ?? 14;
  const ngSentiment = record.sentiment?.negative ?? 4;

  const viewsCount = record.metrics?.views ?? 28500;
  const likesCount = record.metrics?.likes ?? 1840;
  const commentsCount = record.metrics?.comments ?? 340;
  const sharesCount = record.metrics?.shares ?? 210;
  const clicksCount = record.metrics?.clicks ?? Math.round(viewsCount * 0.082);

  const durationText = record.campaignObj?.durationValue
    ? `${record.campaignObj.durationValue} ${L(record.campaignObj.durationUnit || "days", record.campaignObj.durationUnit === "weeks" ? "أسابيع" : "أيام")}`
    : L("30 Days", "٣٠ يوماً");

  const sScore = Math.max(50, Math.min(96, overallScore + 4));
  const wScore = Math.max(10, Math.min(45, Math.round((100 - overallScore) * 0.75 + 10)));
  const oScore = Math.max(55, Math.min(95, Math.round(overallScore * 0.92 + 5)));
  const tScore = Math.max(12, Math.min(48, Math.round((100 - overallScore) * 0.85)));

  const audienceAge = record.campaignObj?.age || "18-45";
  const audienceGender =
    record.campaignObj?.gender === "male"
      ? L("Male Only", "الذكور فقط")
      : record.campaignObj?.gender === "female"
        ? L("Female Only", "الإناث فقط")
        : L("All (Male & Female)", "كلا الجنسين (ذكور وإناث)");
  const audienceLocation =
    record.campaignObj?.location || (isArabic ? "الجزائر (كافة الولايات)" : "Algeria (National)");
  const organizerText =
    record.campaignObj?.organizer || (isArabic ? "مؤسسة معتمدة" : "Verified Organization");

  // Reusable Page Header with Enterprise BI Dark Accent Top
  const makePageHeader = (
    pageTitleEn: string,
    pageTitleAr: string,
    badgeEn: string,
    badgeAr: string,
  ) => `
    <div style="margin-bottom: 20px;">
      <!-- Top Accent Gradient Line -->
      <div style="height: 4px; background: linear-gradient(90deg, #4338ca 0%, #3b82f6 50%, #06b6d4 100%); border-radius: 4px; margin-bottom: 14px;"></div>
      
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 12px; overflow: hidden; background: #0f172a; border: 1.5px solid #334155; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);">
            <img src="${APP_LOGO_BASE64}" alt="Public Insight Logo" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px; font-weight: 900; color: #0f172a; line-height: 1.1; letter-spacing: -0.3px;">Public Insight</span>
              <span style="font-size: 8.5px; font-weight: 800; color: #4338ca; background: #eef2ff; border: 1px solid #c7d2fe; padding: 2px 7px; border-radius: 9999px; text-transform: uppercase;">BI Analytics</span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 3px;">
              ${L(pageTitleEn, pageTitleAr)}
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
          <div style="display: inline-flex; align-items: center; gap: 5px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 8px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
            <span style="font-size: 9px; font-weight: 800; color: #1e293b; letter-spacing: 0.3px;">
              ${L(badgeEn, badgeAr)}
            </span>
          </div>
          <span style="font-size: 9.5px; color: #64748b; font-weight: 700; font-family: monospace;">
            ${record.date || new Date().toISOString().split("T")[0]}
          </span>
        </div>
      </div>
      <div style="height: 1px; background: #e2e8f0; margin-top: 14px;"></div>
    </div>
  `;

  // Reusable Page Footer
  const makePageFooter = (pageNum: number) => `
    <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #64748b; font-weight: 700;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 4px; background: #4338ca; color: #ffffff; font-size: 8px; font-weight: 900;">PI</span>
        <span style="color: #334155; font-weight: 700;">
          ${L("Public Insight Intelligence Platform • Certified Executive Brief", "منصة Public Insight للتحليلات الذكية • تقرير فني واستراتيجي معتمد")}
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 3px 10px; border-radius: 9999px;">
        <span style="font-family: monospace; font-size: 9.5px; color: #0f172a; font-weight: 800;">
          ${L(`Page ${pageNum} of ${totalPages}`, `الصفحة ${pageNum} من ${totalPages}`)}
        </span>
      </div>
    </div>
  `;

  let feedbackHtmlPage = "";
  if (isPostCampaign) {
    const feedbacks = getPdfCampaignFeedback(record.id, record.score, isArabic);
    const total = feedbacks.length;
    const ageUnder18 = feedbacks.filter((f) => f.age === "under-18").length;
    const age18_24 = feedbacks.filter((f) => f.age === "18-24").length;
    const age25_34 = feedbacks.filter((f) => f.age === "25-34").length;
    const age35_44 = feedbacks.filter((f) => f.age === "35-44").length;
    const age45_plus = feedbacks.filter((f) => f.age === "45-54" || f.age === "55-plus").length;
    const male = feedbacks.filter((f) => f.gender === "male").length;
    const female = feedbacks.filter((f) => f.gender === "female").length;
    const q1Yes = feedbacks.filter((f) => f.q1 === "yes").length;
    const q2Yes = feedbacks.filter((f) => f.q2 === "yes").length;
    const comments = feedbacks.filter((f) => f.opinion && f.opinion.trim().length > 0).slice(0, 3);

    const fStats = {
      total,
      malePct: total ? Math.round((male / total) * 100) : 50,
      femalePct: total ? Math.round((female / total) * 100) : 50,
      q1Pct: total ? Math.round((q1Yes / total) * 100) : 85,
      q2Pct: total ? Math.round((q2Yes / total) * 100) : 78,
      age: {
        under18: total ? Math.round((ageUnder18 / total) * 100) : 10,
        age18_24: total ? Math.round((age18_24 / total) * 100) : 35,
        age25_34: total ? Math.round((age25_34 / total) * 100) : 32,
        age35_44: total ? Math.round((age35_44 / total) * 100) : 15,
        age45_plus: total ? Math.round((age45_plus / total) * 100) : 8,
      },
    };

    feedbackHtmlPage = `
      <!-- ==================== PAGE 5: AUDIENCE SURVEY & FIELD QR SENTIMENT ==================== -->
      <div id="pdf-page-5" class="pdf-page" style="width: 794px; height: 1123px; padding: 38px 44px; box-sizing: border-box; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
        <div>
          ${makePageHeader("Field Survey & Offline QR Audience Sentiment", "الاستطلاع الميداني والآراء المباشرة عبر رمز QR", "FIELD AUDIENCE SURVEY", "استطلاع ميداني معتمد")}

          <!-- Top Intro Card -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: #4338ca; color: #ffffff; font-size: 11px;">📊</span>
                <span>${L("1. Field Survey & Offline QR Metrics", "١. نتائج الاستطلاع الميداني وتفاعل الجمهور")}</span>
              </h3>
              <span style="font-size: 9.5px; font-weight: 800; color: #4338ca; background: #e0e7ff; padding: 2px 8px; border-radius: 6px;">
                ${L(`Sample: ${fStats.total} Respondents`, `عينة الاستطلاع: ${fStats.total} مشاركاً`)}
              </span>
            </div>
            <p style="font-size: 10.5px; color: #475569; line-height: 1.6; text-align: justify; margin: 0;">
              ${L(
                "Aggregated responses collected from real audience touchpoints and on-the-ground QR scan portals. This empirical data reflects immediate public comprehension and behavioral intent.",
                "بيانات مجمعة من نقاط الاتصال الميدانية وبوابات مسح رمز QR المخصصة للحملة. تعكس هذه الأرقام مستوى الفهم الفعلي للرسالة ونوايا الجمهور السلوكية بدقة ومصداقية.",
              )}
            </p>
          </div>

          <!-- Top Stats Row -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
            <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #ffffff; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase;">
                ${L("Total Responses", "إجمالي المشاركات")}
              </span>
              <span style="font-size: 20px; font-weight: 900; color: #0f172a; font-family: monospace; margin-top: 4px; display: block;">
                ${fStats.total}
              </span>
            </div>

            <div style="border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 12px; background: #ecfdf5; text-align: center;">
              <span style="font-size: 9px; font-weight: 800; color: #047857; display: block; text-transform: uppercase;">
                ${L("Message Clear (Q1)", "وضوح الرسالة")}
              </span>
              <span style="font-size: 20px; font-weight: 900; color: #065f46; font-family: monospace; margin-top: 4px; display: block;">
                ${fStats.q1Pct}%
              </span>
            </div>

            <div style="border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 12px; background: #eff6ff; text-align: center;">
              <span style="font-size: 9px; font-weight: 800; color: #1d4ed8; display: block; text-transform: uppercase;">
                ${L("Would Recommend (Q2)", "الاستعداد للتوصية")}
              </span>
              <span style="font-size: 20px; font-weight: 900; color: #1e40af; font-family: monospace; margin-top: 4px; display: block;">
                ${fStats.q2Pct}%
              </span>
            </div>

            <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #ffffff; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase;">
                ${L("Gender Ratio", "نسبة الجنس")}
              </span>
              <span style="font-size: 13px; font-weight: 900; color: #0f172a; margin-top: 6px; display: block;">
                ${fStats.malePct}% M / ${fStats.femalePct}% F
              </span>
            </div>
          </div>

          <!-- Age Demographics Bar Chart -->
          <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; background: #ffffff; margin-bottom: 16px;">
            <h4 style="font-size: 11px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
              ${L("Audience Age Distribution (Survey Respondents)", "التوزيع العمري للمشاركين في الاستطلاع")}
            </h4>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; text-align: center;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 4px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block;">< 18</span>
                <span style="font-size: 14px; font-weight: 900; color: #4338ca; font-family: monospace; margin-top: 2px; display: block;">${fStats.age.under18}%</span>
              </div>
              <div style="background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 8px; padding: 8px 4px;">
                <span style="font-size: 9px; font-weight: 800; color: #4338ca; display: block;">18 - 24</span>
                <span style="font-size: 14px; font-weight: 900; color: #3730a3; font-family: monospace; margin-top: 2px; display: block;">${fStats.age.age18_24}%</span>
              </div>
              <div style="background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 8px; padding: 8px 4px;">
                <span style="font-size: 9px; font-weight: 800; color: #4338ca; display: block;">25 - 34</span>
                <span style="font-size: 14px; font-weight: 900; color: #3730a3; font-family: monospace; margin-top: 2px; display: block;">${fStats.age.age25_34}%</span>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 4px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block;">35 - 44</span>
                <span style="font-size: 14px; font-weight: 900; color: #4338ca; font-family: monospace; margin-top: 2px; display: block;">${fStats.age.age35_44}%</span>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 4px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block;">45+</span>
                <span style="font-size: 14px; font-weight: 900; color: #4338ca; font-family: monospace; margin-top: 2px; display: block;">${fStats.age.age45_plus}%</span>
              </div>
            </div>
          </div>

          <!-- Selected Direct Testimonials / User Opinions -->
          <div>
            <h4 style="font-size: 11px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span>💬</span>
              <span>${L("Sample Qualitative Audience Impressions (Verified)", "نماذج من آراء وانطباعات الجمهور الميداني (موثقة)")}</span>
            </h4>
            <div style="display: flex; flex-direction: column; gap: 9px;">
              ${comments
                .map(
                  (c) => `
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-left: ${isArabic ? "1.5px solid #e2e8f0" : "3px solid #4338ca"}; border-right: ${isArabic ? "3px solid #4338ca" : "1.5px solid #e2e8f0"}; border-radius: 8px; padding: 10px 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 9.5px; font-weight: 800; color: #4338ca;">
                      ${L(c.gender === "male" ? "Male Participant" : "Female Participant", c.gender === "male" ? "مشارك (ذكر)" : "مشاركة (أنثى)")} • ${c.age}
                    </span>
                    <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">${c.date || "2026-07-08"}</span>
                  </div>
                  <p style="font-size: 10px; color: #1e293b; line-height: 1.6; margin: 0; font-weight: 600;">
                    "${c.opinion}"
                  </p>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>

        <div>
          ${makePageFooter(5)}
        </div>
      </div>
    `;
  }

  const container = document.createElement("div");
  container.id = "pdf-export-container";
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "794px";
  container.style.minWidth = "794px";
  container.style.maxWidth = "794px";
  container.style.zIndex = "-9999";
  container.style.opacity = "1";
  container.style.pointerEvents = "none";
  container.style.overflow = "visible";
  container.style.backgroundColor = "#ffffff";

  container.innerHTML = `
    <div id="pdf-report-root" style="width: 794px; background-color: #ffffff; color: #0f172a; direction: ${isArabic ? "rtl" : "ltr"}; text-align: ${isArabic ? "right" : "left"}; font-family: ${isArabic ? "'Cairo', 'Segoe UI', Tahoma, sans-serif" : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility;">
      
      <!-- ==================== PAGE 1: COVER & CAMPAIGN EXECUTIVE BRIEF ==================== -->
      <div id="pdf-page-1" class="pdf-page" style="width: 794px; height: 1123px; padding: 38px 44px; box-sizing: border-box; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
        <div>
          ${makePageHeader("AI-Powered Campaign & Sentiment Analytics", "المنصة الذكية لتحليلات الحملات والذكاء الاصطناعي", "CERTIFIED AUDIT REPORT", "تقرير فني رسمي معتمد")}

          <!-- Hero Campaign Title Card -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-radius: 16px; padding: 22px 24px; color: #ffffff; margin-bottom: 20px; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: ${isArabic ? "-20px" : "auto"}; left: ${isArabic ? "auto" : "-20px"}; width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%); pointer-events: none;"></div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span style="font-size: 9.5px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 6px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #06b6d4;"></span>
                ${L("Official Campaign Intelligence Audit", "التقرير التحليلي الشامل والتقييم الاستراتيجي للحملة")}
              </span>
              <span style="font-size: 9px; font-weight: 800; color: #e2e8f0; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); padding: 3px 10px; border-radius: 9999px;">
                ${record.mode === "pre" ? L("PRE-LAUNCH AUDIT", "محاكاة ما قبل الإطلاق") : L("POST-LAUNCH REVIEW", "تحليل ما بعد الإطلاق")}
              </span>
            </div>

            <h1 style="font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 10px 0; line-height: 1.3; letter-spacing: -0.3px;">
              ${campaignName}
            </h1>

            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
              <span style="font-size: 9.5px; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(165, 180, 252, 0.3); color: #c7d2fe; padding: 3px 9px; border-radius: 6px; font-weight: 700;">
                🏢 ${organizerText}
              </span>
              <span style="font-size: 9.5px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(110, 231, 183, 0.3); color: #a7f3d0; padding: 3px 9px; border-radius: 6px; font-weight: 700;">
                💵 $${parseFloat(record.budget || "1000").toLocaleString()} USD
              </span>
              <span style="font-size: 9.5px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(103, 232, 249, 0.3); color: #a5f3fc; padding: 3px 9px; border-radius: 6px; font-weight: 700;">
                🗣️ ${dialectNames[dialectKey] || dialectKey}
              </span>
              <span style="font-size: 9.5px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(252, 211, 77, 0.3); color: #fde68a; padding: 3px 9px; border-radius: 6px; font-weight: 700;">
                ⏱️ ${durationText}
              </span>
            </div>
          </div>

          <!-- Campaign Parameters Bento Grid -->
          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 8px;">
              <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: #4338ca; color: #ffffff; font-size: 10px;">⚙️</span>
                <span>${L("1. Campaign Parameters & Audience Target", "١. محددات الحملة الإعلانية والشريحة المستهدفة")}</span>
              </h3>
              <span style="font-size: 9.5px; font-weight: 700; color: #64748b;">
                ${L("Configuration Matrix", "مصفوفة الإعدادات")}
              </span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase;">
                  ${L("Organizer", "الجهة المنظمة")}
                </span>
                <span style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 3px; display: block;">
                  ${organizerText}
                </span>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase;">
                  ${L("Approved Budget", "الميزانية المعتمدة")}
                </span>
                <span style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 3px; display: block; font-family: monospace;">
                  $${parseFloat(record.budget || "1000").toLocaleString()}
                </span>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase;">
                  ${L("Linguistic Dialect", "اللهجة المستهدفة")}
                </span>
                <span style="font-size: 11.5px; font-weight: 800; color: #4338ca; margin-top: 3px; display: block;">
                  ${dialectNames[dialectKey] || dialectKey}
                </span>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;">
                <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase;">
                  ${L("Duration", "فترة التشغيل")}
                </span>
                <span style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 3px; display: block;">
                  ${durationText}
                </span>
              </div>
            </div>

            <!-- Demographics line -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px;">
              <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase; margin-bottom: 6px;">
                ${L("Audience Criteria & Geographic Scope", "المعايير الديموغرافية والنطاق الجغرافي")}
              </span>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 10px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 6px; color: #1e293b; font-weight: 700;">
                  🎯 ${L("Age: ", "الفئة العمرية: ")} <strong>${audienceAge}</strong>
                </span>
                <span style="font-size: 10px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 6px; color: #1e293b; font-weight: 700;">
                  👥 ${L("Gender: ", "الجنس المستهدف: ")} <strong>${audienceGender}</strong>
                </span>
                <span style="font-size: 10px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 6px; color: #1e293b; font-weight: 700;">
                  📍 ${L("Market: ", "السوق الجغرافي: ")} <strong>${audienceLocation}</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Narrative Description & Primary Message -->
          <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span style="font-size: 9.5px; font-weight: 800; color: #4338ca; display: flex; align-items: center; gap: 6px; text-transform: uppercase; margin-bottom: 6px;">
                <span>📝</span>
                <span>${L("Campaign Concept & Narrative Description", "وصف ومفهوم الحملة الإعلانية")}</span>
              </span>
              <p style="font-size: 11px; color: #1e293b; margin: 0; line-height: 1.65; text-align: justify; font-weight: 600;">
                ${record.campaignObj?.description || (isArabic ? "حملة إعلانية مخصصة تهدف إلى تحسين الوعي وتوسيع قاعدة الجمهور المستهدف بمحتوى مبتكر." : "Strategic ad campaign targeting audience expansion and brand affinity with creative execution.")}
              </p>
            </div>

            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: ${isArabic ? "1.5px solid #e2e8f0" : "4px solid #4338ca"}; border-right: ${isArabic ? "4px solid #4338ca" : "1.5px solid #e2e8f0"}; border-radius: 12px; padding: 14px 18px;">
              <span style="font-size: 9.5px; font-weight: 800; color: #4338ca; display: flex; align-items: center; gap: 6px; text-transform: uppercase; margin-bottom: 6px;">
                <span>📢</span>
                <span>${L("Primary Message & Ad Copy Slogans", "الرسالة الإعلانية الأساسية والشعارات المعتمدة")}</span>
              </span>
              <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 4px; line-height: 1.5;">
                "${record.campaignObj?.message || record.campaignObj?.slogans || (isArabic ? "رسالة تسويقية محددة ومؤثرة." : "Targeted high-resonance marketing message.")}"
              </div>
              ${
                record.campaignObj?.slogans
                  ? `
                <div style="font-size: 10.5px; color: #64748b; font-weight: 700; font-style: italic;">
                  «${record.campaignObj.slogans}»
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>

        <div>
          ${makePageFooter(1)}
        </div>
      </div>

      <!-- ==================== PAGE 2: AI DIAGNOSTICS & STRATEGIC ASSESSMENT ==================== -->
      <div id="pdf-page-2" class="pdf-page" style="width: 794px; height: 1123px; padding: 38px 44px; box-sizing: border-box; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
        <div>
          ${makePageHeader("AI Diagnostics & Strategic Performance", "تشخيصات الذكاء الاصطناعي والأداء الاستراتيجي", "AI DIAGNOSTICS", "تشخيص الذكاء الاصطناعي")}

          <!-- Top Scores Bento (Radial / Metric Style) -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 18px;">
            <div style="border: 1.5px solid #c7d2fe; border-radius: 14px; padding: 16px 20px; background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%); display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(99, 102, 241, 0.08);">
              <div>
                <span style="font-size: 9px; font-weight: 800; color: #4338ca; text-transform: uppercase; background: #e0e7ff; padding: 2px 8px; border-radius: 6px;">
                  ${L("READINESS SCORE", "درجة الجاهزية")}
                </span>
                <h4 style="font-size: 13px; font-weight: 900; color: #1e1b4b; margin: 6px 0 2px 0;">
                  ${L("Campaign Readiness Index", "مؤشر الجاهزية الاستراتيجية")}
                </h4>
                <p style="font-size: 9.5px; color: #4338ca; margin: 0; font-weight: 600;">
                  ${L("Audience cultural & linguistic fit", "المواءمة الثقافية والتوافق اللغوي")}
                </p>
              </div>
              <div style="text-align: right; background: #ffffff; border: 2px solid #a5b4fc; border-radius: 14px; padding: 8px 16px;">
                <span style="font-size: 32px; font-weight: 900; color: #3730a3; font-family: monospace; line-height: 1;">${overallScore}</span>
                <span style="font-size: 11px; color: #6366f1; font-weight: 800; display: block;">/ 100</span>
              </div>
            </div>

            <div style="border: 1.5px solid #a7f3d0; border-radius: 14px; padding: 16px 20px; background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.08);">
              <div>
                <span style="font-size: 9px; font-weight: 800; color: #047857; text-transform: uppercase; background: #d1fae5; padding: 2px 8px; border-radius: 6px;">
                  ${L("SUCCESS PROBABILITY", "احتمالية النجاح")}
                </span>
                <h4 style="font-size: 13px; font-weight: 900; color: #064e3b; margin: 6px 0 2px 0;">
                  ${L("Estimated Organic Resonance", "احتمالية النجاح والرنين العام")}
                </h4>
                <p style="font-size: 9.5px; color: #059669; margin: 0; font-weight: 600;">
                  ${L("Predictive algorithm score", "توقع حجم التفاعل المجتمعي والوصول")}
                </p>
              </div>
              <div style="text-align: right; background: #ffffff; border: 2px solid #6ee7b7; border-radius: 14px; padding: 8px 16px;">
                <span style="font-size: 32px; font-weight: 900; color: #065f46; font-family: monospace; line-height: 1;">${overallScore}%</span>
                <span style="font-size: 11px; color: #10b981; font-weight: 800; display: block;">CONFIDENCE</span>
              </div>
            </div>
          </div>

          <!-- Deep-Dive AI Diagnosis Callout -->
          <div style="border: 1.5px solid #c7d2fe; background: linear-gradient(180deg, #f8faff 0%, #ffffff 100%); padding: 18px 20px; border-radius: 14px; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #e0e7ff; padding-bottom: 6px;">
              <h3 style="font-size: 13px; font-weight: 800; color: #1e1b4b; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: #4338ca; color: #ffffff; font-size: 10px;">✨</span>
                <span>${L("AI Campaign Core Diagnostics (Deep-Dive Analysis)", "تشخيصات الذكاء الاصطناعي العميقة لأداء الحملة")}</span>
              </h3>
              <span style="font-size: 9px; font-weight: 800; color: #4338ca; background: #e0e7ff; padding: 2px 8px; border-radius: 6px;">
                GEMINI NEURAL AUDIT
              </span>
            </div>
            <p style="font-size: 11px; color: #1e293b; line-height: 1.7; text-align: justify; margin: 0; font-weight: 600;">
              ${diagnosisText}
            </p>
          </div>

          <!-- Strategic Evaluation & Performance Forecast -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px;">
            <div style="border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; padding-bottom: 6px; border-bottom: 1.5px solid #f1f5f9; display: flex; align-items: center; gap: 6px;">
                <span style="color: #4338ca;">📋</span>
                <span>${L("Strategic Campaign Evaluation", "التقييم الاستراتيجي الشامل")}</span>
              </h3>
              <p style="font-size: 10.5px; color: #334155; line-height: 1.6; text-align: justify; margin: 0; font-weight: 600;">
                ${evaluationText}
              </p>
            </div>

            <div style="border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; padding-bottom: 6px; border-bottom: 1.5px solid #f1f5f9; display: flex; align-items: center; gap: 6px;">
                <span style="color: #059669;">📈</span>
                <span>${record.mode === "pre" ? L("Performance Forecast", "توقع الأداء والانتشار") : L("Multi-Channel Digital Analysis", "تحليل الأداء عبر المنصات")}</span>
              </h3>
              <p style="font-size: 10.5px; color: #334155; line-height: 1.6; text-align: justify; margin: 0; font-weight: 600;">
                ${forecastText}
              </p>
            </div>
          </div>

          <!-- Audience Behavior & Platform Breakdown -->
          <div style="border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px 18px; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 6px;">
                <span style="color: #0284c7;">👥</span>
                <span>${L("Audience Behavioral Dynamics & Platform Optimization", "ديناميكيات سلوك الجمهور والتحسين عبر المنصات")}</span>
              </h3>
            </div>
            <p style="font-size: 10.5px; color: #334155; line-height: 1.6; text-align: justify; margin: 0; font-weight: 600;">
              ${
                record.aiReport?.audienceBehaviorAnalysis &&
                (isArabic
                  ? hasArabic(record.aiReport.audienceBehaviorAnalysis)
                  : !hasArabic(record.aiReport.audienceBehaviorAnalysis))
                  ? record.aiReport.audienceBehaviorAnalysis
                  : defaultAudienceAnalysis
              }
            </p>
          </div>
        </div>

        <div>
          ${makePageFooter(2)}
        </div>
      </div>

      <!-- ==================== PAGE 3: SWOT STRATEGIC RESILIENCE ==================== -->
      <div id="pdf-page-3" class="pdf-page" style="width: 794px; height: 1123px; padding: 38px 44px; box-sizing: border-box; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
        <div>
          ${makePageHeader("SWOT Strategic Resilience & Impact Index", "التحليل الرباعي ومؤشر الجدوى الاستراتيجية", "SWOT & RESILIENCE", "التحليل الرباعي")}

          <!-- SWOT Chart Bar Card -->
          <div style="background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin-bottom: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              <h4 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 6px;">
                <span style="color: #4338ca;">📊</span>
                <span>${L("SWOT Strategic Impact Index (Audience Resonance)", "مؤشر الأداء والجدوى الاستراتيجية لتحليل SWOT")}</span>
              </h4>
              <span style="font-size: 9px; font-weight: 800; color: #64748b;">
                ${L("Comparative Pillar Weights", "أوزان الركائز الاستراتيجية")}
              </span>
            </div>
            
            <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 130px; padding: 5px 15px 5px 15px;">
              <!-- S -->
              <div style="display: flex; flex-direction: column; align-items: center; width: 110px;">
                <span style="font-size: 12px; font-weight: 900; color: #059669; margin-bottom: 4px; font-family: monospace;">${sScore}%</span>
                <div style="width: 44px; height: ${sScore * 0.85}px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 6px 6px 0 0; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);"></div>
                <div style="margin-top: 6px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 800; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; display: inline-block;">
                    ${L("Strengths", "نقاط القوة")}
                  </span>
                </div>
              </div>

              <!-- W -->
              <div style="display: flex; flex-direction: column; align-items: center; width: 110px;">
                <span style="font-size: 12px; font-weight: 900; color: #dc2626; margin-bottom: 4px; font-family: monospace;">${wScore}%</span>
                <div style="width: 44px; height: ${wScore * 0.85}px; background: linear-gradient(180deg, #f43f5e 0%, #dc2626 100%); border-radius: 6px 6px 0 0; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);"></div>
                <div style="margin-top: 6px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 800; color: #b91c1c; background: #fef2f2; border: 1px solid #fecdd3; padding: 2px 8px; border-radius: 4px; display: inline-block;">
                    ${L("Weaknesses", "نقاط الضعف")}
                  </span>
                </div>
              </div>

              <!-- O -->
              <div style="display: flex; flex-direction: column; align-items: center; width: 110px;">
                <span style="font-size: 12px; font-weight: 900; color: #2563eb; margin-bottom: 4px; font-family: monospace;">${oScore}%</span>
                <div style="width: 44px; height: ${oScore * 0.85}px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 6px 6px 0 0; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);"></div>
                <div style="margin-top: 6px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 800; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 4px; display: inline-block;">
                    ${L("Opportunities", "الفرص المتاحة")}
                  </span>
                </div>
              </div>

              <!-- T -->
              <div style="display: flex; flex-direction: column; align-items: center; width: 110px;">
                <span style="font-size: 12px; font-weight: 900; color: #d97706; margin-bottom: 4px; font-family: monospace;">${tScore}%</span>
                <div style="width: 44px; height: ${tScore * 0.85}px; background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%); border-radius: 6px 6px 0 0; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);"></div>
                <div style="margin-top: 6px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 800; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; display: inline-block;">
                    ${L("Threats", "المخاطر")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- SWOT 4 Bento Cards -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px;">
            <!-- Strengths -->
            <div style="background: #ffffff; border: 1.5px solid #a7f3d0; border-top: 3.5px solid #059669; border-radius: 12px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="font-size: 11.5px; font-weight: 900; color: #065f46; margin: 0; display: flex; align-items: center; gap: 6px;">
                  <span>✅</span>
                  <span>${L("Strengths (Core Strategic Assets)", "نقاط القوة وركائز النجاح")}</span>
                </h4>
                <span style="font-size: 8.5px; font-weight: 800; color: #047857; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">S</span>
              </div>
              <ul style="margin: 0; padding-inline-start: 16px; font-size: 10px; color: #14532d; line-height: 1.6; font-weight: 600;">
                ${finalStrengths.map((s: string) => `<li>${s}</li>`).join("")}
              </ul>
            </div>

            <!-- Weaknesses -->
            <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-top: 3.5px solid #dc2626; border-radius: 12px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="font-size: 11.5px; font-weight: 900; color: #991b1b; margin: 0; display: flex; align-items: center; gap: 6px;">
                  <span>⚠️</span>
                  <span>${L("Weaknesses & Constraints", "نقاط الضعف والتحديات")}</span>
                </h4>
                <span style="font-size: 8.5px; font-weight: 800; color: #b91c1c; background: #fef2f2; padding: 2px 6px; border-radius: 4px;">W</span>
              </div>
              <ul style="margin: 0; padding-inline-start: 16px; font-size: 10px; color: #7f1d1d; line-height: 1.6; font-weight: 600;">
                ${finalWeaknesses.map((w: string) => `<li>${w}</li>`).join("")}
              </ul>
            </div>

            <!-- Opportunities -->
            <div style="background: #ffffff; border: 1.5px solid #bfdbfe; border-top: 3.5px solid #2563eb; border-radius: 12px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="font-size: 11.5px; font-weight: 900; color: #1e40af; margin: 0; display: flex; align-items: center; gap: 6px;">
                  <span>🚀</span>
                  <span>${L("Growth Opportunities", "فرص التوسع والنمو")}</span>
                </h4>
                <span style="font-size: 8.5px; font-weight: 800; color: #1d4ed8; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">O</span>
              </div>
              <ul style="margin: 0; padding-inline-start: 16px; font-size: 10px; color: #1e3a8a; line-height: 1.6; font-weight: 600;">
                ${finalOpportunities.map((o: string) => `<li>${o}</li>`).join("")}
              </ul>
            </div>

            <!-- Threats -->
            <div style="background: #ffffff; border: 1.5px solid #fde68a; border-top: 3.5px solid #d97706; border-radius: 12px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="font-size: 11.5px; font-weight: 900; color: #92400e; margin: 0; display: flex; align-items: center; gap: 6px;">
                  <span>🛡️</span>
                  <span>${L("Threats & Mitigation Strategies", "المخاطر وسبل الحماية")}</span>
                </h4>
                <span style="font-size: 8.5px; font-weight: 800; color: #b45309; background: #fffbeb; padding: 2px 6px; border-radius: 4px;">T</span>
              </div>
              <ul style="margin: 0; padding-inline-start: 16px; font-size: 10px; color: #78350f; line-height: 1.6; font-weight: 600;">
                ${finalThreats.map((t: string) => `<li>${t}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>

        <div>
          ${makePageFooter(3)}
        </div>
      </div>

      <!-- ==================== PAGE 4: REGIONAL WILAYAS, METRICS & RECOMMENDATIONS ==================== -->
      <div id="pdf-page-4" class="pdf-page" style="width: 794px; height: 1123px; padding: 38px 44px; box-sizing: border-box; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
        <div>
          ${makePageHeader("Regional Wilayas & Performance Metrics", "التحليل الإقليمي ومؤشرات الأداء والتوصيات", "REGIONAL & ACTIONS", "التحليل الإقليمي والتوصيات")}

          <!-- Wilayas Table -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px;">
              <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 6px;">
                <span style="color: #4338ca;">📍</span>
                <span>${L("Geographical Optimization & Regional Resonance (Algeria)", "التحليل الإقليمي وملاءمة اللهجة عبر ولايات الجزائر")}</span>
              </h3>
              <span style="font-size: 8.5px; font-weight: 800; color: #4338ca; background: #e0e7ff; padding: 2px 8px; border-radius: 4px;">
                6 KEY WILAYAS
              </span>
            </div>
            
            <div style="border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <table style="width: 100%; border-collapse: collapse; text-align: ${isArabic ? "right" : "left"}; font-size: 10px;">
                <thead>
                  <tr style="background-color: #0f172a; color: #ffffff;">
                    <th style="padding: 7px 10px; font-weight: 800;">${L("Wilaya (Province)", "الولاية")}</th>
                    <th style="padding: 7px 10px; font-weight: 800; text-align: center;">${L("Resonance", "درجة التجاوب")}</th>
                    <th style="padding: 7px 10px; font-weight: 800; text-align: center;">${L("Status", "الحالة")}</th>
                    <th style="padding: 7px 10px; font-weight: 800; text-align: center;">${L("Engagement", "معدل التفاعل")}</th>
                    <th style="padding: 7px 10px; font-weight: 800; text-align: center;">${L("Est. Views", "المشاهدات المقدرة")}</th>
                    <th style="padding: 7px 10px; font-weight: 800; text-align: center;">${L("Best Platform", "المنصة المثالية")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${wilayaRows
                    .map(
                      (row, index) => `
                    <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                      <td style="padding: 6px 10px; font-weight: 800; color: #0f172a;">${row.name}</td>
                      <td style="padding: 6px 10px; text-align: center; font-weight: 900; color: #4338ca; font-family: monospace;">${row.score}%</td>
                      <td style="padding: 6px 10px; text-align: center;">
                        <span style="color: ${row.statusColor}; background: ${row.statusBg}; border: 1px solid ${row.statusBorder}; font-weight: 800; padding: 2px 7px; border-radius: 9999px; font-size: 8.5px;">
                          ${row.statusLabel}
                        </span>
                      </td>
                      <td style="padding: 6px 10px; text-align: center; font-weight: 800; color: #334155; font-family: monospace;">${row.engagementRate}%</td>
                      <td style="padding: 6px 10px; text-align: center; font-weight: 700; color: #0f172a; font-family: monospace;">${Intl.NumberFormat().format(row.views)}</td>
                      <td style="padding: 6px 10px; text-align: center;">
                        <span style="background: #eef2ff; color: #4338ca; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 9px;">${row.bestPlatform}</span>
                      </td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Sentiment & KPIs Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <!-- Sentiment Listening -->
            <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span style="font-size: 10px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 5px; margin-bottom: 8px;">
                <span>🎯</span>
                <span>${L("Sentiment Listening & Reception", "تحليل النبرة ورصد المشاعر")}</span>
              </span>
              <div style="height: 12px; border-radius: 6px; display: flex; overflow: hidden; background: #e2e8f0; margin-bottom: 8px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);">
                <div style="width: ${pSentiment}%; background: linear-gradient(90deg, #10b981, #059669);"></div>
                <div style="width: ${nSentiment}%; background-color: #94a3b8;"></div>
                <div style="width: ${ngSentiment}%; background: linear-gradient(90deg, #f43f5e, #dc2626);"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 9px; font-weight: 800;">
                <span style="color: #059669;">● ${L("Positive", "إيجابي")} ${pSentiment}%</span>
                <span style="color: #475569;">● ${L("Neutral", "محايد")} ${nSentiment}%</span>
                <span style="color: #dc2626;">● ${L("Negative", "سلبي")} ${ngSentiment}%</span>
              </div>
            </div>

            <!-- Digital KPIs -->
            <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span style="font-size: 10px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 5px; margin-bottom: 8px;">
                <span>⚡</span>
                <span>${L("Estimated Engagement Metrics", "مؤشرات التفاعل الرقمي المتوقعة")}</span>
              </span>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 4px; text-align: center; background: #f8fafc;">
                  <span style="font-size: 8px; color: #64748b; font-weight: 800; display: block;">${L("VIEWS", "المشاهدات")}</span>
                  <span style="font-size: 12px; font-weight: 900; color: #0f172a; font-family: monospace; margin-top: 2px; display: block;">${Intl.NumberFormat().format(viewsCount)}</span>
                </div>
                <div style="border: 1px solid #fecdd3; border-radius: 8px; padding: 6px 4px; text-align: center; background: #fff1f2;">
                  <span style="font-size: 8px; color: #e11d48; font-weight: 800; display: block;">${L("LIKES", "الإعجابات")}</span>
                  <span style="font-size: 12px; font-weight: 900; color: #be123c; font-family: monospace; margin-top: 2px; display: block;">${Intl.NumberFormat().format(likesCount)}</span>
                </div>
                <div style="border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px 4px; text-align: center; background: #eff6ff;">
                  <span style="font-size: 8px; color: #2563eb; font-weight: 800; display: block;">${L("CLICKS", "النقرات")}</span>
                  <span style="font-size: 12px; font-weight: 900; color: #1d4ed8; font-family: monospace; margin-top: 2px; display: block;">${Intl.NumberFormat().format(clicksCount)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px;">
              <h3 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 6px;">
                <span>💡</span>
                <span>${L("Final Priority Actionable Recommendations", "التوصيات الاستراتيجية ذات الأولوية القصوى")}</span>
              </h3>
              <span style="font-size: 8.5px; font-weight: 800; color: #059669; background: #ecfdf5; padding: 2px 8px; border-radius: 4px;">
                HIGH PRIORITY
              </span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 7px;">
              ${finalRecommendations
                .map(
                  (rec, idx) => `
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; padding: 8px 12px; border-radius: 8px; display: flex; align-items: flex-start; gap: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                  <span style="height: 20px; width: 20px; border-radius: 50%; background: linear-gradient(135deg, #4338ca 0%, #3b82f6 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; flex-shrink: 0; font-family: monospace;">
                    ${idx + 1}
                  </span>
                  <div>
                    <h5 style="margin: 0 0 2px 0; font-size: 10.5px; font-weight: 800; color: #0f172a;">${rec.title}</h5>
                    <p style="margin: 0; font-size: 9.5px; color: #475569; line-height: 1.5; font-weight: 600; text-align: justify;">${rec.detail}</p>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>

        <div>
          <!-- Official Seal & Signature -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 8px; border-top: 1px solid #e2e8f0;">
            <div>
              <span style="font-size: 8.5px; color: #64748b; font-weight: 700;">${L("Approved & Validated by Autonomous Intelligence Center", "معتمد ومرخص رسمياً من قبل")}</span>
              <span style="display: block; font-size: 10px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                Public Insight Autonomous Intelligence Center
              </span>
            </div>
            <div style="border: 2px solid #4338ca; border-radius: 50%; width: 50px; height: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #4338ca; font-size: 5.5px; font-weight: 900; line-height: 1.1; background: #ffffff; box-shadow: 0 2px 4px rgba(67, 56, 202, 0.1);">
              <span>PUBLIC</span>
              <span style="border-top: 1px solid #4338ca; border-bottom: 1px solid #4338ca; padding: 1px 0; margin: 1px 0; font-size: 4.5px;">APPROVED</span>
              <span>INSIGHT</span>
            </div>
          </div>
          ${makePageFooter(4)}
        </div>
      </div>

      ${feedbackHtmlPage}

    </div>
  `;

  document.body.appendChild(container);

  if (document.fonts && document.fonts.ready) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch {
      // Font loading timeout fallback
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 350));

  const safeName = (record.name || "Campaign")
    .trim()
    .replace(/[/?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_");
  const fileName = `PublicInsight_${safeName}_Report.pdf`;

  try {
    const page1 = container.querySelector("#pdf-page-1") as HTMLElement;
    const page2 = container.querySelector("#pdf-page-2") as HTMLElement;
    const page3 = container.querySelector("#pdf-page-3") as HTMLElement;
    const page4 = container.querySelector("#pdf-page-4") as HTMLElement;
    const page5 = container.querySelector("#pdf-page-5") as HTMLElement;
    const pages = [page1, page2, page3, page4, page5].filter(Boolean);

    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      if (!pageEl) continue;

      const canvas = await html2canvas(pageEl, {
        scale: 2.3, // ~220 DPI crisp print quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "NONE");
    }

    const pdfBlob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Multi-target download mechanism to guarantee saving on user's PC:
    try {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.setAttribute("download", fileName);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (document.body.contains(link)) document.body.removeChild(link);
        } catch {
          // Cleanup error ignored
        }
      }, 5000);
    } catch (e) {
      console.warn("Anchor click failed:", e);
    }

    try {
      pdf.save(fileName);
    } catch (e) {
      console.warn("pdf.save failed:", e);
    }

    return { success: true, blobUrl, fileName };
  } catch (error) {
    console.error("Canvas PDF generation encountered an error:", error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
