export function validateName(name) {
    return name.trim().length >= 2;
}

export function validatePhone(phone) {
    const digits = phone.replace(/\D/g, "");

    // 10 цифр без кода страны
    if (digits.length === 10) {
        return true;
    }

    // 11 цифр, начинающихся с 7 или 8
    if (
        digits.length === 11 &&
        (digits.startsWith("7") || digits.startsWith("8"))
    ) {
        return true;
    }

    return false;
}

export function validateService(service) {
    const allowedServices = [
        "polishing",
        "interior",
        "coating"
    ];

    return allowedServices.includes(service);
}
