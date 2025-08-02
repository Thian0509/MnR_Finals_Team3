// removes underscores from a string
export const removeUnderscores = (str: string) => {
    return str.replace(/_/g, " ")
}

// capitalizes the first letter of a string
export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// capitalizes the first letter of each word in a string

