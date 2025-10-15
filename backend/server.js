require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// 1. Connect DB
connectDB();

// 2. Create app
const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Routes
app.use("/api/test", require("./routes/test"));       // test route
app.use("/api/auth", require("./routes/auth"));       // login/register
app.use("/api/employees", require("./routes/employees")); 
 app.use("/api/leaves", require("./routes/leaves")); 
 app.use("/api/holidays", require("./routes/holidays"));
app.use("/api/performance", require("./routes/performance")); 
app.use("/api/salary", require("./routes/salary")); 
 app.use("/api/promotions", require("./routes/promotions")); 


// 5. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
