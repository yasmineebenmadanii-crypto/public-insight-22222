import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Compass,
  CheckCircle2,
  Award,
  ThumbsUp,
  ThumbsDown,
  Users,
  Globe,
  Zap,
  Check,
  Printer,
  ChevronRight,
  Flame,
  Search,
  Filter,
  Trash2,
  Calendar,
  DollarSign,
  Layers,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Briefcase,
  User,
  Building2,
  QrCode,
  Copy,
  ExternalLink,
  BarChart2,
  Download,
} from "lucide-react";
import { useI18n, type TKey } from "@/lib/i18n";
import { generateCampaignReport } from "@/lib/api/gemini.functions";
import { exportCampaignToPDF } from "@/lib/pdfGenerator";
import { ReportDownloadModal } from "@/components/ReportDownloadModal";
import { AlgeriaInteractiveMap } from "@/components/AlgeriaInteractiveMap";
import { CampaignMediaTracker } from "@/components/CampaignMediaTracker";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Logs — Public Insight" }] }),
  component: Reports,
});

interface AIReportStructure {
  reportDescription: string;
  campaignEvaluation?: string;
  performanceForecast?: string;
  strengths?: string[];
  weaknesses?: string[];
  audienceBehaviorAnalysis?: string;
  platformAnalysis?: string;
  recommendations: { title: string; detail: string }[];
  advancedAIRecommendations?: { title: string; detail: string; impactScore: number }[];
  error?: string;
}

interface CampaignHistoryRecord {
  id: string;
  name: string;
  mode: "pre" | "post";
  userType: "user" | "org";
  date: string;
  budget: string;
  platforms: string[];
  dialect: string;
  score: number;
  status: "weak" | "average" | "strong";
  engagementRate: number;
  sentiment: { positive: number; neutral: number; negative: number };
  metrics: { views: number; likes: number; comments: number; shares: number; clicks?: number };
  campaignObj: any;
  resultObj: any;
  aiReport?: AIReportStructure;
}

