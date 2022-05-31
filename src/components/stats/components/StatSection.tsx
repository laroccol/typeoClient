import { Divider, Grid, Box, Typography } from "@mui/material";
import React from "react";
import { GridCard } from "../../common";
import StatCard from "../components/StatCard";
import { RaceStats } from "../../../constants/stats";

interface StatSectionProps {
  data: RaceStats;
  title: string;
}

export default function StatSection({ data, title }: StatSectionProps) {
  return (
    <>
      <GridCard sx={{ my: 3, width: "99%" }}>
        <Box paddingBottom={2}>
          <Typography variant="h5" display="inline-block">
            {title}
          </Typography>
          <Divider />
        </Box>
        <Grid container spacing={3}>
          {Object.entries(data).map(([name, value]) => (
            <Grid
              zeroMinWidth
              key={`${name}_${value}`}
              item
              xs={12}
              sm={12}
              md={6}
              lg={4}
              xl={2.5}
            >
              <StatCard title={formatName(name)} stat={value} />
            </Grid>
          ))}
        </Grid>
      </GridCard>
    </>
  );
}

const formatName = (name: string) => {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
