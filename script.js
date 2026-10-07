const WAT_THAT = {
    lat: 17.853694,
    lon: 102.801722
};


let currentLanguage =
    localStorage.getItem("watthat-language") || "th";


let weatherData = null;
let reservoirData = null;
let waterLocationData = [];


/* =========================================
   LANGUAGE
========================================= */

const text = {

    th: {
        checking: "กำลังตรวจสอบข้อมูล...",
        normal: "🟢 สภาพอากาศปกติ",
        watch: "🟡 เฝ้าระวังฝน",
        warning: "🟠 มีฝนค่อนข้างมาก",
        danger: "🔴 ฝนตกหนัก",

        rainChance: "โอกาสฝนวันนี้",
        currentRain: "ฝนปัจจุบัน",

        radarPause: "⏸ หยุด",
        radarPlay: "▶ เล่น",

        reservoirVeryHigh: "🔴 ปริมาณน้ำเต็มหรือเกินความจุ",
        reservoirHigh: "🟠 ปริมาณน้ำสูง",
        reservoirGood: "🟢 ปริมาณน้ำอยู่ในระดับสูง",
        reservoirMedium: "🟢 ปริมาณน้ำปานกลาง",
        reservoirLow: "🟡 ปริมาณน้ำน้อย",

        temperature: "อุณหภูมิ",
        rain: "ฝน",
        chance: "โอกาสฝน",
        humidity: "ความชื้น",

        million: "ล้าน ลบ.ม.",

        unavailable: "ไม่สามารถโหลดข้อมูลได้"
    },


    en: {
        checking: "Checking data...",
        normal: "🟢 Normal weather conditions",
        watch: "🟡 Rain watch",
        warning: "🟠 Significant rainfall",
        danger: "🔴 Heavy rainfall",

        rainChance: "Today's rain chance",
        currentRain: "Current rainfall",

        radarPause: "⏸ Pause",
        radarPlay: "▶ Play",

        reservoirVeryHigh: "🔴 Full or above capacity",
        reservoirHigh: "🟠 High water storage",
        reservoirGood: "🟢 High water storage",
        reservoirMedium: "🟢 Moderate water storage",
        reservoirLow: "🟡 Low water storage",

        temperature: "Temperature",
        rain: "Rain",
        chance: "Rain chance",
        humidity: "Humidity",

        million: "million m³",

        unavailable: "Unable to load data"
    }

};


function t(key) {
    return text[currentLanguage][key];
}


function changeLanguage(language) {

    currentLanguage = language;

    localStorage.setItem(
        "watthat-language",
        language
    );


    document.documentElement.lang =
        language;


    document
        .querySelectorAll("[data-th][data-en]")
        .forEach(element => {

            element.textContent =
                language === "th"
                    ? element.dataset.th
                    : element.dataset.en;

        });


    document
        .querySelectorAll(".lang-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.lang === language
            );

        });


    document.title =
        language === "th"
            ? "ศูนย์ข้อมูลน้ำและอากาศตำบลวัดธาตุ"
            : "Wat That Water & Weather Information Center";


    renderWeather();
    renderForecast();
    renderWaterLocations();
    renderReservoir();

    updateRadarButton();
    updateRadarTime();

}


document
    .querySelectorAll(".lang-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {
                changeLanguage(
                    button.dataset.lang
                );
            }
        );

    });



/* =========================================
   WEATHER
========================================= */

async function loadWeather() {

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${WAT_THAT.lat}` +
            `&longitude=${WAT_THAT.lon}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
            `&timezone=Asia%2FBangkok`;


        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error("Weather API error");
        }


        weatherData =
            await response.json();


        renderWeather();
        renderForecast();

    }

    catch (error) {

        console.error(error);

        document.getElementById("status").textContent =
            t("unavailable");

    }

}


