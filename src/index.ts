import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`SERVIDOR CORRIENDO EN http://localhost:${PORT}`);
  console.log(`SWAGGER UI DISPONIBLE EN http://localhost:${PORT}/api-docs`);
});
