import { ruleSections } from "../game/monopolyRules";

function Rules() {
  return (
    <main>
      <h1>Thems the Rules</h1>

      {ruleSections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>

          {section.bullets && (
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}

export default Rules;
