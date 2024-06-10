const express = require("express");
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./my-uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/upload", upload.single("texfile"), (req, res) => {
  //   console.log(req.body);
  console.log(req.file);
  const filename = req.file.filename;
  //   console.log(filename);
  const serverUploadPath = `./my-uploads/${filename}`;
  try {
    const texContent = fs.readFileSync(`./my-uploads/${filename}`, "utf8");
    // console.log(data);
    const texPath = path.join(os.tmpdir(), "bug_report.tex");
    const pdfPath = path.join(os.tmpdir(), "bug_report.pdf");

    try {
      // Write LaTeX content to .tex file
      fs.writeFileSync(texPath, texContent);

      // Compile LaTeX to PDF
      for (let i = 0; i < 3; i++) {
        execSync(
          `pdflatex -interaction=nonstopmode -output-directory=${os.tmpdir()} ${texPath}`,
          { stdio: "inherit" }
        );
      }

      // Read the generated PDF
      const pdfBuffer = fs.readFileSync(pdfPath);

      // Send the PDF as response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=BugReport.pdf");
      res.send(pdfBuffer);

      console.log("Bug report generated and sent.");
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    } finally {
      // Clean up temporary files
      if (fs.existsSync(texPath)) fs.unlinkSync(texPath);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      if (fs.existsSync(serverUploadPath)) fs.unlinkSync(serverUploadPath);
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// logic
// const texContent = `
//         \\documentclass{article}
//         \\usepackage{import}
//         \\begin{document}
//         Hello, hi \\ LaTeX!
//         hi heloo \\\\
//         \\end{document}
//     `;

//     // Temporary paths for .tex and .pdf files
//     const texPath = path.join(os.tmpdir(), 'bug_report.tex');
//     const pdfPath = path.join(os.tmpdir(), 'bug_report.pdf');

//     try {
//         // Write LaTeX content to .tex file
//         fs.writeFileSync(texPath, texContent);

//         // Compile LaTeX to PDF
//         for (let i = 0; i < 3; i++) {
//             execSync(`pdflatex -interaction=nonstopmode -output-directory=${os.tmpdir()} ${texPath}`, { stdio: 'inherit' });
//         }

//         // Read the generated PDF
//         const pdfBuffer = fs.readFileSync(pdfPath);

//         // Send the PDF as response
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', 'inline; filename=BugReport.pdf');
//         res.send(pdfBuffer);

//         console.log("Bug report generated and sent.");
//     } catch (error) {
//         console.error('Error generating PDF:', error);
//         res.status(500).send('Error generating PDF');
//     } finally {
//         // Clean up temporary files
//         if (fs.existsSync(texPath)) fs.unlinkSync(texPath);
//         if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
//     }
