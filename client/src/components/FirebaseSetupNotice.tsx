import { missingFirebaseEnvVars } from "../firebase";

function FirebaseSetupNotice() {
  return (
    <div>
      <h1>Firebase not configured</h1>
      <p>
        Copy <code>client/.env.example</code> to <code>client/.env</code>, fill in
        your Firebase values, then restart the dev server (
        <code>npm run dev</code>).
      </p>
      <p>Missing variables:</p>
      <ul>
        {missingFirebaseEnvVars.map((key) => (
          <li key={key}>
            <code>{key}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FirebaseSetupNotice;
