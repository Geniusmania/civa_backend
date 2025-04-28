const express = require("express");
const startupRoute = require("./routes/startup");
const partnerRoute = require("./routes/partner");
const investorRoute = require("./routes/investor");
const app = express()
app.use(express.json())



app.use("/api/startup", startupRoute)

app.use("/api/partner", partnerRoute)

app.use("/api/incestor" , investorRoute)






app.listen(5000,()=> {
    console.log('App listening on port 5000')
} )