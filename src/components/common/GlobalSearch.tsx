import { Paper, IconButton, InputBase } from '@mui/material';
import { Search, MoreVert } from '@mui/icons-material';

export const GlobalSearch = () => {
  return (
    <Paper
      component="form"
      elevation={0}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '90%',
        maxWidth: 800,
        bgcolor: '#EBE6F3',
        borderRadius: 24,
        height: 48,
        mx: 'auto' // Center horizontally
      }}
    >
      <IconButton sx={{ p: '10px' }} aria-label="search">
        <Search />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Global Search"
        inputProps={{ 'aria-label': 'global search' }}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="options">
        <MoreVert />
      </IconButton>
    </Paper>
  );
};