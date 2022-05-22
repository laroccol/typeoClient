import { useTheme } from "@mui/system";
import { Divider, MenuItem, Typography } from "@mui/material";
import React from "react";
import { GridCard } from "../../common";

interface StatCardProps {
  title: string;
  subtitle?: string;
  stat: number;
}

export default function StatCard({ title, subtitle, stat }: StatCardProps) {
  const theme = useTheme();
  return (
    <>
      <GridCard textalign="center" color={theme.palette.background.default}>
        <Typography variant="h6" padding={1}>
          {title}
        </Typography>
        <Divider />
        <Typography variant="h4" color="primary" paddingTop={3}>
          {stat}
        </Typography>
      </GridCard>
    </>
  );
}
