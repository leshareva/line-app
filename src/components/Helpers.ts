const request = require("request");
const fs = require("fs"); // fs para escrever diretamente para o disco, much win
const path = require("path");


export const parseQueryString = (string) => {
    return string.slice(1).split('&')
        .map((queryParam) => {
            let kvp = queryParam.split('=');
            return { key: kvp[0], value: kvp[1] }
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


export function formatLessonTime(el: any) {
    const days = {
        0: 'вс',
        1: 'пн',
        2: 'вт',
        3: 'ср',
        4: 'чт',
        5: 'пт',
        6: 'сб'
    }

    let key = parseDate(el['Дата']).replace(/^(\d+\s.+?)\s.+/gs, '$1');
    el['День недели'] = days[new Date(el['Дата']).getDay()]
    el['Время'] = Time(el['Дата'])
    el['Дата'] = key;
    return el
}


