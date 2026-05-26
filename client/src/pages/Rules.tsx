// Rules.tsx

import { useState } from "react";
import { ruleSections, type RuleBullet } from "../content/monopolyRules";

// animated panel
// expands under a bullet
type BulletDetailPanelProps = {
  bullet: RuleBullet;
  onClose: () => void;
};

// --
// render expandable detail card beneath clicked bullet
function BulletDetailPanel({ bullet, onClose }: BulletDetailPanelProps) {
  if (!bullet.detail) return null; // avoid crash if bullet is empty (oops)

  return (
    <div className="animate-slide-in-up card-inset mt-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-orange-700">
          {bullet.detail.label}
        </p>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail"
          className="btn-ghost rounded-full px-2 py-0.5 text-xs"
        >
          ✕
        </button>
      </div>

      <p className="text-sm leading-relaxed text-slate-600">
        {bullet.detail.description}
      </p>
    </div>
  );
}

// --
// renders one bullet
// two types: plain (can't interact) and interactive (has details)
type RuleBulletItemProps = {
  bullet: RuleBullet;
  isOpen: boolean;
  onToggle: () => void;
};

function RuleBulletItem({ bullet, isOpen, onToggle }: RuleBulletItemProps) {
  const hasDetail = !!bullet.detail;

  return (
    <li className="flex flex-col">
      <button
        type="button"
        disabled={!hasDetail}
        onClick={hasDetail ? onToggle : undefined}
        className={[
          "group flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm text-slate-600 transition-colors duration-150",
          // only show the pointer & hover highlight when there's something to actually open
          hasDetail
            ? "cursor-pointer hover:bg-orange-100 hover:text-slate-800"
            : "cursor-default",
        ].join(" ")}
      >
        {/* show the rotating triangle thingie if it's interactive*/}
        <span
          className={[
            "mt-0.5 shrink-0 text-orange-400 transition-transform duration-200",
            hasDetail ? "text-xs" : "text-[8px]",
            isOpen ? "rotate-90" : "",
          ].join(" ")}
        >
          {hasDetail ? "▶" : "●"}
        </span>

        <span>{bullet.text}</span>

        {/* conditional for 'show more' and 'hide' hint */}
        {hasDetail && (
          <span className="ml-auto text-[10px] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
            {isOpen ? "hide" : "show more"}
          </span>
        )}
      </button>

      {isOpen && <BulletDetailPanel bullet={bullet} onClose={onToggle} />}
    </li>
  );
}

// ---
// render the body text and bullet list for currently active sidebar tab
type SectionContentProps = {
  sectionIndex: number;
};

function SectionContent({ sectionIndex }: SectionContentProps) {
  const section = ruleSections[sectionIndex];

  // Track which bullet is expanded. Only one open at a time.
  const [openBullet, setOpenBullet] = useState<number | null>(null);

  const handleBulletToggle = (idx: number) => {
    setOpenBullet((prev) => (prev === idx ? null : idx));
  };

  return (
    <div key={sectionIndex} className="animate-slide-in-up flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">
          {section.title}
        </h2>
        <p className="mt-2 text-slate-600 leading-relaxed">{section.body}</p>
      </div>

      {section.bullets && section.bullets.length > 0 && (
        <ul className="flex flex-col gap-1">
          {section.bullets.map((bullet, idx) => (
            <RuleBulletItem
              key={bullet.text}
              bullet={bullet}
              isOpen={openBullet === idx}
              onToggle={() => handleBulletToggle(idx)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Page ---

function Rules() {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <main className="page-shell">
      <div className="page-content">
        <h1 className="mb-6 text-3xl font-extrabold text-slate-800">
          Thems the Rules
        </h1>

        <div className="card flex gap-6 p-0 overflow-hidden">
          {/* Sidebar */}
          <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-orange-100 p-4">
            {ruleSections.map((section, idx) => (
              <button
                key={section.title}
                type="button"
                onClick={() => {
                  setActiveSection(idx);
                }}
                className={[
                  "btn-nav",
                  activeSection === idx ? "btn-nav-active" : "",
                ].join(" ")}
              >
                {section.title}
              </button>
            ))}
          </nav>

          {/* Content area */}
          <div className="flex-1 p-6">
            <SectionContent key={activeSection} sectionIndex={activeSection} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Rules;
