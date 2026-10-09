/* =====================================================
   CONFIG
===================================================== */

const WAT_THAT = {
    lat: 17.853694,
    lon: 102.801722
};


let currentLanguage =
    localStorage.getItem("watthat-language") || "th";


let weatherData = null;
let airQualityData = null;
let reservoirData = null;
let waterLocationData = [];


/* =====================================================
   TRANSLATIONS
===================================================== */

const i18n = {

    th: {
        unavailable: "ไม่สามารถโหลดข้อมูลได้",

        clear: "ท้องฟ้าแจ่มใส",
        partlyCloudy: "มีเมฆบางส่วน",
        cloudy: "มีเมฆมาก",
        fog: "มีหมอก",
        rainWeather: "มีฝน",
        showers: "มีฝนเป็นช่วง ๆ",
        thunder: "มีพายุฝนฟ้าคะนอง",

        rainNormal: "🟢 สถานการณ์ปกติ",
        rainWatch: "🟡 เฝ้าระวังฝน",
        rainWarning: "🟠 มีฝนค่อนข้างมาก",
        rainDanger: "🔴 ฝนตกหนัก",

        currentRain: "ฝนขณะนี้",
        rainChance: "โอกาสเกิดฝนวันนี้",

        temperature: "อุณหภูมิ",
        humidity: "ความชื้น",
        rainfall: "ฝน",
        chance: "โอกาสฝน",

        radarPlay: "▶ เล่น",
        radarPause: "⏸ หยุด",

        reservoirLow: "🟡 ปริมาณน้ำน้อย",
        reservoirMedium: "🟢 ปริมาณน้ำปานกลาง",
        reservoirHigh: "🟢 ปริมาณน้ำสูง",
        reservoirVeryHigh: "🟠 ปริมาณน้ำสูงมาก",
        reservoirFull: "🔴 เต็มหรือเกินความจุ",

        millionM3: "ล้าน ลบ.ม."
    },


    en: {
        unavailable: "Unable to load data",

        clear: "Clear sky",
        partlyCloudy: "Partly cloudy",
        cloudy: "Cloudy",
        fog: "Fog",
        rainWeather: "Rain",
        showers: "Rain showers",
        thunder: "Thunderstorms",

        rainNormal: "🟢 Normal conditions",
        rainWatch: "🟡 Rain watch",
        rainWarning: "🟠 Significant rainfall",
        rainDanger: "🔴 Heavy rainfall",

        currentRain: "Current rainfall",
        rainChance: "Today's rain chance",

        temperature: "Temperature",
        humidity: "Humidity",
        rainfall: "Rain",
        chance: "Rain chance",

        radarPlay: "▶ Play",
        radarPause: "⏸ Pause",

        reservoirLow: "🟡 Low storage",
        reservoirMedium: "🟢 Moderate storage",
        reservoirHigh: "🟢 High storage",
        reservoirVeryHigh: "🟠 Very high storage",
        reservoirFull: "🔴 Full or above capacity",

        millionM3: "million m³"
    }

};


function t(key) {

    return i18n[currentLanguage][key];

}


/* =====================================================
   LANGUAGE
===================================================== */

