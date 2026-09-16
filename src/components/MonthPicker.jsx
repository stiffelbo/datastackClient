import {
  Button,
  ButtonGroup,
} from '@mui/material';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function MonthPicker({
  value,
  onPrev,
  onNext,
  disabled = false,
  size = 'small',
  sx,
  name = "",
}) {
  return (
    <ButtonGroup
      size={size}
      variant="outlined"
      color="divider"
      sx={sx}
    >
      <Button
        onClick={onPrev}
        disabled={disabled} 
        aria-label="Poprzedni miesiąc"
      >
        <ChevronLeftIcon fontSize="small" />
      </Button>

      <Button
        disabled={disabled} 
      >
        {value}
      </Button>

      <Button
        onClick={onNext}
        disabled={disabled} 
        aria-label="Następny miesiąc"
      >
        <ChevronRightIcon fontSize="small" />
      </Button>
    </ButtonGroup>
  );
}

export default MonthPicker;
