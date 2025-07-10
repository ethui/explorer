import clsx from "clsx";
import { useEffect, useState } from "react";

interface Tabs {
  tabs: {
    label: string;
    component: React.ReactNode;
  }[];
  tabIndex?: number;
}

export function Tabs({ tabs, tabIndex = 0 }: Tabs) {
  const [selectedTab, setSelectedTab] = useState(tabs[tabIndex]);

  useEffect(() => {
    if (tabs[tabIndex]) {
      setSelectedTab(tabs[tabIndex]);
    }
  }, [tabIndex, tabs]);

  return (
    <div className="flex flex-col gap-4 pt-8">
      <div className="flex flex-row gap-4">
        {tabs.map((tab) => (
          <div key={tab.label} className="flex items-center gap-2">
            <button
              type="button"
              className={clsx(
                "flex w-fit cursor-pointer items-center gap-2 rounded-xl border bg-gray-200 p-2 font-semibold hover:bg-gray-300",
                selectedTab.label === tab.label &&
                  "!bg-sky-600 text-white hover:bg-sky-600 hover:text-white",
              )}
              onClick={() => setSelectedTab(tab)}
            >
              <span className="text-xs">{tab.label}</span>
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.label}
            className={clsx(
              selectedTab.label === tab.label ? "block" : "hidden",
            )}
          >
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  );
}
