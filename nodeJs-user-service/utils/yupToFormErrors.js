import isEmpty from 'is-empty'

export default function yupToFormError(validationError) {
    if (isEmpty(validationError) || !validationError.inner) {
        return {}
    }

    const errors = validationError.inner.reduce((accumulator, error) => {
        
        const fieldPath = error.path || 'general'
        
        if (!accumulator[fieldPath] || error.message.length > accumulator[fieldPath].length) {
            accumulator[fieldPath] = error.message
        }
        
        return accumulator
    }, {})

    return errors
}


export function formatHealthValidationError(formErrors) {
    const healthSpecificMessages = {
        age: 'Age information is required for safe health recommendations',
        weight: 'Weight information helps determine appropriate calorie and exercise targets',
        height: 'Height information is needed for accurate health calculations',
        healthConditions: 'Health conditions help us provide safe, personalized recommendations',
        medications: 'Medication information is important for exercise and nutrition safety',
        emergencyContact: 'Emergency contact information is crucial for your safety during fitness activities',
        disclaimerAcceptance: 'Understanding health disclaimers is essential for safe service use'
    }

    const enhancedErrors = { ...formErrors }
    Object.keys(enhancedErrors).forEach(field => {
        if (healthSpecificMessages[field]) {
            enhancedErrors[field] = `${enhancedErrors[field]}. ${healthSpecificMessages[field]}`
        }
    })

    return enhancedErrors
}