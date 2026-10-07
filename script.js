const latitude = 17.88;
const longitude = 102.74;

const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Asia%2FBangkok`;

fetch(url)

    .then(response => response.json())

    .then(data => {

        console.log(data);

        updateRainStatus(data);

        // =========================
        // อากาศปัจจุบัน
        // =========================

        document.getElementById("temperature").textContent =
            data.current.temperature_2m;

        document.getElementById("rain").textContent =
            data.current.precipitation;

        document.getElementById("humidity").textContent =
            data.current.relative_humidity_2m;

        document.getElementById("wind").textContent =
            data.current.wind_speed_10m;


        // เวลาอัปเดต

        const updateTime = new Date(data.current.time);

        document.getElementById("update-time").textContent =
            updateTime.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit"
            }) + " น.";


        // =========================
        // พยากรณ์ 7 วัน
        // =========================

        const forecastContainer =
            document.getElementById("forecast");

        forecastContainer.innerHTML = "";


        for (let i = 0; i < data.daily.time.length; i++) {

            const date =
                new Date(data.daily.time[i] + "T00:00:00");

            const dayName =
                date.toLocaleDateString("th-TH", {
                    weekday: "short"
                });


            const maxTemp =
                data.daily.temperature_2m_max[i];

            const minTemp =
                data.daily.temperature_2m_min[i];

            const rainChance =
                data.daily.precipitation_probability_max[i];

            const weatherCode =
                data.daily.weather_code[i];


            const icon =
                getWeatherIcon(weatherCode);


            const card =
                document.createElement("div");

            card.className = "forecast-card";


            card.innerHTML = `

                <h3>${dayName}</h3>

                <div class="forecast-icon">
                    ${icon}
                </div>

                <div class="temp-max">
                    ${maxTemp}°C
                </div>

                <div class="temp-min">
                    ${minTemp}°C
                </div>

                <div class="rain-chance">
                    🌧️ ${rainChance}%
                </div>

            `;


            forecastContainer.appendChild(card);
        }

    })

    .catch(error => {

        console.error(
            "ไม่สามารถโหลดข้อมูลอากาศได้",
            error
        );

    });


// =========================
// เลือกไอคอนตามสภาพอากาศ
// =========================

function getWeatherIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (code === 1 || code === 2) {
        return "🌤️";
    }

    if (code === 3) {
        return "☁️";
    }

    if (code >= 45 && code <= 48) {
        return "🌫️";
    }

    if (code >= 51 && code <= 67) {
        return "🌧️";
    }

    if (code >= 80 && code <= 82) {
        return "🌦️";
    }

    if (code >= 95) {
        return "⛈️";
    }

    return "🌤️";
}
function updateRainStatus(data) {

    const rain = data.current.precipitation;

    const rainChance =
        data.daily.precipitation_probability_max[0];

    const status =
        document.getElementById("status");

    const detail =
        document.getElementById("status-detail");

    const card =
        document.getElementById("status-card");


    card.classList.remove(
        "status-normal",
        "status-watch",
        "status-warning",
        "status-danger"
    );


    if (rain >= 15) {

        status.textContent =
            "🔴 ฝนตกหนัก";

        detail.textContent =
            `ฝนปัจจุบัน ${rain} มม. ควรติดตามสถานการณ์อย่างใกล้ชิด`;

        card.classList.add("status-danger");

    }

    else if (rain >= 5) {

        status.textContent =
            "🟠 มีฝนค่อนข้างมาก";

        detail.textContent =
            `ฝนปัจจุบัน ${rain} มม.`;

        card.classList.add("status-warning");

    }

    else if (rain > 0 || rainChance >= 60) {

        status.textContent =
            "🟡 เฝ้าระวังฝน";

        detail.textContent =
            `โอกาสฝนวันนี้ ${rainChance}%`;

        card.classList.add("status-watch");

    }

    else {

        status.textContent =
            "🟢 สภาพอากาศปกติ";

        detail.textContent =
            `โอกาสฝนวันนี้ ${rainChance}%`;

        card.classList.add("status-normal");

    }

}

// ================================
// แหล่งน้ำตำบลวัดธาตุ
// ================================

const waterLocations = [

    {
        name: "บึงหนองคาย",
        area: "บ้านสร้างประทาย หมู่ 10",
        icon: "🌊",
        latitude: 17.853694,
        longitude: 102.801722,
        locationType: "จุดอ้างอิงบริเวณบึง"
    },

    {
        name: "ลำห้วยยาง",
        area: "ช่วงบ้านเมืองบาง หมู่ 1",
        icon: "💧",
        latitude: 17.851441,
        longitude: 102.829628,
        locationType: "จุดอ้างอิงพื้นที่"
    },

    {
        name: "อ่างเก็บน้ำบ้านเบิดใหญ่",
        area: "บ้านเบิดใหญ่ หมู่ 6",
        icon: "🏞️",
        latitude: 17.862368,
        longitude: 102.825702,
        locationType: "พิกัดอ้างอิงจากกรมชลประทาน"
    },

    {
        name: "ห้วยจุ่มก้น",
        area: "บ้านทิพย์ธานี หมู่ 14",
        icon: "💦",
        latitude: 17.867458,
        longitude: 102.781926,
        locationType: "จุดอ้างอิงพื้นที่หมู่บ้าน"
    },

    {
        name: "คลองหลุบบึ่ง",
        area: "บ้านเบิดน้อย หมู่ 7",
        icon: "💦",
        latitude: 17.871892,
        longitude: 102.807057,
        locationType: "จุดอ้างอิงพื้นที่หมู่บ้าน"
    }

];


// ================================
// โหลดอากาศแยกแต่ละแหล่งน้ำ
// ================================

async function loadWaterWeather() {

    const container =
        document.getElementById("water-locations");

    container.innerHTML =
        "<p>กำลังโหลดข้อมูล...</p>";


    try {

        const results =
            await Promise.all(

                waterLocations.map(async place => {

                    const url =
                        `https://api.open-meteo.com/v1/forecast` +
                        `?latitude=${place.latitude}` +
                        `&longitude=${place.longitude}` +
                        `&current=temperature_2m,relative_humidity_2m,precipitation` +
                        `&daily=precipitation_probability_max` +
                        `&timezone=Asia%2FBangkok`;


                    const response =
                        await fetch(url);


                    if (!response.ok) {

                        throw new Error(
                            `โหลดข้อมูล ${place.name} ไม่สำเร็จ`
                        );

                    }


                    const data =
                        await response.json();


                    return {

                        ...place,

                        temperature:
                            data.current.temperature_2m,

                        humidity:
                            data.current.relative_humidity_2m,

                        rain:
                            data.current.precipitation,

                        rainChance:
                            data.daily
                                .precipitation_probability_max[0],

                        updateTime:
                            data.current.time

                    };

                })

            );


        // ล้างข้อความโหลด
        container.innerHTML = "";


        results.forEach(place => {

            const status =
                getWaterRainStatus(
                    place.rain,
                    place.rainChance
                );


            const card =
                document.createElement("div");


            card.className =
                "water-location-card";


            card.innerHTML = `

                <div class="water-card-top">

                    <div class="water-place-icon">
                        ${place.icon}
                    </div>

                    <div>
                        <h3>${place.name}</h3>
                        <p>${place.area}</p>
                    </div>

                </div>


                <div class="water-weather">

                    <div>
                        <span>🌡️ อุณหภูมิ</span>
                        <strong>
                            ${place.temperature}°C
                        </strong>
                    </div>


                    <div>
                        <span>🌧️ ฝนปัจจุบัน</span>
                        <strong>
                            ${place.rain} มม.
                        </strong>
                    </div>


                    <div>
                        <span>☔ โอกาสฝน</span>
                        <strong>
                            ${place.rainChance}%
                        </strong>
                    </div>


                    <div>
                        <span>💧 ความชื้น</span>
                        <strong>
                            ${place.humidity}%
                        </strong>
                    </div>

                </div>


                <div class="water-status ${status.className}">
                    ${status.text}
                </div>


                <div class="water-location-note">
                    📍 ${place.locationType}
                </div>

            `;


            container.appendChild(card);

        });


    }

    catch (error) {

        console.error(error);

        container.innerHTML =
            `<p>
                ไม่สามารถโหลดข้อมูลแหล่งน้ำได้ในขณะนี้
            </p>`;

    }

}


