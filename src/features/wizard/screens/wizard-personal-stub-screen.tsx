import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "react-router-dom";

const containerSx = { py: 4 } as const;

/** Temporary stub until Phase 4 wizard chrome. */
export function WizardPersonalStubScreen() {
  const [params] = useSearchParams();
  const quoteId = params.get("quoteId");

  return (
    <Container component="main" maxWidth="sm" sx={containerSx}>
      <Typography component="h1" variant="h5" gutterBottom>
        Quote wizard
      </Typography>
      <Typography color="text.secondary">
        {quoteId
          ? `Editing quote ${quoteId} — wizard steps come in Phase 4.`
          : "New quote — wizard steps come in Phase 4."}
      </Typography>
    </Container>
  );
}