function changeLanguage(language) {

    currentLanguage =
        language;


    localStorage.setItem(
        "watthat-language",
        language
    );


    document.documentElement.lang =
        language;


    document
        .querySelectorAll(
            "[data-th][data-en]"
        )
        .forEach(element => {

            element.textContent =
                language === "th"
                    ? element.dataset.th
                    : element.dataset.en;

        });


    document
        .querySelectorAll(
            ".lang-btn"
        )
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


    updateClock();

    renderWeather();

    renderForecast();

    renderAirQuality();

    renderReservoir();

    renderWaterLocations();

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


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

    const now =
        new Date();


    const locale =
        currentLanguage === "th"
            ? "th-TH"
            : "en-GB";


    document.getElementById(
        "clock-time"
    ).textContent =
        now.toLocaleTimeString(
            locale,
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    document.getElementById(
        "clock-date"
    ).textContent =
        now.toLocaleDateString(
            locale,
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


setInterval(
    updateClock,
    1000
);


/* =====================================================
   WEATHER INFO
===================================================== */

function getWeatherInfo(code) {

    if (code === 0) {

        return {
            icon: "☀️",
            text: t("clear")
        };

    }


    if (
        code === 1 ||
        code === 2
    ) {

        return {
            icon: "🌤️",
            text: t("partlyCloudy")
        };

    }


    if (code === 3) {

        return {
            icon: "☁️",
            text: t("cloudy")
        };

    }


    if (
        code >= 45 &&
        code <= 48
    ) {

        return {
            icon: "🌫️",
            text: t("fog")
        };

    }


    if (
        code >= 51 &&
        code <= 67
    ) {

        return {
            icon: "🌧️",
            text: t("rainWeather")
        };

    }


    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            icon: "🌦️",
            text: t("showers")
        };

    }


    if (code >= 95) {

        return {
            icon: "⛈️",
            text: t("thunder")
        };

    }


    return {
        icon: "🌤️",
        text: t("partlyCloudy")
    };

}


/* =====================================================
   WEATHER API
===================================================== */

async function loadWeather() {

    try {

        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${WAT_THAT.lat}` +
            `&longitude=${WAT_THAT.lon}` +
            "&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum" +
            "&forecast_days=7" +
            "&timezone=Asia%2FBangkok";


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Weather HTTP ${response.status}`
            );

        }


        weatherData =
            await response.json();


        renderWeather();

        renderForecast();

    }

    catch (error) {

        console.error(
            "Weather error:",
            error
        );

    }

}


/* =====================================================
   WEATHER RENDER
===================================================== */

