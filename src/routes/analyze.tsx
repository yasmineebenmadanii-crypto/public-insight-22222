import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Rocket,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Video,
  Palette,
  Sparkles,
  Flame,
  Target,
  MessageSquare,
  AlertCircle,
  Upload,
  RefreshCw,
  HelpCircle,
  ThumbsUp,
  QrCode,
  Star,
  Printer,
  Download,
  CheckCircle2,
  Link2,
  Users,
  Percent,
  Award,
  TrendingUp,
  Globe,
  HeartPulse,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer as RechartsResponsiveContainer,
} from "recharts";
import { useI18n, type TKey } from "@/lib/i18n";
import {
  simulateABTest,
  checkCampaignSuitability,
  parseScreenshotData,
} from "@/lib/api/gemini.functions";

export const Route = createFileRoute("/analyze")({
  head: () => ({ meta: [{ title: "Analyze — Public Insight" }] }),
  component: Analyze,
});

const dayKeys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function get30DayDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  return { start: formatDate(start), end: formatDate(end) };
}

function getPreLaunchCampaignPreset(language: string) {
  switch (language) {
    case "ar":
      return {
        name: "مدينتنا مسؤوليتنا",
        type: ["awareness", "social"],
        organizer: "جمعية محلية بالتعاون مع البلدية",
        description:
          "حملة توعوية للحفاظ على نظافة الأحياء والأماكن العامة - حملة رقمية وميدانية تهدف إلى تشجيع المواطنين، خاصة الشباب، على المحافظة على نظافة الأحياء وعدم رمي النفايات في الأماكن العامة، مع تعزيز الشعور بالمسؤولية تجاه المدينة.",
        objectives:
          "• رفع الوعي بأهمية المحافظة على نظافة المحيط.\n• تشجيع المواطنين على عدم رمي النفايات عشوائيًا.\n• زيادة مشاركة الشباب في المبادرات التطوعية.\n• تعزيز المسؤولية الجماعية تجاه المدينة.",
        age: "16-40",
        gender: "both",
        location: "سطيف، الجزائر",
        education: "ثانوي، جامعي وما بعد الجامعي",
        interests: "البيئة، التطوع، المبادرات الشبابية، الحياة المجتمعية، تحسين المدينة",
        message: "نظافة حومتك تبدأ منك.",
        slogans: "حومتنا مسؤوليتنا، نقيها اليوم، تعيش فيها غدوة، مدينتنا أجمل بينا",
        platforms: ["facebook", "instagram", "tiktok"],
        durationValue: "21",
        durationUnit: "days" as const,
        budget: "300000",
        contentTypes: ["video", "design", "image", "text"],
        dialect: "algerian",
      };

    case "fr":
      return {
        name: "Notre Ville, Notre Responsabilité (مدينتنا مسؤوليتنا)",
        type: ["awareness", "social"],
        organizer: "Association locale en partenariat avec la commune",
        description:
          "Campagne de sensibilisation pour la propreté des quartiers et des espaces publics - initiative numérique et de terrain visant à encourager les citoyens, en particulier les jeunes, à préserver la propreté des quartiers et à éliminer les dépôts sauvages.",
        objectives:
          "• Sensibiliser à l'importance de préserver la propreté de l'environnement.\n• Inciter les citoyens à ne pas jeter les ordures de manière anarchique.\n• Accroître la participation des jeunes aux initiatives de bénévolat.\n• Renforcer la responsabilité collective envers la ville.",
        age: "16-40",
        gender: "both",
        location: "Sétif, Algérie",
        education: "Secondaire, universitaire et supérieur",
        interests:
          "Environnement, bénévolat, initiatives citoyennes des jeunes, vie communautaire, embellissement urbain",
        message: "La propreté de votre quartier commence par vous. (نظافة حومتك تبدأ منك)",
        slogans:
          "Notre quartier notre responsabilité, Nettoie-le aujourd'hui pour mieux vivre demain, Notre ville est plus belle avec nous",
        platforms: ["facebook", "instagram", "tiktok"],
        durationValue: "21",
        durationUnit: "days" as const,
        budget: "300000",
        contentTypes: ["video", "design", "image", "text"],
        dialect: "algerian",
      };

    case "es":
      return {
        name: "Nuestra Ciudad, Nuestra Responsabilidad (مدينتنا مسؤوليتنا)",
        type: ["awareness", "social"],
        organizer: "Asociación local en colaboración con el municipio",
        description:
          "Campaña de concienciación para la limpieza de barrios y espacios públicos - iniciativa digital y comunitaria para motivar a la ciudadanía, en especial a la juventud, a cuidar su entorno urbano.",
        objectives:
          "• Crear conciencia sobre la importancia de mantener limpio el entorno.\n• Fomentar que los ciudadanos no arrojen basura indiscriminadamente.\n• Incrementar la participación juvenil en brigadas de voluntariado.\n• Consolidar la responsabilidad cívica compartida hacia la ciudad.",
        age: "16-40",
        gender: "both",
        location: "Sétif, Argelia",
        education: "Secundaria, universitaria y posgrado",
        interests:
          "Medio ambiente, voluntariado, iniciativas juveniles, vida comunitaria, mejora urbana",
        message: "La limpieza de tu barrio empieza por ti. (نظافة حومتك تبدأ منك)",
        slogans:
          "Nuestro barrio nuestra responsabilidad, Límpialo hoy para vivir mejor mañana, Nuestra ciudad es más hermosa juntos",
        platforms: ["facebook", "instagram", "tiktok"],
        durationValue: "21",
        durationUnit: "days" as const,
        budget: "300000",
        contentTypes: ["video", "design", "image", "text"],
        dialect: "algerian",
      };

    case "de":
      return {
        name: "Unsere Stadt, Unsere Verantwortung (مدينتنا مسؤوليتنا)",
        type: ["awareness", "social"],
        organizer: "Lokale Bürgerinitiative in Zusammenarbeit mit der Stadtverwaltung",
        description:
          "Aufklärungskampagne für die Sauberkeit von Nachbarschaften und öffentlichen Plätzen - digitale und bürgernahe Initiative zur Förderung des Engagements junger Menschen für ihre Stadt.",
        objectives:
          "• Bewusstsein für die Bedeutung einer sauberen Umwelt schärfen.\n• Bürger dazu anhalten, Abfälle nicht wild im öffentlichen Raum zu entsorgen.\n• Engagement von Jugendlichen in ehrenamtlichen Aktionen steigern.\n• Gemeinschaftliche Verantwortung für die Stadt festigen.",
        age: "16-40",
        gender: "both",
        location: "Sétif, Algerien",
        education: "Gymnasium, Hochschule und postgraduale Bildung",
        interests:
          "Umweltschutz, Ehrenamt, Jugendinitiativen, Gemeinschaftsleben, Stadtverschönerung",
        message: "Die Sauberkeit deines Viertels beginnt bei dir. (نظافة حومتك تبدأ منك)",
        slogans:
          "Unser Viertel unsere Verantwortung, Heute reinigen morgen besser leben, Gemeinsam ist unsere Stadt schöner",
        platforms: ["facebook", "instagram", "tiktok"],
        durationValue: "21",
        durationUnit: "days" as const,
        budget: "300000",
        contentTypes: ["video", "design", "image", "text"],
        dialect: "algerian",
      };

    case "zh":
      return {
        name: "我们的城市，我们的责任 (مدينتنا مسؤوليتنا)",
        type: ["awareness", "social"],
        organizer: "塞提夫本地协会与市政当局联合主办",
        description:
          "维护社区和公共场所卫生的宣教活动 - 结合线上与线下的倡议行动，鼓励市民特别是青年爱护社区环境，杜绝在公共区域乱扔垃圾，培养城市主人翁意识。",
        objectives:
          "• 提高公众对保护周边环境整洁的重视度。\n• 引导市民自觉遵守公共卫生准则，杜绝随意丢弃垃圾。\n• 激发青年参与社区志愿清洁行动的热情。\n• 凝聚全民共建美好家园的集体责任感。",
        age: "16-40",
        gender: "both",
        location: "阿尔及利亚 塞提夫",
        education: "高中、大学及以上学历",
        interests: "环境保护、志愿服务、青年倡议、社区生活、城市美化",
        message: "社区的整洁，从你我做起。(نظافة حومتك تبدأ منك)",
        slogans: "社区是我们的责任，今天搞好清洁明天美好生活，有你我城市更美好",
        platforms: ["facebook", "instagram", "tiktok"],
        durationValue: "21",
        durationUnit: "days" as const,
        budget: "300000",
        contentTypes: ["video", "design", "image", "text"],
        dialect: "algerian",
      };

    default: // "en"
      return {
        name: "Our City, Our Responsibility (مدينتنا مسؤوليتنا)",
        type: ["awareness", "social"],
        organizer: "Local community association in cooperation with the municipality",
        description:
          "Awareness campaign to keep neighborhoods and public spaces clean - A digital and on-the-ground campaign aimed at encouraging citizens, especially youth, to maintain neighborhood cleanliness, avoid littering in public places, and foster collective responsibility for the city.",
        objectives:
          "• Raise awareness on the vital importance of maintaining environmental cleanliness.\n• Encourage citizens to refrain from random littering.\n• Boost youth participation in community volunteer initiatives.\n• Strengthen collective civic responsibility for the city.",
        age: "16-40",
        gender: "both",
        location: "Setif, Algeria",
        education: "Secondary, University and Postgraduate",
        interests: "Environment, volunteering, youth initiatives, community life, city improvement",
        message: "The cleanliness of your neighborhood starts with you. (نظافة حومتك تبدأ منك)",
        slogans:
          "Our neighborhood is our responsibility, Clean it today live well tomorrow, Our city is more beautiful together",
        platforms: ["facebook", "instagram", "tiktok"],
        durationValue: "21",
        durationUnit: "days" as const,
        budget: "300000",
        contentTypes: ["video", "design", "image", "text"],
        dialect: "algerian",
      };
  }
}

