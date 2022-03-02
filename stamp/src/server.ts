import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import router from "./routes";

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(router);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server listening on port: ${port}`));
