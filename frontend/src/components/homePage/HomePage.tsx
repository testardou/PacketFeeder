import React, { useState } from "react";
import { Sidebar } from "../sidebar/Sidebar"; // ajuster le chemin si besoin
import { Replay } from "../replay/Replay"; // ajuster le chemin si besoin

export const HomePage: React.FC = () => {
  const modes = ["replay"];
  const [activeMode, setActiveMode] = useState<string>(modes[0]);

  return (
    <div className="flex flex-row">
      <Sidebar
        modes={modes}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />
      <main>{activeMode === "replay" ? <Replay /> : <div>Home Page</div>}</main>
    </div>
  );
};

export default HomePage;
