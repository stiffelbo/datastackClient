import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsIcon from "@mui/icons-material/Groups";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";

import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GROUP_ICON = {
  System: <SettingsIcon fontSize="small" />,
  Raporty: <QueryStatsIcon fontSize="small" />,
  HR: <GroupsIcon fontSize="small" />,
  Controlling: <MonetizationOnIcon fontSize="small" />,
  Projekty: <AssignmentIcon fontSize="small" />,
  Tech: <BuildCircleIcon fontSize="small" />,
};

const ROLE_CHIP_COLOR = {
  admin: "error",
  editor: "primary",
  operator: "success",
  viewer: "default",
};

const getPersonName = (person) => {
  if (!person) {
    return "Nieprzypisany użytkownik";
  }

  const fullName = [person.first_name, person.last_name].filter(Boolean).join(" ").trim();

  return fullName || "Nieznana osoba";
};

const getInitials = (person) => {
  if (!person) {
    return "?";
  }

  const first = person.first_name?.[0] ?? "";
  const last = person.last_name?.[0] ?? "";

  return `${first}${last}`.toUpperCase() || "?";
};

const canOpenPage = (page, allowedPageIds = []) => {
  if (!page?.id) {
    return false;
  }

  return allowedPageIds.includes(page.id);
};

const renderPageLink = (page, allowedPageIds = []) => {
  const allowed = canOpenPage(page, allowedPageIds);
  const hasRoute = !!page?.route;

  if (!allowed || !hasRoute) {
    return (
      <Chip
        size="small"
        label={page?.name || "brak"}
        variant="filled"
      />
    );
  }

  return (
    <Chip
      size="small"
      label={page.name}
      clickable
      component={RouterLink}
      to={page.route}
      color="primary"
      variant="outlined"
    />
  );
};

const renderAssignedPerson = (entry, pageId, index) => {
  const person = entry.person || entry.employee || null;
  const personName = getPersonName(person);

  return (
    <Box
      key={`${pageId}-${entry.user_id}-${index}`}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 1.25,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Avatar
          src={person?.profile_url || undefined}
          alt={personName}
          sx={{ width: 36, height: 36 }}
        >
          {getInitials(person)}
        </Avatar>

        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {personName}
            </Typography>

            <Chip
              size="small"
              label={entry.role_label}
              color={ROLE_CHIP_COLOR[entry.role_key] || "default"}
              variant="outlined"
            />
          </Stack>

          {!!person?.occupation_name && (
            <Typography variant="caption" color="text.secondary">
              {person.occupation_name}
            </Typography>
          )}

          {!!entry.description && (
            <Typography variant="body2" color="text.secondary">
              {entry.description}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

const renderAssignedUsers = (page) => {
  if (!page?.users?.length) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 700, textTransform: "uppercase" }}
      >
        Osoby przypisane
      </Typography>

      <Stack spacing={1}>
        {page.users.map((entry, index) => renderAssignedPerson(entry, page.id, index))}
      </Stack>
    </Stack>
  );
};

const renderPageCard = (page, allowedPageIds = []) => {
  return (
    <Grid key={page.id || page.name} size={{ xs: 12, md: 6, lg: 4 }}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          height: "100%",
          minWidth: "100%",
          width: "100%",
        }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {page.label}
              </Typography>

              {renderPageLink(page, allowedPageIds)}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {page.description?.trim?.()
                ? page.description
                : "Opis w przygotowaniu."}
            </Typography>

            {renderAssignedUsers(page)}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

const renderDomainAccordion = (domain, allowedPageIds = []) => {
  const groupKey = domain.group_key;
  const groupLabel = domain.group_label || domain.group_key || "Bez grupy";
  const domainPages = domain.pages || [];

  return (
    <Accordion
      key={groupKey}
      defaultExpanded={groupLabel === "Projekty"}
      disableGutters
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          {GROUP_ICON[groupLabel] ?? <AccountTreeIcon fontSize="small" />}
          <Typography sx={{ fontWeight: 800 }}>{groupLabel}</Typography>
          <Chip size="small" label={`${domainPages.length}`} variant="outlined" />
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Grid container spacing={1.75}>
          {domainPages.map((page) => renderPageCard(page, allowedPageIds))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

const AppModules = ({ pages: domains = [] }) => {
  const { user } = useAuth();

  const allowedPageIds = React.useMemo(() => {
    return user?.pages?.map((item) => item.id) || [];
  }, [user]);

  return (
    <Stack spacing={3}>
      <Box sx={{ pb: 4 }}>
        <Stack spacing={1.5} sx={{ mb: 1.25 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountTreeIcon fontSize="small" />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Moduły / strony aplikacji
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={1.25}>
          {domains.map((domain) => renderDomainAccordion(domain, allowedPageIds))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default AppModules;