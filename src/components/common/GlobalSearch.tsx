import { useState } from 'react';
import { M3Card, M3IconButton, M3TextField } from 'm3r';
import { Search, MoreVert, Clear } from '@mui/icons-material';

interface GlobalSearchProps {
  onSearch: (query: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <M3Card
      component="div"
      elevation={0}
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: "40%",
        maxWidth: 800,
        bgcolor: "#EBE6F3",
        borderRadius: 30,
        height: 38,
        mx: "auto",
      }}
    >
      <M3IconButton sx={{ p: "10px" }} aria-label="search">
        <Search />
      </M3IconButton>
      <M3TextField
        placeholder="Global Search"
        inputProps={{ "aria-label": "global search" }}
        variant="outlined"
        value={searchValue}
        onChange={handleInputChange}
        sx={{
          ml: 1,
          flex: 1,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              border: "none",
            },
        }}
        size="small"
      />
      {searchValue && (
        <M3IconButton onClick={handleClear} sx={{ p: "10px" }} aria-label="clear search">
          <Clear />
        </M3IconButton>
      )}
      <M3IconButton type="button" sx={{ p: "10px" }} aria-label="options">
        <MoreVert />
      </M3IconButton>
    </M3Card>
  );
};
