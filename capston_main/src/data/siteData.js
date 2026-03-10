// src/data/siteData.js

export const STORAGE_KEY = "capstone_site_data_v2";

export const defaultData = {
  brand: {
    logoText: "CAPSTONE",
    nav: [
      { id: "org", label: "Organization" },
      { id: "valuesWork", label: "Value&Work" },
      { id: "fields", label: "Fields" },
      { id: "cases", label: "Cases" },
      { id: "contact", label: "Contact" },
    ],
  },

  media: {
    introVideoSrc: "",
    introEndPauseMs: 1000,
    logoMaskSrc: "/capstone_logo_2.png",

    introHeightDesktop: "100dvh",
    introMinHeightDesktop: 520,
    introVideoScaleDesktop: 1.0,

    introHeightMobile: "56vh",
    introMinHeightMobile: 360,

    keepAspectOnMobile: true,
    introVideoScaleMobile: 0.9,
    introVideoObjectPositionMobile: "center center",
  },

  layout: {
    sectionPadDesktopY: 110,
    sectionPadDesktopX: 40,
    sectionPadMobileY: 56,
    sectionPadMobileX: 16,
    headerHeight: 64,
    containerMax: 1280,
  },

  sectionBg: {
    intro: [
      "/Back_image/A-1.jpg",
      "/Back_image/A-2.jpg",
      "/Back_image/A-5.jpg",
    ],
    org: "/Back_image/Org_Image.webp",
    valuesWork: "/Back_image/A-4.jpg",
    fields: "/Back_image/Rolling_Image.jpg",
  },

  main: {
    tagTitle: "About us",
    tagSub: "회사소개",
    title: "MICE 산업 전문기업",
    subtitle: "각 분야의 전문가들이 최고의 행사를 기획 및 운영합니다.",
    bullets: [
      "PCO: 국제회의, 컨퍼런스, 포럼, 심포지엄, 학술대회, 세미나 등 학술관련 프로그램 기획 및 운영",
      "Event & Exhibition: 기념식, 시상식, 비전선포식, 프로모션 등 부대행사 기획 및 운영",
      "Design & Journal: 온/오프라인 디자인 기획 및 운영, 편집 및 인쇄",
      "On-Line: 온라인 회의 기획 및 운영, 홈페이지 제작, 중계시스템 운영",
    ],
    heroMedia: { src: "", type: "image" },
  },

  org: {
    tagTitle: "About us",
    tagSub: "회사소개",
    title: "조직도 및 인원 현황",
    subtitle: "실무 경력자들의 경험과 노하우를 보유한 전문가 집단",

    ceo: { title: "대표이사" },

    offices: [{ title: "전략기획실" }, { title: "경영지원실" }],

    divisions: [
      { title: "기획 본부", teams: ["1 TEAM", "2 TEAM", "3 TEAM"] },
      { title: "디자인 본부", teams: ["1 TEAM", "2 TEAM"] },
      { title: "온라인 본부", teams: ["1 TEAM", "2 TEAM"] },
      { title: "영상제작 본부", teams: ["1 TEAM"] },
    ],
  },

  values: {
    tagTitle: "About us",
    tagSub: "회사소개",
    title: "핵심가치",
    items: [
      {
        title: "책임",
        body: "맡은 업무에\n강한 책임감을 바탕으로\n고객만족 실현",
      },
      {
        title: "신뢰",
        body: "투입되는 모든 인력의\n전문성과 신뢰를 바탕으로\n성공적인 프로젝트 수행",
      },
      {
        title: "성실",
        body: "경험과 노하우를 바탕으로\n상호 소통·협력하여\n선을 이루는 결과 도출",
      },
      {
        title: "열정",
        body: "변화하는 기술과 트렌드를\n반영하여 사업의\n핵심 가치를 실현",
      },
    ],
  },

  work: {
    tagTitle: "Business",
    tagSub: "사업영역",
    title: "주요 업무",
    subtitle: "안정된 행사 운영과 효율적인 업무 진행",
    backgroundImageSrc: "/Back_image/A-4.jpg",
    items: [
      {
        t: "참가자 관리",
        d: "지속적으로 관리할 수 있는 DATA 폼을 마련,\n관심을 유도하는 프로모션 진행",
      },
      {
        t: "체계적인 일정관리",
        d: "성공적인 행사 개최를 위해 단계별, 업무별 체크\n수립과 실행을 통한 효율적인 업무 수행",
      },
      {
        t: "커뮤니케이션",
        d: "성공적인 행사 준비, 전담 TF팀 구성,\n효율적인 업무 공조 및 지원",
      },
      {
        t: "운영/의전 매뉴얼 구축",
        d: "행사 진행 시 발생될 수 있는 모든 상황 별\n대응 시나리오 수립 및 매뉴얼화를 통한 안전한 행사운영",
      },
      {
        t: "체계적인 보고/검토",
        d: "주/월간 보고 등 체계적인 보고와 최적화된\n커뮤니케이션 프로세스를 통한 효율적인 업무 추진",
      },
      {
        t: "철저한 시설 및 안전 관리",
        d: "각종 제작물, 시설물 등에 대한 철저한 사전 준비를\n통해 안전한 행사 진행",
      },
      {
        t: "효율적인 인력운영",
        d: "부문별 필요인력 선발 교육 및 추가 충원계획\n수립을 통한 효율적인 인력 운영",
      },
      {
        t: "체계적인 조직/업무관리",
        d: "체계적인 업무 수행과 성공적인 사업 전개를 위하여\n각 부서별 업무분장 및 효율적인 커뮤니케이션 전개",
      },
    ],
  },

  fields: {
    tagTitle: "Business",
    tagSub: "사업영역",
    title: "주요 사업분야",
    subtitle:
      "정부, 공공기관, 학술단체 및 민간기업 등이 개최하는 국내/외 행사",
    summaryLines: [
      "VIP, 국무총리, 장관급 등 격식 행사",
      "국제회의, 컨퍼런스, 포럼, 심포지엄, 학술대회, 세미나 등 학술관련 행사",
      "기념식, 시상식, 비전선포식, 프로모션 등 부대 행사",
      "온라인 및 하이브리드 행사",
    ],
    rollingPhotos: [
      { src: "", label: "KoNECT 컨퍼런스" },
      { src: "", label: "14th IPVE 심포지엄" },
      { src: "", label: "국제디스플레이 전시회" },
      { src: "", label: "LINC+ 산학협력 성과확산 포럼" },
      { src: "", label: "해외의료기기 규제동향 포럼" },
    ],
  },

  cases: {
    tagTitle: "Business",
    tagSub: "사업영역",
    blocks: [
      {
        title: "대형 행사 경험과 노하우 보유",
        subtitle: "VIP, 국무총리, 장관급 행사 등",
        images: [
          { src: "", label: "IMAGE 1" },
          { src: "", label: "IMAGE 2" },
          { src: "", label: "IMAGE 3" },
          { src: "", label: "IMAGE 4" },
          { src: "", label: "IMAGE 5" },
        ],
      },
      {
        title: "컨퍼런스, 심포지엄 등 학술관련 프로그램 운영의 전문성 보유",
        subtitle: "컨퍼런스, 심포지엄, 학술대회, 세미나 등",
        images: [
          { src: "", label: "IMAGE 1" },
          { src: "", label: "IMAGE 2" },
          { src: "", label: "IMAGE 3" },
          { src: "", label: "IMAGE 4" },
          { src: "", label: "IMAGE 5" },
        ],
      },
      {
        title: "부대행사 실행 능력의 전문성 보유",
        subtitle: "비전선포식, 기념식, MOU 등",
        images: [
          { src: "", label: "IMAGE 1" },
          { src: "", label: "IMAGE 2" },
          { src: "", label: "IMAGE 3" },
          { src: "", label: "IMAGE 4" },
        ],
      },
    ],
  },

  contact: {
    title: "CONTACT",
    desc: "여러분과 언제든 함께할 수 있도록 24시간 열려 있습니다.\n간단한 정보를 작성해주시면, 빠른 시일 내에 회신 드리겠습니다 :)",
    companyName: "주식회사 캡스톤그룹",
    address: "서울시 서대문구 신촌로25, 2층(창천동, 상록빌딩)",
    tel: "02-6010-8500",
    email: "info@capstone-pco.com",
  },

  contactForm: {
    title: "Send a Message",
    fields: {
      name: "성명",
      org: "소속",
      phone: "핸드폰번호",
      email: "이메일주소",
      inquiry: "문의사항",
      submit: "전송",
    },
  },

  theme: {
    fontFamily: "GmarketSans",
    accent: "#C7A66A",
    brand: "#C7A66A",
    secondary: "#8D6B3F",
    name: "dark",
  },
};

