import { M3Card, M3IconButton, M3TextField } from 'm3r';
import { Search, MoreVert } from '@mui/icons-material';

export const GlobalSearch = () => {
  return (
    <M3Card
      component="form"
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
        mx: "auto", // Center horizontally
      }}
    >
      <M3IconButton sx={{ p: "10px" }} aria-label="search">
        <Search />
      </M3IconButton>
      <M3TextField
        placeholder="Global Search"
        inputProps={{ "aria-label": "global search" }}
        variant="outlined"
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
      <M3IconButton type="button" sx={{ p: "10px" }} aria-label="options">
        <MoreVert />
      </M3IconButton>
    </M3Card>
  );
};