function renderWeather() {

    if (!weatherData) {
        return;
    }


    const current =
        weatherData.current;


    document.getElementById(
        "temperature"
    ).textContent =
        current.temperature_2m;


    document.getElementById(
        "rain"
    ).textContent =
        current.precipitation;


    document.getElementById(
        "humidity"
    ).textContent =
        current.relative_humidity_2m;


    document.getElementById(
        "wind"
    ).textContent =
        current.wind_speed_10m;


    const updateDate =
        new Date(current.time);


    document.getElementById(
        "update-time"
    ).textContent =
        updateDate.toLocaleTimeString(
            currentLanguage === "th"
                ? "th-TH"
                : "en-GB",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    renderRainStatus();

}


function renderRainStatus() {

    if (!weatherData) {
        return;
    }


    const rain =
        weatherData.current.precipitation;


    const rainChance =
        weatherData.daily
            .precipitation_probability_max[0];


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
            t("danger");

        detail.textContent =
            `${t("currentRain")} ${rain} mm`;

        card.classList.add(
            "status-danger"
        );

    }

    else if (rain >= 5) {

        status.textContent =
            t("warning");

        detail.textContent =
            `${t("currentRain")} ${rain} mm`;

        card.classList.add(
            "status-warning"
        );

    }

    else if (
        rain > 0 ||
        rainChance >= 60
    ) {

        status.textContent =
            t("watch");

        detail.textContent =
            `${t("rainChance")} ${rainChance}%`;

        card.classList.add(
            "status-watch"
        );

    }

    else {

        status.textContent =
            t("normal");

        detail.textContent =
            `${t("rainChance")} ${rainChance}%`;

        card.classList.add(
            "status-normal"
        );

    }

}



/* =========================================
   FORECAST
========================================= */

function weatherIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (code <= 2) {
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


function renderForecast() {

    if (!weatherData) {
        return;
    }


    const container =
        document.getElementById("forecast");


    container.innerHTML = "";


    weatherData.daily.time
        .forEach((dateString, index) => {

            const date =
                new Date(
                    dateString + "T00:00:00"
                );


            const dayName =
                date.toLocaleDateString(
                    currentLanguage === "th"
                        ? "th-TH"
                        : "en-GB",
                    {
                        weekday: "short"
                    }
                );


            const card =
                document.createElement("div");


            card.className =
                "forecast-card";


            card.innerHTML = `

                <strong>${dayName}</strong>

                <div class="forecast-icon">
                    ${weatherIcon(
                        weatherData.daily.weather_code[index]
                    )}
                </div>

                <div class="forecast-max">
                    ${weatherData.daily.temperature_2m_max[index]}°C
                </div>

                <div class="forecast-min">
                    ${weatherData.daily.temperature_2m_min[index]}°C
                </div>

                <div class="forecast-rain">
                    🌧️
                    ${weatherData.daily.precipitation_probability_max[index]}%
                </div>

            `;


            container.appendChild(
                card
            );

        });

}



/* =========================================
   LOCAL WATER SOURCES
========================================= */

const waterLocations = [

    {
        th: "บึงหนองคาย",
        en: "Bueng Nong Khai",
        areaTh: "บ้านสร้างประทาย หมู่ 10",
        areaEn: "Ban Sang Prathai, Moo 10",
        icon: "🌊",
        lat: 17.853694,
        lon: 102.801722
    },

    {
        th: "ลำห้วยยาง",
        en: "Huai Yang Stream",
        areaTh: "พื้นที่บ้านเมืองบาง",
        areaEn: "Ban Mueang Bang area",
        icon: "💧",
        lat: 17.851441,
        lon: 102.829628
    },

    {
        th: "อ่างเก็บน้ำบ้านเบิดใหญ่",
        en: "Ban Boet Yai Reservoir",
        areaTh: "บ้านเบิดใหญ่ หมู่ 6",
        areaEn: "Ban Boet Yai, Moo 6",
        icon: "🏞️",
        lat: 17.862368,
        lon: 102.825702
    },

    {
        th: "ห้วยจุ่มก้น",
        en: "Huai Chum Kon",
        areaTh: "บ้านทิพย์ธานี หมู่ 14",
        areaEn: "Ban Thip Thani, Moo 14",
        icon: "💦",
        lat: 17.867458,
        lon: 102.781926
    },

    {
        th: "คลองหลุบบึ่ง",
        en: "Khlong Lup Bueng",
        areaTh: "บ้านเบิดน้อย หมู่ 7",
        areaEn: "Ban Boet Noi, Moo 7",
        icon: "💦",
        lat: 17.871892,
        lon: 102.807057
    }

];


async function loadWaterLocations() {

    try {

        const results =
            await Promise.all(

                waterLocations.map(
                    async place => {

                        const url =
                            `https://api.open-meteo.com/v1/forecast` +
                            `?latitude=${place.lat}` +
                            `&longitude=${place.lon}` +
                            `&current=temperature_2m,relative_humidity_2m,precipitation` +
                            `&daily=precipitation_probability_max` +
                            `&timezone=Asia%2FBangkok`;


                        const response =
                            await fetch(url);


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
                                    .precipitation_probability_max[0]

                        };

                    }
                )

            );


        waterLocationData =
            results;


        renderWaterLocations();

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "water-locations"
        ).textContent =
            t("unavailable");

    }

}


