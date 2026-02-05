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

      <AppModules pages={pages} />
    </Box>
  );
}
