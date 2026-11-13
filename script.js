import {
    validateName,
    validatePhone,
    validateService
} from "./formValidation.js";

console.log("DETAIL PRO: сайт успешно загружен");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");

if (menuButton && navigation) {

    function closeMenu() {
        navigation.classList.remove("is-open");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Открыть меню"
        );
    }

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Закрыть меню" : "Открыть меню"
        );
    });

    // Закрываем меню после выбора раздела

    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    // Закрываем меню клавишей Escape

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    // Закрываем меню при переходе на широкий экран

    const desktopQuery = window.matchMedia(
        "(min-width: 769px)"
    );

    desktopQuery.addEventListener("change", (event) => {
        if (event.matches) {
            closeMenu();
        }
    });

    document.addEventListener("click", (event) => {

    const clickedInsideMenu = navigation.contains(event.target);
    const clickedButton = menuButton.contains(event.target);

    if (!clickedInsideMenu && !clickedButton) {
        closeMenu();
    }

});
}


/* ===== Урок 40: форма заявки ===== */

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
    const nameInput = document.querySelector("#client-name");
    const phoneInput = document.querySelector("#client-phone");
    const serviceInput = document.querySelector("#client-service");
    const messageInput = document.querySelector("#client-message");

    const submitButton = document.querySelector("#submit-button");
    const formResult = document.querySelector("#form-result");

    function setFieldState(input, errorId, message) {
        const errorElement = document.querySelector(errorId);
        const hasError = message !== "";

        errorElement.textContent = message;

        input.classList.toggle("input-error", hasError);
        input.classList.toggle("input-success", !hasError);

        input.setAttribute(
            "aria-invalid",
            String(hasError)
        );

        return !hasError;
    }

    function checkName() {
        const isValid = validateName(nameInput.value);

        return setFieldState(
            nameInput,
            "#name-error",
            isValid ? "" : "Введите минимум 2 символа."
        );
    }

    function checkPhone() {
        const isValid = validatePhone(phoneInput.value);

        return setFieldState(
            phoneInput,
            "#phone-error",
            isValid ? "" : "Введите корректный номер телефона."
        );
    }

    function checkService() {
        const isValid = validateService(serviceInput.value);

        return setFieldState(
            serviceInput,
            "#service-error",
            isValid ? "" : "Выберите услугу."
        );
    }

    // Проверяем поля после завершения ввода

    nameInput.addEventListener("blur", checkName);
    phoneInput.addEventListener("blur", checkPhone);
    serviceInput.addEventListener("change", checkService);

    function validateForm() {
        const nameValid = checkName();
        const phoneValid = checkPhone();
        const serviceValid = checkService();

        return nameValid && phoneValid && serviceValid;
    }

    function clearFieldStates() {
        [nameInput, phoneInput, serviceInput].forEach((input) => {
            input.classList.remove(
                "input-error",
                "input-success"
            );

            input.removeAttribute("aria-invalid");
        });

        document.querySelectorAll(".form-error").forEach((error) => {
            error.textContent = "";
        });
    }

    // Демонстрационная асинхронная операция
    // Она НЕ отправляет данные на сервер

    function simulateRequest() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1200);
        });
    }

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        formResult.textContent = "";
        formResult.className = "form-result";

        if (!validateForm()) {
            formResult.textContent =
                "Проверьте правильность заполнения формы.";

            formResult.classList.add("error");

            const firstInvalid = contactForm.querySelector(
                '[aria-invalid="true"]'
            );

            firstInvalid?.focus();
            return;
        }

        const formData = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            service: serviceInput.value,
            message: messageInput.value.trim()
        };

        submitButton.disabled = true;
        submitButton.textContent = "Обработка заявки...";

        try {
            await simulateRequest();

            console.log(
                "Демо-заявка прошла проверку:",
                {
                    service: formData.service,
                    hasMessage: formData.message.length > 0
                }
            );

            formResult.textContent =
                "Демонстрационная заявка успешно обработана. " +
                "Данные никуда не отправлены.";

            formResult.classList.add("success");

            contactForm.reset();
            clearFieldStates();

        } catch (error) {
            console.error("Ошибка обработки формы:", error);

            formResult.textContent =
                "Не удалось обработать заявку. Попробуйте ещё раз.";

            formResult.classList.add("error");

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Отправить заявку";
        }
    });
    const messageCounter = document.querySelector("#message-counter");

messageInput.addEventListener("input", () => {
    messageCounter.textContent =
        `${messageInput.value.length} / 500 символов`;
});
}
phoneInput.addEventListener("input", () => {
    if (phoneInput.classList.contains("input-error")) {
        checkPhone();
    }
});
