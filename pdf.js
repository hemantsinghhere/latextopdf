const express = require('express');
const fs = require("fs");
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const app = express();
const port = process.env.PORT || 3001;

app.get('/', async (req, res) => {
    const texContent = `
        \\documentclass{article}
        \\usepackage{import}
        \\begin{document}
        Hello, hi \\ LaTeX!
        hi heloo \\\\
        \\end{document}
    `;

    // Temporary paths for .tex and .pdf files
    const texPath = path.join(os.tmpdir(), 'bug_report.tex');
    const pdfPath = path.join(os.tmpdir(), 'bug_report.pdf');

    try {
        // Write LaTeX content to .tex file
        fs.writeFileSync(texPath, texContent);

        // Compile LaTeX to PDF
        for (let i = 0; i < 3; i++) {
            execSync(`pdflatex -interaction=nonstopmode -output-directory=${os.tmpdir()} ${texPath}`, { stdio: 'inherit' });
        }

        // Read the generated PDF
        const pdfBuffer = fs.readFileSync(pdfPath);

        // Send the PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=BugReport.pdf');
        res.send(pdfBuffer);

        console.log("Bug report generated and sent.");
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    } finally {
        // Clean up temporary files
        if (fs.existsSync(texPath)) fs.unlinkSync(texPath);
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
