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
  size = 'small',
  sx,
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
        aria-label="Poprzedni miesiąc"
      >
        <ChevronLeftIcon fontSize="small" />
      </Button>

      <Button
      >
        {value}
      </Button>

      <Button
        onClick={onNext}
        aria-label="Następny miesiąc"
      >
        <ChevronRightIcon fontSize="small" />
      </Button>
    </ButtonGroup>
  );
}

export default MonthPicker;