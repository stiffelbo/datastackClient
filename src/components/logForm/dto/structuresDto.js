export const structuresDto = (structures = []) => {
    let result = [];
    if(!structures) return result;

    result = structures.map(item => {
        return {
            id : +item.value,
            label : item.label,
            disabled : item.disabled,
            title : item.title,
            group : item.groupField,
        }
    });
    return result;
}