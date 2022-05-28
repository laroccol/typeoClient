import React from "react";
import { Button, Dialog, Typography, Box, useTheme } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { WPMData } from "../../../../constants/race";
import "chartjs-adapter-date-fns";
import { GridCard } from "../../../common";
import { GraphData } from "../../../../constants/graphs";
import { ResultsData } from "../../../../constants/race";

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ResultsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: ResultsData;
}

export default function Results({
  open,
  setOpen,
  data: { dataPoints, accuracy, characters, testType },
}: ResultsProps) {
  const [graphData, setGraphData] = React.useState<GraphData>();
  const [wpm, setWPM] = React.useState<number>(0);

  const theme = useTheme();

  React.useEffect(() => {
    // Update Graph
    if (dataPoints.length < 2) return;
    const totalTestTime =
      (dataPoints[dataPoints.length - 1].timestamp -
        dataPoints[0].timestamp +
        1000) /
      1000;
    const newData = dataPoints.map((val, index) => {
      return {
        x:
          index !== dataPoints.length - 1
            ? `${index + 1}`
            : totalTestTime.toFixed(1),
        y: val.wpm,
      };
    });

    if (totalTestTime - dataPoints.length < 0.15) {
      newData.splice(newData.length - 1, 1);
    }

    setGraphData({
      datasets: [
        {
          label: " wpm ",
          data: newData,
          fill: true,
          borderColor: theme.palette.info.main,
          tension: 0.1,
        },
      ],
    });

    // Update text
    setWPM(dataPoints[dataPoints.length - 1].wpm);
  }, [dataPoints, accuracy, characters, testType]);

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg">
        <Box padding={5} textAlign="center">
          <GridCard sx={{ marginBottom: 3 }}>
            <Typography variant="h3">WPM: {wpm.toFixed(1)}</Typography>
            <Typography>Accuracy: {accuracy.toFixed(1)}</Typography>
            <Typography>
              Character: {characters.correct} / {characters.incorrect}
            </Typography>
            <Typography>
              Test Type: {testType.name}
              {testType.amount ? `, ${testType.amount}` : null}
            </Typography>
          </GridCard>
          {graphData ? (
            <GridCard>
              <Box height="50vh" width="50vw">
                <Line
                  data={graphData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      xAxes: {
                        ticks: {
                          autoSkip: true,
                          maxTicksLimit: 30,
                        },
                      },
                      yAxes: {
                        ticks: {
                          maxTicksLimit: 5,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </GridCard>
          ) : null}
          <Button onClick={() => setOpen(false)}>Leave</Button>
        </Box>
      </Dialog>
    </>
  );
}