export function deepMerge(base, patch) {
  if (Array.isArray(base)) return Array.isArray(patch) ? patch : base;
  if (typeof base !== "object" || base === null) return patch ?? base;

  const out = { ...base };
  for (const k of Object.keys(patch || {})) {
    out[k] = k in base ? deepMerge(base[k], patch[k]) : patch[k];
  }
  return out;
}

function migrateNav(defaultNav, savedNav) {
  const d = Array.isArray(defaultNav) ? defaultNav : [];
  const s = Array.isArray(savedNav) ? savedNav : [];

  const map = new Map(
    s.map((x) => [String(x?.id || "").replace(/^#/, ""), x])
  );

  return d
    .map((n) => {
      const id = String(n?.id || "").replace(/^#/, "");
      const old = map.get(id);
      return old ? { ...n, ...old, id } : { ...n, id };
    })
    .filter((x) => x && x.id);
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;

    const saved = JSON.parse(raw);
    const merged = deepMerge(defaultData, saved);

    const defaultNav = defaultData?.brand?.nav || [];
    const savedNav = saved?.brand?.nav || merged?.brand?.nav || [];
    merged.brand = merged.brand || {};
    merged.brand.nav = migrateNav(defaultNav, savedNav);

    return merged;
  } catch {
    return defaultData;
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}