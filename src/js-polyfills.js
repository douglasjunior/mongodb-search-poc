
if (!RegExp.escape) {
    RegExp.escape = s => {
        return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    };
}
