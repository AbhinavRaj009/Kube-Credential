import IssuePage from "./pages/IssuePage";
import VerifyPage from "./pages/VerifyPage";

export default function App() {
  const isVerify = typeof window !== 'undefined' && window.location.pathname === "/verify";
  return (
    <div>
      <nav style={{ display:"flex", gap:12, padding:12, borderBottom:"1px solid #ddd" }}>
        <a href="/">Issue</a>
        <a href="/verify">Verify</a>
      </nav>
      <div>
        {isVerify ? <VerifyPage/> : <IssuePage/>}
      </div>
    </div>
  );
}
