require("dotenv").config();

const express = require("express");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Заполни TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID");
    process.exit(1);
}

app.use(express.json({ limit: "10kb" }));

// Для локального тестирования отдаём сам сайт.
app.use(express.static(path.join(__dirname, "..")));

const services = [
    "Полировка кузова",
    "Химчистка салона",
    "Защитное покрытие"
];


function validateRequest(data) {
    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return false;
    }

    const {
        name,
        phone,
        service,
        comment = ""
    } = data;

    if (
    typeof data.companyWebsite !== "string" ||
    data.companyWebsite !== ""
) {
    return false;
}

    if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 80
    ) {
        return false;
    }

    if (
        typeof phone !== "string" ||
        !/^\+?[0-9\s()-]{10,20}$/.test(phone)
    ) {
        return false;
    }

    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10 || digits.length > 15) {
        return false;
    }

    const allowedServices = [
        "Полировка кузова",
        "Химчистка салона",
        "Защитное покрытие"
    ];

    if (!allowedServices.includes(service)) {
        return false;
    }

    if (
        typeof comment !== "string" ||
        comment.length > 500
    ) {
        return false;
    }

    return true;
}


const cors = require("cors");

const { rateLimit } = require("express-rate-limit");


const allowedOrigins = [
    "https://aladick9454-bot.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS: источник не разрешён"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));



const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Слишком много заявок. Попробуйте через 15 минут."
    }
});

app.use("/api/booking", bookingLimiter);


app.post("/api/booking", async (req, res) => {
    if (!validateRequest(req.body)) {
        return res.status(400).json({
            success: false,
            message: "Проверьте данные формы."
        });
    }

    const { name, phone, service, comment = "" } = req.body;

    const message = [
        "🚗 Новая заявка DETAIL PRO",
        "",
        `Имя: ${name.trim()}`,
        `Телефон: ${phone.trim()}`,
        `Услуга: ${service}`,
        `Комментарий: ${comment.trim() || "Не указан"}`
    ].join("\n");

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message
                }),
                signal: AbortSignal.timeout(10000)
            }
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error("Telegram не подтвердил доставку");
        }

        return res.json({
            success: true,
            message: "Заявка успешно отправлена!"
        });
    } catch (error) {
        console.error("Ошибка отправки заявки:", error.message);

        return res.status(502).json({
            success: false,
            message: "Не удалось отправить заявку. Попробуйте позже."
        });
    }
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "detail-pro-api"
    });
});

app.listen(PORT, () => {
    console.log(`Сайт запущен: http://localhost:${PORT}`);
});
