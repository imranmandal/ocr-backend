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

function getAverageConfidence(data: Tesseract.Page) {
  const words = data.words || [];
  if (words.length === 0) return 0;

  const sum = words.reduce((a, w) => a + (w.confidence || 0), 0);
  return sum / words.length;
}
function isImageClear(data: Tesseract.Page) {
  const avgConf = getAverageConfidence(data);
  const text = data.text || "";

  const validLines = text
    .split("\n")
    .filter((l) => /[a-zA-Z]/.test(l) && /\d/.test(l));

  return {
    clear: avgConf >= 70 && validLines.length >= 2,
    confidence: Math.round(avgConf),
    validLines: validLines.length,
  };
}

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