function localStatus(place) {

    if (place.rain >= 15) {
        return t("danger");
    }

    if (place.rain >= 5) {
        return t("warning");
    }

    if (
        place.rain > 0 ||
        place.rainChance >= 60
    ) {
        return t("watch");
    }

    return t("normal");

}


function renderWaterLocations() {

    if (
        waterLocationData.length === 0
    ) {
        return;
    }


    const container =
        document.getElementById(
            "water-locations"
        );


    container.innerHTML = "";


    waterLocationData.forEach(
        place => {

            const card =
                document.createElement("div");


            card.className =
                "water-location-card";


            const name =
                currentLanguage === "th"
                    ? place.th
                    : place.en;


            const area =
                currentLanguage === "th"
                    ? place.areaTh
                    : place.areaEn;


            card.innerHTML = `

                <div class="water-title">

                    <div class="water-icon">
                        ${place.icon}
                    </div>

                    <div>
                        <h3>${name}</h3>
                        <p>${area}</p>
                    </div>

                </div>


                <div class="water-values">

                    <div>
                        <small>${t("temperature")}</small>
                        <strong>
                            ${place.temperature}°C
                        </strong>
                    </div>

                    <div>
                        <small>${t("rain")}</small>
                        <strong>
                            ${place.rain} mm
                        </strong>
                    </div>

                    <div>
                        <small>${t("chance")}</small>
                        <strong>
                            ${place.rainChance}%
                        </strong>
                    </div>

                    <div>
                        <small>${t("humidity")}</small>
                        <strong>
                            ${place.humidity}%
                        </strong>
                    </div>

                </div>


                <div class="water-local-status">
                    ${localStatus(place)}
                </div>

            `;


            container.appendChild(
                card
            );

        });

}



/* =========================================
   RESERVOIR
========================================= */

async function loadReservoir() {

    try {

        const response =
            await fetch("/api/berd-yai-reservoir");


        const result =
            await response.json();


        if (!result.success) {
            throw new Error(
                result.message
            );
        }


        reservoirData =
            result.data;


        renderReservoir();

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "reservoir-status"
        ).textContent =
            t("unavailable");

    }

}


function reservoirStatus(percent) {

    if (percent >= 100) {
        return t("reservoirVeryHigh");
    }

    if (percent >= 90) {
        return t("reservoirHigh");
    }

    if (percent >= 70) {
        return t("reservoirGood");
    }

    if (percent >= 30) {
        return t("reservoirMedium");
    }

    return t("reservoirLow");

}


function renderReservoir() {

    if (!reservoirData) {
        return;
    }


    document.getElementById(
        "reservoir-percent"
    ).textContent =
        reservoirData.percent.toFixed(2);


    document.getElementById(
        "reservoir-capacity"
    ).textContent =
        `${reservoirData.capacity.toFixed(3)} ${t("million")}`;


    document.getElementById(
        "reservoir-volume"
    ).textContent =
        `${reservoirData.volume.toFixed(3)} ${t("million")}`;


    document.getElementById(
        "water-bar-fill"
    ).style.width =
        `${Math.min(
            reservoirData.percent,
            100
        )}%`;


    document.getElementById(
        "reservoir-status"
    ).textContent =
        reservoirStatus(
            reservoirData.percent
        );


    const fetched =
        new Date(
            reservoirData.fetchedAt
        );


    document.getElementById(
        "reservoir-update"
    ).textContent =
        fetched.toLocaleString(
            currentLanguage === "th"
                ? "th-TH"
                : "en-GB",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

}



/* =========================================
   RADAR
========================================= */

let radarMap;
let radarFrames = [];

let radarLayer = null;

let radarFrameIndex = 0;

let radarTimer = null;

let radarPlaying = true;

let currentRadarDate = null;


function initRadarMap() {

    radarMap =
        L.map(
            "weather-radar"
        )
        .setView(
            [
                WAT_THAT.lat,
                WAT_THAT.lon
            ],
            8
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap"
        }
    )
    .addTo(
        radarMap
    );


    L.marker(
        [
            WAT_THAT.lat,
            WAT_THAT.lon
        ]
    )
    .addTo(
        radarMap
    )
    .bindPopup(
        "เทศบาลตำบลวัดธาตุ<br>Wat That Subdistrict"
    );

}