function getHealthCampaignPreset(language: string) {
  const { start, end } = get30DayDates();

  switch (language) {
    case "ar":
      return {
        pre: {
          name: "صحتك تبدأ منك",
          type: ["awareness"],
          organizer: "مديرية الصحة والسكان - ولاية سطيف",
          description:
            "حملة توعوية صحية موجهة لشباب ولاية سطيف تهدف إلى تعزيز نمط الحياة الصحي والنشاط البدني والتغذية السليمة والوقاية من الأمراض المزمنة.",
          objectives:
            "توعية 100,000 شاب وشابة في سطيف بأهمية الفحوصات الدورية وممارسة الرياضة والحد من التدخين والأغذية الضارة.",
          age: "18-35",
          gender: "both",
          location: "سطيف، الجزائر",
          education: "جامعي / ثانوي",
          interests: "صحة عامة، لياقة بدنية، تغذية صحية، رياضة",
          message: "صحتك تبدأ منك.. كل خطوة صحية اليوم تصنع فرقاً يدوم في مستقبلك!",
          slogans: "صحتك في يديك، سطيف بصحة أفضل، عيشها بصحة",
          platforms: ["facebook", "instagram"],
          durationValue: "30",
          durationUnit: "days" as const,
          budget: "100000",
          contentTypes: ["image", "video", "design"],
          dialect: "algerian",
        },
        post: {
          name: "صحتك تبدأ منك",
          type: "حملة توعوية صحية",
          goal: "توعية صحية",
          age: "18-35",
          gender: "الشباب من 18 إلى 35 سنة (ذكور وإناث)",
          location: "سطيف، الجزائر",
          start,
          end,
          budget: "100,000 دج",
          platforms: ["facebook", "instagram"],
          postUrl: "https://facebook.com/health.setif/posts/campaign2026",
          views: "145000",
          likes: "9800",
          comments: "840",
          shares: "1620",
          saves: "1150",
          clicks: "4200",
          followersBefore: "12500",
          followersAfter: "18300",
          topLocation: "سطيف، الجزائر",
          topAge: "18-35",
          dialect: "algerian",
          competitor: "sante-algerie.dz",
        },
      };

    case "fr":
      return {
        pre: {
          name: "Votre santé commence par vous (صحتك تبدأ منك)",
          type: ["awareness"],
          organizer: "Direction de la Santé et de la Population - Wilaya de Sétif",
          description:
            "Campagne de sensibilisation à la santé ciblant les jeunes de la wilaya de Sétif pour encourager un mode de vie sain, l'exercice physique régulier et une alimentation équilibrée.",
          objectives:
            "Sensibiliser 100 000 jeunes de Sétif à l'importance de la prévention sanitaire et du dépistage précoce.",
          age: "18-35",
          gender: "both",
          location: "Sétif, Algérie",
          education: "Universitaire / Secondaire",
          interests: "Santé publique, fitness, nutrition saine, sport",
          message:
            "Votre santé commence par vous.. un petit geste sain chaque jour transforme votre avenir !",
          slogans: "Votre santé entre vos mains, Sétif en meilleure santé",
          platforms: ["facebook", "instagram"],
          durationValue: "30",
          durationUnit: "days" as const,
          budget: "100000",
          contentTypes: ["image", "video", "design"],
          dialect: "algerian",
        },
        post: {
          name: "Votre santé commence par vous (صحتك تبدأ منك)",
          type: "Campagne de sensibilisation à la santé",
          goal: "Sensibilisation à la santé",
          age: "18-35",
          gender: "Jeunes de 18 à 35 ans (Hommes et Femmes)",
          location: "Sétif, Algérie",
          start,
          end,
          budget: "100 000 DZD",
          platforms: ["facebook", "instagram"],
          postUrl: "https://facebook.com/health.setif/posts/campaign2026",
          views: "145000",
          likes: "9800",
          comments: "840",
          shares: "1620",
          saves: "1150",
          clicks: "4200",
          followersBefore: "12500",
          followersAfter: "18300",
          topLocation: "Sétif, Algérie",
          topAge: "18-35",
          dialect: "algerian",
          competitor: "sante-algerie.dz",
        },
      };

    case "es":
      return {
        pre: {
          name: "Tu salud empieza por ti (صحتك تبدأ منك)",
          type: ["awareness"],
          organizer: "Dirección de Salud y Población - Provincia de Sétif",
          description:
            "Campaña de concienciación sobre la salud dirigida a los jóvenes de Sétif para promover estilos de vida saludables, ejercicio y nutrición balanceada.",
          objectives:
            "Sensibilizar a 100.000 jóvenes en Sétif sobre la prevención de enfermedades y el bienestar integral.",
          age: "18-35",
          gender: "both",
          location: "Sétif, Argelia",
          education: "Universitario / Secundario",
          interests: "Salud pública, ejercicio, nutrición, deportes",
          message:
            "Tu salud empieza por ti.. ¡un pequeño paso hoy marca una gran diferencia en tu futuro!",
          slogans: "Tu salud en tus manos, Sétif más saludable",
          platforms: ["facebook", "instagram"],
          durationValue: "30",
          durationUnit: "days" as const,
          budget: "100000",
          contentTypes: ["image", "video", "design"],
          dialect: "algerian",
        },
        post: {
          name: "Tu salud empieza por ti (صحتك تبدأ منك)",
          type: "Campaña de concienciación sobre la salud",
          goal: "Concienciación sobre la salud",
          age: "18-35",
          gender: "Jóvenes de 18 a 35 años (Todos)",
          location: "Sétif, Argelia",
          start,
          end,
          budget: "100.000 DZD",
          platforms: ["facebook", "instagram"],
          postUrl: "https://facebook.com/health.setif/posts/campaign2026",
          views: "145000",
          likes: "9800",
          comments: "840",
          shares: "1620",
          saves: "1150",
          clicks: "4200",
          followersBefore: "12500",
          followersAfter: "18300",
          topLocation: "Sétif, Argelia",
          topAge: "18-35",
          dialect: "algerian",
          competitor: "sante-algerie.dz",
        },
      };

    case "de":
      return {
        pre: {
          name: "Deine Gesundheit beginnt bei dir (صحتك تبدأ منك)",
          type: ["awareness"],
          organizer: "Direktion für Gesundheit und Bevölkerung - Provinz Sétif",
          description:
            "Gesundheitsaufklärungskampagne für junge Menschen in der Provinz Sétif zur Förderung eines gesunden Lebensstils, regelmäßiger Bewegung und ausgewogener Ernährung.",
          objectives:
            "Sensibilisierung von 100.000 Jugendlichen in Sétif für Prävention und Vorsorgeuntersuchungen.",
          age: "18-35",
          gender: "both",
          location: "Sétif, Algerien",
          education: "Hochschule / Weiterführend",
          interests: "Öffentliche Gesundheit, Fitness, Ernährung, Sport",
          message:
            "Deine Gesundheit beginnt bei dir.. ein kleiner gesunder Schritt heute macht morgen den Unterschied!",
          slogans: "Deine Gesundheit in deinen Händen, ein gesünderes Sétif",
          platforms: ["facebook", "instagram"],
          durationValue: "30",
          durationUnit: "days" as const,
          budget: "100000",
          contentTypes: ["image", "video", "design"],
          dialect: "algerian",
        },
        post: {
          name: "Deine Gesundheit beginnt bei dir (صحتك تبدأ منك)",
          type: "Gesundheitsaufklärungskampagne",
          goal: "Gesundheitsaufklärung",
          age: "18-35",
          gender: "Jugendliche von 18 bis 35 Jahren (Alle)",
          location: "Sétif, Algerien",
          start,
          end,
          budget: "100.000 DZD",
          platforms: ["facebook", "instagram"],
          postUrl: "https://facebook.com/health.setif/posts/campaign2026",
          views: "145000",
          likes: "9800",
          comments: "840",
          shares: "1620",
          saves: "1150",
          clicks: "4200",
          followersBefore: "12500",
          followersAfter: "18300",
          topLocation: "Sétif, Algerien",
          topAge: "18-35",
          dialect: "algerian",
          competitor: "sante-algerie.dz",
        },
      };

    case "zh":
      return {
        pre: {
          name: "健康始于自身 (صحتك تبدأ منك)",
          type: ["awareness"],
          organizer: "阿尔及利亚 塞提夫省卫生与人口理事会",
          description: "面向塞提夫省青年的健康宣教活动，倡导健康生活方式、经常锻炼和均衡饮食。",
          objectives: "向塞提夫的10万名青年普及预防保健和健康生活习惯的重要性。",
          age: "18-35",
          gender: "both",
          location: "阿尔及利亚 塞提夫",
          education: "大学 / 高中",
          interests: "公共健康、健身、均衡膳食、体育",
          message: "健康始于自身.. 今天迈出一小步，未来带来长久健康改变！",
          slogans: "健康掌握在自己手中，塞提夫更健康",
          platforms: ["facebook", "instagram"],
          durationValue: "30",
          durationUnit: "days" as const,
          budget: "100000",
          contentTypes: ["image", "video", "design"],
          dialect: "algerian",
        },
        post: {
          name: "健康始于自身 (صحتك تبدأ منك)",
          type: "健康宣传倡导活动",
          goal: "健康倡导",
          age: "18-35",
          gender: "18至35岁青年 (男女全体)",
          location: "阿尔及利亚 塞提夫",
          start,
          end,
          budget: "100,000 DZD",
          platforms: ["facebook", "instagram"],
          postUrl: "https://facebook.com/health.setif/posts/campaign2026",
          views: "145000",
          likes: "9800",
          comments: "840",
          shares: "1620",
          saves: "1150",
          clicks: "4200",
          followersBefore: "12500",
          followersAfter: "18300",
          topLocation: "阿尔及利亚 塞提夫",
          topAge: "18-35",
          dialect: "algerian",
          competitor: "sante-algerie.dz",
        },
      };

    default: // "en"
      return {
        pre: {
          name: "Your Health Starts with You (صحتك تبدأ منك)",
          type: ["awareness"],
          organizer: "Health & Population Directorate - Setif Province",
          description:
            "A public health awareness campaign targeting youth in Setif province to promote healthy living, regular exercise, and balanced nutrition.",
          objectives:
            "Educate 100,000 youth in Setif about the value of disease prevention and healthy lifestyles.",
          age: "18-35",
          gender: "both",
          location: "Setif, Algeria",
          education: "University / High School",
          interests: "Health, fitness, nutrition, sports",
          message:
            "Your health starts with you.. a small healthy step today makes a big difference tomorrow!",
          slogans: "Your Health in Your Hands, Setif Healthier",
          platforms: ["facebook", "instagram"],
          durationValue: "30",
          durationUnit: "days" as const,
          budget: "100000",
          contentTypes: ["image", "video", "design"],
          dialect: "algerian",
        },
        post: {
          name: "Your Health Starts with You (صحتك تبدأ منك)",
          type: "Health Awareness Campaign",
          goal: "Health Awareness",
          age: "18-35",
          gender: "Youth aged 18 to 35 years (All genders)",
          location: "Setif, Algeria",
          start,
          end,
          budget: "100,000 DZD",
          platforms: ["facebook", "instagram"],
          postUrl: "https://facebook.com/health.setif/posts/campaign2026",
          views: "145000",
          likes: "9800",
          comments: "840",
          shares: "1620",
          saves: "1150",
          clicks: "4200",
          followersBefore: "12500",
          followersAfter: "18300",
          topLocation: "Setif, Algeria",
          topAge: "18-35",
          dialect: "algerian",
          competitor: "sante-algerie.dz",
        },
      };
  }
}

