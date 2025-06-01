import { app } from "./app";

app.get("/", (_, res) => {
  res.send("Hello, gcvcians!");
});