// Preloaded beautiful local campaigns to populate with dynamic data
const INITIAL_CAMPAIGNS: CampaignHistoryRecord[] = [
  {
    id: "pre_loaded_1",
    name: "أصالة للقهوة المختصة (Asala Coffee Launch)",
    mode: "pre",
    userType: "org",
    date: "2026-06-20",
    budget: "1500",
    platforms: ["instagram", "tiktok"],
    dialect: "gulf",
    score: 92,
    status: "strong",
    engagementRate: 6.4,
    sentiment: { positive: 85, neutral: 11, negative: 4 },
    metrics: { views: 74200, likes: 2600, comments: 410, shares: 210, clicks: 5936 },
    campaignObj: {
      name: "أصالة للقهوة المختصة (Asala Coffee Launch)",
      type: ["awareness", "commercial"],
      organizer: "أصالة للقهوة والضيافة",
      description:
        "حملة إطلاق خط إنتاج القهوة المختصة الباردة المعبأة مسبقاً واستهداف عشاق القهوة في الخليج.",
      objectives: "زيادة الوعي بالمنتج الجديد وتحقيق مبيعات ممتازة عبر نقرات المتجر الإلكتروني.",
      age: "18-34",
      gender: "both",
      location: "المملكة العربية السعودية والخليج",
      education: "University",
      interests: "Coffee, specialty coffee, cafes",
      message: "طعم الأصالة في كل رشفة باردة تنعش يومك.",
      slogans: "أصالة باردة، قهوة مختصة، طاقة يومك",
      platforms: ["instagram", "tiktok"],
      durationValue: "14",
      durationUnit: "days",
      budget: "1500",
      contentTypes: ["video", "design"],
      dialect: "gulf",
    },
    resultObj: {
      campaignName: "أصالة للقهوة المختصة (Asala Coffee Launch)",
      score: 92,
      status: "strong",
      engagementRate: 6.4,
      engagementGrade: "excellent",
      sentiment: { positive: 85, neutral: 11, negative: 4 },
      peakTime: { from: "18:00", to: "22:00" },
      metrics: { views: 74200, likes: 2600, comments: 410, shares: 210, clicks: 5936 },
      timeline: [
        { day: "Mon", views: 8200, engagement: 5.8 },
        { day: "Tue", views: 9100, engagement: 6.1 },
        { day: "Wed", views: 9800, engagement: 6.3 },
        { day: "Thu", views: 12400, engagement: 6.6 },
        { day: "Fri", views: 14200, engagement: 7.0 },
        { day: "Sat", views: 11500, engagement: 6.5 },
        { day: "Sun", views: 9000, engagement: 6.0 },
      ],
      insights: [
        "حققت الحملة تغلغلاً كبيراً بفضل مواءمتها الاستثنائية مع اللهجة الخليجية المحلية.",
        "مقاطع الفيديو ريلز كانت محرك التفاعل الأساسي بنسبة تفوق 2.5 ضعف مقارنة بالصور.",
        "تنسيق الميزانية المرصودة حقق أقصى فاعلية في الوصول للجمهور المستهدف دون هدر مالي.",
      ],
      recommendations: [
        {
          title: "تركيز الميزانية في تيك توك وإنستجرام ريلز",
          detail:
            "الاستمرار في إنتاج مقاطع فيديو ريلز قصيرة تحاكي نبرة الحياة اليومية للشباب الخليجي.",
          category: "content",
        },
        {
          title: "استثمار أوقات النشر المسائية",
          detail:
            "أفضل تفاعل ينشط بين الساعة 6 مساءً و 10 مساءً، لذا جدول المنشورات الرئيسية في هذا النطاق.",
          category: "timing",
        },
      ],
      strengths: [
        "مواءمة ثقافية متميزة جداً بفضل اللهجة الخليجية المصممة بعناية.",
        "تركيز واضح ومكثف على منصات التفاعل البصري التي ينشط فيها الشباب.",
        "جاذبية شعار الحملة المباشر والملائم للأجواء الصيفية والمزاج اليومي للمستهلك.",
      ],
      weaknesses: [
        "الاعتماد الكامل على المنشورات الإعلانية المدفوعة يمثل خطراً عند انتهاء الميزانية.",
        "نقص مؤشرات تتبع المنافسين المباشرين في السوق الإقليمي المحيط.",
      ],
      advancedRecommendations: [],
      longTermRoadmap: { shortTerm: [], midTerm: [], longTerm: [] },
    },
    aiReport: {
      reportDescription:
        "حملة 'أصالة للقهوة المختصة' تمثل نموذجاً يحتذى به في التموضع التسويقي والملاءمة الثقافية العالية. باستخدام اللهجة الخليجية بنسب ذكية ومدروسة، استطاعت العلامة التجارية اختراق الحواجز العاطفية وتحقيق رنين معنوي ومصداقية فورية لدى عشاق القهوة الشباب. يضمن هذا الأداء المتميز ومعدل التفاعل الاستثنائي البالغ 6.4% كفاءة مذهلة في تحويل النقرات والزيارات إلى مبيعات ملموسة ومستدامة. تعد هذه الحملة جاهزة تسويقياً بشكل كامل ومحسنة للاستحواذ على حصة سوقية هامة.",
      campaignEvaluation:
        "تظهر استراتيجية حملة أصالة عمقاً كبيراً وتخطيطاً استباقياً ناضجاً. اختيار المنصات متوافق تماماً مع طبيعة المنتج وعمر الجمهور المستهدف (18-34)، كما أن الميزانية الموزعة على منصتين فقط تضمن عدم تشتت الزخم الإعلاني وتحقق أقصى فاعلية ممكنة.",
      performanceForecast:
        "يتوقع خبراء الذكاء الاصطناعي انتشاراً عضوياً واسع النطاق (Viral potential) في الأسابيع الأولى، مع الحفاظ على كلفة نقرة منخفضة للغاية بفضل مستويات التفاعل العالية والمشاركة النشطة لجمهور القهوة.",
      strengths: [
        "الملاءمة الثقافية المثالية واستخدام اللهجة الخليجية المحلية.",
        "توزيع الميزانية عالي الكفاءة على قنوات بصرية مركزة.",
        "الرسالة التسويقية جذابة للغاية ومحفزة للشراء العفوي.",
      ],
      weaknesses: [
        "مخاطر تراجع التفاعل التدريجي بعد أسبوعين في حال عدم تجديد المشاهد الإعلانية.",
        "غياب خطة واضحة لرسائل إعادة الاستهداف (Retargeting) بعد النقرة الأولى.",
      ],
      audienceBehaviorAnalysis:
        "الجمهور المستهدف من فئة الشباب الخليجي متأثر للغاية بجودة الصورة ومصداقية المراجعات العفوية، ولديه تقدير خاص للقهوة كجزء رئيسي من نمط حياته وتجمعاته الاجتماعية اليومية.",
      platformAnalysis:
        "تيك توك وإنستجرام ريلز هما المنصتان الذهبيتان لهذا المنتج، حيث تمنحان خوارزميات النشر العضوي فرصة هائلة للوصول لآلاف المهتمين دون كلفة إضافية.",
      recommendations: [
        {
          title: "التعاون مع صناع محتوى محليين",
          detail: "أرسل عينات مجانية لصناع المحتوى الخليجيين لتصوير تجربة تذوق عفوية وغير مصطنعة.",
        },
        {
          title: "تقديم كود خصم صيفي حصري",
          detail: "اطرح كود خصم تفاعلي مثل (ASALA10) لتتبع مصادر المبيعات وتحفيز الشراء الفوري.",
        },
      ],
    },
  },
  {
    id: "pre_loaded_2",
    name: "صحتك في حركتك (Your Health in Movement)",
    mode: "post",
    userType: "user",
    date: "2026-06-15",
    budget: "800",
    platforms: ["instagram"],
    dialect: "levantine",
    score: 78,
    status: "average",
    engagementRate: 4.2,
    sentiment: { positive: 74, neutral: 20, negative: 6 },
    metrics: { views: 32000, likes: 740, comments: 120, shares: 60, clicks: 2560 },
    campaignObj: {
      name: "صحتك في حركتك (Your Health in Movement)",
      type: ["social", "informational"],
      organizer: "كابتن سارة - مدربة لياقة",
      description:
        "برنامج رياضي مجتمعي نسائي للتوعية بأهمية نمط الحياة الصحي والنشاط البدني المنزلي اليومي.",
      objectives: "تحفيز 500 سيدة للمشاركة في التحدي الرياضي المنزلي المجاني.",
      age: "18-45",
      gender: "female",
      location: "الأردن وبلاد الشام",
      education: "High School, University",
      interests: "Fitness, wellness, home workout, healthy food",
      message: "خطوة صغيرة كل يوم بتصنع فرق كبير بصحتك ونشاطك.",
      slogans: "صحتك بحركتك، تحدي اللياقة، نمط حياة صحي",
      platforms: ["instagram"],
      durationValue: "30",
      durationUnit: "days",
      budget: "800",
      contentTypes: ["video", "image"],
      dialect: "levantine",
    },
    resultObj: {
      campaignName: "صحتك في حركتك (Your Health in Movement)",
      score: 78,
      status: "average",
      engagementRate: 4.2,
      engagementGrade: "good",
      sentiment: { positive: 74, neutral: 20, negative: 6 },
      peakTime: { from: "19:00", to: "22:00" },
      metrics: { views: 32000, likes: 740, comments: 120, shares: 60, clicks: 2560 },
      timeline: [
        { day: "Mon", views: 3800, engagement: 3.8 },
        { day: "Tue", views: 4100, engagement: 4.0 },
        { day: "Wed", views: 4300, engagement: 4.1 },
        { day: "Thu", views: 5200, engagement: 4.4 },
        { day: "Fri", views: 5800, engagement: 4.6 },
        { day: "Sat", views: 4900, engagement: 4.3 },
        { day: "Sun", views: 4100, engagement: 3.9 },
      ],
      insights: [
        "تفاعل نسائي قوي ومؤثر بفضل الطابع التحفيزي البسيط والنبرة الودودة باللهجة الشامية اللطيفة.",
        "المشاركة اليومية للقصص واليوميات ساهمت في رفع معدل بقاء وتفاعل الجمهور العضوي.",
      ],
      recommendations: [
        {
          title: "إدماج الفيديوهات القصيرة للتفسير المباشر",
          detail:
            "تفضل المتابعات مقاطع ريلز التي تشرح حركات رياضية دقيقة مع النصائح التغذوية البسيطة.",
          category: "content",
        },
      ],
      strengths: [
        "نبرة عاطفية وصادقة تخلق شعوراً بالانتماء والمجتمع الداعم بين المشاركات.",
        "التزام قوي وصريح من الجمهور المتابع بمشاركة تحدياتهم اليومية بحرية.",
      ],
      weaknesses: [
        "محدودية الميزانية تحد من نطاق الوصول خارج الدائرة الاجتماعية القريبة.",
        "الاعتماد الكبير على النشر اليدوي المجهد للمدربة طوال الـ 30 يوماً.",
      ],
      advancedRecommendations: [],
      longTermRoadmap: { shortTerm: [], midTerm: [], longTerm: [] },
    },
    aiReport: {
      reportDescription:
        "تمثل مبادرة 'صحتك في حركتك' حالة دراسية ممتازة في كيفية بناء مجتمع تسويقي وفيّ ومتفاعل بأقل التكاليف الممكنة. استخدام النبرة التشجيعية والودودة باللهجة الشامية العفوية أزال كلف التكلف وبنى جسراً من الثقة الفورية مع السيدات الباحثات عن بيئة رياضية داعمة خالية من الضغوط. برغم الميزانية المحدودة (800 دولار)، حقق التفاعل معدل 4.2% وهو مؤشر ممتاز يعكس شغف الجمهور واستعداده للاستمرار والترويج الشفهي للمبادرة.",
      campaignEvaluation:
        "الحملة مبنية على أسس سليمة عاطفياً ومجتمعياً. التركيز الحصري على منصة إنستجرام كان قراراً حكيماً في ظل الميزانية المتواضعة، مما سمح للمدربة ببناء هوية بصرية مألوفة وعلاقة تفاعلية مباشرة مع السيدات عبر الرسائل والتعليقات والقصص اليومية.",
      performanceForecast:
        "يُتوقع أن تحافظ الحملة على نمو عضوي متصاعد بفضل مشاركات المتابعات لقصصهن وتجاربهن الخاصة (UGC)، مما يعمل كدعاية مجانية مستمرة تضاعف من أثر الحملة على المدى الطويل.",
      strengths: [
        "بناء مجتمع نسائي تفاعلي متماسك وداعم.",
        "اللهجة الشامية العفوية والودية ملامسة جداً لقلوب الجمهور.",
        "مصداقية عالية للمدربة تترجم إلى ولاء طويل الأمد.",
      ],
      weaknesses: [
        "صعوبة الوصول لشرائح جديدة خارج إنستجرام بسبب غياب الميزانية الممولة.",
        "خطر تعرض المتابعات للملل أو الفتور الإعلاني بعد انتهاء فترة التحدي.",
      ],
      audienceBehaviorAnalysis:
        "الجمهور من السيدات يفضل المحتوى التحفيزي اليومي المتكرر، ويبحث عن خطوات سهلة التنفيذ تناسب روتينهن المنزلي المزدحم، كما يثقن بالتجارب والنتائج الحقيقية للمشاركات الأخريات.",
      platformAnalysis:
        "إنستجرام هي المنصة المثالية للنمط البصري والقصصي لهذه الحملة، حيث يسهل استخدام ميزات الملصقات التفاعلية والأسئلة لزيادة الارتباط اليومي.",
      recommendations: [
        {
          title: "إطلاق مسابقة أسبوعية بجوائز رمزية",
          detail:
            "قدمي جوائز معنوية بسيطة كاستشارة مجانية أو خطة تغذية مخصصة لتنشيط التفاعل دورياً.",
        },
        {
          title: "تصوير مقاطع ريلز قصيرة لتمارين صحيحة",
          detail:
            "انشري فيديوهات مدتها 15 ثانية تشرح الأخطاء الشائعة في التمارين لتوفير قيمة علمية سريعة ومقنعة.",
        },
      ],
    },
  },
  {
    id: "pre_loaded_3",
    name: "متجر واحة التقنية (Ramadan Tech Offers)",
    mode: "post",
    userType: "org",
    date: "2026-06-08",
    budget: "3500",
    platforms: ["facebook", "instagram", "youtube"],
    dialect: "egyptian",
    score: 63,
    status: "average",
    engagementRate: 3.1,
    sentiment: { positive: 58, neutral: 32, negative: 10 },
    metrics: { views: 110000, likes: 1900, comments: 340, shares: 80, clicks: 8800 },
    campaignObj: {
      name: "متجر واحة التقنية (Ramadan Tech Offers)",
      type: ["commercial"],
      organizer: "واحة التقنية للأجهزة الذكية",
      description:
        "حملة ترويجية كبرى وتخفيضات موسمية هائلة بمناسبة شهر رمضان على الأجهزة الذكية والأجهزة اللوحية.",
      objectives: "زيادة مبيعات المتجر الإلكتروني وتحقيق 200 طلب شراء خلال الشهر الكريم.",
      age: "25-45",
      gender: "both",
      location: "مصر والقاهرة",
      education: "University",
      interests: "Tech gadgets, tablets, mobile accessories, online shopping",
      message: "لمّ شمل التكنولوجيا بأفضل عروض في رمضان مع واحة التقنية.",
      slogans: "عروض رمضان، أجهزة ذكية بأفضل سعر، واحة التقنية",
      platforms: ["facebook", "instagram", "youtube"],
      durationValue: "30",
      durationUnit: "days",
      budget: "3500",
      contentTypes: ["image", "design"],
      dialect: "egyptian",
    },
    resultObj: {
      campaignName: "متجر واحة التقنية (Ramadan Tech Offers)",
      score: 63,
      status: "average",
      engagementRate: 3.1,
      engagementGrade: "good",
      sentiment: { positive: 58, neutral: 32, negative: 10 },
      peakTime: { from: "21:00", to: "01:00" },
      metrics: { views: 110000, likes: 1900, comments: 340, shares: 80, clicks: 8800 },
      timeline: [
        { day: "Mon", views: 12000, engagement: 2.8 },
        { day: "Tue", views: 13500, engagement: 3.0 },
        { day: "Wed", views: 14000, engagement: 2.9 },
        { day: "Thu", views: 18000, engagement: 3.2 },
        { day: "Fri", views: 19500, engagement: 3.5 },
        { day: "Sat", views: 17000, engagement: 3.3 },
        { day: "Sun", views: 16000, engagement: 3.1 },
      ],
      insights: [
        "حقق الإعلان وصولاً لافتاً ومكثفاً بفضل قوة ميزانية الإطلاق وتنوع القنوات الإعلانية.",
        "تراجع مستوى التفاعل الفعلي مقارنة بالميزانية بسبب النبرة البيعية الجافة وغياب الطابع الإنساني الرمضاني.",
      ],
      recommendations: [
        {
          title: "دمج الأجواء الرمضانية المصرية المألوفة",
          detail:
            "استبدل التصاميم الصامتة بمقاطع تفاعلية قصيرة تبرز كرم ولمة العائلة مع لمسة فكاهية مصرية.",
          category: "strategy",
        },
      ],
      strengths: [
        "تخفيضات حقيقية وعروض مغرية تمثل حافزاً قوياً جداً للشراء الفعلي.",
        "مستوى انتشار هائل ومستمر طوال الشهر بفضل استقرار تمويل الحملة.",
      ],
      weaknesses: [
        "تشتت كبير لميزانية النشر عبر منصات عديدة دون تخصيص المحتوى المناسب لكل منها.",
        "بطء شديد في ردود خدمة العملاء على الأسئلة بخصوص أسعار المنتجات في التعليقات.",
      ],
      advancedRecommendations: [],
      longTermRoadmap: { shortTerm: [], midTerm: [], longTerm: [] },
    },
    aiReport: {
      reportDescription:
        "حملة 'واحة التقنية' حققت انتشاراً واسعاً ووصولاً رقمياً هائلاً بلغ 110 آلاف مشاهدة بفضل الميزانية السخية، إلا أنها واجهت عقبات واضحة في معدلات التحويل الفعلي ومستوى الارتباط العاطفي. تبني نبرة تجارية بحتة خالية من الطابع الإنساني الرمضاني أضعف من جاذبية العلامة التجارية في موسم يتميز بالدفء والترابط العائلي. مع معدل تفاعل منخفض نسبياً بلغ 3.1%، تظهر المؤشرات وجود هدر إعلاني واضح نتيجة تشتت التمويل عبر عدة منصات دون تكييف المحتوى بشكل مستقل لكل منصة.",
      campaignEvaluation:
        "أداء الحملة متوسط ومشتت. برغم العروض القوية والتخفيضات الممتازة، عانت الحملة من بطء تحويل النقرات إلى مبيعات ملموسة، ويعزى ذلك لضعف تهيئة صفحة الهبوط وبطء خدمة العملاء في التجاوب مع استفسارات المشترين المتحمسين في صندوق التعليقات والرسائل.",
      performanceForecast:
        "يُخشى تعرض الميزانية المتبقية للهدر إذا لم يتم فوراً تعديل أسلوب استهداف الإعلانات، وتركيز الإنفاق على فيسبوك كونه القناة الأكثر جلباً للمبيعات المباشرة لهذا النوع من المنتجات في السوق المصري.",
      strengths: [
        "قيمة العروض ممتازة والخصومات المطروحة منافسة وقوية.",
        "تغطية جغرافية ممتازة وانتشار كثيف بفضل الميزانية القوية.",
      ],
      weaknesses: [
        "نبرة إعلانية تقليدية خالية من المواءمة الثقافية الرمضانية المحببة.",
        "بطء كبير وتأخر في الرد على تعليقات المستخدمين المتحمسين بخصوص الأسعار.",
        "تشتيت الميزانية على 3 قنوات واسعة دون مواءمة المحتوى بشكل خاص لكل منها.",
      ],
      audienceBehaviorAnalysis:
        "المستهلك المصري في رمضان ينشط تسوقه ليلاً بعد الإفطار، ويستجيب بقوة للرسائل الدافئة والقصص العائلية أو الفكاهية، ويحتاج لردود سريعة ومبسطة بخصوص السعر وطريقة التوصيل.",
      platformAnalysis:
        "فيسبوك هو المنصة الرائدة والأكثر فاعلية لتحقيق المبيعات المباشرة والتفاعل الحواري في مصر، بينما يفضل استخدام يوتيوب فقط للفيديوهات القصيرة والمقاطع الاستعراضية الجذابة.",
      recommendations: [
        {
          title: "تفعيل ميزة الرد الآلي الفوري بالأسعار",
          detail:
            "اربط الإعلانات بنظام ردود آلي ذكي يرسل تفاصيل الأسعار وروابط الشراء المباشر للعميل بمجرد تعليقه.",
        },
        {
          title: "إعادة توجيه الميزانية لصالح فيسبوك",
          detail:
            "أوقف تمويل إعلانات يوتيوب المكلفة وركز كامل الميزانية المتبقية لتعزيز منشورات فيسبوك التفاعلية.",
        },
      ],
    },
  },
  {
    id: "pre_loaded_4",
    name: "مبادرة تشجير الحي (Neighborhood Green Drive)",
    mode: "pre",
    userType: "user",
    date: "2026-05-24",
    budget: "300",
    platforms: ["facebook", "instagram"],
    dialect: "levantine",
    score: 81,
    status: "strong",
    engagementRate: 5.1,
    sentiment: { positive: 88, neutral: 10, negative: 2 },
    metrics: { views: 9800, likes: 280, comments: 45, shares: 35, clicks: 784 },
    campaignObj: {
      name: "مبادرة تشجير الحي (Neighborhood Green Drive)",
      type: ["social"],
      organizer: "مجموعة متطوعي عمان الخضراء",
      description:
        "حملة أهلية تطوعية لتشجير وتجميل الشوارع والأرصفة المحلية لتعزيز الوعي البيئي وحماية الطبيعة.",
      objectives: "جمع 100 متطوع وتأمين تبرعات عينية بـ 300 شتلة صالحة للزراعة في أحياء المدينة.",
      age: "18-40",
      gender: "both",
      location: "الأردن وعمان",
      education: "Any",
      interests: "Environment, volunteering, nature, plants, social work",
      message: "شجرة اليوم هي ظل ولطف لبكرة.. شاركنا نزرع الخير ببلدنا.",
      slogans: "شجر حينا، عمان خضراء، تطوع للبيئة",
      platforms: ["facebook", "instagram"],
      durationValue: "10",
      durationUnit: "days",
      budget: "300",
      contentTypes: ["image", "design"],
      dialect: "levantine",
    },
    resultObj: {
      campaignName: "مبادرة تشجير الحي (Neighborhood Green Drive)",
      score: 81,
      status: "strong",
      engagementRate: 5.1,
      engagementGrade: "excellent",
      sentiment: { positive: 88, neutral: 10, negative: 2 },
      peakTime: { from: "17:00", to: "20:00" },
      metrics: { views: 9800, likes: 280, comments: 45, shares: 35, clicks: 784 },
      timeline: [
        { day: "Mon", views: 900, engagement: 4.8 },
        { day: "Tue", views: 1100, engagement: 5.0 },
        { day: "Wed", views: 1200, engagement: 4.9 },
        { day: "Thu", views: 1500, engagement: 5.3 },
        { day: "Fri", views: 1800, engagement: 5.5 },
        { day: "Sat", views: 1600, engagement: 5.2 },
        { day: "Sun", views: 1700, engagement: 5.1 },
      ],
      insights: [
        "التفاف مجتمعي لافت وتأييد واسع للغاية بفضل نبل الهدف وشفافية الرسالة البيئية.",
        "حققت الحملة درجة تفاعل عاطفي استثنائية (88% مشاعر إيجابية) تبرهن على رغبة المجتمع في المبادرات التطوعية الهادفة.",
      ],
      recommendations: [
        {
          title: "تفعيل مجموعات فيسبوك المحلية والواتساب",
          detail:
            "انشر تفاصيل الحملة مجاناً في مجموعات الأحياء السكنية للحصول على متطوعين مباشرين ودون تكلفة إعلانية.",
          category: "strategy",
        },
      ],
      strengths: [
        "مبادرة نقية وخالية من الأغراض التجارية تكسب تعاطفاً ومصداقية تلقائية فورية.",
        "وضوح الرسالة المباشرة وبساطتها وسهولة المشاركة فيها ميدانياً.",
      ],
      weaknesses: ["الميزانية المتواضعة جداً (300 دولار) تصعّب إمكانية الترويج واسع النطاق."],
      advancedRecommendations: [],
      longTermRoadmap: { shortTerm: [], midTerm: [], longTerm: [] },
    },
    aiReport: {
      reportDescription:
        "مبادرة 'تشجير الحي' حققت نجاحاً باهراً وتأييداً مجتمعياً رائعاً بنسبة مشاعر إيجابية استثنائية بلغت 88%. يثبت هذا التحليل التنبؤي أن المبادرات البيئية غير الربحية التي تخاطب المجتمع بروح تشاركية تكتسب فاعلية مضاعفة وتتغلب على قيود الميزانيات المتواضعة (300 دولار فقط). النبرة الدافئة والمحلية باللهجة الأردنية الشامية عززت من مشاعر المواطنة الصالحة، وخلقت دافعاً ذاتياً قوياً للمشاركة والتبرع بالشتلات الزراعية ميدانياً.",
      campaignEvaluation:
        "الحملة جاهزة وممتازة للتطبيق الفعلي. برغم الميزانية المنخفضة، استغلت الحملة قنوات النشر البصري بذكاء واستطاعت تركيز جهودها الجغرافية على منطقة عمان لتفادي ضياع المشاهدات الإعلانية في مناطق غير مستهدفة بالعمل الميداني.",
      performanceForecast:
        "يُتوقع استجابة ميدانية ممتازة ومشاركة نشطة من المتطوعين، مع إمكانية استقطاب رعاية عينية هامة من مشاتل زراعية محلية أو جهات أهلية بمجرد انطلاق الفعالية ومشاركة الصور الحية.",
      strengths: [
        "رسالة إنسانية نبيلة وتكافل مجتمعي يبعث على الفخر والمصداقية العالية.",
        "الملاءمة اللغوية والوجدانية مع النبض المحلي وسلوك الشباب المتطوع.",
      ],
      weaknesses: [
        "الميزانية المحدودة تعيق شراء أدوات تشجير إضافية أو تمويل إعلانات الفيديو الاحترافية.",
      ],
      audienceBehaviorAnalysis:
        "الجمهور من الشباب والناشطين في عمان مهتم جداً بالقضايا البيئية ويقدّر العمل الجماعي الشفاف، ويبحث عن مبادرات آمنة وموثوقة يقدم فيها جهداً ملموساً يخدم مدينته.",
      platformAnalysis:
        "فيسبوك هو المنصة الذهبية للتعبئة والترتيب الميداني وتنسيق مجموعات العمل، بينما تبرز أهمية إنستجرام لمشاركة الصور الجمالية قبل وبعد التشجير لإلهام الآخرين.",
      recommendations: [
        {
          title: "التواصل مع المشاهير وصناع التأثير المحليين",
          detail:
            "تواصل مع صناع المحتوى المهتمين بالطبيعة والبيئة في الأردن لدعوتهم للمشاركة مجاناً والترويج للحدث.",
        },
        {
          title: "تصوير وتوثيق الحدث بفيديو سريع",
          detail:
            "أنتج فيديو سريع بتقنية تسريع الوقت (Time-lapse) لعملية الزراعة والتحول الجمالي للشارع، ليكون ركيزة لحملاتك القادمة.",
        },
      ],
    },
  },
];

