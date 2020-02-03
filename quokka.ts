

//Функция для изменения окончаний //

const plural = (titles) => {
    var cases = [2, 0, 1, 1, 1, 2];
    return function (number) {
        number = Math.abs(number);
        let c =
            (number % 100 > 4 && number % 100 < 20) ? 2 :
                cases[(number % 10 < 5) ? number % 10 : 5];
        return titles[c];
    }
}

var point = plural(['балл', 'балла', 'баллов']);
//

function request<Request, Response>(
    method: 'GET' | 'POST',
    url: string,
    content?: Request,
    callback?: (response: Response) => void,
    errorCallback?: (err: any) => void) {

    const request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            // Success!
            const data = JSON.parse(this.response) as Response;
            callback && callback(data);
        } else {
            // We reached our target server, but it returned an error
        }
    };

    request.onerror = function (err) {
        // There was a connection error of some sort
        errorCallback && errorCallback(err);
    };
    if (method === 'POST') {
        request.setRequestHeader(
            'Content-Type',
            'application/x-www-form-urlencoded; charset=UTF-8');
    }
    request.send(content);
}

function request2<Request, Response>(
    method: 'GET' | 'POST',
    url: string,
    content?: Request
): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        request(method, url, content, resolve, reject);
    });
}

(async () => {
    const PINTEREST_TOKEN = 'Atoiwdmqga--GFFNYTdMbeLumw0aFeKZ1Fl1IIlESnR5XqAtEwl2ADAAAe7XRmcUaFlAvE0AAAAA'
    let reuslt = await request2('GET', `https://api.pinterest.com/v1/me/pins/?
    access_token=${PINTEREST_TOKEN}
    &fields=id,note
    &limit=1`);
    console.log(reuslt);
})()

const createLootTable = () => {
    const perc = 55;
    let items = [
        {
            'Название': 'Дорогой товар 1',
            'Стоимость': 50,
            'Купил пользователь': true
        },
        {
            'Название': 'Дорогой товар 2',
            'Стоимость': 50,
            'Купил пользователь': false
        },
        {
            'Название': 'Средний товар 1',
            'Стоимость': 30,
            'Купил пользователь': true
        },
        {
            'Название': 'Средний товар 2',
            'Стоимость': 25,
            'Купил пользователь': false
        },
        {
            'Название': 'Средний товар 3',
            'Стоимость': 15,
            'Купил пользователь': false
        },
        {
            'Название': 'Дешевый товар 1',
            'Стоимость': 5,
            'Купил пользователь': false
        },
        {
            'Название': 'Дешевый товар 2',
            'Стоимость': 5,
            'Купил пользователь': false
        },
        {
            'Название': 'Дешевый товар 2',
            'Стоимость': 5,
            'Купил пользователь': false
        },
        {
            'Название': 'Дешевый товар 2',
            'Стоимость': 5,
            'Купил пользователь': false
        }
    ]

    items = items.filter(el => !el['Купил пользователь'])
        .sort((a, b) => {
            return b['Стоимость'] - a['Стоимость']
        })
    let one = items[0];
    let two = items[Math.round((items.length - 1) / 2)];
    let three = items[items.length - 1]
    one['perc'] = perc * 0.6
    two['perc'] = perc * 0.3
    three['perc'] = perc * 0.1
    let empty = 100 - (one['perc'] + two['perc'] + three['perc']);
    console.log(one)
    console.log(two)
    console.log(three)
    console.log(empty)
}

