import express, { type Request, type Response } from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";

import dotenv from "dotenv";
dotenv.config();

import { generateDutch } from "./repo/gpt_repo.js";

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
  return res.send("Hola amigo!");
});

app.post(
  "/analyze-image",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) throw new Error("file missing");
      const notes = req.body.note;
      //   const mode: "equal" | "dutch" = req.body.mode || "equal";
      //   const headcount: number = req.body.headcount;
      const { data } = await Tesseract.recognize(req.file.buffer, "eng");

      if (data.confidence < 50)
        return res.status(400).json({
          error: "File is not clear!",
          data: { text: data.text.trim(), confidence: data.confidence },
        });

      const result = await generateDutch(
        [
          data.text.trim(),
          notes && `note:${notes}`,
          "analyze:currency,items=[price,item,item-alias=3char_unique] output:json",
        ]
          .filter((d) => d)
          .join(" "),
      );
      //   const result = await generateDutch(
      //     `${data.text.trim()} mode:${mode} headcount:${headcount} note:${notes} output:json`,
      //   );

      res.json({ result });
    } catch (err: any) {
      res.status(500).json({ error: err?.message });
    }
  },
);

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});


// {
//     "result": "[\n 
//  {\"item\":\"Tandoori chicken\",\"price\":205,\"item-alias\":\"TAN\"},\n
//   {\"item\":\"Lasooni Dal Tadka\",\"price\":275,\"item-alias\":\"LAS\"},\n
//   {\"item\":\"HYDERABADI MURG BIRYANI\",\"price\":375,\"item-alias\":\"HYD\"},\n
//   {\"item\":\"Tandoori Roti all food less spicy\",\"price\":30,\"item-alias\":\"TAN\"},\n
//   {\"item\":\"Tandoori Roti\",\"price\":30,\"item-alias\":\"TAN\"}\n]"
// }

// output 2 
// {
//     "result": "{\n  \"invoice_number\": \"INO01001259\",\n  \"currency\": \"INR\",\n
//   \"items\": [\n    {\"item\": \"Tandoori chicken\", \"price\": 205.00, \"item_alias\": \"TAN\"},\n 
//    {\"item\": \"Lasooni Dal Tadka\", \"price\": 275.00, \"item_alias\": \"LAS\"},\n
//     {\"item\": \"HYDERABADI MURG BIRYANI\", \"price\": 375.00, \"item_alias\": \"HYD\"},\n 
//    {\"item\": \"Tandoori Roti all food less spicy\", \"price\": 30.00, \"item_alias\": \"TOR\"},\n
//     {\"item\": \"Tandoori Roti\", \"price\": 30.00, \"item_alias\": \"TRO\"}\n  ]\n}"
// }