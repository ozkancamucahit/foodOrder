
import express from "express";


const app = express();

app.use('/', (req, res) => {
  return res.json('Hello there');
});


app.listen(8017, () => {
  console.log('APP is listening on 8017');
});


