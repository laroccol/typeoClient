import { Typography } from "@mui/material";
import React from "react";
import { Bar } from "react-chartjs-2";
import { BarChartData } from "../../../constants/graphs";
import { GridCard } from "../../common";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#ababab";

export default function MissedSequences({
  missedSequences,
  responsiveChart,
}: {
  missedSequences: { [x: string]: number };
  responsiveChart?: boolean;
}) {
  const [missedSequenceData, setMissedSequenceData] =
    React.useState<BarChartData>();

  React.useEffect(() => {
    // Missed sequences
    const missedSequencesEntries = Object.entries(missedSequences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    setMissedSequenceData({
      labels: missedSequencesEntries.map((entry) =>
        entry[0].replaceAll(" ", "_")
      ),
      datasets: [
        {
          data: missedSequencesEntries.map((entry) => entry[1]),
          fill: true,
          backgroundColor: [
            "rgba(255, 99, 132, 0.3)",
            "rgba(255, 159, 64, 0.3)",
            "rgba(255, 205, 86, 0.3)",
            "rgba(75, 192, 192, 0.3)",
            "rgba(54, 162, 235, 0.3)",
            "rgba(153, 102, 255, 0.3)",
            "rgba(201, 203, 207, 0.3)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
            "rgb(153, 102, 255)",
            "rgb(201, 203, 207)",
          ],
          borderWidth: 1,
          maxBarThickness: 100,
        },
      ],
    });
  }, [missedSequences]);
  return (
    <GridCard sx={{ my: 3, textAlign: "center" }}>
      <Typography variant="h5">Missed Sequences</Typography>
      {missedSequenceData && missedSequenceData.labels.length > 0 ? (
        <Bar
          width={responsiveChart === false ? "600px" : "inherit"}
          data={missedSequenceData}
          options={{
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              yAxes: {
                ticks: {
                  callback: function (value) {
                    if ((value as number) % 1 === 0) {
                      return value;
                    }
                  },
                },
              },
            },
          }}
        />
      ) : (
        <Typography>None</Typography>
      )}
    </GridCard>
  );
}
