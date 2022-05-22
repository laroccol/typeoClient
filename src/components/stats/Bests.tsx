import React from "react";
import StatSection from "./components/StatSection";

const stats = [
  { title: "WPM", stat: 120 },
  { title: "Accuracy", stat: 95.4 },
  { title: "Characters", stat: 3.4 },
];

export default function Bests() {
  const [timeframe, setTimeframe] = React.useState<string>("0");

  return (
    <>
      <StatSection
        title="Bests"
        data={stats}
        timeFrame={timeframe}
        setTimeFrame={setTimeframe}
      />
    </>
  );
}
