function toFixed(number, precision) {
    return Math.round(number * (10 ** precision)) / (10 ** precision);
}

function toRadians(angle) {
    return toFixed(angle * (Math.PI / 180), 4);
}

function polarToCartesian(angle, radius) {
    const inRadians = toRadians(angle);
    const ratios = [Math.cos(inRadians), Math.sin(inRadians)];

    return ratios.map(ratio => toFixed(radius * ratio, 4));
}

// not cryptographically secure
// see https://stackoverflow.com/a/34842797
function hash(str) {
    return str.split('').reduce((prevHash, currVal) => (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

function colorInGradient(begin, end, weight) {
    const partOfEnd = weight;
    const partOfBegin = 1 - partOfEnd;

    return [
        Math.round((begin[0] * partOfBegin) + (end[0] * partOfEnd)),
        Math.round((begin[1] * partOfBegin) + (end[1] * partOfEnd)),
        Math.round((begin[2] * partOfBegin) + (end[2] * partOfEnd))
    ];
}
