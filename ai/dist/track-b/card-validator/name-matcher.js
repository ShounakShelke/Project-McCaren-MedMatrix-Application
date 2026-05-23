export function matchNames(billName, cardName) {
    // simple string distances could reside here
    return billName.toLowerCase() === cardName.toLowerCase();
}
