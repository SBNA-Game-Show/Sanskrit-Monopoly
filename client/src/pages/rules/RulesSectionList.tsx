import { useState } from "react";
import { ruleSections, type RuleBullet } from "../../content/monopolyRules";

type RuleBulletItemProps = {
  bullet: RuleBullet;
  isOpen: boolean;
  onToggle: () => void;
};

type RulesSectionListProps = {
  className?: string;
};

function RuleBulletItem({ bullet, isOpen, onToggle }: RuleBulletItemProps) {
  const hasDetail = Boolean(bullet.detail);

  return (
    <li className="border-t border-orange-100 first:border-t-0">
      <button
        type="button"
        disabled={!hasDetail}
        onClick={hasDetail ? onToggle : undefined}
        className={[
          "group flex w-full items-center gap-2 px-1 py-2.5 text-left text-sm font-semibold leading-relaxed text-slate-700 transition-colors duration-150",
          // Only interactive bullets get hover treatment, so plain rules do not feel broken.
          hasDetail
            ? "cursor-pointer hover:text-orange-700"
            : "cursor-default",
        ].join(" ")}
      >
        <span
          className={[
            "shrink-0 text-orange-500 transition-transform duration-200",
            isOpen ? "rotate-90" : "",
          ].join(" ")}
        >
          {hasDetail ? "▶" : "•"}
        </span>
        <span>{bullet.text}</span>
        {hasDetail && (
          <span className="ml-auto text-[10px] font-black uppercase tracking-wide text-orange-400 opacity-0 transition-opacity group-hover:opacity-100">
            {isOpen ? "Hide" : "More"}
          </span>
        )}
      </button>

      {isOpen && bullet.detail && (
        <div className="animate-slide-in-up rounded-xl bg-orange-50 px-3 py-3">
          <p className="text-sm font-bold text-orange-800">
            {bullet.detail.label}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {bullet.detail.description}
          </p>
        </div>
      )}
    </li>
  );
}

export function RulesSectionList({ className = "" }: RulesSectionListProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [openBulletIndex, setOpenBulletIndex] = useState<number | null>(null);

  const activeSection = ruleSections[activeSectionIndex];

  const handleSectionChange = (index: number) => {
    setActiveSectionIndex(index);
    setOpenBulletIndex(null);
  };

  return (
    <section
      className={[
        "rounded-2xl border border-orange-200 bg-[#fffdf9] p-4 shadow-sm",
        "xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto",
        className,
      ].join(" ")}
    >
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-700">
        Rulebook
      </p>

      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0">
        {ruleSections.map((section, index) => (
          <button
            key={section.title}
            type="button"
            onClick={() => handleSectionChange(index)}
            className={[
              "btn-nav shrink-0 whitespace-nowrap px-3 py-2 text-sm font-semibold xl:w-full xl:whitespace-normal",
              activeSectionIndex === index ? "btn-nav-active" : "",
            ].join(" ")}
          >
            {section.title}
          </button>
        ))}
      </nav>

      <div key={activeSection.title} className="animate-slide-in-up mt-5">
        {/* Keep the sidebar concise so the board remains the main interactive object. */}
        <h2 className="text-xl font-bold leading-tight text-slate-900">
          {activeSection.title}
        </h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
          {activeSection.body}
        </p>

        {activeSection.bullets && activeSection.bullets.length > 0 && (
          <ul className="mt-4">
            {activeSection.bullets.map((bullet, index) => (
              <RuleBulletItem
                key={bullet.text}
                bullet={bullet}
                isOpen={openBulletIndex === index}
                onToggle={() =>
                  setOpenBulletIndex((currentIndex) =>
                    currentIndex === index ? null : index,
                  )
                }
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
