

export const parseOptions = (
    data = [], 
    selected = ['', '', 'Select.'],
    index = [],  
    replace = ['key', 'value', 'text'] 
) => {
    let newData = [];
    try {
        if (selected) {
            let payload = {};
            for(let rep in replace) {
                payload[replace[rep]] = selected[rep];
            }
            // add first
            newData.push(payload);
        }
        data.filter(d => {
            let metaData = {};
            for(let i in index) {
                let key = replace[i];
                let value = d[index[i]];
                metaData[key] = value;
            }
            // add
            newData.push(metaData);
        });
        // response
        return newData;
    } catch (error) {
        return [];
    }
}