function getCampaignFeedback(campaignId: string, overallScore: number = 80) {
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

  const positiveOpinions = [
    "حملة رائعة ومفهومة جداً، أعجبني التصميم واختيار الكلمات الرنانة والمؤثرة.",
    "فكرة ممتازة وتلامس الواقع اليومي، التوصيل كان سريعاً ومناسباً جداً للفئات الشابة.",
    "اللهجة المستخدمة قريبة جداً من القلب وسهلة الفهم وابتعدت عن التعقيد.",
    "أفضل حملة رأيتها هذا الشهر، التنظيم كان غاية في الروعة والإنتاج متميز.",
    "رسالة قوية وهادفة غيرت وجهة نظري الإيجابية تماماً تجاه المنتج والخدمة.",
    "مبدعون! جودة الفيديو والمحتوى الإبداعي ممتازة وبسيطة.",
    "تنظيم رائع وتناسق تام بين الرسالة المكتوبة والهدف المرجو.",
    "الرسالة وصلتني مباشرة دون عناء، أعجبني بساطة الشرح والأسلوب.",
    "فخور برؤية مثل هذه الحملات المنظمة والذكية في مجتمعنا.",
    "أفكار عصرية وجذابة ومناسبة لكافة الأعمار والفئات المستهدفة.",
  ];

  const neutralOpinions = [
    "الحملة جيدة في مجملها لكنها تحتاج إلى شرح إضافي لبعض النقاط التقنية.",
    "المحتوى ممتاز ولكن المؤثرات البصرية والموسيقى كانت مشتتة قليلاً.",
    "التنظيم مقبول ولكن أرى أنه كان يمكن تحسين جودة الصور والبوسترات بشكل أفضل.",
    "فهمت الرسالة بشكل عام ولكن لم تغير رأيي أو سلوكي الفعلي بشكل كامل.",
    "جيدة ولكن تمنيت لو ركزت أكثر على الفئات العمرية الأصغر سناً وتطلعاتهم.",
    "حملة متوسطة الأداء، الرسالة واضحة لكن تكرار الأفكار كان مملاً بعض الشيء.",
  ];

  const negativeOpinions = [
    "الرسالة غير واضحة وهناك غموض كبير في الهدف الرئيسي من الحملة الإعلانية.",
    "لم تعجبني اللهجة المستخدمة، أرى أنها غير ملائمة لعامة الناس والشريحة الكبرى.",
    "محتوى تقليدي ومكرر، يحتاج لمزيد من الابتكار والبعد عن النمطية.",
    "التنظيم يحتاج لإعادة نظر بالكامل، لم أستطع فهم العرض والهدف بالشكل المطلوب.",
  ];

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
        opinion = positiveOpinions[seed % positiveOpinions.length];
      } else if (q1 === "partially" || q2 === "no") {
        opinion = neutralOpinions[seed % neutralOpinions.length];
      } else {
        opinion = negativeOpinions[seed % negativeOpinions.length];
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

  return [...userFeedbacks, ...preseeded];
}