function Analyze() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const L = (en: string, arT: string) => (ar ? arT : en);
  const nav = useNavigate();
  const [mode, setMode] = useState<"pre" | "post" | null>(null);

  // States for new experimental widgets
  const [copyA, setCopyA] = useState(
    ar
      ? "انضم إلينا اليوم لتجربة تميز فريد ومستدام، ووفر أكثر من 40% من ميزانيتك!"
      : "Join us today and experience unique, sustainable excellence while saving over 40% on your budget!",
  );
  const [copyB, setCopyB] = useState(
    ar
      ? "خطوتك الأولى نحو مستقبل أفضل تبدأ هنا. دعنا نساعدك في تحقيق أهدافك خطوة بخطوة."
      : "Your first step towards a better future starts here. Let us help you achieve your goals step-by-step.",
  );
  const [abLoading, setAbLoading] = useState(false);
  const [abResult, setAbResult] = useState<any>(null);

  const [suitabilityLoading, setSuitabilityLoading] = useState(false);
  const [suitabilityResult, setSuitabilityResult] = useState<any>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Check if redirected with an error message
  useEffect(() => {
    const redirectedMsg = sessionStorage.getItem("pi-form-error");
    if (redirectedMsg) {
      setBannerError(redirectedMsg);
      sessionStorage.removeItem("pi-form-error");
    }
  }, []);

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (bannerError) {
      setBannerError(null);
    }
  };

  // Pre-launch form state
  const [pre, setPre] = useState({
    name: "",
    type: ["awareness"] as string[],
    organizer: "",
    description: "",
    objectives: "",
    age: "",
    gender: "both",
    location: "",
    education: "",
    interests: "",
    message: "",
    slogans: "",
    platforms: [] as string[],
    durationValue: "",
    durationUnit: "days" as "days" | "weeks",
    budget: "",
    contentTypes: [] as string[],
    dialect: "standard", // Cultural dialect setting
  });
  const setP = (k: keyof typeof pre, v: any) => {
    clearError(k as string);
    setPre((p) => ({ ...p, [k]: v }));
  };
  const togglePre = (k: "platforms" | "contentTypes", id: string) => {
    clearError(k);
    setPre((p) => ({
      ...p,
      [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id],
    }));
  };

  // Post-launch state
  const [post, setPost] = useState<any>({
    name: "",
    type: "Awareness",
    goal: "Awareness",
    age: "25-34",
    gender: "All",
    location: "",
    start: "",
    end: "",
    budget: "",
    platforms: ["instagram"],
    postUrl: "",
    views: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
    clicks: "",
    followersBefore: "",
    followersAfter: "",
    topLocation: "",
    topAge: "",
    dialect: "standard", // Cultural dialect setting
    competitor: "", // Competitor reference
  });
  const [postStep, setPostStep] = useState(0);
  const [postTab, setPostTab] = useState<"digital" | "field">("digital");

  // Feedback Link Analysis state
  const [feedbackLink, setFeedbackLink] = useState<string>("");
  const [linkAnalysisLoading, setLinkAnalysisLoading] = useState<boolean>(false);
  const [linkAnalysisStep, setLinkAnalysisStep] = useState<number>(0);
  const [analyzedData, setAnalyzedData] = useState<any | null>(null);

  const loadingSteps = [
    L("Connecting to survey endpoint...", "جاري الاتصال بفرع نموذج الاستبيان..."),
    L(
      "Extracting responses and validating metadata...",
      "جاري استخراج الردود والتحقق من صحة البيانات...",
    ),
    L(
      "Analyzing comprehension and sentiment metrics...",
      "جاري تحليل مقاييس الفهم ومؤشرات الرأي...",
    ),
    L(
      "Synthesizing statistics and generating charts...",
      "جاري دمج الإحصاءات وإنشاء الرسوم البيانية...",
    ),
  ];

  const handleAnalyzeLink = () => {
    if (!feedbackLink || !feedbackLink.trim()) {
      setLinkError(
        L(
          "Feedback survey link is required.",
          "يرجى إدخال رابط صالح لنموذج أو استبيان التغذية الراجعة.",
        ),
      );
      return;
    }

    // Simple validation of URL
    if (
      !feedbackLink.startsWith("http://") &&
      !feedbackLink.startsWith("https://") &&
      !feedbackLink.includes(".")
    ) {
      setLinkError(
        L(
          "Please enter a valid URL (e.g. https://forms.google.com/...)",
          "يرجى إدخال رابط إنترنت صالح يبدأ بـ http:// أو https://.",
        ),
      );
      return;
    }

    setLinkError(null);

    setLinkAnalysisLoading(true);
    setLinkAnalysisStep(0);

    // Step 0 -> 1 -> 2 -> 3
    const timer1 = setTimeout(() => setLinkAnalysisStep(1), 800);
    const timer2 = setTimeout(() => setLinkAnalysisStep(2), 1600);
    const timer3 = setTimeout(() => setLinkAnalysisStep(3), 2400);
    const timer4 = setTimeout(() => {
      // Generate deterministic metrics
      const result = generateLinkAnalysis(feedbackLink);
      setAnalyzedData(result);
      setLinkAnalysisLoading(false);
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  const generateLinkAnalysis = (url: string) => {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = url.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    const malePercent = 35 + (hash % 26);
    const femalePercent = 100 - malePercent;

    const ageGroups = ["18-24", "25-34", "35-44", "45-54"];
    const topAge = ageGroups[hash % ageGroups.length];

    // Determine Sentiment profile based on the hash (3 possibilities)
    const sentimentTypes = ["positive", "neutral", "negative"] as const;
    const sentiment = sentimentTypes[hash % sentimentTypes.length];

    let maleComprehension = 0;
    let femaleComprehension = 0;
    let maleImpact = 0;
    let femaleImpact = 0;
    let rating = 0;
    let arabicWords: { word: string; translation: string; count: number }[] = [];
    let summaryAr = "";
    let summaryEn = "";

    if (sentiment === "positive") {
      maleComprehension = 72 + (hash % 19); // 72 to 90
      femaleComprehension = 76 + ((hash + 3) % 20); // 76 to 95
      maleImpact = 68 + ((hash + 7) % 23); // 68 to 90
      femaleImpact = 72 + ((hash + 12) % 24); // 72 to 95
      rating = parseFloat((4.1 + (hash % 9) / 10).toFixed(1)); // 4.1 to 4.9

      arabicWords = [
        { word: "ملهمة", translation: "Inspiring", count: 45 + (hash % 25) },
        { word: "هادفة", translation: "Purposeful", count: 38 + ((hash + 5) % 20) },
        { word: "مبتكرة", translation: "Innovative", count: 32 + ((hash + 10) % 15) },
        { word: "واضحة", translation: "Clear", count: 28 + ((hash + 15) % 15) },
        { word: "مؤثرة", translation: "Impactful", count: 22 + ((hash + 20) % 15) },
        { word: "رائعة", translation: "Wonderful", count: 18 + ((hash + 25) % 15) },
      ];

      summaryAr =
        "حملة إيجابية للغاية وممتازة! أظهر الجمهور تفاعلاً كبيراً وفهماً عميقاً للرسالة الإعلانية الأساسية مع نسبة رضا وتوصيات مرتفعة جداً.";
      summaryEn =
        "Highly positive and successful campaign! The audience demonstrated strong engagement, deep understanding of the core message, and very high satisfaction.";
    } else if (sentiment === "neutral") {
      maleComprehension = 50 + (hash % 15); // 50 to 64
      femaleComprehension = 52 + ((hash + 3) % 15); // 52 to 66
      maleImpact = 44 + ((hash + 7) % 15); // 44 to 58
      femaleImpact = 48 + ((hash + 12) % 15); // 48 to 62
      rating = parseFloat((3.1 + (hash % 9) / 10).toFixed(1)); // 3.1 to 3.9

      arabicWords = [
        { word: "عادية", translation: "Ordinary", count: 42 + (hash % 20) },
        { word: "جيدة", translation: "Good", count: 36 + ((hash + 5) % 20) },
        { word: "مكررة", translation: "Repeated", count: 30 + ((hash + 10) % 15) },
        { word: "مقبولة", translation: "Acceptable", count: 25 + ((hash + 15) % 15) },
        { word: "طويلة", translation: "Too Long", count: 20 + ((hash + 20) % 15) },
        { word: "مبهمة", translation: "Vague", count: 15 + ((hash + 25) % 15) },
      ];

      summaryAr =
        "حملة متوسطة ومحايدة. بالرغم من قبول الفكرة بشكل عام، إلا أن فئات واسعة من الجمهور وصفتها بأنها اعتيادية أو مكررة وتفتقر للابتكار الملموس.";
      summaryEn =
        "Moderate and neutral campaign. Although the concept was generally acceptable, large audience segments found it ordinary, repetitive, or lacking significant innovation.";
    } else {
      // negative
      maleComprehension = 22 + (hash % 18); // 22 to 39
      femaleComprehension = 25 + ((hash + 3) % 18); // 25 to 42
      maleImpact = 16 + ((hash + 7) % 18); // 16 to 33
      femaleImpact = 18 + ((hash + 12) % 18); // 18 to 35
      rating = parseFloat((1.6 + (hash % 12) / 10).toFixed(1)); // 1.6 to 2.7

      arabicWords = [
        { word: "مملة", translation: "Boring", count: 44 + (hash % 20) },
        { word: "سيئة", translation: "Bad", count: 38 + ((hash + 5) % 20) },
        { word: "غير واضحة", translation: "Unclear", count: 32 + ((hash + 10) % 15) },
        { word: "مخيبة", translation: "Disappointing", count: 26 + ((hash + 15) % 15) },
        { word: "مستفزة", translation: "Provocative", count: 20 + ((hash + 20) % 15) },
        { word: "مكلفة", translation: "Expensive", count: 16 + ((hash + 25) % 15) },
      ];

      summaryAr =
        "حملة سلبية جداً وتواجه صعوبات تواصلية حقيقية! سجل استطلاع الرأي نفوراً واضحاً من الجمهور مع غياب الفهم الكافي وملاحظات حادة عن الأسلوب الفني.";
      summaryEn =
        "Very negative and critical campaign results! The public feedback highlights a severe communication gap, audience fatigue, and direct criticism of the execution.";
    }

    return {
      malePercent,
      femalePercent,
      topAge,
      maleComprehension,
      femaleComprehension,
      maleImpact,
      femaleImpact,
      rating,
      words: arabicWords,
      link: url,
      sentiment,
      summaryAr,
      summaryEn,
    };
  };
  const setPo = (k: string, v: any) => {
    clearError(k);
    setPost((d: any) => ({ ...d, [k]: v }));
  };
  const togglePoPlat = (id: string) => {
    clearError("platforms");
    setPo(
      "platforms",
      post.platforms.includes(id)
        ? post.platforms.filter((p: string) => p !== id)
        : [...post.platforms, id],
    );
  };

  const [autoFillSuccess, setAutoFillSuccess] = useState<string | null>(null);

  const handleAutoFillPost = () => {
    const preset = getHealthCampaignPreset(lang).post;
    setPost(preset);
    setErrors({});
    setBannerError(null);
    setAutoFillSuccess(
      lang === "ar"
        ? "تمت تعبئة بيانات الحملة الصحية بنجاح! (صحتك تبدأ منك - سطيف)"
        : lang === "fr"
          ? "Données de la campagne « Votre santé commence par vous (Sétif) » renseignées avec succès !"
          : "Health campaign details ('Your Health Starts with You - Setif') auto-filled successfully!",
    );
    setTimeout(() => {
      setAutoFillSuccess(null);
    }, 4500);
  };

  const handleAutoFillPre = () => {
    const preset = getPreLaunchCampaignPreset(lang);
    setPre(preset);
    setErrors({});
    setBannerError(null);
    setAutoFillSuccess(
      lang === "ar"
        ? "تمت تعبئة بيانات حملة «مدينتنا مسؤوليتنا» بنجاح! (سطيف • 300,000 دج • 21 يوماً)"
        : lang === "fr"
          ? "Données de la campagne « Notre Ville, Notre Responsabilité (Sétif) » renseignées avec succès !"
          : lang === "es"
            ? "¡Datos de la campaña «Nuestra Ciudad, Nuestra Responsabilidad (Sétif)» rellenados con éxito!"
            : lang === "de"
              ? "Daten der Kampagne „Unsere Stadt, Unsere Verantwortung (Sétif)“ erfolgreich ausgefüllt!"
              : lang === "zh"
                ? "已成功自动填充宣传活动“我们的城市，我们的责任 (塞提夫)”的数据！"
                : "Pre-launch campaign details ('Our City, Our Responsibility - Setif') auto-filled successfully!",
    );
    setTimeout(() => {
      setAutoFillSuccess(null);
    }, 4500);
  };

  const submitPre = () => {
    const newErrors: Record<string, string> = {};

    if (!pre.name || !pre.name.trim()) {
      newErrors.name = L("Campaign name is required", "اسم الحملة إلزامي");
    }
    if (!pre.type || pre.type.length === 0) {
      newErrors.type = L(
        "Please select at least one campaign type",
        "يرجى تحديد نوع حملة واحد على الأقل",
      );
    }
    if (!pre.description || !pre.description.trim()) {
      newErrors.description = L(
        "Campaign description is required",
        "وصف الحملة إلزامي لتمكين الذكاء الاصطناعي من فهم محتواها",
      );
    }
    if (!pre.objectives || !pre.objectives.trim()) {
      newErrors.objectives = L(
        "Campaign objectives are required",
        "أهداف الحملة إلزامية لتحديد معايير النجاح",
      );
    }
    if (!pre.location || !pre.location.trim()) {
      newErrors.location = L("Target location is required", "الموقع الجغرافي المستهدف إلزامي");
    }
    if (!pre.message || !pre.message.trim()) {
      newErrors.message = L(
        "Main campaign message is required",
        "الرسالة الرئيسية للحملة إلزامية لتحليل الأثر والتفاعل",
      );
    }
    if (!pre.platforms || pre.platforms.length === 0) {
      newErrors.platforms = L(
        "Please select at least one target platform",
        "يرجى اختيار منصة تواصل واحدة على الأقل",
      );
    }
    if (!pre.durationValue || !String(pre.durationValue).trim() || Number(pre.durationValue) <= 0) {
      newErrors.durationValue = L(
        "Valid duration is required",
        "يرجى إدخال مدة حملة صالحة (أكبر من صفر)",
      );
    }
    if (!pre.budget || !pre.budget.trim()) {
      newErrors.budget = L(
        "Campaign budget is required",
        "الميزانية المتاحة إلزامية لتقييم الجدوى والتوافق",
      );
    }
    if (!pre.contentTypes || pre.contentTypes.length === 0) {
      newErrors.contentTypes = L(
        "Please select at least one content format",
        "يرجى اختيار نوع محتوى واحد على الأقل",
      );
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setBannerError(
        L(
          "Please fill in all required fields marked with an asterisk (*) before running the analysis.",
          "يرجى ملء جميع الحقول الإلزامية المحددة بعلامة (*) قبل إرسال الحملة للتحليل بالذكاء الاصطناعي.",
        ),
      );

      // Smoothly scroll to first invalid field
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const inputEl = el.querySelector("input, textarea, button") as HTMLElement | null;
        inputEl?.focus?.();
      }
      return;
    }

    setBannerError(null);
    setErrors({});
    sessionStorage.setItem("pi-campaignMode", "pre");
    sessionStorage.setItem("pi-campaign", JSON.stringify(pre));
    sessionStorage.setItem("pi-current-run-id", `run_${Date.now()}`);
    nav({ to: "/analyzing" });
  };

  const handleNextPostStep = () => {
    if (postStep === 0) {
      const stepErrors: Record<string, string> = {};
      if (!post.name || !post.name.trim()) {
        stepErrors.name = L("Campaign name is required", "اسم الحملة إلزامي");
      }
      if (!post.location || !post.location.trim()) {
        stepErrors.location = L("Target location is required", "الموقع الجغرافي المستهدف إلزامي");
      }
      if (!post.start) {
        stepErrors.start = L("Start date is required", "تاريخ بدء الحملة إلزامي");
      }
      if (!post.end) {
        stepErrors.end = L("End date is required", "تاريخ انتهاء الحملة إلزامي");
      }
      if (post.start && post.end && post.start > post.end) {
        stepErrors.end = L(
          "End date cannot precede start date",
          "تاريخ الانتهاء لا يمكن أن يسبق تاريخ البدء",
        );
      }

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setBannerError(
          L(
            "Please fill in all required fields marked with (*) to proceed.",
            "يرجى إكمال البيانات الأساسية الإلزامية المحددة بـ (*) للمتابعة.",
          ),
        );
        const firstKey = Object.keys(stepErrors)[0];
        const el = document.getElementById(`field-post-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const inputEl = el.querySelector("input") as HTMLElement | null;
          inputEl?.focus?.();
        }
        return;
      }
    } else if (postStep === 1) {
      const stepErrors: Record<string, string> = {};
      if (!post.platforms || post.platforms.length === 0) {
        stepErrors.platforms = L(
          "Please select at least one active platform",
          "يرجى تحديد منصة واحدة على الأقل تم نشر الحملة عليها",
        );
      }

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setBannerError(
          L(
            "Please select at least one platform where your campaign was launched.",
            "يرجى تحديد منصة واحدة على الأقل أطلقت عليها الحملة.",
          ),
        );
        const el = document.getElementById("field-post-platforms");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
    }

    setBannerError(null);
    setErrors({});
    setPostStep((p) => p + 1);
  };

  const submitPost = () => {
    const metricErrors: Record<string, string> = {};
    if (!post.views || !String(post.views).trim()) {
      metricErrors.views = L(
        "Views count is required to calculate conversion and engagement metrics",
        "عدد المشاهدات إلزامي لحساب معدلات التفاعل والتحويل",
      );
    } else if (isNaN(Number(String(post.views).replace(/,/g, "")))) {
      metricErrors.views = L(
        "Please enter a valid numeric views count",
        "يرجى إدخال رقم صحيح لعدد المشاهدات",
      );
    }

    if (Object.keys(metricErrors).length > 0) {
      setErrors(metricErrors);
      setBannerError(
        L(
          "Please enter at least the total views before submitting metrics for analysis.",
          "يرجى إدخال إجمالي المشاهدات على الأقل لتمكين الذكاء الاصطناعي من تحليل النتائج.",
        ),
      );
      const el = document.getElementById("field-post-views");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const inputEl = el.querySelector("input") as HTMLElement | null;
        inputEl?.focus?.();
      }
      return;
    }

    setBannerError(null);
    setErrors({});
    sessionStorage.setItem("pi-campaignMode", "post");
    sessionStorage.setItem("pi-campaign", JSON.stringify(post));
    sessionStorage.setItem("pi-current-run-id", `run_${Date.now()}`);
    nav({ to: "/analyzing" });
  };

  // ----- Mode selection -----
  if (!mode) {
    return (
      <AppShell title={t("analyzeNow")}>
        <div className="max-w-2xl mx-auto py-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold mb-2">{t("chooseAnalysisMode")}</h1>
            <p className="text-sm text-muted-foreground mb-8">{t("chooseAnalysisModeIntro")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModeCard
                Icon={Rocket}
                title={t("preLaunch")}
                desc={t("preLaunchDesc")}
                onClick={() => setMode("pre")}
                highlight
              />
              <ModeCard
                Icon={BarChart3}
                title={t("postLaunch")}
                desc={t("postLaunchDesc")}
                onClick={() => setMode("post")}
              />
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  // ----- PRE-LAUNCH FORM -----
  if (mode === "pre") {
    const typeOptions = [
      { id: "awareness", label: L("Awareness", "توعوية") },
      { id: "informational", label: L("Informational", "إعلامية") },
      { id: "social", label: L("Social", "اجتماعية") },
      { id: "commercial", label: L("Commercial", "تجارية") },
      { id: "other", label: L("Other", "أخرى") },
    ];
    const platformOptions = [
      { id: "facebook", label: "Facebook", Icon: Facebook },
      { id: "instagram", label: "Instagram", Icon: Instagram },
      { id: "tiktok", label: "TikTok", Icon: () => <span className="text-xs font-bold">TT</span> },
      { id: "linkedin", label: "LinkedIn", Icon: Linkedin },
      { id: "x", label: "X", Icon: () => <span className="text-xs font-bold">X</span> },
      { id: "youtube", label: "YouTube", Icon: Youtube },
    ];
    const contentOptions = [
      { id: "text", label: L("Text posts", "منشورات نصية"), Icon: FileText },
      { id: "image", label: L("Images", "صور"), Icon: ImageIcon },
      { id: "video", label: L("Videos", "فيديوهات"), Icon: Video },
      { id: "design", label: L("Designs", "تصاميم"), Icon: Palette },
    ];

    return (
      <AppShell title={t("analyzeNow")}>
        <div className="max-w-3xl mx-auto py-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => setMode(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-4 group cursor-pointer bg-secondary/15 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-secondary/25"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
              <span>{L("Back to Campaign Mode Choice", "الرجوع للمرحلة السابقة")}</span>
            </button>
            <h1 className="text-3xl font-display font-bold mb-2">
              {L("Pre-launch campaign analysis", "تحليل الحملة قبل الإطلاق")}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              {L(
                "Fill in the campaign details to generate a full pre-launch report.",
                "املأ تفاصيل الحملة لإنشاء تقرير تحليلي كامل قبل الإطلاق.",
              )}
            </p>

            {bannerError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                <div className="flex-1 leading-relaxed">{bannerError}</div>
              </motion.div>
            )}

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border/70 text-xs text-muted-foreground mb-6">
              <span className="text-destructive font-black text-sm">*</span>
              <span>
                {L(
                  "Fields marked with an asterisk (*) are required to run an accurate AI campaign analysis.",
                  "الحقول المعلمة بالنجمة (*) إلزامية لتمكين الذكاء الاصطناعي من تحليل الحملة بدقة.",
                )}
              </span>
            </div>

            {/* One-Click Auto-Fill Preset Card for Pre-Launch */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="text-start">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs text-foreground">
                      {L(
                        "Auto-Fill Pre-Launch Campaign Preset",
                        "تعبئة تلقائية لمثال حملة قبل الإطلاق",
                      )}
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {lang === "ar"
                        ? "مدينتنا مسؤوليتنا (نظافة الأحياء)"
                        : "Our City, Our Responsibility (مدينتنا مسؤوليتنا)"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {L(
                      "Setif, Algeria • 16-40 years • 21 days • 300,000 DZD • Facebook, Instagram, TikTok",
                      "سطيف، الجزائر • 16–40 سنة • 21 يوماً • 300,000 دج • فيسبوك، إنستغرام، تيك توك",
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillPre}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                <span>{L("Auto-Fill Fields", "تعبئة الحقول تلقائياً")}</span>
              </button>
            </div>

            {autoFillSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{autoFillSuccess}</span>
              </motion.div>
            )}

            <Section title={L("Campaign basics", "بيانات الحملة")}>
              <Field
                label={L("Campaign name", "اسم الحملة")}
                required
                error={errors.name}
                id="field-name"
              >
                <input
                  id="input-name"
                  value={pre.name}
                  onChange={(e) => setP("name", e.target.value)}
                  className={`${inputCls} ${errors.name ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                  placeholder={L(
                    "e.g. Health Awareness 2026",
                    "مثال: الحملة الوطنية للصحة الرقمية 2026",
                  )}
                />
              </Field>

              {/* Interactive A/B Copy Tester */}
              <div className="mt-4 mb-6 p-5 rounded-2xl border border-primary/20 bg-primary/5 text-start">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <h4 className="font-semibold text-sm">
                    {L("Smart A/B Copy Test Simulator", "محاكي اختبار A/B الذكي للنصوص الإعلانية")}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {L(
                    "Compare two ad headlines or slogans. Public Insight AI evaluates each copy using consumer behavioral metrics.",
                    "أدخل نسختين من النص الإعلاني لمقارنتهما ومعرفة أيهما سيحقق أداءً أفضل بناءً على العوامل السيكولوجية والروحية.",
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {L("Version A Copy", "النسخة أ")}
                    </label>
                    <textarea
                      rows={2}
                      value={copyA}
                      onChange={(e) => setCopyA(e.target.value)}
                      className={`${inputCls} text-xs mt-1`}
                      placeholder={L(
                        "e.g. Save money today and join the elite!",
                        "مثال: وفّر أموالك اليوم وانضم إلى النخبة!",
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {L("Version B Copy", "النسخة ب")}
                    </label>
                    <textarea
                      rows={2}
                      value={copyB}
                      onChange={(e) => setCopyB(e.target.value)}
                      className={`${inputCls} text-xs mt-1`}
                      placeholder={L(
                        "e.g. Build better habits that pay off over time.",
                        "مثال: ابنِ عادات أفضل تثمر فائدتها بمرور الوقت.",
                      )}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={abLoading || !copyA || !copyB}
                  onClick={async () => {
                    setAbLoading(true);
                    try {
                      const res = await simulateABTest({
                        data: {
                          copyA,
                          copyB,
                          language: lang,
                        },
                      });
                      setAbResult(res);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setAbLoading(false);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/10 transition text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {abLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                  )}
                  {L("Simulate A/B Performance", "توقع النسخة الأفضل بالذكاء الاصطناعي")}
                </button>

                <AnimatePresence>
                  {abResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 pt-4 border-t border-border overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-4 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-500">
                            {L("Predicted Champion", "النسخة المتفوقة")}
                          </span>
                          <h5 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {abResult.winner === "A"
                              ? L("Version A Winner", "النسخة أ هي الفائزة")
                              : L("Version B Winner", "النسخة ب هي الفائزة")}
                          </h5>
                        </div>
                        <div className="text-end">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">
                            {L("AI Confidence", "نسبة ثقة الذكاء")}
                          </span>
                          <div className="text-lg font-extrabold text-primary">
                            {abResult.confidence}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 mb-4 text-start">
                        {/* Copy A Scores */}
                        <div className="p-3 bg-surface border border-border rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-bold text-xs">
                              {L("Copy A Psychological Breakdown", "التحليل النفسي للنسخة أ")}
                            </h6>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                            <div>
                              <div className="text-muted-foreground text-[10px]">
                                {L("Emotion", "العاطفة")}
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-rose-500 rounded-full"
                                  style={{ width: `${abResult.copyA.emotion}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]">
                                {abResult.copyA.emotion}/100
                              </span>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-[10px]">
                                {L("Urgency", "الإلحاح")}
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${abResult.copyA.urgency}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]">
                                {abResult.copyA.urgency}/100
                              </span>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-[10px]">
                                {L("Clarity", "الوضوح")}
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${abResult.copyA.clarity}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]">
                                {abResult.copyA.clarity}/100
                              </span>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-[10px]">
                                {L("Impact", "التأثير")}
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${abResult.copyA.impact}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]">
                                {abResult.copyA.impact}/100
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                            {abResult.copyA.psychologyAnalysis}
                          </p>
                        </div>

                        {/* Copy B Scores */}
                        <div className="p-3 bg-surface border border-border rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-bold text-xs">
                              {L("Copy B Psychological Breakdown", "التحليل النفسي للنسخة ب")}
                            </h6>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                            <div>
                              <div className="text-muted-foreground text-[10px]">
                                {L("Emotion", "العاطفة")}
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-rose-500 rounded-full"
                                  style={{ width: `${abResult.copyB.emotion}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]">
                                {abResult.copyB.emotion}/100
                              </span>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-[10px]">
                                {L("Urgency", "الإلحاح")}
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${abResult.copyB.urgency}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]">
                                {abResult.copyB.urgency}/100
                              </span>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-[10px]">
                                {L("Clarity", "الوضوح")}
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${abResult.copyB.clarity}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]">
                                {abResult.copyB.clarity}/100
                              </span>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-[10px]">
                                {L("Impact", "التأثير")}
                              </div>
                              <div className="h-1.5 w-full bg-border rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${abResult.copyB.impact}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]">
                                {abResult.copyB.impact}/100
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                            {abResult.copyB.psychologyAnalysis}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-xs text-start">
                        <span className="font-bold text-primary block mb-1">
                          {L("Expert Verdict Summary & Advice", "الخلاصة وتوجيهات الخبراء")}
                        </span>
                        <p className="leading-relaxed text-muted-foreground text-[11px]">
                          {abResult.verdict}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Field
                label={L("Campaign Type (Multi-select)", "نوع الحملة (تحديد متعدد)")}
                required
                error={errors.type}
                id="field-type"
              >
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 gap-2 p-1 rounded-xl transition ${
                    errors.type ? "border border-destructive/80 ring-2 ring-destructive/20" : ""
                  }`}
                >
                  {typeOptions.map((o) => {
                    const isSelected = pre.type.includes(o.id);
                    return (
                      <Pill
                        key={o.id}
                        active={isSelected}
                        onClick={() => {
                          const updated = pre.type.includes(o.id)
                            ? pre.type.filter((t) => t !== o.id)
                            : [...pre.type, o.id];
                          setP("type", updated);
                        }}
                      >
                        {o.label}
                      </Pill>
                    );
                  })}
                </div>
              </Field>
              <Field label={L("Organizing entity (optional)", "الجهة المنظمة (اختياري)")}>
                <input
                  value={pre.organizer}
                  onChange={(e) => setP("organizer", e.target.value)}
                  className={inputCls}
                  placeholder={L("Institution name", "اسم المؤسسة أو الشركة")}
                />
              </Field>
              <Field
                label={L("Campaign description", "وصف الحملة")}
                required
                error={errors.description}
                id="field-description"
              >
                <textarea
                  rows={3}
                  value={pre.description}
                  onChange={(e) => setP("description", e.target.value)}
                  className={`${inputCls} ${errors.description ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                  placeholder={L(
                    "Describe the campaign idea and context...",
                    "اشرح فكرة وموضوع وسياق الحملة الإعلانية...",
                  )}
                />
              </Field>
              <Field
                label={L("Campaign objectives", "أهداف الحملة")}
                required
                error={errors.objectives}
                id="field-objectives"
              >
                <textarea
                  rows={3}
                  value={pre.objectives}
                  onChange={(e) => setP("objectives", e.target.value)}
                  className={`${inputCls} ${errors.objectives ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                  placeholder={L(
                    "List the main objectives (e.g. increase public awareness by 30%)",
                    "اذكر الأهداف الرئيسية المرجوة من الحملة",
                  )}
                />
              </Field>
            </Section>

            <Section title={L("Target audience", "الجمهور المستهدف")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={L("Age range (optional)", "الفئة العمرية (اختياري)")}>
                  <input
                    value={pre.age}
                    onChange={(e) => setP("age", e.target.value)}
                    className={inputCls}
                    placeholder="18-24, 25-34…"
                  />
                </Field>
                <Field label={L("Gender", "الجنس")}>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "male", label: L("Male", "ذكور") },
                      { id: "female", label: L("Female", "إناث") },
                      { id: "both", label: L("Both", "كلاهما") },
                    ].map((g) => (
                      <Pill
                        key={g.id}
                        active={pre.gender === g.id}
                        onClick={() => setP("gender", g.id)}
                      >
                        {g.label}
                      </Pill>
                    ))}
                  </div>
                </Field>
                <Field
                  label={L("Target location", "الموقع الجغرافي المستهدف")}
                  required
                  error={errors.location}
                  id="field-location"
                >
                  <input
                    id="input-location"
                    value={pre.location}
                    onChange={(e) => setP("location", e.target.value)}
                    className={`${inputCls} ${errors.location ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                    placeholder={L(
                      "Region / city (e.g. Algiers, Oran, National)",
                      "المنطقة / المدينة (مثال: الجزائر العاصمة، وهران، وطني)",
                    )}
                  />
                </Field>
                <Field label={L("Education level (optional)", "المستوى التعليمي (اختياري)")}>
                  <input
                    value={pre.education}
                    onChange={(e) => setP("education", e.target.value)}
                    className={inputCls}
                    placeholder={L("e.g. University", "مثال: جامعي")}
                  />
                </Field>
                <Field label={L("Interests (optional)", "الاهتمامات (اختياري)")}>
                  <input
                    value={pre.interests}
                    onChange={(e) => setP("interests", e.target.value)}
                    className={inputCls}
                    placeholder={L("Sports, tech, fashion…", "رياضة، تقنية، موضة…")}
                  />
                </Field>
                <Field label={L("Cultural dialect & local identity", "الذكاء الثقافي والمحلي")}>
                  <select
                    value={pre.dialect}
                    onChange={(e) => setP("dialect", e.target.value)}
                    className={`${inputCls} dark:bg-zinc-900 border-border rounded-xl px-3 py-2 text-sm`}
                  >
                    <option value="standard">
                      {L("Standard Arabic (Fusha)", "العربية الفصحى (فصحى)")}
                    </option>
                    <option value="algerian">
                      {L("Algerian Dialect", "لهجة جزائرية (دارجة وعامية)")}
                    </option>
                    <option value="egyptian">{L("Egyptian Dialect", "لهجة مصرية")}</option>
                    <option value="gulf">{L("Gulf Dialect", "لهجة خليجية")}</option>
                    <option value="levantine">{L("Levantine Dialect", "لهجة شامية")}</option>
                    <option value="english">
                      {L("English (Universal)", "الإنجليزية (العالمية)")}
                    </option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section title={L("Message & slogans", "الرسالة والشعارات")}>
              <Field
                label={L("Main campaign message", "الرسالة الرئيسية للحملة")}
                required
                error={errors.message}
                id="field-message"
              >
                <textarea
                  id="input-message"
                  rows={3}
                  value={pre.message}
                  onChange={(e) => setP("message", e.target.value)}
                  className={`${inputCls} ${errors.message ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                  placeholder={L(
                    "The core message or slogan conveyed to the audience",
                    "الرسالة الجوهرية الموجهة للجمهور المستهدف",
                  )}
                />
                <div className="mt-1 text-xs text-muted-foreground text-end">
                  {pre.message.length} / 240
                </div>
              </Field>
              <Field label={L("Slogans used (optional)", "الشعارات المستخدمة (اختياري)")}>
                <input
                  value={pre.slogans}
                  onChange={(e) => setP("slogans", e.target.value)}
                  className={inputCls}
                  placeholder={L("Slogans separated by commas", "افصل بين الشعارات بفواصل")}
                />
              </Field>
            </Section>

            <Section title={L("Channels, duration & budget", "المنصات والمدة والميزانية")}>
              <Field
                label={L("Target platforms", "المنصات المستهدفة")}
                required
                error={errors.platforms}
                id="field-platforms"
              >
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 gap-2 p-1 rounded-xl transition ${
                    errors.platforms
                      ? "border border-destructive/80 ring-2 ring-destructive/20"
                      : ""
                  }`}
                >
                  {platformOptions.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePre("platforms", id)}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm transition cursor-pointer ${
                        pre.platforms.includes(id)
                          ? "bg-primary/15 border-primary"
                          : "bg-surface border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label={L("Campaign duration", "مدة الحملة")}
                  required
                  error={errors.durationValue}
                  id="field-durationValue"
                >
                  <div className="flex gap-2">
                    <input
                      id="input-durationValue"
                      type="number"
                      min={1}
                      value={pre.durationValue}
                      onChange={(e) => setP("durationValue", e.target.value)}
                      className={`${inputCls} ${errors.durationValue ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                      placeholder="0"
                    />
                    <div className="flex gap-1">
                      {[
                        { id: "days", label: L("Days", "أيام") },
                        { id: "weeks", label: L("Weeks", "أسابيع") },
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setP("durationUnit", u.id as any)}
                          className={`px-3 rounded-xl text-xs border cursor-pointer ${pre.durationUnit === u.id ? "bg-primary/15 border-primary" : "bg-surface border-border hover:border-primary/40"}`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Field>
                <Field
                  label={L("Available budget ($)", "الميزانية المتاحة ($)")}
                  required
                  error={errors.budget}
                  id="field-budget"
                >
                  <input
                    id="input-budget"
                    value={pre.budget}
                    onChange={(e) => setP("budget", e.target.value)}
                    className={`${inputCls} ${errors.budget ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                    placeholder="e.g. 1500"
                  />
                </Field>
              </div>

              {/* Interactive Suitability Checker */}
              <div className="mt-6 p-4 rounded-xl border border-border bg-surface/50 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">
                    {L("Budget and Platform Cohesion Checker", "مؤشر توافق الميزانية والمنصات")}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={
                    suitabilityLoading ||
                    !pre.budget ||
                    pre.platforms.length === 0 ||
                    !pre.durationValue
                  }
                  onClick={async () => {
                    setSuitabilityLoading(true);
                    try {
                      const res = await checkCampaignSuitability({
                        data: {
                          budget: pre.budget,
                          platforms: pre.platforms,
                          durationValue: pre.durationValue,
                          durationUnit: pre.durationUnit,
                          language: lang,
                        },
                      });
                      setSuitabilityResult(res);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setSuitabilityLoading(false);
                    }
                  }}
                  className="self-start px-4 py-1.5 rounded-lg bg-surface border border-border text-xs hover:border-primary transition cursor-pointer disabled:opacity-50"
                >
                  {suitabilityLoading
                    ? L("Calculating with AI...", "جاري الحساب بالذكاء الاصطناعي...")
                    : L("Analyze Compatibility", "تحليل التوافق")}
                </button>

                <AnimatePresence>
                  {suitabilityResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 border-t border-border text-xs overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">
                          {L("Compatibility Rating", "مستوى التوافق")}
                        </span>
                        <span className="font-extrabold text-primary">
                          {suitabilityResult.score}/100
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            suitabilityResult.status === "insufficient"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : suitabilityResult.status === "tight"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {suitabilityResult.status === "insufficient"
                            ? L("Insufficient Budget", "الميزانية غير كافية للمنصات المختارة")
                            : suitabilityResult.status === "tight"
                              ? L("Tight Budget Bounds", "الميزانية محدودة")
                              : L("Adequate & Optimized", "الميزانية مناسبة ومُحسّنة")}
                        </span>
                        <p className="font-semibold text-[11px] text-foreground">
                          {suitabilityResult.message}
                        </p>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 italic bg-muted/30 p-2.5 rounded-lg border border-border/50">
                        {suitabilityResult.explanation}
                      </p>

                      {suitabilityResult.recommendations &&
                        suitabilityResult.recommendations.length > 0 && (
                          <div className="space-y-1 mt-2">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                              {L("AI Financial Counsel", "توصيات ذكية للميزانية")}
                            </span>
                            {suitabilityResult.recommendations.map((rec: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Section>

            <Section title={L("Proposed content", "المحتوى المقترح للحملة")}>
              <Field
                label={L("Proposed content formats", "أنواع المحتوى المقترح")}
                required
                error={errors.contentTypes}
                id="field-contentTypes"
              >
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 rounded-xl transition ${
                    errors.contentTypes
                      ? "border border-destructive/80 ring-2 ring-destructive/20"
                      : ""
                  }`}
                >
                  {contentOptions.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePre("contentTypes", id)}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-sm transition cursor-pointer ${
                        pre.contentTypes.includes(id)
                          ? "bg-primary/15 border-primary"
                          : "bg-surface border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" /> {label}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>

            {bannerError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                <div className="flex-1 leading-relaxed">{bannerError}</div>
              </motion.div>
            )}

            <button
              onClick={submitPre}
              className="w-full mt-6 gradient-primary text-primary-foreground py-4 rounded-2xl font-semibold glow-ring flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 shadow-lg transition"
            >
              {t("submit")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  // ----- POST-LAUNCH FLOW (unchanged) -----
  const stepLabels: TKey[] = ["step_campaign", "step_platforms", "step_metrics"];
  const lastStep = stepLabels.length - 1;
  const metricFields: [string, TKey][] = [
    ["views", "views"],
    ["likes", "likes"],
    ["comments", "comments"],
    ["shares", "shares"],
    ["saves", "saves"],
    ["clicks", "clicks"],
    ["followersBefore", "followersBefore"],
    ["followersAfter", "followersAfter"],
    ["topLocation", "topLocation"],
    ["topAge", "topAge"],
  ];
  const platformsPost = [
    { id: "facebook", label: "Facebook", Icon: Facebook },
    { id: "instagram", label: "Instagram", Icon: Instagram },
    { id: "tiktok", label: "TikTok", Icon: () => <span className="text-sm font-bold">TT</span> },
  ];

  return (
    <AppShell title={t("analyzeNow")}>
      <div className="max-w-2xl mx-auto py-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => setMode(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-4 group cursor-pointer bg-secondary/15 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-secondary/25"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
            <span>{L("Back to Campaign Mode Choice", "الرجوع للمرحلة السابقة")}</span>
          </button>
          <h1 className="text-3xl font-display font-bold mb-2">{t("newAnalysis")}</h1>
          <p className="text-sm text-muted-foreground mb-8">{t("analyzeIntro")}</p>

          {/* Tabs for Digital / Field Analysis */}
          <div className="flex gap-2 mb-8 bg-surface p-1 rounded-2xl border border-border max-w-md">
            <button
              type="button"
              onClick={() => setPostTab("digital")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                postTab === "digital"
                  ? "bg-primary text-primary-foreground shadow-sm animate-fade-in"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/15"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>{L("Digital Analysis", "تحليل رقمي")}</span>
            </button>
            <button
              type="button"
              onClick={() => setPostTab("field")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                postTab === "field"
                  ? "bg-primary text-primary-foreground shadow-sm animate-fade-in"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/15"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>{L("Field Analysis", "تحليل ميداني")}</span>
            </button>
          </div>

          {postTab === "field" ? (
            <motion.div
              key="field-analysis-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-start"
            >
              {/* If no data has been analyzed and we are not loading */}
              {!analyzedData && !linkAnalysisLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-6 md:p-8 text-center flex flex-col items-center justify-center min-h-[350px] space-y-6"
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Link2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2 max-w-lg">
                    <h2 className="text-xl font-bold text-foreground">
                      {L("Feedback Link Analysis", "تحليل رابط التغذية الراجعة (Feedback Link)")}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {L(
                        "Enter the URL of your citizen feedback or survey form (e.g., Google Forms, Microsoft Forms, Typeform, or custom survey sheets). The system will automatically process the responses, analyze public sentiments, calculate gender metrics, and output interactive column charts.",
                        "أدخل رابط استمارة التغذية الراجعة أو استطلاع آراء المواطنين (مثل Google Forms أو Microsoft Forms أو Typeform أو جداول بيانات الاستبيانات). سيقوم النظام تلقائياً بمعالجة الردود، وتحليل آراء الجمهور، وحساب المقاييس الديموغرافية، وعرض النتائج في أعمدة بيانية تفاعلية.",
                      )}
                    </p>
                  </div>

                  <div className="w-full max-w-md space-y-3">
                    <div className="relative text-start">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/50">
                        <Globe className="h-4 w-4" />
                      </div>
                      <input
                        type="url"
                        value={feedbackLink}
                        onChange={(e) => {
                          setFeedbackLink(e.target.value);
                          if (linkError) setLinkError(null);
                        }}
                        placeholder={L(
                          "https://docs.google.com/forms/d/...",
                          "https://docs.google.com/forms/d/...",
                        )}
                        className={`w-full bg-surface border rounded-xl pl-10 pr-4 py-3.5 text-xs focus:outline-none transition ${
                          linkError
                            ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive"
                            : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                        }`}
                      />
                      {linkError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-destructive flex items-center gap-1.5 font-medium mt-1.5"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{linkError}</span>
                        </motion.p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAnalyzeLink}
                      className="w-full py-3.5 px-6 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-primary to-indigo-600 text-white hover:opacity-95 shadow-md shadow-primary/15"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{L("Analyze Feedback Data", "تحليل بيانات الاستبيان")}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Loading State */}
              {linkAnalysisLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-8 text-center min-h-[350px] flex flex-col items-center justify-center space-y-6"
                >
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {L("Analyzing Live Responses...", "جاري معالجة وتحليل الردود...")}
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      {L(
                        "Please wait while our engine connects to the link and processes the demographic variables.",
                        "يرجى الانتظار بينما يتصل محرك التحليل بالرابط ويقوم بمعالجة وتحليل المتغيرات الديموغرافية.",
                      )}
                    </p>
                  </div>

                  {/* Progressive loading checklist */}
                  <div className="w-full max-w-xs space-y-2 bg-secondary/10 p-4 rounded-xl border border-border text-start">
                    {loadingSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs">
                        {linkAnalysisStep > idx ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : linkAnalysisStep === idx ? (
                          <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                        )}
                        <span
                          className={`font-semibold transition-colors duration-300 ${linkAnalysisStep === idx ? "text-foreground font-bold" : linkAnalysisStep > idx ? "text-muted-foreground/60 line-through" : "text-muted-foreground/40"}`}
                        >
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Analyzed Data Dashboard */}
              {analyzedData && !linkAnalysisLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Top Bar with link reset */}
                  <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-foreground">
                          {L("Link Analysis Succeeded", "تم إكمال التحليل بنجاح")}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[280px] sm:max-w-[400px] font-mono select-all">
                          {analyzedData.link}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAnalyzedData(null);
                        setFeedbackLink("");
                      }}
                      className="py-2 px-3.5 rounded-xl border border-border bg-surface text-xs font-semibold text-foreground hover:bg-surface-elevated transition cursor-pointer shrink-0"
                    >
                      {L("Analyze Another Link", "تحليل رابط آخر")}
                    </button>
                  </div>

                  {/* Sentiment Health Alert Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      analyzedData.sentiment === "positive"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : analyzedData.sentiment === "neutral"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5 animate-bounce">
                      {analyzedData.sentiment === "positive"
                        ? "✨"
                        : analyzedData.sentiment === "neutral"
                          ? "⚠️"
                          : "🚨"}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white ${
                            analyzedData.sentiment === "positive"
                              ? "bg-emerald-600"
                              : analyzedData.sentiment === "neutral"
                                ? "bg-amber-500"
                                : "bg-rose-600"
                          }`}
                        >
                          {analyzedData.sentiment === "positive"
                            ? L("Positive Feedback Profile", "مؤشر إيجابي")
                            : analyzedData.sentiment === "neutral"
                              ? L("Mixed/Neutral Feedback Profile", "مؤشر محايد / مختلط")
                              : L("Negative/Critical Feedback Profile", "مؤشر سلبي / تحذيري")}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                        {ar ? analyzedData.summaryAr : analyzedData.summaryEn}
                      </p>
                    </div>
                  </div>

                  {/* KPI Summary Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* KPI 1: Gender split */}
                    <div className="glass-card p-5 space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {L("Gender Split", "نسبة الإناث والذكور")}
                        </span>
                        <Users className="h-4 w-4 text-primary/75" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <span className="text-2xl font-display font-black text-indigo-500">
                            {analyzedData.femalePercent}%
                          </span>
                          <span className="text-[10px] text-muted-foreground block font-bold">
                            👩 {L("Females", "الإناث")}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="space-y-1 text-right">
                          <span className="text-2xl font-display font-black text-primary">
                            {analyzedData.malePercent}%
                          </span>
                          <span className="text-[10px] text-muted-foreground block font-bold">
                            👨 {L("Males", "الذكور")}
                          </span>
                        </div>
                      </div>
                      {/* Stacked progress bar */}
                      <div className="w-full h-2 rounded-full overflow-hidden flex bg-border">
                        <div
                          className="bg-indigo-500 h-full"
                          style={{ width: `${analyzedData.femalePercent}%` }}
                        />
                        <div
                          className="bg-primary h-full"
                          style={{ width: `${analyzedData.malePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* KPI 2: Top Age Group */}
                    <div className="glass-card p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {L("Top Age Group", "الفئة العمرية الأكثر حضورًا")}
                        </span>
                        <TrendingUp className="h-4 w-4 text-violet-500" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-3xl font-display font-black text-violet-500">
                          {analyzedData.topAge}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {L(
                            "Represents the dominant audience segment",
                            "تمثل الشريحة الديموغرافية السائدة في الاستطلاع",
                          )}
                        </p>
                      </div>
                    </div>

                    {/* KPI 3: Overall Campaign Rating */}
                    <div className="glass-card p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {L("Overall Rating", "التقييم الإجمالي للحملة")}
                        </span>
                        <Award
                          className={`h-4 w-4 ${
                            analyzedData.sentiment === "positive"
                              ? "text-yellow-500"
                              : analyzedData.sentiment === "neutral"
                                ? "text-amber-500"
                                : "text-rose-500"
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-3xl font-display font-black ${
                              analyzedData.sentiment === "positive"
                                ? "text-yellow-500"
                                : analyzedData.sentiment === "neutral"
                                  ? "text-amber-500"
                                  : "text-rose-500"
                            }`}
                          >
                            {analyzedData.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">/ 5</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const active = star <= Math.round(analyzedData.rating);
                            return (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  active
                                    ? analyzedData.sentiment === "positive"
                                      ? "fill-yellow-400 text-yellow-400"
                                      : analyzedData.sentiment === "neutral"
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-rose-400 text-rose-400"
                                    : "text-muted-foreground/20"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Charts & Analytics Visuals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Charts Column: Comprehension & Impact (takes 2 cols on wide, 1 on mobile) */}
                    <div className="glass-card p-6 md:col-span-2 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {L(
                            "Comprehension & Impact Column Chart",
                            "النتائج في أعمدة بيانية: الفهم والتأثير",
                          )}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {L(
                            "Comparative metric split by gender for comprehension rate and behavioral change.",
                            "تحليل مقارن للمقاييس حسب الجنس لقياس مدى فهم الرسالة والتأثير الفعلي على الرأي والسلوك.",
                          )}
                        </p>
                      </div>

                      {/* Bar chart container */}
                      <div className="h-[260px] w-full text-xs">
                        <RechartsResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart
                            data={[
                              {
                                name: ar ? "فهم رسالة الحملة" : "Campaign Message Understanding",
                                [ar ? "الإناث 👩" : "Females 👩"]: analyzedData.femaleComprehension,
                                [ar ? "الذكور 👨" : "Males 👨"]: analyzedData.maleComprehension,
                              },
                              {
                                name: ar ? "تغير السلوك أو الرأي" : "Behavior / Opinion Changed",
                                [ar ? "الإناث 👩" : "Females 👩"]: analyzedData.femaleImpact,
                                [ar ? "الذكور 👨" : "Males 👨"]: analyzedData.maleImpact,
                              },
                            ]}
                            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                          >
                            <RechartsCartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.05)"
                            />
                            <RechartsXAxis
                              dataKey="name"
                              stroke="currentColor"
                              className="text-[10px] text-muted-foreground"
                            />
                            <RechartsYAxis
                              domain={[0, 100]}
                              tickFormatter={(v) => `${v}%`}
                              stroke="currentColor"
                              className="text-[10px] text-muted-foreground"
                            />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: "rgba(15, 23, 42, 0.95)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "12px",
                                color: "#f8fafc",
                              }}
                            />
                            <RechartsLegend verticalAlign="top" height={36} iconType="circle" />
                            <RechartsBar
                              dataKey={ar ? "الإناث 👩" : "Females 👩"}
                              fill={
                                analyzedData.sentiment === "positive"
                                  ? "#6366f1"
                                  : analyzedData.sentiment === "neutral"
                                    ? "#f59e0b"
                                    : "#f43f5e"
                              }
                              radius={[4, 4, 0, 0]}
                            />
                            <RechartsBar
                              dataKey={ar ? "الذكور 👨" : "Males 👨"}
                              fill={
                                analyzedData.sentiment === "positive"
                                  ? "#06b6d4"
                                  : analyzedData.sentiment === "neutral"
                                    ? "#f97316"
                                    : "#dc2626"
                              }
                              radius={[4, 4, 0, 0]}
                            />
                          </RechartsBarChart>
                        </RechartsResponsiveContainer>
                      </div>

                      {/* Descriptive breakdown indicators */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/40">
                        <div
                          className={`space-y-1 p-3 rounded-xl border ${
                            analyzedData.sentiment === "positive"
                              ? "bg-indigo-500/5 border-indigo-500/10 text-indigo-400"
                              : analyzedData.sentiment === "neutral"
                                ? "bg-amber-500/5 border-amber-500/10 text-amber-500"
                                : "bg-rose-500/5 border-rose-500/10 text-rose-500"
                          }`}
                        >
                          <span className="text-[11px] font-bold block">
                            {L("Comprehension Rate (% الفهم)", "% الفهم لدى الجنسين")}
                          </span>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {ar
                              ? analyzedData.sentiment === "positive"
                                ? `تم فهم الرسالة بشكل ممتاز بنسبة ${analyzedData.femaleComprehension}٪ لدى الإناث و ${analyzedData.maleComprehension}٪ لدى الذكور.`
                                : analyzedData.sentiment === "neutral"
                                  ? `فهم الرسالة كان متوسطاً ومصحوباً ببعض التردد بنسبة ${analyzedData.femaleComprehension}٪ لدى الإناث و ${analyzedData.maleComprehension}٪ لدى الذكور.`
                                  : `معدل فهم الرسالة كان منخفضاً جداً ومصحوباً بسوء فهم بنسبة ${analyzedData.femaleComprehension}٪ لدى الإناث و ${analyzedData.maleComprehension}٪ لدى الذكور.`
                              : analyzedData.sentiment === "positive"
                                ? `Understood perfectly by ${analyzedData.femaleComprehension}% of females and ${analyzedData.maleComprehension}% of males.`
                                : analyzedData.sentiment === "neutral"
                                  ? `Understood moderately with slight hesitation by ${analyzedData.femaleComprehension}% of females and ${analyzedData.maleComprehension}% of males.`
                                  : `Very low comprehension with noted misinterpretations by ${analyzedData.femaleComprehension}% of females and ${analyzedData.maleComprehension}% of males.`}
                          </p>
                        </div>

                        <div
                          className={`space-y-1 p-3 rounded-xl border ${
                            analyzedData.sentiment === "positive"
                              ? "bg-cyan-500/5 border-cyan-500/10 text-cyan-400"
                              : analyzedData.sentiment === "neutral"
                                ? "bg-amber-500/5 border-amber-500/10 text-amber-500"
                                : "bg-rose-500/5 border-rose-500/10 text-rose-500"
                          }`}
                        >
                          <span className="text-[11px] font-bold block">
                            {L("Behavioral Impact (% التأثير)", "% التأثير على السلوك والرأي")}
                          </span>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {ar
                              ? analyzedData.sentiment === "positive"
                                ? `أحدثت الحملة تغيراً إيجابياً في الرأي والسلوك بنسبة ${analyzedData.femaleImpact}٪ للإناث و ${analyzedData.maleImpact}٪ للذكور.`
                                : analyzedData.sentiment === "neutral"
                                  ? `التأثير السلوكي كان خجولاً ومحدود التفاعل بنسبة ${analyzedData.femaleImpact}٪ للإناث و ${analyzedData.maleImpact}٪ للذكور.`
                                  : `سجلت الحملة نفوراً أو غياباً تاماً للتفاعل الإيجابي بنسبة ${analyzedData.femaleImpact}٪ للإناث و ${analyzedData.maleImpact}٪ للذكور.`
                              : analyzedData.sentiment === "positive"
                                ? `Triggered positive change in ${analyzedData.femaleImpact}% of females and ${analyzedData.maleImpact}% of males.`
                                : analyzedData.sentiment === "neutral"
                                  ? `Induced mild behavioral response with limited enthusiasm in ${analyzedData.femaleImpact}% of females and ${analyzedData.maleImpact}% of males.`
                                  : `Triggered high friction or total absence of positive engagement in ${analyzedData.femaleImpact}% of females and ${analyzedData.maleImpact}% of males.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Word Cloud / Opinion Text Analysis Column */}
                    <div className="glass-card p-6 space-y-4 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {L("Most Used Words in Opinions", "الكلمات الأكثر استخدامًا في الآراء")}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {L(
                            "Extracted from open text fields, capturing main sentiment words.",
                            "الكلمات الأكثر تكراراً ووروداً في الخانات النصية للآراء المكتوبة.",
                          )}
                        </p>
                      </div>

                      {/* Display words frequency bars */}
                      <div className="space-y-3.5 my-4">
                        {analyzedData.words.map((item: any, i: number) => {
                          const maxCount = analyzedData.words[0].count;
                          const pct = (item.count / maxCount) * 100;
                          return (
                            <div key={item.word} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-foreground flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  {item.word}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-semibold bg-secondary/20 px-1.5 py-0.5 rounded-md">
                                  {item.count} {L("times", "تكرار")}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-secondary/15 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: i * 0.1, duration: 0.6 }}
                                  className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mini word badges block */}
                      <div className="bg-surface/50 p-3.5 rounded-2xl border border-border/80 text-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                          {L("Dominant Sentiment Cloud", "سحابة المفاهيم السائدة")}
                        </span>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {analyzedData.words.map((w: any, idx: number) => (
                            <span
                              key={w.word}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${
                                idx === 0
                                  ? "bg-primary/20 border-primary text-foreground text-[11px] font-bold"
                                  : idx === 1
                                    ? "bg-indigo-500/10 border-indigo-500/20 text-foreground"
                                    : "bg-secondary/10 border-border text-muted-foreground"
                              }`}
                            >
                              {w.word}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <>
              {bannerError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-2.5 shadow-sm"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                  <div className="flex-1 leading-relaxed">{bannerError}</div>
                </motion.div>
              )}

              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border/70 text-xs text-muted-foreground mb-6">
                <span className="text-destructive font-black text-sm">*</span>
                <span>
                  {L(
                    "Fields marked with an asterisk (*) are required to calculate campaign performance.",
                    "الحقول المعلمة بالنجمة (*) إلزامية لحساب مؤشرات أداء الحملة.",
                  )}
                </span>
              </div>

              {/* One-Click Auto-Fill Preset Card for Post-Launch */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <HeartPulse className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="text-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs text-foreground">
                        {L(
                          "Auto-Fill Health Campaign Preset",
                          "تعبئة تلقائية لبيانات الحملة الصحية",
                        )}
                      </h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {lang === "ar" ? "صحتك تبدأ منك" : "Health Campaign (صحتك تبدأ منك)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {L(
                        "Setif, Algeria • 18-35 years • 30 days • 100,000 DZD • Algerian Dialect",
                        "سطيف، الجزائر • 18-35 سنة • 30 يوماً • 100,000 دج • دارجة وعربية فصحى",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillPost}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{L("Auto-Fill Fields", "تعبئة الحقول تلقائياً")}</span>
                </button>
              </div>

              {autoFillSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{autoFillSuccess}</span>
                </motion.div>
              )}

              <div className="flex items-center gap-2 mb-8">
                {stepLabels.map((label, i) => (
                  <div key={label} className="flex-1 flex items-center gap-2">
                    <div
                      className={`h-8 w-8 grid place-items-center rounded-full text-xs font-semibold transition ${i <= postStep ? "gradient-primary text-primary-foreground" : "bg-surface border border-border text-muted-foreground"}`}
                    >
                      {i < postStep ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <div className="text-xs hidden sm:block">{t(label)}</div>
                    {i < stepLabels.length - 1 && (
                      <div className={`flex-1 h-px ${i < postStep ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                ))}
              </div>

              {postStep === 0 && (
                <Section title={t("step_campaign")}>
                  <Field
                    label={t("campaignName")}
                    required
                    error={errors.name}
                    id="field-post-name"
                  >
                    <input
                      id="input-post-name"
                      value={post.name}
                      onChange={(e) => setPo("name", e.target.value)}
                      className={`${inputCls} ${errors.name ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                      placeholder={t("campaignNamePh")}
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label={L("Target Location", "الموقع الجغرافي المستهدف")}
                      required
                      error={errors.location}
                      id="field-post-location"
                    >
                      <input
                        id="input-post-location"
                        value={post.location}
                        onChange={(e) => setPo("location", e.target.value)}
                        placeholder={t("location")}
                        className={`${inputCls} ${errors.location ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                      />
                    </Field>
                    <Field
                      label={L("Target Demographics (optional)", "الجمهور المستهدف (اختياري)")}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={post.age}
                          onChange={(e) => setPo("age", e.target.value)}
                          placeholder={t("age")}
                          className={inputCls}
                        />
                        <input
                          value={post.gender}
                          onChange={(e) => setPo("gender", e.target.value)}
                          placeholder={t("gender")}
                          className={inputCls}
                        />
                      </div>
                    </Field>
                  </div>
                  <Field
                    label={t("duration")}
                    required
                    error={errors.start || errors.end}
                    id="field-post-duration"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">
                          {L("Start date", "تاريخ البدء")}
                        </span>
                        <input
                          type="date"
                          value={post.start}
                          onChange={(e) => setPo("start", e.target.value)}
                          className={`${inputCls} ${errors.start ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">
                          {L("End date", "تاريخ الانتهاء")}
                        </span>
                        <input
                          type="date"
                          value={post.end}
                          onChange={(e) => setPo("end", e.target.value)}
                          className={`${inputCls} ${errors.end ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                        />
                      </div>
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={t("budgetOptional")}>
                      <input
                        value={post.budget}
                        onChange={(e) => setPo("budget", e.target.value)}
                        className={inputCls}
                        placeholder="$"
                      />
                    </Field>
                    <Field
                      label={L(
                        "Competitor reference / Page URL (optional)",
                        "مرجع صفحة المنافس (اختياري)",
                      )}
                    >
                      <input
                        value={post.competitor || ""}
                        onChange={(e) => setPo("competitor", e.target.value)}
                        className={inputCls}
                        placeholder="e.g. competitor-brand.com"
                      />
                    </Field>
                  </div>
                  <Field label={L("Local Dialect", "اللهجة الثقافية المحلية")}>
                    <select
                      value={post.dialect}
                      onChange={(e) => setPo("dialect", e.target.value)}
                      className={`${inputCls} dark:bg-zinc-900 border-border rounded-xl px-3 py-2 text-sm`}
                    >
                      <option value="standard">
                        {L("Standard Arabic (Fusha)", "العربية الفصحى (فصحى)")}
                      </option>
                      <option value="algerian">
                        {L("Algerian Dialect", "لهجة جزائرية (دارجة وعامية")}
                      </option>
                      <option value="egyptian">{L("Egyptian Dialect", "لهجة مصرية")}</option>
                      <option value="gulf">{L("Gulf Dialect", "لهجة خليجية")}</option>
                      <option value="levantine">{L("Levantine Dialect", "لهجة شامية")}</option>
                      <option value="english">
                        {L("English (Universal)", "الإنجليزية (العالمية)")}
                      </option>
                    </select>
                  </Field>
                </Section>
              )}

              {postStep === 1 && (
                <Section title={t("step_platforms")}>
                  <Field
                    label={t("platformsLabel")}
                    required
                    error={errors.platforms}
                    id="field-post-platforms"
                  >
                    <div
                      className={`grid grid-cols-3 gap-2 p-1 rounded-xl transition ${
                        errors.platforms
                          ? "border border-destructive/80 ring-2 ring-destructive/20"
                          : ""
                      }`}
                    >
                      {platformsPost.map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => togglePoPlat(id)}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-sm transition cursor-pointer ${
                            post.platforms.includes(id)
                              ? "bg-primary/15 border-primary"
                              : "bg-surface border-border hover:border-primary/50"
                          }`}
                        >
                          <Icon className="h-5 w-5" /> {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label={L("Post URL (optional)", "رابط المنشور (اختياري)")}>
                    <input
                      value={post.postUrl}
                      onChange={(e) => setPo("postUrl", e.target.value)}
                      placeholder="https://…"
                      className={inputCls}
                    />
                  </Field>
                </Section>
              )}

              {postStep === 2 && (
                <Section title={t("step_metrics")}>
                  {/* Dynamic OCR Screenshot Reader */}
                  <div className="mb-6 p-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex flex-col items-center text-center">
                    <Upload className="h-8 w-8 text-primary/75 mb-2" />
                    <span className="text-xs font-bold block mb-1">
                      {L(
                        "Auto-Extract Metrics from Screenshot",
                        "استخراج الإحصائيات تلقائياً من لقطة شاشة",
                      )}
                    </span>
                    <p className="text-[10px] text-muted-foreground max-w-sm mb-3">
                      {L(
                        "Upload clean campaign graph or insights report (FB/IG/TikTok Manager). Gemini extracts data to auto-fill form values instantly.",
                        "ارفع صورة للوحة الإحصائيات من مدير الإعلانات وسيقوم محرك جيميناي باستخراج الأرقام وتعبئتها بالكامل يدوياً.",
                      )}
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      id="ocr-uploader-file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = reader.result as string;
                            setOcrLoading(true);
                            setOcrMessage(
                              L(
                                "Google Gemini is executing OCR details extraction...",
                                "جاري فك تشفير الصورة واستخراج الأرقام بالذكاء الاصطناعي...",
                              ),
                            );
                            try {
                              const res = await parseScreenshotData({
                                data: { imageBase64: base64, mimeType: file.type, language: lang },
                              });
                              if (res) {
                                if (res.views !== undefined && res.views !== null)
                                  setPo("views", String(res.views));
                                if (res.likes !== undefined && res.likes !== null)
                                  setPo("likes", String(res.likes));
                                if (res.comments !== undefined && res.comments !== null)
                                  setPo("comments", String(res.comments));
                                if (res.shares !== undefined && res.shares !== null)
                                  setPo("shares", String(res.shares));
                                if (res.saves !== undefined && res.saves !== null)
                                  setPo("saves", String(res.saves));
                                if (res.clicks !== undefined && res.clicks !== null)
                                  setPo("clicks", String(res.clicks));
                                setOcrMessage(
                                  L(
                                    "Data extracted successfully and populated below!",
                                    "تم استخراج البيانات وتعبئتها في النموذج أدناه بنجاح!",
                                  ) +
                                    " (" +
                                    res.extractedMeta +
                                    ")",
                                );
                              }
                            } catch (err) {
                              console.error(err);
                              setOcrMessage(
                                L(
                                  "Failed to scan visual elements. Fill metrics manually instead.",
                                  "تعذر مسح الصورة، يرجى كتابة البيانات يدوياً بمرونة.",
                                ),
                              );
                            } finally {
                              setOcrLoading(false);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <label
                      htmlFor="ocr-uploader-file"
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer flex items-center gap-1 transition"
                    >
                      {ocrLoading ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <ImageIcon className="h-3 w-3" />
                      )}
                      {L("Upload Dashboard Image", "ارفع صورة الإحصائيات")}
                    </label>

                    {ocrMessage && (
                      <div className="mt-3 text-[11px] text-primary bg-primary/10 px-3 py-1.5 rounded-lg font-medium">
                        {ocrMessage}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {metricFields.map(([k, lk]) => {
                      const isViews = k === "views";
                      return (
                        <Field
                          key={k}
                          label={t(lk)}
                          required={isViews}
                          error={isViews ? errors.views : undefined}
                          id={isViews ? "field-post-views" : undefined}
                        >
                          <input
                            id={isViews ? "input-post-views" : undefined}
                            value={post[k]}
                            onChange={(e) => setPo(k, e.target.value)}
                            className={`${inputCls} ${isViews && errors.views ? "border-destructive ring-2 ring-destructive/20 focus:border-destructive" : ""}`}
                            placeholder={isViews ? L("e.g. 50000", "مثال: 50000") : "0"}
                          />
                        </Field>
                      );
                    })}
                  </div>
                </Section>
              )}

              {bannerError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-2.5 shadow-sm"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                  <div className="flex-1 leading-relaxed">{bannerError}</div>
                </motion.div>
              )}

              <div className="flex gap-3 mt-6">
                {postStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setPostStep(postStep - 1)}
                    className="flex-1 py-3.5 rounded-2xl border border-border bg-surface font-medium hover:bg-surface-elevated transition cursor-pointer"
                  >
                    {t("back")}
                  </button>
                )}
                {postStep < lastStep ? (
                  <button
                    type="button"
                    onClick={handleNextPostStep}
                    className="flex-1 gradient-primary text-primary-foreground py-3.5 rounded-2xl font-semibold glow-ring flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 shadow-md transition"
                  >
                    {t("continue")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitPost}
                    className="flex-1 gradient-primary text-primary-foreground py-3.5 rounded-2xl font-semibold glow-ring cursor-pointer hover:opacity-95 shadow-md transition"
                  >
                    {t("submit")}
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}

const inputCls =
  "w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 space-y-5 mb-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {title}
      </div>
      {children}
    </div>
  );
}
function Field({
  label,
  required,
  error,
  id,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="block space-y-1.5 transition-all text-start">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer">
          <span>{label}</span>
          {required && (
            <span
              className="text-destructive font-black text-sm leading-none"
              title="Required / إلزامي"
            >
              *
            </span>
          )}
        </label>
        {required && (
          <span className="text-[10px] text-destructive/90 font-medium bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20">
            * Required
          </span>
        )}
      </div>
      <div>{children}</div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive flex items-center gap-1.5 font-medium mt-1"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
}
function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-3 py-2.5 rounded-xl text-sm border transition ${
        active
          ? "bg-primary/15 border-primary text-foreground"
          : "bg-surface border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
function ModeCard({
  Icon,
  title,
  desc,
  onClick,
  highlight,
}: {
  Icon: any;
  title: string;
  desc: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-start glass-card p-6 hover:scale-[1.01] transition relative overflow-hidden group ${highlight ? "ring-1 ring-primary/40" : ""}`}
    >
      {highlight && (
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, oklch(0.55 0.24 275 / 0.4), transparent 60%)",
          }}
        />
      )}
      <div className="relative">
        <div className="h-12 w-12 rounded-2xl gradient-primary grid place-items-center glow-ring mb-4">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="font-display font-bold text-lg mb-1">{title}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-primary font-medium">
          {title} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </div>
      </div>
    </button>
  );
}
