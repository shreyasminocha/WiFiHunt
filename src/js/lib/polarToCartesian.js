function polarToCartesian(angle, radius) {
    const inRadians = toRadians(angle);
    const ratios = [Math.cos(inRadians), Math.sin(inRadians)];

    return ratios.map(ratio => toFixed(radius * ratio, 4));
}
