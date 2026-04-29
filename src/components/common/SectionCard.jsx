import React from "react";
import { Card, CardContent, CardHeader, Typography, Box } from "@mui/material";

const SectionCard = ({
  title,
  subtitle = null,
  action = null,
  children,
  sx = {},
  contentSx = {},
}) => {
  return (
    <Card variant="outlined" sx={{ mb: 2, ...sx }}>
      {title ? (
        <CardHeader
          title={
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
          }
          subheader={subtitle}
          action={action}
          sx={{ pb: 0.5 }}
        />
      ) : null}

      <CardContent sx={{ pt: title ? 1.5 : 2, ...contentSx }}>
        <Box>{children}</Box>
      </CardContent>
    </Card>
  );
};

export default SectionCard;