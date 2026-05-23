export function validateEsicForm8(formData) {
    let valid = true;
    let errors = [];
    if (formData.amount > 7000)
        errors.push('exceeds_esic_limit');
    return { valid: errors.length === 0, errors };
}
