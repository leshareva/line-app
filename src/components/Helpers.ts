export const parseQueryString = (string) => {
    return string.slice(1).split('&')
        .map((queryParam) => {
            let kvp = queryParam.split('=');
            return {key: kvp[0], value: kvp[1]}
        })
        .reduce((query, kvp) => {
            query[kvp.key] = kvp.value;
            return query
        }, {})
};

export const parseDate = (iso: string) => {
    var arr = [
        'января',
        'февраля',
        'марта',
        'апреля',
        'мая',
        'июня',
        'июля',
        'августа',
        'сентября',
        'октября',
        'ноября',
        'декабря',
    ];
    let date = new Date(iso)
    let month = arr[+date.getMonth()];
    const result = `${date.getDate()} ${month} ${date.getFullYear()}, ${date.toLocaleTimeString().replace(/(.*:.*?):\d+/gs, '$1')}`
    return result
}

export function Time(date) {
    var d = new Date(date);
    d.setHours(d.getHours());
    let res = d.toTimeString().substring(0, 5);
    return res;

}