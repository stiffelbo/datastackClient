import React, {useState} from "react";

//Mui
import { IconButton, Menu, MenuItem, Badge } from '@mui/material';

//Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

//Utils
import { getPeriodLabel } from "./utils";

const PeriodsList = ({
    periods = [],
    onChange,
    value = null}) => {

    const [periodAnchor, setPeriodAnchor] = useState(null);
    const handleOpen = (event) => setPeriodAnchor(event.currentTarget);
    const handleClose = () => setPeriodAnchor(null);

    const sortedPeriods = [...periods].sort((a, b) =>
        new Date(b.date_to) - new Date(a.date_to)
    );

    return (
        <>
            <Badge
                badgeContent={value ?? 'Brak'}
                color={value ? 'primary' : 'error'}
                overlap="circular"
            >
                <IconButton
                    size="small"
                    title="Okres"
                    color={value ? 'primary' : 'error'}
                    onClick={handleOpen}
                    sx={{ mt: 1 }}
                >
                    <CalendarMonthIcon fontSize="small" />
                </IconButton>
            </Badge>

            <Menu
                anchorEl={periodAnchor}
                open={Boolean(periodAnchor)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                {sortedPeriods.map((period) => (
                    <MenuItem
                        key={period.id}
                        selected={period.id === value}
                        onClick={() => {
                            onChange(period.id);
                            handleClose();
                        }}
                    >
                        {getPeriodLabel(period)}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

export default PeriodsList;