function Reports() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const L = (en: string, arT: string) => (ar ? arT : en);
  const nav = useNavigate();

  const [campaigns, setCampaigns] = useState<CampaignHistoryRecord[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignHistoryRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "report">("report");
  const [postAnalysisTab, setPostAnalysisTab] = useState<"digital" | "field">("digital");
  const [copied, setCopied] = useState(false);

  const feedbacksForCampaign = useMemo(() => {
    if (!selectedCampaign) return [];
    return getCampaignFeedback(selectedCampaign.id, selectedCampaign.score);
  }, [selectedCampaign]);

  const feedbackStats = useMemo(() => {
    if (feedbacksForCampaign.length === 0) return null;
    const total = feedbacksForCampaign.length;

    const ageUnder18 = feedbacksForCampaign.filter((f) => f.age === "under-18").length;
    const age18_24 = feedbacksForCampaign.filter((f) => f.age === "18-24").length;
    const age25_34 = feedbacksForCampaign.filter((f) => f.age === "25-34").length;
    const age35_44 = feedbacksForCampaign.filter((f) => f.age === "35-44").length;
    const age45_plus = feedbacksForCampaign.filter(
      (f) => f.age === "45-54" || f.age === "55-plus",
    ).length;

    const male = feedbacksForCampaign.filter((f) => f.gender === "male").length;
    const female = feedbacksForCampaign.filter((f) => f.gender === "female").length;

    const q1Yes = feedbacksForCampaign.filter((f) => f.q1 === "yes").length;
    const q1Partially = feedbacksForCampaign.filter((f) => f.q1 === "partially").length;
    const q1No = feedbacksForCampaign.filter((f) => f.q1 === "no").length;

    const q2Yes = feedbacksForCampaign.filter((f) => f.q2 === "yes").length;
    const q2No = feedbacksForCampaign.filter((f) => f.q2 === "no").length;

    const comments = feedbacksForCampaign.filter((f) => f.opinion && f.opinion.trim().length > 0);

    return {
      total,
      age: {
        under18: Math.round((ageUnder18 / total) * 100),
        age18_24: Math.round((age18_24 / total) * 100),
        age25_34: Math.round((age25_34 / total) * 100),
        age35_44: Math.round((age35_44 / total) * 100),
        age45_plus: Math.round((age45_plus / total) * 100),
      },
      gender: {
        male: Math.round((male / total) * 100),
        female: Math.round((female / total) * 100),
        maleCount: male,
        femaleCount: female,
      },
      q1: {
        yes: Math.round((q1Yes / total) * 100),
        partially: Math.round((q1Partially / total) * 100),
        no: Math.round((q1No / total) * 100),
        yesCount: q1Yes,
        partiallyCount: q1Partially,
        noCount: q1No,
      },
      q2: {
        yes: Math.round((q2Yes / total) * 100),
        no: Math.round((q2No / total) * 100),
        yesCount: q2Yes,
        noCount: q2No,
      },
      comments,
    };
  }, [feedbacksForCampaign]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUserType, setFilterUserType] = useState<"all" | "user" | "org">("all");
  const [filterMode, setFilterMode] = useState<"all" | "pre" | "post">("all");
  const [filterScore, setFilterScore] = useState<"all" | "excellent" | "average" | "weak">("all");

  // Report Loading States (on-the-fly fetch for new records)
  const [reportLoading, setReportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Initialize and load campaigns from localStorage
  useEffect(() => {
    const historyRaw = localStorage.getItem("pi-campaign-history");
    let loadedHistory: CampaignHistoryRecord[] = [];
    try {
      loadedHistory = historyRaw ? JSON.parse(historyRaw) : [];
    } catch (e) {
      loadedHistory = [];
    }

    // If empty, pre-populate with INITIAL_CAMPAIGNS to display gorgeous dynamic data immediately
    if (loadedHistory.length === 0) {
      localStorage.setItem("pi-campaign-history", JSON.stringify(INITIAL_CAMPAIGNS));
      setCampaigns(INITIAL_CAMPAIGNS);
      loadedHistory = INITIAL_CAMPAIGNS;
    } else {
      setCampaigns(loadedHistory);
    }

    const handleReload = () => {
      const freshHistoryRaw = localStorage.getItem("pi-campaign-history");
      let freshHistory: CampaignHistoryRecord[] = [];
      try {
        freshHistory = freshHistoryRaw ? JSON.parse(freshHistoryRaw) : [];
      } catch (e) {
        freshHistory = [];
      }
      setCampaigns(freshHistory);

      const lastResultId =
        sessionStorage.getItem("pi-current-run-id") ||
        localStorage.getItem("pi-selected-campaign-id");
      let selection: CampaignHistoryRecord | null = null;
      if (lastResultId) {
        selection = freshHistory.find((item) => item.id === lastResultId) || null;
      }
      if (!selection && freshHistory.length > 0) {
        selection = freshHistory[0];
      }
      if (selection) {
        setSelectedCampaign(selection);
        setActiveTab("report");
      }
    };

    window.addEventListener("selected-campaign-changed", handleReload);
    window.addEventListener("campaign-history-updated", handleReload);

    // Check if we came straight from an analysis or have a selected campaign
    const lastResultId =
      sessionStorage.getItem("pi-current-run-id") ||
      localStorage.getItem("pi-selected-campaign-id");
    let initialSelection: CampaignHistoryRecord | null = null;
    if (lastResultId) {
      initialSelection = loadedHistory.find((item) => item.id === lastResultId) || null;
    }
    if (!initialSelection && loadedHistory.length > 0) {
      initialSelection = loadedHistory[0]; // default to latest
    }
    if (initialSelection) {
      handleSelectCampaign(initialSelection, loadedHistory);
    } else {
      setActiveTab("report");
    }

    return () => {
      window.removeEventListener("selected-campaign-changed", handleReload);
      window.removeEventListener("campaign-history-updated", handleReload);
    };
  }, []);

  // Compute stats across current list of campaigns
  const stats = useMemo(() => {
    const total = campaigns.length;
    if (total === 0) {
      return { total, avgScore: 0, avgEngagement: "0.0", totalBudget: "0" };
    }
    const sumScore = campaigns.reduce((acc, c) => acc + c.score, 0);
    const sumEng = campaigns.reduce((acc, c) => acc + c.engagementRate, 0);
    const sumBudget = campaigns.reduce((acc, c) => acc + (parseFloat(c.budget) || 0), 0);

    return {
      total,
      avgScore: Math.round(sumScore / total),
      avgEngagement: (sumEng / total).toFixed(1),
      totalBudget: sumBudget.toLocaleString(),
    };
  }, [campaigns]);

  // Handle select campaign and trigger on-the-fly report generation if needed
  const handleSelectCampaign = async (
    c: CampaignHistoryRecord,
    currentCampaignsList?: CampaignHistoryRecord[],
  ) => {
    const activeList = currentCampaignsList || campaigns;
    setSelectedCampaign(c);
    setActiveTab("report");

    // Clear the current run ID in sessionStorage to prevent auto-redirect loop on next loads
    sessionStorage.removeItem("pi-current-run-id");

    // If it's a newly created campaign and has no cached aiReport, fetch it immediately!
    if (!c.aiReport) {
      setReportLoading(true);
      try {
        const res = await generateCampaignReport({
          data: {
            campaignData: {
              ...c.campaignObj,
              metrics: c.resultObj.metrics,
              score: c.resultObj.score,
              status: c.resultObj.status,
              engagementRate: c.resultObj.engagementRate,
              mode: c.mode,
            },
            language: lang,
          },
        });

        if (res && !(res as any).error) {
          const updatedCampaigns = activeList.map((item) => {
            if (item.id === c.id) {
              const updatedItem = { ...item, aiReport: res as AIReportStructure };
              setSelectedCampaign(updatedItem);
              return updatedItem;
            }
            return item;
          });
          setCampaigns(updatedCampaigns);
          localStorage.setItem("pi-campaign-history", JSON.stringify(updatedCampaigns));
        }
      } catch (err) {
        console.error("Failed to generate AI report dynamically:", err);
      } finally {
        setReportLoading(false);
      }
    }
  };

  // Delete Campaign from logs
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = campaigns.filter((c) => c.id !== id);
    setCampaigns(updated);
    localStorage.setItem("pi-campaign-history", JSON.stringify(updated));
    if (selectedCampaign?.id === id) {
      setSelectedCampaign(null);
      setActiveTab("history");
    }
  };

  // Apply filters to campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.campaignObj?.organizer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.campaignObj?.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUserType = filterUserType === "all" ? true : c.userType === filterUserType;

      const matchesMode = filterMode === "all" ? true : c.mode === filterMode;

      const matchesScore =
        filterScore === "all"
          ? true
          : filterScore === "excellent"
            ? c.score >= 80
            : filterScore === "average"
              ? c.score >= 60 && c.score < 80
              : c.score < 60;

      return matchesSearch && matchesUserType && matchesMode && matchesScore;
    });
  }, [campaigns, searchQuery, filterUserType, filterMode, filterScore]);

  const [pdfSuccessMsg, setPdfSuccessMsg] = useState<string | null>(null);
  const [lastDownloadedPdf, setLastDownloadedPdf] = useState<{
    fileName: string;
    blobUrl: string;
    dataUri: string;
    blob: Blob;
  } | null>(null);

  // Export selected campaign as real certified PDF file
  const handleDownloadReport = async (record: CampaignHistoryRecord) => {
    if (pdfLoading) return;
    setPdfLoading(true);
    setPdfSuccessMsg(null);
    try {
      const result = await exportCampaignToPDF(record, lang === "ar" ? "ar" : "en");
      if (result && result.blobUrl) {
        setLastDownloadedPdf({
          fileName: result.fileName,
          blobUrl: result.blobUrl,
          dataUri: result.dataUri,
          blob: result.pdfBlob,
        });
      }
      setPdfSuccessMsg(
        lang === "ar"
          ? `تم تنزيل ملف PDF للحملة «${record.name}» على حاسوبك بنجاح (مجلد Downloads)!`
          : `PDF report for "${record.name}" downloaded successfully to your PC (Downloads)!`,
      );
      setTimeout(() => setPdfSuccessMsg(null), 8000);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  // Pre-formatted Fallbacks if some fields missing on AI endpoints
  const defaultEvaluation = L(
    "Overall, the campaign strategy shows robust positioning with well-defined channels. Ad creatives align well with audience pain points, ensuring stable reach and efficient budget utilization.",
    "بشكل عام، تظهر استراتيجية الحملة تموضعاً قوياً وقنوات إعلانية محددة بعناية. تتناسب التصاميم والرسائل الإعلانية تماماً مع اهتمامات وتطلعات الشريحة المستهدفة، مما يضمن وصولاً مستقراً واستغلالاً مثالياً ومستداماً.",
  );

  const defaultForecast = L(
    "Strong potential to hit high awareness levels with an estimated engagement spike. Localized dialect copy is projected to stay below industry cost-per-click averages.",
    "فرص قوية لتحقيق معدلات وعي مرتفعة للغاية مع قفزة تفاعل متوقعة بفضل المواءمة الثقافية. يتوقع أن تبقى كلفة النقرة (CPC) دون متوسط السوق في حال الاعتماد على النسخ الإعلانية المحلية.",
  );

  const defaultAudienceAnalysis = L(
    "The target audience is highly responsive to authentic, storytelling ad structures presented in their local dialect. The younger demographic prioritizes directness and high visual engagement.",
    "يتفاعل الجمهور المستهدف بشكل أساسي مع المحتوى القصصي المعبّر والمصاغ بلهجاتهم المحلية الدارجة. الفئات الشابة تبحث عن المصداقية والسرعة وتفضل مقاطع الفيديو القصيرة التي تطرح حلولاً مباشرة.",
  );

  const defaultPlatformAnalysis = L(
    "Instagram and TikTok consistently output the highest engagement metrics for short-form visual content. Facebook remains a baseline for broader reach.",
    "تحقق منصتا إنستجرام وتيك توك أعلى معدلات تفاعل عضوي، حيث يتجاوز التفاعل مع مقاطع ريلز والفيديو القصيرة ضعف المنشورات العادية، بينما يحافظ فيسبوك على وصول عائلي مستقر.",
  );

  const dialectNames: Record<string, string> = {
    standard: L("Standard Arabic (Fusha)", "العربية الفصحى"),
    algerian: L("Algerian Dialect", "اللهجة الجزائرية"),
    egyptian: L("Egyptian Dialect", "اللهجة المصرية"),
    gulf: L("Gulf Dialect", "اللهجة الخليجية"),
    levantine: L("Levantine Dialect", "اللهجة الشامية"),
    english: L("English", "الإنجليزية"),
  };

  return (
    <AppShell title={t("reports")}>
      {pdfSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-sm no-print"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{pdfSuccessMsg}</span>
        </motion.div>
      )}
      {activeTab === "history" ? (
        <div className="space-y-6 pb-16 text-start">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold mb-2">
                <Layers className="h-3.5 w-3.5" />
                <span>{L("ARCHIVE & ANALYTICS CENTER", "مركز الأرشيف والتحليلات")}</span>
              </div>
              <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">
                {L("Campaign History Log", "سجل الحملات والتحليلات")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {L(
                  "Explore past simulated pre-launch reports and post-launch analytics records.",
                  "استعرض كافة محاكات ما قبل الإطلاق وتقارير التحليل المباشر للحملات السابقة.",
                )}
              </p>
            </div>

            <Link
              to="/analyze"
              className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition text-sm flex items-center justify-center gap-1.5 self-start shadow-sm shadow-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>{L("Analyze New Campaign", "بدء تحليل حملة جديدة")}</span>
            </Link>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                {L("Total Campaigns", "إجمالي الحملات")}
              </span>
              <div className="font-display font-extrabold text-3xl text-gradient leading-none">
                {stats.total}
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">
                {L("Persistent client records", "سجلات نشطة في لوحتك")}
              </span>
            </div>

            <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Award className="h-10 w-10 text-success" />
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                {L("Avg Readiness Score", "متوسط الجاهزية")}
              </span>
              <div className="font-display font-extrabold text-3xl text-emerald-500 leading-none">
                {stats.avgScore}{" "}
                <span className="text-xs text-muted-foreground font-normal">/100</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">
                {stats.avgScore >= 80
                  ? L("Highly Cohesive (Green)", "معدل نضوج ممتاز")
                  : L("Needs Adjustments", "يحتاج لبعض التعديل")}
              </span>
            </div>

            <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Flame className="h-10 w-10 text-amber-500" />
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                {L("Avg Engagement Rate", "متوسط التفاعل")}
              </span>
              <div className="font-display font-extrabold text-3xl text-amber-500 leading-none">
                {stats.avgEngagement}%
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">
                {L("Standard industry benchmark: 3.5%", "معدل السوق القياسي: 3.5%")}
              </span>
            </div>

            <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <DollarSign className="h-10 w-10 text-indigo-500" />
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                {L("Cumulative Budget", "الميزانية التراكمية")}
              </span>
              <div className="font-display font-extrabold text-2xl text-gradient leading-none py-1">
                ${stats.totalBudget}
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">
                {L("Across all targeted channels", "مرصودة عبر القنوات النشطة")}
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-border/40 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder={L(
                    "Search campaigns by name, institution, description...",
                    "ابحث بالاسم، الجهة المنظمة، وصف الحملة...",
                  )}
                />
              </div>

              {/* User Type */}
              <div className="w-full md:w-48">
                <select
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value as any)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs dark:bg-zinc-900 focus:outline-none"
                >
                  <option value="all">{L("User: All Types", "المستخدم: جميع الأنواع")}</option>
                  <option value="user">{L("Individual User Only", "مستخدم فردي فقط")}</option>
                  <option value="org">{L("Organization Only", "المؤسسات فقط")}</option>
                </select>
              </div>

              {/* Campaign Mode */}
              <div className="w-full md:w-48">
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as any)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs dark:bg-zinc-900 focus:outline-none"
                >
                  <option value="all">{L("Phase: All Phases", "المرحلة: كل المراحل")}</option>
                  <option value="pre">{L("Pre-Launch Simulation", "قبل الإطلاق (محاكاة)")}</option>
                  <option value="post">{L("Post-Launch Analytics", "بعد الإطلاق (نتائج)")}</option>
                </select>
              </div>

              {/* Score Range */}
              <div className="w-full md:w-48">
                <select
                  value={filterScore}
                  onChange={(e) => setFilterScore(e.target.value as any)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs dark:bg-zinc-900 focus:outline-none"
                >
                  <option value="all">{L("Score: All Scores", "النقاط: جميع الدرجات")}</option>
                  <option value="excellent">{L("Excellent (80+)", "ممتاز (80 وأكثر)")}</option>
                  <option value="average">{L("Average (60-79)", "متوسط (60 - 79)")}</option>
                  <option value="weak">{L("Needs Review (<60)", "تحت المراجعة (دون 60)")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaigns List/Grid */}
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-16 bg-surface-elevated/10 border border-dashed border-border rounded-2xl">
              <AlertCircle className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <h3 className="font-bold text-foreground text-sm">
                {L("No campaigns match filters", "لم يتم العثور على أي حملة تطابق خيارات التصفية")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {L(
                  "Try adjusting your search query, user type, or status filters above.",
                  "يرجى تعديل نصوص البحث أو فئات التصفية المحددة في الأعلى للمحاولة مجدداً.",
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCampaigns.map((c) => {
                const isStrong = c.score >= 80;
                const isWeak = c.score < 60;
                const statusColor = isStrong
                  ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20"
                  : isWeak
                    ? "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20";

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCampaign(c)}
                    className="glass-card p-5 hover:border-primary/40 hover:scale-[1.01] transition-all duration-300 group cursor-pointer relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {c.mode === "pre" ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {L("Pre-Launch", "قبل الإطلاق")}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {L("Post-Launch", "بعد الإطلاق")}
                            </span>
                          )}

                          {c.userType === "org" ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                              <Building2 className="h-2.5 w-2.5" />
                              <span>{L("Organization", "مؤسسة")}</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                              <User className="h-2.5 w-2.5" />
                              <span>{L("Individual", "مستقل")}</span>
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {c.date}
                        </span>
                      </div>

                      {/* Campaign Title */}
                      <h3 className="font-display font-extrabold text-base text-foreground group-hover:text-primary transition line-clamp-1 mb-1.5">
                        {c.name}
                      </h3>

                      {/* Brief description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {c.campaignObj?.description ||
                          L(
                            "No campaign details available.",
                            "لا توجد تفاصيل متاحة لوصف هذه الحملة في السجلات.",
                          )}
                      </p>
                    </div>

                    {/* Stats & Score Footer Row */}
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between mt-2">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-muted-foreground block font-bold">
                            {L("Budget", "الميزانية")}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            ${parseFloat(c.budget).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-muted-foreground block font-bold">
                            {L("Dialect", "اللهجة")}
                          </span>
                          <span className="text-xs font-semibold text-foreground truncate max-w-[80px] block">
                            {dialectNames[c.dialect] || c.dialect}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-muted-foreground block font-bold">
                            {L("Engagement", "التفاعل")}
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            {c.engagementRate}%
                          </span>
                        </div>
                      </div>

                      {/* Circular Score display */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-extrabold px-2 py-1 rounded-lg border ${statusColor}`}
                        >
                          {c.score}/100
                        </span>

                        <div className="flex gap-1.5 items-center">
                          <button
                            title={L("Download Official PDF Report", "تنزيل تقرير PDF الرسمي")}
                            disabled={pdfLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadReport(c);
                            }}
                            className="p-1.5 rounded-lg border border-primary/40 hover:border-primary text-primary hover:bg-primary/10 transition disabled:opacity-50 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title={L("Delete from history log", "مسح السجل نهائياً")}
                            onClick={(e) => handleDelete(c.id, e)}
                            className="p-1.5 rounded-lg border border-border hover:border-destructive text-muted-foreground hover:text-destructive transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* REPORT DETAIL VIEW */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pb-16 print:p-0 text-start"
          id="campaign-report-capture"
        >
          {/* Back Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <button
              onClick={() => {
                setActiveTab("history");
              }}
              className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-foreground hover:bg-primary transition bg-primary/10 px-3.5 py-2 rounded-xl border border-primary/20 cursor-pointer"
            >
              {lang === "ar" ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
              {L("Back to previous stage", "الرجوع للمرحلة السابقة")}
            </button>

            <div className="flex gap-2">
              <button
                disabled={pdfLoading}
                onClick={() => {
                  if (selectedCampaign) handleDownloadReport(selectedCampaign);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition bg-surface-elevated/40 hover:bg-surface-elevated px-3 py-1.5 rounded-lg border border-border/40 cursor-pointer disabled:opacity-50"
              >
                {pdfLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Printer className="h-3.5 w-3.5" />
                )}
                {pdfLoading
                  ? L("Exporting PDF...", "جاري تصدير PDF...")
                  : L("Export PDF", "تصدير التقرير PDF")}
              </button>
            </div>
          </div>

          {selectedCampaign && (
            <>
              {/* Campaign Header Profile */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    {selectedCampaign.mode === "pre"
                      ? L("PRE-LAUNCH AI SIMULATION REPORT", "تنبؤات الذكاء الاصطناعي قبل الإطلاق")
                      : L("CAMPAIGN REAL-TIME INSIGHTS", "النتائج الفعلية والتحليلات للحملة")}
                  </div>
                  <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">
                    {selectedCampaign.name}
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
                  <Award className="h-3.5 w-3.5" />
                  {selectedCampaign.mode === "pre"
                    ? L("Simulation Engined", "محرك المحاكاة نشط")
                    : L("Direct Platform Integration", "ربط مباشر بالمنصات")}
                </div>
              </div>

              {/* Loader for newly created dynamically evaluated campaigns */}
              {reportLoading ? (
                <div className="glass-card p-12 text-center space-y-4">
                  <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto" />
                  <h3 className="font-bold text-base text-foreground">
                    {L(
                      "Google Gemini is executing deep text & cultural analysis...",
                      "جاري استشارة جيميناي لتكوين تحليل دلالي وثقافي عميق...",
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {L(
                      "Analyzing emotional sentiment weights, dialect suitabilities, and potential budget optimizations.",
                      "يتم الآن احتساب المشاعر، تحليل كفاءة اللهجة المحلية، وابتكار التوصيات المناسبة.",
                    )}
                  </p>
                </div>
              ) : (
                <>
                  {/* Score Bento Blocks */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Overall Score Card */}
                    <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Zap className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                          {selectedCampaign.mode === "pre"
                            ? L("PREDICTED READINESS SCORE", "درجة الجاهزية المتوقعة")
                            : t("overallScore")}
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          {L(
                            "Calculated based on target demographic alignment, budget efficiency, and cultural dialect matching.",
                            "محسوبة بناءً على توافق الجمهور المستهدف، كفاءة الميزانية، وملاءمة اللهجة الثقافية.",
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                        <div className="font-display font-extrabold text-7xl text-gradient leading-none tracking-tighter flex items-baseline">
                          <span>{selectedCampaign.score}</span>
                          <span className="text-xl text-muted-foreground font-normal ml-1">
                            /100
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                            selectedCampaign.score >= 80
                              ? "text-success border-success/30 bg-success/5"
                              : "text-warning border-warning/30 bg-warning/5"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${selectedCampaign.score >= 80 ? "bg-success" : "bg-warning"} animate-pulse`}
                          />
                          <span>
                            {selectedCampaign.score >= 80
                              ? L("Optimal Readiness Level", "جاهزية استراتيجية كاملة")
                              : L("Refinement Recommended", "يوصى ببعض التحسينات")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Success Rate Dial */}
                    <div className="glass-card p-6 border-success/20 bg-success/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <CheckCircle2 className="h-12 w-12 text-success" />
                      </div>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 h-full">
                        <div className="space-y-2 text-center md:text-left">
                          <div className="text-[10px] uppercase tracking-widest text-success font-bold">
                            {L("CAMPAIGN SUCCESS PROBABILITY", "مؤشر احتمالية النجاح")}
                          </div>
                          <h3 className="font-display font-bold text-lg text-foreground">
                            {selectedCampaign.score >= 80
                              ? L("Highly Recommended Fit", "توافق ممتاز ومثالي")
                              : L("Refinement Advised", "يحتاج إلى إعادة توجيه")}
                          </h3>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            {L(
                              "Reflects the probability of achieving visual network resonance and stable conversions under standard market loads.",
                              "يمثل احتمالية تحقيق انتشار عضوي قوي ومعدل تحويل مستقر في ظل ظروف السوق الحالية.",
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <div className="relative h-24 w-24 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                className="stroke-muted/10"
                                strokeWidth="6"
                                fill="transparent"
                              />
                              <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                className="stroke-success"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={251.2}
                                initial={{ strokeDashoffset: 251.2 }}
                                animate={{
                                  strokeDashoffset: 251.2 - (251.2 * selectedCampaign.score) / 100,
                                }}
                                transition={{ duration: 1.4, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute text-center">
                              <span className="font-display font-extrabold text-2xl text-success">
                                {selectedCampaign.score}%
                              </span>
                              <span className="block text-[8px] uppercase tracking-widest text-muted-foreground">
                                {L("Success", "نسبة النجاح")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. AI Detailed campaign description (approx 10 lines) */}
                  <div className="glass-card p-6">
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-bold">
                      {L("Campaign Diagnosis", "تشخيص الحملة")}
                    </h2>
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-surface/40 border border-border/40 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Sparkles className="h-12 w-12 text-primary" />
                      </div>
                      <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1 animate-pulse" />
                      <div className="text-sm text-foreground/90 leading-loose whitespace-pre-line text-justify font-sans relative z-10">
                        {selectedCampaign.aiReport?.reportDescription ||
                          L(
                            "With a success score of " +
                              selectedCampaign.score +
                              "/100 and interactive platform responses, this campaign demonstrated notable engagement. Reaching peak engagement during the evening represents high alignment with modern consumer behavioral patterns. The positive sentiment at " +
                              selectedCampaign.sentiment.positive +
                              "% proves that the key messages hit appropriate market thresholds, avoiding common PR pitfalls. Given this strategic response, double-down investments on platforms like Instagram are highly endorsed. Tailoring messaging specifically in terms of content format (leading with responsive video) will bolster future organic visibility. Our models outline a direct path toward sustained growth across organic networks. Maintain this strategic alignment during the upcoming quarter to lock in gains.",
                            "مع مجموع نقاط " +
                              selectedCampaign.score +
                              " من 100 وتفاعل مستمر عبر المنصات الإعلانية، أظهرت الحملة نجاحًا كبيرًا ومؤشرات نضوج عالية. إن تحقيق ذروة النشاط خلال الفترة المسائية يعكس تماشيًا ذكيًا مع الأنماط السلوكية للجمهور المستهدف بدقة واحترافية. استجابة المشاعر الإيجابية البالغة " +
                              selectedCampaign.sentiment.positive +
                              "% تؤكد على ملاءمة الرسائل واختراقها للحواجز النفسية للمستهلكين بنجاح. بناءً على هذا الأداء، يعد الاستثمار المكثف بقوة على منصات مثل إنستجرام وخوارزميات مقاطع ريلز المخصصة خيارًا استراتيجيًا متميزًا لتحقيق عوائد أفضل. إن ملاءمة رسالتك الإعلانية مع تفضيلات الفيديو القصيرة سيسهم حتمًا في إثراء الوصول العضوي للحسابات بمرونة تامة. يضمن هذا التناسق في تفكيك سلوك الشريحة تكرار معدلات النجاح على المدى الطويل. نوصي بالحفاظ على هذا النفس الاستراتيجي للاستفادة الكاملة من الزخم الحالي وضمان استمراريته.",
                          )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Comprehensive Campaign Evaluation & Performance Forecast / Field Survey */}
                  <div className="glass-card p-6">
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-bold">
                      {selectedCampaign.mode === "pre"
                        ? L(
                            "Comprehensive campaign Evaluation & Forecast",
                            "التقييم الشامل للحملة وتوقع الأداء",
                          )
                        : L(
                            "Comprehensive Campaign Evaluation & Multi-Channel Analysis",
                            "التقييم الشامل للحملة والتحليل متعدد القنوات",
                          )}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Evaluation */}
                      <div className="p-5 rounded-2xl bg-surface/30 border border-border/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-sm text-foreground">
                              {L("Comprehensive Evaluation", "التقييم الشامل للحملة")}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                            {selectedCampaign.aiReport?.campaignEvaluation || defaultEvaluation}
                          </p>
                        </div>
                      </div>

                      {/* Performance (Pre-Launch) OR Dual Analysis (Post-Launch) */}
                      {selectedCampaign.mode === "pre" ? (
                        <div className="p-5 rounded-2xl bg-surface/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                            <h3 className="font-semibold text-sm text-foreground">
                              {L(
                                "Performance Forecast (Pre-Launch)",
                                "توقع الأداء والانتشار (قبل الإطلاق)",
                              )}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                            {selectedCampaign.aiReport?.performanceForecast || defaultForecast}
                          </p>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-surface/30 border border-border/50 flex flex-col justify-between">
                          <div>
                            {/* Tabs Header */}
                            <div className="flex gap-1.5 mb-4 bg-slate-950/60 p-1 rounded-xl border border-border/20 w-fit">
                              <button
                                type="button"
                                onClick={() => setPostAnalysisTab("digital")}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                  postAnalysisTab === "digital"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <BarChart2 className="h-3 w-3" />
                                <span>{L("Digital Analysis", "تحليل رقمي")}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPostAnalysisTab("field")}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                  postAnalysisTab === "field"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <QrCode className="h-3 w-3" />
                                <span>{L("Field Analysis", "تحليل ميداني")}</span>
                              </button>
                            </div>

                            <AnimatePresence mode="wait">
                              {postAnalysisTab === "digital" ? (
                                <motion.div
                                  key="digital-analysis"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="h-4 w-4 text-indigo-400" />
                                    <h4 className="font-semibold text-xs text-foreground">
                                      {L(
                                        "Digital Analysis (Engagement, Opinions & Performance)",
                                        "التحليل الرقمي (التفاعل، الآراء، والأداء عبر مواقع التواصل)",
                                      )}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed text-justify mb-4">
                                    {selectedCampaign.aiReport?.performanceForecast ||
                                      defaultForecast}
                                  </p>

                                  {/* Quick Digital Stats */}
                                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/20">
                                    <div className="p-2 rounded-xl bg-slate-950/40 border border-border/20 text-center">
                                      <span className="text-[9px] text-muted-foreground block font-bold">
                                        {L("Engagement Rate", "معدل التفاعل")}
                                      </span>
                                      <span className="text-xs font-black text-indigo-400">
                                        {selectedCampaign.engagementRate}%
                                      </span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-950/40 border border-border/20 text-center">
                                      <span className="text-[9px] text-muted-foreground block font-bold">
                                        {L("Positive Sentiment", "المشاعر الإيجابية")}
                                      </span>
                                      <span className="text-xs font-black text-emerald-400">
                                        {selectedCampaign.sentiment.positive}%
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="field-analysis"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                  className="space-y-4"
                                >
                                  {/* Header text */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <QrCode className="h-4 w-4 text-cyan-400" />
                                      <h4 className="font-semibold text-xs text-foreground">
                                        {L(
                                          "On-the-ground Feedback & Custom QR Code",
                                          "التحليل الميداني واستطلاع رأي الجمهور عبر QR",
                                        )}
                                      </h4>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                      {L(
                                        "Deploy this campaign QR code in offline media (banners, stands, print). Target audience can scan to submit direct feedback.",
                                        "أنشئ رمز الاستجابة السريعة (QR Code) المخصص لهذه الحملة لطباعته أو عرضه ميدانياً. يمسحه الجمهور المستهدف ليفتح نموذج التقييم الميداني الفوري.",
                                      )}
                                    </p>
                                  </div>

                                  {/* QR Code section */}
                                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-950/40 border border-border/20 rounded-2xl">
                                    <div className="shrink-0 bg-white p-2 rounded-xl">
                                      <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                                          typeof window !== "undefined"
                                            ? `${window.location.origin}/feedback?campaignId=${selectedCampaign.id}`
                                            : `https://publicinsight.ai/feedback?campaignId=${selectedCampaign.id}`,
                                        )}`}
                                        alt="Campaign QR Code"
                                        className="h-[80px] w-[80px]"
                                      />
                                    </div>
                                    <div className="flex-grow w-full space-y-2">
                                      <div className="text-[9px] text-slate-400 truncate bg-slate-950 border border-border/20 rounded-lg px-2.5 py-1.5 font-mono select-all">
                                        {typeof window !== "undefined"
                                          ? `${window.location.origin}/feedback?campaignId=${selectedCampaign.id}`
                                          : `/feedback?campaignId=${selectedCampaign.id}`}
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const url =
                                              typeof window !== "undefined"
                                                ? `${window.location.origin}/feedback?campaignId=${selectedCampaign.id}`
                                                : "";
                                            navigator.clipboard.writeText(url);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                          }}
                                          className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 border border-border/20 rounded-lg text-[9px] font-bold text-slate-200 flex items-center justify-center gap-1 cursor-pointer transition"
                                        >
                                          <Copy className="h-2.5 w-2.5" />
                                          <span>
                                            {copied
                                              ? L("Copied!", "تم النسخ!")
                                              : L("Copy link", "نسخ الرابط")}
                                          </span>
                                        </button>
                                        <a
                                          href={
                                            typeof window !== "undefined"
                                              ? `${window.location.origin}/feedback?campaignId=${selectedCampaign.id}`
                                              : "#"
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[9px] font-bold text-white flex items-center justify-center gap-1 transition"
                                        >
                                          <ExternalLink className="h-2.5 w-2.5" />
                                          <span>{L("Open Form", "معاينة النموذج")}</span>
                                        </a>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Stats details */}
                                  {feedbackStats && (
                                    <div className="space-y-3 pt-2 border-t border-border/15">
                                      {/* Counts header */}
                                      <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-slate-950/20 border border-border/20 rounded-xl">
                                          <span className="text-[8px] text-muted-foreground font-bold block uppercase">
                                            {L("Total Feedback", "التقييمات المستلمة")}
                                          </span>
                                          <span className="text-xs font-black text-white">
                                            {feedbackStats.total}
                                          </span>
                                        </div>
                                        <div className="p-2 bg-slate-950/20 border border-border/20 rounded-xl">
                                          <span className="text-[8px] text-muted-foreground font-bold block uppercase">
                                            {L("Message Clarity", "وضوح الرسالة")}
                                          </span>
                                          <span className="text-xs font-black text-emerald-400">
                                            {feedbackStats.q1.yes}%
                                          </span>
                                        </div>
                                        <div className="p-2 bg-slate-950/20 border border-border/20 rounded-xl">
                                          <span className="text-[8px] text-muted-foreground font-bold block uppercase">
                                            {L("Action/Opinion Alter", "نسبة تغيير السلوك")}
                                          </span>
                                          <span className="text-xs font-black text-cyan-400">
                                            {feedbackStats.q2.yes}%
                                          </span>
                                        </div>
                                      </div>

                                      {/* Gender distribution progress bar */}
                                      <div className="space-y-1 p-2 rounded-xl bg-slate-950/15 border border-border/10">
                                        <div className="flex justify-between text-[9px] font-bold">
                                          <span className="text-cyan-400">
                                            {L(
                                              `Male: ${feedbackStats.gender.male}%`,
                                              `ذكور: ${feedbackStats.gender.male}%`,
                                            )}
                                          </span>
                                          <span className="text-rose-400">
                                            {L(
                                              `Female: ${feedbackStats.gender.female}%`,
                                              `إناث: ${feedbackStats.gender.female}%`,
                                            )}
                                          </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-950 rounded-full flex overflow-hidden">
                                          <div
                                            className="bg-cyan-500 h-full transition-all"
                                            style={{ width: `${feedbackStats.gender.male}%` }}
                                          />
                                          <div
                                            className="bg-rose-500 h-full transition-all"
                                            style={{ width: `${feedbackStats.gender.female}%` }}
                                          />
                                        </div>
                                      </div>

                                      {/* Age Distribution lines */}
                                      <div className="space-y-1.5 p-2 rounded-xl bg-slate-950/15 border border-border/10">
                                        <span className="text-[9px] font-bold text-muted-foreground block">
                                          {L(
                                            "Age Demographics Distribution",
                                            "التوزيع السكاني للفئات العمرية",
                                          )}
                                        </span>
                                        <div className="space-y-1">
                                          {[
                                            {
                                              label: L("Under 18", "أقل من ١٨ سنة"),
                                              val: feedbackStats.age.under18,
                                              col: "bg-teal-500/80",
                                            },
                                            {
                                              label: "18 - 24",
                                              val: feedbackStats.age.age18_24,
                                              col: "bg-indigo-500/80",
                                            },
                                            {
                                              label: "25 - 34",
                                              val: feedbackStats.age.age25_34,
                                              col: "bg-purple-500/80",
                                            },
                                            {
                                              label: "35 - 44",
                                              val: feedbackStats.age.age35_44,
                                              col: "bg-pink-500/80",
                                            },
                                            {
                                              label: L("45+", "+٤٥ سنة"),
                                              val: feedbackStats.age.age45_plus,
                                              col: "bg-slate-500/80",
                                            },
                                          ].map((g, gIdx) => (
                                            <div
                                              key={gIdx}
                                              className="flex items-center gap-2 text-[9px]"
                                            >
                                              <span className="w-12 text-muted-foreground font-semibold truncate">
                                                {g.label}
                                              </span>
                                              <div className="flex-grow h-1 bg-slate-950 rounded-full overflow-hidden">
                                                <div
                                                  className={`h-full ${g.col}`}
                                                  style={{ width: `${g.val}%` }}
                                                />
                                              </div>
                                              <span className="w-6 text-end font-bold text-foreground">
                                                {g.val}%
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Written Opinions Scrollbox */}
                                      {feedbackStats.comments.length > 0 && (
                                        <div className="space-y-1.5">
                                          <span className="text-[9px] font-bold text-muted-foreground block">
                                            {L(
                                              "Direct Audience Feedback & Opinions",
                                              "الآراء الحقيقية المباشرة والملاحظات",
                                            )}
                                          </span>
                                          <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                            {feedbackStats.comments.map((comment, cIdx) => {
                                              const isMale = comment.gender === "male";
                                              const ageText =
                                                {
                                                  "under-18": L("<18", "١٨-"),
                                                  "18-24": "18-24",
                                                  "25-34": "25-34",
                                                  "35-44": "35-44",
                                                  "45-54": "45-54",
                                                  "55-plus": "+55",
                                                }[comment.age as string] || comment.age;

                                              return (
                                                <div
                                                  key={cIdx}
                                                  className="p-2.5 rounded-xl bg-slate-950/50 border border-border/10 text-[10px] leading-relaxed"
                                                >
                                                  <div className="flex justify-between items-center mb-1 text-[8px] text-muted-foreground">
                                                    <span className="font-bold flex items-center gap-1">
                                                      <span
                                                        className={`h-1 w-1 rounded-full ${
                                                          isMale ? "bg-cyan-400" : "bg-rose-400"
                                                        }`}
                                                      />
                                                      {isMale
                                                        ? L("Male", "ذكر")
                                                        : L("Female", "أنثى")}{" "}
                                                      ({ageText})
                                                    </span>
                                                    <span>{comment.date}</span>
                                                  </div>
                                                  <p className="text-slate-300 italic">
                                                    "{comment.opinion}"
                                                  </p>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Strengths and Weaknesses */}
                  <div className="glass-card p-6">
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-bold">
                      {L(
                        "Campaign Strengths & Risks / Weaknesses",
                        "نقاط القوة والمخاطر (تحليل أسباب الفشل والنجاح)",
                      )}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                          <ThumbsUp className="h-5 w-5 text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            {L("Points of Strength", "نقاط القوة والنجاح")}
                          </span>
                        </div>
                        <ul className="space-y-3">
                          {(
                            selectedCampaign.aiReport?.strengths ||
                            selectedCampaign.resultObj.strengths ||
                            []
                          ).map((str: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed"
                            >
                              <span className="h-5 w-5 shrink-0 rounded bg-emerald-500/10 grid place-items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                ✓
                              </span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses / Failure Risks (Worst case analysis) */}
                      <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                          <ThumbsDown className="h-5 w-5 text-rose-500" />
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                            {L(
                              "Risks / Causes of Failure (Worst-case)",
                              "تحليل المخاطر وأسباب الفشل المحتملة (أسوأ حالة)",
                            )}
                          </span>
                        </div>
                        <ul className="space-y-3">
                          {(
                            selectedCampaign.aiReport?.weaknesses ||
                            selectedCampaign.resultObj.weaknesses ||
                            []
                          ).map((weak: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed"
                            >
                              <span className="h-5 w-5 shrink-0 rounded bg-rose-500/10 grid place-items-center text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                !
                              </span>
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 4. Audience Behavior & Platform Analysis */}
                  <div className="glass-card p-6">
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-bold">
                      {L(
                        "Audience and Platform deep-dive Analysis",
                        "تحليل سلوك الجمهور ومنصات الإطلاق بالتفصيل",
                      )}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Audience Behavior */}
                      <div className="p-5 rounded-2xl bg-surface/30 border border-border/50 flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 grid place-items-center">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-1.5">
                            {L("Audience Behavior Analysis", "تحليل سلوك الجمهور وتفضيلاته")}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                            {selectedCampaign.aiReport?.audienceBehaviorAnalysis ||
                              defaultAudienceAnalysis}
                          </p>
                        </div>
                      </div>

                      {/* Platform Analysis */}
                      <div className="p-5 rounded-2xl bg-surface/30 border border-border/50 flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-500/10 grid place-items-center">
                          <Globe className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-1.5">
                            {L("Platform Effectiveness Analysis", "تحليل ملاءمة وتأثير المنصات")}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                            {selectedCampaign.aiReport?.platformAnalysis || defaultPlatformAnalysis}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Algeria Interactive Geographical & Cultural Optimization Map */}
                  {((selectedCampaign.campaignObj?.dialect || selectedCampaign.dialect) ===
                    "algerian" ||
                    selectedCampaign.campaignObj?.location?.toLowerCase()?.includes("algeria") ||
                    selectedCampaign.campaignObj?.location?.includes("الجزائر")) && (
                    <div className="glass-card p-6">
                      <AlgeriaInteractiveMap
                        campaignId={selectedCampaign.id}
                        campaignName={selectedCampaign.name}
                        overallScore={selectedCampaign.score}
                        dialect={selectedCampaign.campaignObj?.dialect || "standard"}
                        campaignType={selectedCampaign.campaignObj?.type || "awareness"}
                        isArabic={ar}
                      />
                    </div>
                  )}

                  {/* Campaign Media Mentions & Sentiment Listening Engine */}
                  <div className="glass-card p-6">
                    <CampaignMediaTracker
                      campaignId={selectedCampaign.id}
                      campaignName={selectedCampaign.name}
                      overallScore={selectedCampaign.score}
                      dialect={selectedCampaign.campaignObj?.dialect || "standard"}
                      campaignType={selectedCampaign.campaignObj?.type || "awareness"}
                      isArabic={ar}
                      mode={selectedCampaign.mode}
                    />
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 flex flex-col justify-between">
                      <div>
                        <Eye className="h-4 w-4 mb-2 text-primary" />
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {t("views")}
                        </div>
                      </div>
                      <div className="font-display font-bold text-2xl mt-1">
                        {Intl.NumberFormat().format(selectedCampaign.metrics.views)}
                      </div>
                    </div>

                    <div className="glass-card p-4 flex flex-col justify-between">
                      <div>
                        <Heart className="h-4 w-4 mb-2 text-rose-500" />
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {t("likes")}
                        </div>
                      </div>
                      <div className="font-display font-bold text-2xl mt-1">
                        {Intl.NumberFormat().format(selectedCampaign.metrics.likes)}
                      </div>
                    </div>

                    <div className="glass-card p-4 flex flex-col justify-between">
                      <div>
                        <MessageSquare className="h-4 w-4 mb-2 text-amber-500" />
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {t("comments")}
                        </div>
                      </div>
                      <div className="font-display font-bold text-2xl mt-1">
                        {Intl.NumberFormat().format(selectedCampaign.metrics.comments)}
                      </div>
                    </div>

                    <div className="glass-card p-4 flex flex-col justify-between">
                      <div>
                        <Share2 className="h-4 w-4 mb-2 text-emerald-500" />
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {t("shares")}
                        </div>
                      </div>
                      <div className="font-display font-bold text-2xl mt-1">
                        {Intl.NumberFormat().format(selectedCampaign.metrics.shares)}
                      </div>
                    </div>
                  </div>

                  {/* 5. Simple, clear, actionable recommendations */}
                  <div className="glass-card p-6">
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-bold">
                      {L("Actionable Recommendations", "التوصيات المباشرة والقابلة للتنفيذ")}
                    </h2>
                    <div className="space-y-3">
                      {(
                        selectedCampaign.aiReport?.recommendations ||
                        selectedCampaign.resultObj.recommendations ||
                        []
                      ).map((rec: any, i: number) => (
                        <div
                          key={i}
                          className="flex gap-3 text-sm p-4 rounded-xl bg-surface border border-border/50"
                        >
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <h3 className="font-semibold text-foreground text-sm mb-1">
                              {rec.title}
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              {rec.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Report Footer Back Button */}
                  <div className="flex gap-4 mt-4 no-print justify-center">
                    <button
                      onClick={() => {
                        window.dispatchEvent(new Event("open-archive-center"));
                      }}
                      className="max-w-xs flex-1 text-center py-3.5 rounded-2xl border border-border bg-surface font-semibold hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                      {L("Open Campaign Archive", "افتح أرشيف وسجل الحملات")}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Saved to PC Confirmation Banner */}
      {lastDownloadedPdf && (
        <div className="flex justify-center pt-3 pb-2 no-print">
          <div className="w-full max-w-lg p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="truncate">
                {L(
                  `Saved to PC: ${lastDownloadedPdf.fileName}`,
                  `تم حفظ الملف على جهازك: ${lastDownloadedPdf.fileName}`,
                )}
              </span>
            </div>
            <button
              onClick={() =>
                downloadPDFDirectly(
                  lastDownloadedPdf.blob,
                  lastDownloadedPdf.dataUri,
                  lastDownloadedPdf.fileName,
                )
              }
              className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm text-[11px]"
            >
              <Download className="h-3 w-3" />
              <span>{L("Download Again", "تحميل مجدداً")}</span>
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display font-bold text-lg text-foreground mt-1">{value}</div>
    </div>
  );
}
