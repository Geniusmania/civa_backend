const express = require("express");
const startupRoute = require("./routes/startup");
const partnerRoute = require("./routes/partner");
const investorRoute = require("./routes/investor");
const cors = require("cors");

const app = express();
app.use(express.json());
// In index.js, consider more specific CORS configuration
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/startup", startupRoute);

app.use("/api/partner", partnerRoute);

app.use("/api/investor", investorRoute);

app.listen(5000, () => {
  console.log("App listening on port 5000");
});