function renderWeather() {

    if (!weatherData) {
        return;
    }


    const current =
        weatherData.current;


    const info =
        getWeatherInfo(
            current.weather_code
        );


    document.getElementById(
        "weather-symbol"
    ).textContent =
        info.icon;


    document.getElementById(
        "weather-description"
    ).textContent =
        info.text;


    document.getElementById(
        "temperature"
    ).textContent =
        Number(
            current.temperature_2m
        ).toFixed(1);


    document.getElementById(
        "feels-like"
    ).textContent =
        Number(
            current.apparent_temperature
        ).toFixed(1);


    document.getElementById(
        "humidity"
    ).textContent =
        current.relative_humidity_2m;


    document.getElementById(
        "wind"
    ).textContent =
        Number(
            current.wind_speed_10m
        ).toFixed(1);


    document.getElementById(
        "pressure"
    ).textContent =
        Math.round(
            current.surface_pressure
        );


    document.getElementById(
        "current-rain"
    ).textContent =
        Number(
            current.precipitation || 0
        ).toFixed(1);


    document.getElementById(
        "today-rain"
    ).textContent =
        Number(
            weatherData.daily
                .precipitation_sum[0] || 0
        ).toFixed(1);


    const sevenDayRain =
        weatherData.daily
            .precipitation_sum
            .reduce(
                (total, value) =>
                    total + Number(value || 0),
                0
            );


    document.getElementById(
        "seven-day-rain"
    ).textContent =
        sevenDayRain.toFixed(1);


    const weatherTime =
        new Date(
            current.time
        );


    document.getElementById(
        "weather-update"
    ).textContent =
        weatherTime.toLocaleString(
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


    renderRainStatus();

}


/* =====================================================
   RAIN STATUS
===================================================== */

function renderRainStatus() {

    if (!weatherData) {
        return;
    }


    const rain =
        Number(
            weatherData.current
                .precipitation || 0
        );


    const chance =
        Number(
            weatherData.daily
                .precipitation_probability_max[0] || 0
        );


    const box =
        document.getElementById(
            "rain-status-box"
        );


    const status =
        document.getElementById(
            "rain-status-text"
        );


    const detail =
        document.getElementById(
            "rain-status-detail"
        );


    box.classList.remove(
        "watch",
        "warning",
        "danger"
    );


    if (rain >= 15) {

        status.textContent =
            t("rainDanger");


        detail.textContent =
            `${t("currentRain")} ${rain.toFixed(1)} mm`;


        box.classList.add(
            "danger"
        );

    }

    else if (rain >= 5) {

        status.textContent =
            t("rainWarning");


        detail.textContent =
            `${t("currentRain")} ${rain.toFixed(1)} mm`;


        box.classList.add(
            "warning"
        );

    }

    else if (
        rain > 0 ||
        chance >= 60
    ) {

        status.textContent =
            t("rainWatch");


        detail.textContent =
            `${t("rainChance")} ${chance}%`;


        box.classList.add(
            "watch"
        );

    }

    else {

        status.textContent =
            t("rainNormal");


        detail.textContent =
            `${t("rainChance")} ${chance}%`;

    }

}


/* =====================================================
   FORECAST
===================================================== */

function renderForecast() {

    if (!weatherData) {
        return;
    }


    const container =
        document.getElementById(
            "forecast"
        );


    container.innerHTML = "";


    weatherData.daily.time.forEach(
        (dateString, index) => {

            const date =
                new Date(
                    `${dateString}T00:00:00`
                );


            const info =
                getWeatherInfo(
                    weatherData.daily
                        .weather_code[index]
                );


            const dateLabel =
                date.toLocaleDateString(
                    currentLanguage === "th"
                        ? "th-TH"
                        : "en-GB",
                    {
                        weekday: "short",
                        day: "numeric",
                        month: "short"
                    }
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "forecast-item";


            card.innerHTML = `

                <div class="forecast-day">
                    ${dateLabel}
                </div>

                <div class="forecast-icon">
                    ${info.icon}
                </div>

                <div class="forecast-max">
                    ${Math.round(
                        weatherData.daily
                            .temperature_2m_max[index]
                    )}°
                </div>

                <div class="forecast-min">
                    ${Math.round(
                        weatherData.daily
                            .temperature_2m_min[index]
                    )}°
                </div>

                <div class="forecast-rain">
                    💧
                    ${
                        weatherData.daily
                            .precipitation_probability_max[index]
                    }%
                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   AIR QUALITY
===================================================== */

async function loadAirQuality() {

    try {

        const url =
            "https://air-quality-api.open-meteo.com/v1/air-quality" +
            `?latitude=${WAT_THAT.lat}` +
            `&longitude=${WAT_THAT.lon}` +
            "&current=pm2_5,pm10,us_aqi" +
            "&timezone=Asia%2FBangkok";


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Air quality HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        airQualityData =
            result.current;


        renderAirQuality();

    }

    catch (error) {

        console.error(
            "Air quality error:",
            error
        );


        document.getElementById(
            "air-quality-status"
        ).textContent =
            t("unavailable");

    }

}


/* =====================================================
   AQI STATUS
===================================================== */

function getAirQualityStatus(aqi) {

    if (aqi <= 50) {

        return {
            className: "good",

            th:
                "🟢 คุณภาพอากาศดี",

            en:
                "🟢 Good",

            adviceTh:
                "คุณภาพอากาศอยู่ในเกณฑ์ดี สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ",

            adviceEn:
                "Air quality is good. Normal outdoor activities can continue."
        };

    }


    if (aqi <= 100) {

        return {
            className: "moderate",

            th:
                "🟡 คุณภาพอากาศปานกลาง",

            en:
                "🟡 Moderate",

            adviceTh:
                "คุณภาพอากาศอยู่ในระดับปานกลาง ผู้ที่ไวต่อมลพิษควรติดตามอาการของตนเอง",

            adviceEn:
                "Air quality is moderate. Sensitive individuals should monitor symptoms."
        };

    }


    if (aqi <= 150) {

        return {
            className: "sensitive",

            th:
                "🟠 เริ่มมีผลต่อกลุ่มเสี่ยง",

            en:
                "🟠 Unhealthy for sensitive groups",

            adviceTh:
                "เด็ก ผู้สูงอายุ และผู้ที่มีปัญหาระบบทางเดินหายใจควรลดกิจกรรมกลางแจ้งเป็นเวลานาน",

            adviceEn:
                "Sensitive groups should reduce prolonged outdoor activity."
        };

    }


    if (aqi <= 200) {

        return {
            className: "unhealthy",

            th:
                "🔴 มีผลกระทบต่อสุขภาพ",

            en:
                "🔴 Unhealthy",

            adviceTh:
                "ควรลดกิจกรรมกลางแจ้งเป็นเวลานาน โดยเฉพาะเด็ก ผู้สูงอายุ และกลุ่มเสี่ยง",

            adviceEn:
                "Reduce prolonged outdoor activity, especially for sensitive groups."
        };

    }


    if (aqi <= 300) {

        return {
            className: "very-unhealthy",

            th:
                "🟣 มีผลกระทบต่อสุขภาพมาก",

            en:
                "🟣 Very unhealthy",

            adviceTh:
                "ควรหลีกเลี่ยงกิจกรรมกลางแจ้งเป็นเวลานาน และติดตามข้อมูลคุณภาพอากาศอย่างใกล้ชิด",

            adviceEn:
                "Avoid prolonged outdoor activity and closely follow air-quality information."
        };

    }


    return {
        className: "hazardous",

        th:
            "🟤 คุณภาพอากาศอันตราย",

        en:
            "🟤 Hazardous",

        adviceTh:
            "ควรหลีกเลี่ยงกิจกรรมกลางแจ้งและติดตามคำแนะนำจากหน่วยงานด้านสาธารณสุข",

        adviceEn:
            "Avoid outdoor activity and follow public-health advice."
    };

}


/* =====================================================
   AIR QUALITY RENDER
===================================================== */

function renderAirQuality() {

    if (!airQualityData) {
        return;
    }


    const pm25 =
        Number(
            airQualityData.pm2_5
        );


    const pm10 =
        Number(
            airQualityData.pm10
        );


    const aqi =
        Math.round(
            Number(
                airQualityData.us_aqi
            )
        );


    document.getElementById(
        "pm25"
    ).textContent =
        Number.isFinite(pm25)
            ? pm25.toFixed(1)
            : "--";


    document.getElementById(
        "pm10"
    ).textContent =
        Number.isFinite(pm10)
            ? pm10.toFixed(1)
            : "--";


    document.getElementById(
        "air-aqi"
    ).textContent =
        Number.isFinite(aqi)
            ? aqi
            : "--";


    if (!Number.isFinite(aqi)) {
        return;
    }


    const state =
        getAirQualityStatus(
            aqi
        );


    const badge =
        document.getElementById(
            "air-quality-status"
        );


    badge.className =
        `air-status-badge ${state.className}`;


    badge.textContent =
        currentLanguage === "th"
            ? state.th
            : state.en;


    document.getElementById(
        "air-quality-advice"
    ).textContent =
        currentLanguage === "th"
            ? state.adviceTh
            : state.adviceEn;


    const markerPosition =
        Math.min(
            Math.max(
                aqi / 300 * 100,
                0
            ),
            100
        );


    document.getElementById(
        "air-meter-marker"
    ).style.left =
        `${markerPosition}%`;


    const airTime =
        new Date(
            airQualityData.time
        );


    document.getElementById(
        "air-update"
    ).textContent =
        airTime.toLocaleString(
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


/* =====================================================
   RESERVOIR
===================================================== */

async function loadReservoir() {

    try {

        const response =
            await fetch(
                "/api/reservoir",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Reservoir HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Reservoir API error"
            );

        }


        reservoirData =
            result.data;


        renderReservoir();

    }

    catch (error) {

        console.error(
            "Reservoir error:",
            error
        );


        document.getElementById(
            "reservoir-status"
        ).textContent =
            t("unavailable");

    }

}


/* =====================================================
   RESERVOIR STATUS
===================================================== */

function getReservoirStatus(percent) {

    if (percent >= 100) {
        return t("reservoirFull");
    }

    if (percent >= 90) {
        return t("reservoirVeryHigh");
    }

    if (percent >= 70) {
        return t("reservoirHigh");
    }

    if (percent >= 30) {
        return t("reservoirMedium");
    }

    return t("reservoirLow");

}


/* =====================================================
   RESERVOIR RENDER
===================================================== */

function renderReservoir() {

    if (!reservoirData) {
        return;
    }


    const percent =
        Number(
            reservoirData.percent
        );


    const volume =
        Number(
            reservoirData.volume
        );


    const capacity =
        Number(
            reservoirData.capacity
        );


    document.getElementById(
        "reservoir-percent"
    ).textContent =
        percent.toFixed(2);


    document.getElementById(
        "reservoir-volume"
    ).textContent =
        `${volume.toFixed(3)} ${t("millionM3")}`;


    document.getElementById(
        "reservoir-capacity"
    ).textContent =
        `${capacity.toFixed(3)} ${t("millionM3")}`;


    document.getElementById(
        "water-progress-fill"
    ).style.width =
        `${Math.min(percent, 100)}%`;


    document.getElementById(
        "reservoir-status"
    ).textContent =
        getReservoirStatus(
            percent
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
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


/* =====================================================
   LOCAL WATER
===================================================== */

const waterLocations = [

    {
        th: "บึงหนองคาย",
        en: "Bueng Nong Khai",

        areaTh:
            "บ้านสร้างประทาย หมู่ 10",

        areaEn:
            "Ban Sang Prathai, Moo 10",

        icon:
            "🌊",

        lat:
            17.853694,

        lon:
            102.801722
    },


    {
        th: "ลำห้วยยาง",
        en: "Huai Yang Stream",

        areaTh:
            "พื้นที่บ้านเมืองบาง",

        areaEn:
            "Ban Mueang Bang area",

        icon:
            "💧",

        lat:
            17.851441,

        lon:
            102.829628
    },


    {
        th: "อ่างเก็บน้ำบ้านเบิดใหญ่",
        en: "Ban Boet Yai Reservoir",

        areaTh:
            "บ้านเบิดใหญ่ หมู่ 6",

        areaEn:
            "Ban Boet Yai, Moo 6",

        icon:
            "🏞️",

        lat:
            17.862368,

        lon:
            102.825702
    },


    {
        th: "ห้วยจุ่มก้น",
        en: "Huai Chum Kon",

        areaTh:
            "บ้านทิพย์ธานี หมู่ 14",

        areaEn:
            "Ban Thip Thani, Moo 14",

        icon:
            "💦",

        lat:
            17.867458,

        lon:
            102.781926
    },


    {
        th: "คลองหลุบบึ่ง",
        en: "Khlong Lup Bueng",

        areaTh:
            "บ้านเบิดน้อย หมู่ 7",

        areaEn:
            "Ban Boet Noi, Moo 7",

        icon:
            "💦",

        lat:
            17.871892,

        lon:
            102.807057
    }

];


/* =====================================================
   LOAD LOCAL WATER WEATHER
===================================================== */

async function loadWaterLocations() {

    try {

        const results =
            await Promise.all(

                waterLocations.map(
                    async place => {

                        const url =
                            "https://api.open-meteo.com/v1/forecast" +
                            `?latitude=${place.lat}` +
                            `&longitude=${place.lon}` +
                            "&current=temperature_2m,relative_humidity_2m,precipitation" +
                            "&daily=precipitation_probability_max" +
                            "&forecast_days=1" +
                            "&timezone=Asia%2FBangkok";


                        const response =
                            await fetch(url);


                        if (!response.ok) {

                            throw new Error(
                                "Local weather API error"
                            );

                        }


                        const data =
                            await response.json();


                        return {

                            ...place,

                            temperature:
                                Number(
                                    data.current.temperature_2m
                                ),

                            humidity:
                                Number(
                                    data.current.relative_humidity_2m
                                ),

                            rain:
                                Number(
                                    data.current.precipitation || 0
                                ),

                            chance:
                                Number(
                                    data.daily
                                        .precipitation_probability_max[0] || 0
                                )

                        };

                    }
                )

            );


        waterLocationData =
            results;


        renderWaterLocations();

    }

    catch (error) {

        console.error(
            "Water location error:",
            error
        );


        document.getElementById(
            "water-locations"
        ).textContent =
            t("unavailable");

    }

}


/* =====================================================
   WATER POINT STATUS
===================================================== */

function getWaterPointStatus(place) {

    if (place.rain >= 15) {
        return t("rainDanger");
    }


    if (place.rain >= 5) {
        return t("rainWarning");
    }


    if (
        place.rain > 0 ||
        place.chance >= 60
    ) {
        return t("rainWatch");
    }


    return t("rainNormal");

}


/* =====================================================
   WATER POINT RENDER
===================================================== */

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


    container.innerHTML =
        "";


    waterLocationData.forEach(
        place => {

            const name =
                currentLanguage === "th"
                    ? place.th
                    : place.en;


            const area =
                currentLanguage === "th"
                    ? place.areaTh
                    : place.areaEn;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "water-point";


            card.innerHTML = `

                <div class="water-point-head">

                    <div class="water-point-icon">
                        ${place.icon}
                    </div>

                    <div>

                        <h3>
                            ${name}
                        </h3>

                        <p>
                            ${area}
                        </p>

                    </div>

                </div>


                <div class="water-point-data">

                    <div>

                        <small>
                            ${t("temperature")}
                        </small>

                        <strong>
                            ${place.temperature.toFixed(1)}°C
                        </strong>

                    </div>


                    <div>

                        <small>
                            ${t("rainfall")}
                        </small>

                        <strong>
                            ${place.rain.toFixed(1)} mm
                        </strong>

                    </div>


                    <div>

                        <small>
                            ${t("chance")}
                        </small>

                        <strong>
                            ${place.chance}%
                        </strong>

                    </div>


                    <div>

                        <small>
                            ${t("humidity")}
                        </small>

                        <strong>
                            ${place.humidity}%
                        </strong>

                    </div>

                </div>


                <div class="water-point-status">
                    ${getWaterPointStatus(place)}
                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   RADAR
===================================================== */

let radarMap = null;

let radarFrames = [];

let radarLayer = null;

let radarFrameIndex = 0;

let radarTimer = null;

let radarPlaying = true;

let radarCurrentDate = null;


/* =====================================================
   INIT RADAR MAP
===================================================== */

function initRadarMap() {

    radarMap =
        L.map(
            "weather-radar",
            {
                zoomControl: true,
                attributionControl: true
            }
        )
        .setView(
            [
                WAT_THAT.lat,
                WAT_THAT.lon
            ],
            7
        );


    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
        "เทศบาลตำบลวัดธาตุ<br>Wat That Subdistrict Municipality"
    );


    setTimeout(
        () => {
            radarMap.invalidateSize();
        },
        300
    );

}


/* =====================================================
   LOAD RADAR
===================================================== */

async function loadRadar() {

    try {

        const wasPlaying =
            radarPlaying;


        clearTimeout(
            radarTimer
        );


        const response =
            await fetch(
                "https://api.rainviewer.com/public/weather-maps.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Radar HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        radarFrames =
            (data.radar?.past || [])
                .slice(-8)
                .map(
                    frame => ({
                        ...frame,
                        host:
                            data.host
                    })
                );


        if (
            radarFrames.length === 0
        ) {

            throw new Error(
                "No radar frames"
            );

        }


        radarFrameIndex =
            0;


        showRadarFrame(
            radarFrameIndex
        );


        if (wasPlaying) {

            startRadar();

        }
        else {

            radarPlaying =
                false;

            radarFrameIndex =
                radarFrames.length - 1;

            showRadarFrame(
                radarFrameIndex
            );

            updateRadarButton();

        }

    }

    catch (error) {

        console.error(
            "Radar error:",
            error
        );


        document.getElementById(
            "radar-time"
        ).textContent =
            t("unavailable");

    }

}


/* =====================================================
   SHOW RADAR FRAME
===================================================== */

function showRadarFrame(index) {

    if (
        !radarMap ||
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
                opacity:
                    0.68,

                maxNativeZoom:
                    7,

                maxZoom:
                    12,

                attribution:
                    "Radar © RainViewer"
            }
        );


    radarLayer.addTo(
        radarMap
    );


    radarCurrentDate =
        new Date(
            frame.time * 1000
        );


    document.getElementById(
        "radar-live"
    ).textContent =
        index ===
        radarFrames.length - 1
            ? "● RADAR • LATEST"
            : "● RADAR";


    updateRadarTime();

}


/* =====================================================
   RADAR ANIMATION
===================================================== */

function scheduleRadarFrame() {

    if (
        !radarPlaying ||
        radarFrames.length === 0
    ) {
        return;
    }


    const delay =
        radarFrameIndex ===
        radarFrames.length - 1
            ? 2500
            : 900;


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


    radarPlaying =
        true;


    updateRadarButton();


    scheduleRadarFrame();

}


function pauseRadar() {

    radarPlaying =
        false;


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

    if (!radarCurrentDate) {
        return;
    }


    document.getElementById(
        "radar-time"
    ).textContent =
        radarCurrentDate.toLocaleString(
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


/* =====================================================
   START
===================================================== */

changeLanguage(
    currentLanguage
);


updateClock();


loadWeather();

loadAirQuality();

loadReservoir();

loadWaterLocations();


initRadarMap();

loadRadar();


/* =====================================================
   AUTO REFRESH
===================================================== */

/* Weather every 10 minutes */

setInterval(
    loadWeather,
    10 * 60 * 1000
);


/* PM2.5 every 30 minutes */

setInterval(
    loadAirQuality,
    30 * 60 * 1000
);


/* Local weather every 10 minutes */

setInterval(
    loadWaterLocations,
    10 * 60 * 1000
);


/* Reservoir every 30 minutes */

setInterval(
    loadReservoir,
    30 * 60 * 1000
);


/* Radar metadata every 10 minutes */

setInterval(
    loadRadar,
    10 * 60 * 1000
);
