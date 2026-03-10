import React from "react";

export default function AdminTabs({ ui, tab, setTab }) {
  const tabs = [
    { key: "org", label: "Org" },
    { key: "fields", label: "Fields" },
    { key: "cases", label: "Cases" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginTop: 10,
      }}
    >
      {tabs.map((t) => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              ...ui.btn,
              ...(active ? ui.btnPrimary : ui.btnGhost),
              padding: "10px 14px",
              opacity: active ? 1 : 0.9,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
