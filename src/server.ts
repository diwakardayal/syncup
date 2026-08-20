import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "server is running",
  });
});

app.listen(5000, () => {
  console.log("server running on http://localhost:5000");
});


