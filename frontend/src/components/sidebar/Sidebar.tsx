import React from "react";

type SideBarProps = {
  modes?: string[];
  activeMode?: string;
  setActiveMode?: (mode: string) => void;
};

export const Sidebar: React.FC<SideBarProps> = ({
  modes = [],
  activeMode,
  setActiveMode,
}) => {
  return (
    <aside className="sidebar">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          className={mode === activeMode ? "active" : ""}
          onClick={() => setActiveMode && setActiveMode(mode)}
        >
          {mode}
        </button>
      ))}
    </aside>
  );
};
