// src/App.js
import "./styles/fonts.css";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useSiteStore } from "./hooks/useSiteStore";
import { getSiteStyles } from "./styles/siteStyles";

import Header from "./components/Header";
import IntroSection from "./components/sections/IntroSection";
import OrgSection from "./components/sections/OrgSection";
import ValuesWorkSection from "./components/sections/ValuesWorkSection";
import FieldsSection from "./components/sections/FieldsSection";
import CasesSection from "./components/sections/CasesSection";
import ContactSection from "./components/sections/ContactSection";
import AdminPage from "./pages/AdminPageTemp";

function normalizeHash(raw) {
  const h = raw || "#/";
  if (h === "#admin") return "#/admin";
  return h;
}

export default function App() {
  const { data, setData, saveError } = useSiteStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [hash, setHash] = useState(() => normalizeHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setHash(normalizeHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isAdmin = hash.startsWith("#/admin");

  // ✅ 훅 순서 고정: admin이어도 useMemo는 항상 호출
  const styles = useMemo(() => {
    if (isAdmin) return null; // admin일 때는 메인 styles 계산 스킵
    return getSiteStyles({ data, isMobile });
  }, [isAdmin, data, isMobile]);

  const headerHeight = data?.layout?.headerHeight ?? 74;

  const INTRO_BG = "#2b2628";

  const themesBySection = {
    intro: "dark",
    org: "dark",
    valuesWork: "light",
    fields: "light",
    cases: "dark",
    contact: "dark",
  };

  // ✅ Admin 페이지
  if (isAdmin) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; }
          html, body { margin:0; padding:0; background:#0b0d12; }
          body { overflow-x: hidden; }
        `}</style>
        <AdminPage data={data} setData={setData} saveError={saveError} />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin:0; padding:0; background: transparent; }
        body { overflow-x: hidden; }
      `}</style>

      {/* ✅ Header는 폰트 제외(기존 유지) */}
      <Header data={data} styles={styles} />

      {/* ✅ Header 제외한 전체에만 GmarketSans 강제 적용 */}
      <div style={{ fontFamily: '"GmarketSans", system-ui, sans-serif' }}>
        <IntroSection
          data={data}
          isMobile={isMobile}
          styles={styles}
          theme={themesBySection.intro}
          headerHeight={headerHeight}
          headerIsFixed={true}
          introBg={INTRO_BG}
        />

        <OrgSection
          data={data}
          isMobile={isMobile}
          styles={styles}
          theme={themesBySection.org}
        />

        <ValuesWorkSection
          data={data}
          isMobile={isMobile}
          styles={styles}
          theme={themesBySection.valuesWork}
          headerHeight={headerHeight}
        />

        <FieldsSection
          data={data}
          isMobile={isMobile}
          styles={styles}
          theme={themesBySection.fields}
        />

        <CasesSection
          data={data}
          isMobile={isMobile}
          styles={styles}
          theme={themesBySection.cases}
        />

        <ContactSection
          data={data}
          isMobile={isMobile}
          styles={styles}
          theme={themesBySection.contact}
        />
      </div>
    </div>
  );
}
