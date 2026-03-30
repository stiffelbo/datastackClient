import React, { useMemo } from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import FormTemplate from '../../components/powerTable/form/formTemplate';

const StructureDetails = ({ id, row, rows, entity, rwd, dashboard }) => {
  const onCancel = () => {
    dashboard.setCurrentId(null);
    dashboard.setTab(null);
  };

  const modifiedRow = { ...row };
  if (row) {
    modifiedRow.profile_url = '';
  }

  const storageUrl = import.meta.env.VITE_STORAGE_URL;

  const schema = useMemo(() => {
    const baseSchema = Array.isArray(entity?.schema?.editForm?.schema)
      ? [...entity.schema.editForm.schema]
      : [];

    baseSchema.push({
      name: '__profile_preview',
      type: 'custom',
      label: 'Profil',
      md: 12,
      xl: 12,
      render: () => {
        const imgSrc = row?.profile_url_org
          ? `${storageUrl}/${row.profile_url_org}`
          : row?.profile_url
            ? `${storageUrl}/${row.profile_url}`
            : null;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={imgSrc || undefined}
              alt="Profil"
              sx={{ width: 96, height: 96 }}
            />
            <Box>
              <Typography variant="body1">Profil</Typography>
              <Typography variant="body2" color="text.secondary">
                {imgSrc ? 'Podgląd aktualnego profilu' : 'Brak obrazu profilowego'}
              </Typography>
            </Box>
          </Box>
        );
      },
    });

    return baseSchema;
  }, [entity?.schema?.editForm?.schema, storageUrl, row]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%' }}>
      <FormTemplate
        formLabel="Edytuj Strukturę"
        sendFormData={false}
        data={modifiedRow}
        schema={schema}
        onSubmit={(data) => entity.updateFD(id, data)}
        onCancel={onCancel}
      />
    </Box>
  );
};

export default StructureDetails;