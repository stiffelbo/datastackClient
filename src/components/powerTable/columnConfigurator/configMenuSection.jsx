import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * ConfigMenuSection
 * Wzorzec do sekcji konfiguracyjnych z menu rozwijanym.
 */
const ConfigMenuSection = ({
  icon,
  label,
  color = "inherit",
  children,
  disabled = false,
  active = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <MenuItem disabled={disabled} onClick={openMenu}>
        <ListItemIcon>
          {React.cloneElement(icon, { fontSize: "small", color: active ? "warning" : color })}
        </ListItemIcon>
        <ListItemText primary={label} />
        <ExpandMoreIcon fontSize="small" />
      </MenuItem>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {/* dzieci przekazują closeMenu, żeby móc się zamknąć */}
        {React.isValidElement(children)
          ? React.cloneElement(children, { onClose: closeMenu })
          : children}
      </Menu>
    </>
  );
};

export default ConfigMenuSection;
