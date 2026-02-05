// AppDescription.jsx
// React 19 + MUI v5/6 compatible

import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from "@mui/material";


//Components

import AppWorkflow from "./AppWorkflow";
import AppModules from "./AppModules";
import AppSummary from "./AppSummary";


export default function AppDescription({
  pages,
  title = "DataStack",
  orgName = "Germanimint",
}) {

  return (
    <Box sx={{height: "100%", overflowY: "auto"}}>
      <AppSummary title={title} pages={pages} orgName={orgName}  />

      <Box component="section" sx={{ display: "flex", flexDirection: "row" }}>
        <Box sx={{ width: '30%', px: 1 }} >
          <AppWorkflow title={title} pages={pages} />
        </Box>
        <Box sx={{ width: '70%', px: 1 }} >
          <AppModules pages={pages} />
        </Box>
      </Box>
    </Box>
  );
}
