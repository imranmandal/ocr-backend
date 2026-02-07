import express, { type Request, type Response } from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  return res.send("Hola amigo!");
});

app.post(
  "/analyze-image",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) throw new Error("file missing");
      const { data } = await Tesseract.recognize(req.file.path, "eng");

      res.json({
        ...data,
      });
    } catch (err) {
      res.status(500).json({ error: "OCR failed" });
    }
  },
);

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
