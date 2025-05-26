import app from "./app";
import { config } from "./config/env";

app.listen(config.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${config.PORT}`);
});
