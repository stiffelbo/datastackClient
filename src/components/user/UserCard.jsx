import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  EmailOutlined,
  PhoneOutlined,
  WorkOutline,
  BusinessOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import { useRwd } from "../../context/RwdContext";
import { useAuth } from "../../context/AuthContext";

const storageUrl = import.meta.env.VITE_STORAGE_URL;

const UserCard = () => {
  const { user } = useAuth();
  const rwd = useRwd();

  const employee = user?.employee;

  if (!employee) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">Brak danych pracownika</Typography>
          <Typography variant="body2" color="text.secondary">
            Konto użytkownika nie jest powiązane z kartoteką pracownika.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const profileSrc = employee.profile_url
    ? `${storageUrl}${employee.profile_url}`
    : undefined;

  const employeeName =
    employee.employeeName ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ");

  const active = Number(employee.is_active) === 1;
  const working = Number(employee.work_status) === 1;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          gap: 2.5,
          alignItems: "center",
          flexDirection: rwd?.isMobile ? "column" : "row",
          textAlign: rwd?.isMobile ? "center" : "left",
        }}
      >
        <Avatar
          src={profileSrc}
          alt={employeeName}
          sx={{
            width: 96,
            height: 96,
            fontSize: 34,
          }}
        >
          {employeeName?.slice(0, 1)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700}>
            {employeeName}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {employee.occupation_name || "Brak stanowiska"}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: 1.5,
              justifyContent: rwd?.isMobile ? "center" : "flex-start",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Chip
              size="small"
              label={active ? "Aktywny" : "Nieaktywny"}
              color={active ? "success" : "default"}
              variant={active ? "filled" : "outlined"}
            />
            <Chip
              size="small"
              label={working ? "Pracujący" : "Niepracujący"}
              color={working ? "primary" : "default"}
              variant="outlined"
            />
          </Stack>
        </Box>
      </Box>

      <Divider />

      <CardContent>
        <Grid container spacing={2}>
          <InfoItem
            icon={<EmailOutlined fontSize="small" />}
            label="Email"
            value={employee.email}
          />
          <InfoItem
            icon={<PhoneOutlined fontSize="small" />}
            label="Telefon"
            value={employee.phone}
          />
          <InfoItem
            icon={<BusinessOutlined fontSize="small" />}
            label="Dział"
            value={employee.structureName}
          />
          <InfoItem
            icon={<LocationOnOutlined fontSize="small" />}
            label="Lokalizacja"
            value={employee.locationName}
          />
          <InfoItem
            icon={<WorkOutline fontSize="small" />}
            label="Spółka / zatrudnienie"
            value={employee.employment_company_code}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

const InfoItem = ({ icon, label, value }) => {
  if (!value) return null;

  return (
    <Grid item xs={12} sm={6}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box sx={{ color: "text.secondary", pt: "2px" }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Grid>
  );
};

export default UserCard;