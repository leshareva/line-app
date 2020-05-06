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






//класс для сохранения и удаления файлов на сервер

export class Files {

    constructor() { }

    download(url, path_to, name): Promise<string | any> {
        let p = new Promise(function (resolve, reject) {
            let dest = path.join(path_to, name);
            let writeStream = fs.createWriteStream(dest);

            // Avisando a promise que acabamos por aqui
            writeStream.on("finish", function () {
                resolve(dest as string);
            });

            // Capturando erros da write stream
            writeStream.on("error", function (err) {
                fs.unlink(dest, reject.bind(null, err));
            });

            let readStream = request.get(url);

            // Capturando erros da request stream
            readStream.on("error", function (err) {
                fs.unlink(dest, reject.bind(null, err));
            });

            // Iniciando a transferência de dados
            readStream.pipe(writeStream);
        });

        // Manter compatibilidade com callbacks
        return p;

        // p.then(function(id) {
        //   callback(null, id);
        // }).catch(function(err) {
        //   callback(err);
        // });
    }

    unlinkFile(path) {
        fs.unlink(path, err => {
            if (err) console.error(err.stack);
            console.log(path + " was deleted");
        });
    }

}
