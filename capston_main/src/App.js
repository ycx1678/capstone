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

// 네 프로젝트에서 실제 사용하는 관리자 페이지 import 경로로 유지
// 기존 경로가 맞으면 그대로 두고,
// 만약 AdminConsolePage를 직접 쓰면 아래 줄만 바꿔라.
// import AdminPage from "./pages/admin_console/AdminConsolePage";
import AdminPage from "./pages/AdminPageTemp";

function normalizeHash(raw) {
  const h = raw || "#/";
  if (h === "#admin") return "#/admin";
  return h;
}

export default function App() {
  const { data, setData, saveError, loading, save, saving } = useSiteStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [hash, setHash] = useState(() => normalizeHash(window.location.hash));

  useEffect(() => {
    const onHash = () => setHash(normalizeHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isAdmin = hash.startsWith("#/admin");

  const styles = useMemo(() => {
    if (isAdmin) return null;
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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0b0d12",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        Loading...
      </div>
    );
  }

  if (isAdmin) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #0b0d12; }
          body { overflow-x: hidden; }
        `}</style>

        <AdminPage
          data={data}
          setData={setData}
          saveError={saveError}
          save={save}
          saving={saving}
        />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: transparent; }
        body { overflow-x: hidden; }
      `}</style>

      <Header data={data} styles={styles} />

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