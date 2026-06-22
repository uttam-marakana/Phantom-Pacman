import { useState } from "react";
import Marquee from "./components/Marquee";
import ModePicker from "./components/ModePicker";
import SoloGame from "./views/SoloGame";
import OnlineGame from "./views/OnlineGame";

export default function App() {
  const [mode, setMode] = useState("solo");

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-md">
        <Marquee />
        <ModePicker mode={mode} onChange={setMode} />
        {mode === "solo" ? <SoloGame /> : <OnlineGame />}
      </div>
    </div>
  );
}
