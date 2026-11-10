import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

// This is the home page. Every piece here (Container, Typography, Button) is a
// ready-made Material UI component. We did not build these from scratch.
export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          py: 6,
        }}
      >
        <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }}>
          ADHD Budgeting App
        </Typography>
        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ fontWeight: 400 }}
        >
          The budgeting app that does the work for you: automatic tracking, one
          clear safe-to-spend number, and a calm, no-shame design.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="large">
            Get started
          </Button>
          <Button variant="outlined" size="large">
            Learn more
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
