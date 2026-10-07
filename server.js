const express =
    require("express");

const cheerio =
    require("cheerio");

const app =
    express();


const PORT =
    process.env.PORT || 3000;


/* =========================================
   STATIC WEBSITE
========================================= */

app.use(
    express.static(__dirname)
);


/* =========================================
   RESERVOIR API
   อ่างเก็บน้ำบ้านเบิดใหญ่
========================================= */

app.get(
    "/api/reservoir",
    async (req, res) => {

        try {

            const sourceUrl =
                "https://rid5.net/water/smallreport.php";


            const response =
                await fetch(
                    sourceUrl,
                    {
                        headers: {

                            "User-Agent":
                                "WatThat-Water-Weather/1.0",

                            "Accept-Language":
                                "th,en;q=0.8"

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

                    const cells =
                        [];


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


                    if (
                        cells.includes(
                            "269600"
                        ) &&
                        cells.includes(
                            "1976300"
                        )
                    ) {

                        reservoir = {

                            name:
                                cells[1],

                            subdistrict:
                                cells[5],

                            district:
                                cells[6],

                            province:
                                cells[7],

                            capacity:
                                Number(
                                    cells[8]
                                ),

                            volume:
                                Number(
                                    cells[9]
                                ),

                            percent:
                                Number(
                                    cells[10]
                                ),

                            fetchedAt:
                                new Date()
                                    .toISOString()

                        };

                    }

                }
            );


            if (!reservoir) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "ไม่พบข้อมูลอ่างเก็บน้ำบ้านเบิดใหญ่"

                    });

            }


            res.json({

                success:
                    true,

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

                    success:
                        false,

                    message:
                        "ไม่สามารถดึงข้อมูลอ่างเก็บน้ำได้"

                });

        }

    }
);


/* =========================================
   HEALTH CHECK
========================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            status: "ok"
        });

    }
);


/* =========================================
   START SERVER
========================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Local: http://localhost:${PORT}`
        );

    }
);