// ================================
// ประเมินสถานการณ์ฝน
// ================================

function getWaterRainStatus(
    rain,
    rainChance
) {

    if (rain >= 15) {

        return {
            text: "🔴 มีฝนตกหนัก",
            className: "water-danger"
        };

    }


    if (rain >= 5) {

        return {
            text: "🟠 มีฝนค่อนข้างมาก",
            className: "water-warning"
        };

    }


    if (
        rain > 0 ||
        rainChance >= 60
    ) {

        return {
            text: "🟡 เฝ้าระวังฝน",
            className: "water-watch"
        };

    }


    return {
        text: "🟢 สภาพอากาศปกติ",
        className: "water-normal"
    };

}


// โหลดครั้งแรก
loadWaterWeather();


// อัปเดตทุก 10 นาที
setInterval(
    loadWaterWeather,
    10 * 60 * 1000
);
async function loadReservoirData() {

    try {

        const response =
            await fetch("/api/berd-yai-reservoir");

        const result =
            await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        const data = result.data;


        // เปอร์เซ็นต์น้ำ
        document.getElementById(
            "reservoir-percent"
        ).textContent =
            data.percent.toFixed(2);


        // ความจุอ่าง
        document.getElementById(
            "reservoir-capacity"
        ).textContent =
            `${data.capacity.toFixed(3)} ล้าน ลบ.ม.`;


        // ปริมาณน้ำปัจจุบัน
        document.getElementById(
            "reservoir-volume"
        ).textContent =
            `${data.volume.toFixed(3)} ล้าน ลบ.ม.`;


        // แถบระดับน้ำ
        document.getElementById(
            "water-bar-fill"
        ).style.width =
            `${Math.min(data.percent, 100)}%`;


        // เวลาโหลดข้อมูล
        const updateTime =
            new Date(data.fetchedAt);

        document.getElementById(
            "reservoir-update"
        ).textContent =
            updateTime.toLocaleString(
                "th-TH",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );


        updateReservoirStatus(
            data.percent
        );

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "reservoir-status"
        ).textContent =
            "⚪ ไม่สามารถโหลดข้อมูลได้";

    }

}



function updateReservoirStatus(percent) {

    const status =
        document.getElementById(
            "reservoir-status"
        );


    if (percent >= 90) {

        status.textContent =
            "🟠 ปริมาณน้ำสูง";

    }

    else if (percent >= 70) {

        status.textContent =
            "🟢 ปริมาณน้ำอยู่ในระดับสูง";

    }

    else if (percent >= 30) {

        status.textContent =
            "🟢 ปริมาณน้ำปานกลาง";

    }

    else {

        status.textContent =
            "🟡 ปริมาณน้ำน้อย";

    }

}


// โหลดข้อมูลตอนเปิดเว็บ
loadReservoirData();


// โหลดใหม่ทุก 30 นาที
setInterval(
    loadReservoirData,
    30 * 60 * 1000
);
