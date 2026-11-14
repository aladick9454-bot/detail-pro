import {
    validateName,
    validatePhone,
    validateService
} from "./formValidation.js";

// Мобильное меню
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");

if (menuButton && navigation) {
    function closeMenu() {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Открыть меню");
    }

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Закрыть меню" : "Открыть меню"
        );
    });

    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
        if (
            !navigation.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeMenu();
        }
    });
}

// Отправка заявки на сервер
async function sendBooking(data) {
    const isLocal = [
        "localhost",
        "127.0.0.1"
    ].includes(window.location.hostname);

    const API_URL = isLocal
        ? "/api/booking"
        : "https://detail-pro-api.onrender.com/api/booking";

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Ошибка отправки");
    }

    return result;
}

// Форма
const contactForm = document.querySelector("#contact-form");

if (contactForm) {
    const nameInput = document.querySelector("#client-name");
    const phoneInput = document.querySelector("#client-phone");
    const serviceInput = document.querySelector("#client-service");
    const messageInput = document.querySelector("#client-message");
    const submitButton = document.querySelector("#submit-button");
    const formResult = document.querySelector("#form-result");
    const messageCounter = document.querySelector("#message-counter");

    const serviceNames = {
        polishing: "Полировка кузова",
        interior: "Химчистка салона",
        coating: "Защитное покрытие"
    };

    function setFieldState(input, errorId, valid, errorText) {
        const errorElement = document.querySelector(errorId);

        errorElement.textContent = valid ? "" : errorText;
        input.classList.toggle("input-error", !valid);
        input.classList.toggle("input-success", valid);
        input.setAttribute("aria-invalid", String(!valid));

        return valid;
    }

    function checkName() {
        return setFieldState(
            nameInput,
            "#name-error",
            validateName(nameInput.value),
            "Введите минимум 2 символа."
        );
    }

    function checkPhone() {
        return setFieldState(
            phoneInput,
            "#phone-error",
            validatePhone(phoneInput.value),
            "Введите корректный номер телефона."
        );
    }

    function checkService() {
        return setFieldState(
            serviceInput,
            "#service-error",
            validateService(serviceInput.value),
            "Выберите услугу."
        );
    }

    nameInput.addEventListener("blur", checkName);
    phoneInput.addEventListener("blur", checkPhone);
    serviceInput.addEventListener("change", checkService);

    messageInput.addEventListener("input", () => {
        if (messageCounter) {
            messageCounter.textContent =
                `${messageInput.value.length} / 500 символов`;
        }
    });

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        formResult.textContent = "";
        formResult.className = "form-result";

        const validName = checkName();
        const validPhone = checkPhone();
        const validService = checkService();

        if (!validName || !validPhone || !validService) {
            formResult.textContent = "Проверьте данные формы.";
            formResult.classList.add("error");
            return;
        }

        const bookingData = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            service: serviceNames[serviceInput.value],
            comment: messageInput.value.trim(),
            companyWebsite: document.querySelector("#company-website").value = ""
        };

        submitButton.disabled = true;
        submitButton.textContent = "Отправка...";

        try {
            const result = await sendBooking(bookingData);

            formResult.textContent = result.message;
            formResult.classList.add("success");

            contactForm.reset();

            [nameInput, phoneInput, serviceInput].forEach((input) => {
                input.classList.remove("input-error", "input-success");
                input.removeAttribute("aria-invalid");
            });

            document.querySelectorAll(".form-error").forEach((element) => {
                element.textContent = "";
            });

            if (messageCounter) {
                messageCounter.textContent = "0 / 500 символов";
            }
        } catch (error) {
            console.error("Ошибка заявки:", error);
            formResult.textContent = error.message;
            formResult.classList.add("error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Отправить заявку";
        }
    });
}
