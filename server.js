const express = require("express");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get("/api/berd-yai-reservoir", async (req, res) => {
    try {
        const sourceUrl =
            "https://rid5.net/water/smallreport.php";

        const response = await fetch(sourceUrl);

        if (!response.ok) {
            throw new Error(
                `โหลดข้อมูลไม่สำเร็จ HTTP ${response.status}`
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        let reservoir = null;

        $("tr").each((index, row) => {

            const cells = [];

            $(row).find("td").each((i, cell) => {

                cells.push(
                    $(cell)
                        .text()
                        .replace(/\s+/g, " ")
                        .trim()
                );

            });

            const rowText = cells.join(" ");

            if (
                cells[3] === "269600" &&
    cells[4] === "1976300"
            ) {

               
    console.log("พบอ่างบ้านเบิดใหญ่:", cells);

    reservoir = {
        name: "อ่างเก็บน้ำบ้านเบิดใหญ่",
        subdistrict: "วัดธาตุ",
        district: "เมืองหนองคาย",
        province: "หนองคาย",

        capacity: Number(cells[8]),
        volume: Number(cells[9]),
        percent: Number(cells[10]),

        fetchedAt: new Date().toISOString()

                };
            }
        });

        if (!reservoir) {

            return res.status(404).json({
                success: false,
                message:
                    "ไม่พบข้อมูลอ่างเก็บน้ำบ้านเบิดใหญ่"
            });

        }

        res.json({
            success: true,
            data: reservoir
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "ไม่สามารถดึงข้อมูลได้"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
