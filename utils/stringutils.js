function isEquals(a, b) {
    return typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
        : a === b;
};

function hhmmToHours(hh_mm) {
    const [hh, mm] = hh_mm.split(':');
    return parseInt(hh, 10) + parseInt(mm, 10) / 60;
}

module.exports = { isEquals, hhmmToHours };
