const express = require("express");
const cheerio = require("cheerio");

const app = express();

const PORT =
    process.env.PORT || 3000;


/* =====================================
   STATIC WEBSITE
===================================== */

app.use(
    express.static(__dirname)
);


/* =====================================
   RESERVOIR FUNCTION
===================================== */

async function getReservoirData(req, res) {

    try {

        const sourceUrl =
            "https://rid5.net/water/smallreport.php";


        const response =
            await fetch(
                sourceUrl,
                {
                    headers: {
                        "User-Agent":
                            "WatThatMunicipality-WaterWeather/1.0",

                        "Accept":
                            "text/html,application/xhtml+xml",

                        "Accept-Language":
                            "th-TH,th;q=0.9,en;q=0.8"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `RID5 HTTP ${response.status}`
            );

        }


        const html =
            await response.text();


        const $ =
            cheerio.load(html);


        let reservoir =
            null;


        $("tr").each(
            (index, row) => {

                const cells = [];


                $(row)
                    .find("td")
                    .each(
                        (i, cell) => {

                            cells.push(
                                $(cell)
                                    .text()
                                    .replace(
                                        /\s+/g,
                                        " "
                                    )
                                    .trim()
                            );

                        }
                    );


                /*
                    อ่างเก็บน้ำบ้านเบิดใหญ่
                    UTM:
                    269600
                    1976300
                */

                if (
                    cells[3] === "269600" &&
                    cells[4] === "1976300"
                ) {

                    const capacity =
                        Number(cells[8]);


                    const volume =
                        Number(cells[9]);


                    const percent =
                        Number(cells[10]);


                    if (
                        Number.isFinite(capacity) &&
                        Number.isFinite(volume) &&
                        Number.isFinite(percent)
                    ) {

                        reservoir = {

                            name:
                                "อ่างเก็บน้ำบ้านเบิดใหญ่",

                            subdistrict:
                                "วัดธาตุ",

                            district:
                                "เมืองหนองคาย",

                            province:
                                "หนองคาย",

                            capacity:
                                capacity,

                            volume:
                                volume,

                            percent:
                                percent,

                            fetchedAt:
                                new Date()
                                    .toISOString()

                        };

                    }

                }

            }
        );


        if (!reservoir) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "ไม่พบข้อมูลอ่างเก็บน้ำบ้านเบิดใหญ่"
                });

        }


        res.json({
            success: true,

            data:
                reservoir,

            source:
                "Regional Irrigation Office 5"
        });

    }

    catch (error) {

        console.error(
            "Reservoir error:",
            error
        );


        res
            .status(500)
            .json({
                success: false,

                message:
                    "ไม่สามารถดึงข้อมูลอ่างเก็บน้ำได้"
            });

    }

}


/* =====================================
   API ROUTES
===================================== */

app.get(
    "/api/reservoir",
    getReservoirData
);


/* รองรับ URL เก่าด้วย */

app.get(
    "/api/berd-yai-reservoir",
    getReservoirData
);


/* =====================================
   HEALTH CHECK
===================================== */

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            status:
                "ok",

            time:
                new Date()
                    .toISOString()
        });

    }
);


/* =====================================
   START SERVER
===================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
