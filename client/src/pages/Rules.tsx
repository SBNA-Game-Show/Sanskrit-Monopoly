import { ruleSections } from "../game/monopolyRules";

function Rules() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-orange-50 px-6 py-10">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="m-0 text-3xl font-extrabold text-slate-800">
          Thems the Rules
        </h1>

        <div className="mt-8 space-y-6">
          {ruleSections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-orange-100 bg-orange-50 p-5"
            >
              <h2 className="m-0 text-xl font-bold text-slate-800">
                {section.title}
              </h2>

              <p className="mt-2 text-slate-600">{section.body}</p>

              {section.bullets && (
                <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-600">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Rules;