async function loadRadar() {

    try {

        const response =
            await fetch(
                "https://api.rainviewer.com/public/weather-maps.json"
            );


        const data =
            await response.json();


        radarFrames =
            (data.radar.past || [])
            .slice(-6)
            .map(frame => ({
                ...frame,
                host: data.host
            }));


        if (
            radarFrames.length === 0
        ) {

            throw new Error(
                "No radar data"
            );

        }


        radarFrameIndex = 0;


        showRadarFrame(
            radarFrameIndex
        );


        startRadar();

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "radar-time"
        ).textContent =
            t("unavailable");

    }

}


function showRadarFrame(index) {

    if (
        radarFrames.length === 0
    ) {
        return;
    }


    const frame =
        radarFrames[index];


    if (radarLayer) {

        radarMap.removeLayer(
            radarLayer
        );

    }


    radarLayer =
        L.tileLayer(

            `${frame.host}${frame.path}/256/{z}/{x}/{y}/2/1_0.png`,

            {
                opacity: 0.68,

                maxNativeZoom: 7,

                maxZoom: 12,

                attribution:
                    "Radar © RainViewer"
            }

        );


    radarLayer.addTo(
        radarMap
    );


    currentRadarDate =
        new Date(
            frame.time * 1000
        );


    updateRadarTime();


    document.getElementById(
        "radar-badge"
    ).textContent =

        index ===
        radarFrames.length - 1

            ? "🔴 RADAR • LATEST"

            : "▶ RADAR";

}


function scheduleRadarFrame() {

    if (!radarPlaying) {
        return;
    }


    const delay =
        radarFrameIndex ===
        radarFrames.length - 1

            ? 2500

            : 1000;


    radarTimer =
        setTimeout(
            () => {

                radarFrameIndex =
                    (
                        radarFrameIndex + 1
                    ) %
                    radarFrames.length;


                showRadarFrame(
                    radarFrameIndex
                );


                scheduleRadarFrame();

            },
            delay
        );

}


function startRadar() {

    clearTimeout(
        radarTimer
    );


    radarPlaying = true;

    updateRadarButton();

    scheduleRadarFrame();

}


function pauseRadar() {

    radarPlaying = false;

    clearTimeout(
        radarTimer
    );

    updateRadarButton();

}


function updateRadarButton() {

    const button =
        document.getElementById(
            "radar-play"
        );


    if (!button) {
        return;
    }


    button.textContent =
        radarPlaying
            ? t("radarPause")
            : t("radarPlay");

}


function updateRadarTime() {

    if (!currentRadarDate) {
        return;
    }


    document.getElementById(
        "radar-time"
    ).textContent =
        currentRadarDate.toLocaleString(
            currentLanguage === "th"
                ? "th-TH"
                : "en-GB",
            {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


document.getElementById(
    "radar-play"
)
.addEventListener(
    "click",
    () => {

        if (radarPlaying) {
            pauseRadar();
        }
        else {
            startRadar();
        }

    }
);



/* =========================================
   START APP
========================================= */

changeLanguage(
    currentLanguage
);


loadWeather();

loadWaterLocations();

loadReservoir();


initRadarMap();

loadRadar();


/* Weather refresh 10 min */

setInterval(
    loadWeather,
    10 * 60 * 1000
);


/* Local locations 10 min */

setInterval(
    loadWaterLocations,
    10 * 60 * 1000
);


/* Reservoir 30 min */

setInterval(
    loadReservoir,
    30 * 60 * 1000
);


/* Radar metadata refresh 10 min */

setInterval(
    loadRadar,
    10 * 60 * 1000
);
