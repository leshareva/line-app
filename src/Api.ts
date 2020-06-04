import { AirtableConnector, iAirtableListOptions } from './Airtable';
// import * as admin from 'firebase-admin';


// Events //

export interface iEventType {
    level?: number,
    isAvailableToUser?: (user: any) => boolean
}

export interface iEventFileds {
    event_type_id?: string
}

export interface iEvent extends iEventFileds {
    isAvailableToUser?: (user: any) => boolean
}

export interface iEventCreate {
    title?: string
}

export interface iEventUpdate {
    title?: string
}

type eventFields = 'Name' | 'Уровень' | 'Тренировки' | 'Описание' | 'Рубрика' | 'День' | 'Опубликовано' | 'RubricID' | 'Опыт рубрики' | 'Навыки' | 'key' | 'Skills' | 'Уровень' | 'level_no' | 'recID'

interface iEventListOptions extends iAirtableListOptions {
    fields?: eventFields[]
}

class EventTypes {
    private listName = 'Тип тренировки';

    constructor(private base: AirtableConnector) { }

    list = async (params?: iEventListOptions): Promise<EventType[]> => this.base.list(this.listName, params)
        .then(res => res.map(el => new EventType(el)))

    getByID = async (id: string): Promise<EventType> => this.base.getByID(id, this.listName)
    // create = async (data: iEventCreate[]) => this.base.create(data).then(res => res.map(el => new Event(el)))
    // update = async (data: iEventUpdate[]) => this.base.update(data).then(res => res.map(el => new Event(el)))
};

// class Users {
//     private listName = 'Участники';
//     constructor(private base: AirtableConnector, firebase: FBConnector) { }
//     list = async (filter?: iEventFileds): Promise<EventType[]> => this.base.list(this.listName, { filter: filter })
//         .then(res => res.map(el => new EventType(el)))
// }




class Events {
    private listName = 'Тренировки';
    constructor(private base: AirtableConnector) { }

    list = async (params?: iAirtableListOptions, include_event_type?: boolean): Promise<Event[]> => this.base.list(this.listName, params).then(res => {
        if (!include_event_type) return res

        let proms = res.map(el => new EventTypes(this.base).getByID(el.event_type_id).then(event_type => {
            el.event_type = new EventType(event_type)
            return el
        }))
        return Promise.all(proms).then(res => res.map(el => new Event(el)))
    })

    getByID = async (id: string): Promise<Event> => this.base.getByID(id, this.listName)
};

type iLevelFields = 'Number'
    | 'Требует опыта'
    | 'Товары'
    | 'Тип тренировки'
    | 'Навыки'
    | 'recID'

interface iLevelListOption extends iAirtableListOptions {
    fields?: iLevelFields[]
}

class Levels {
    private listName = 'Уровни дизайнера';
    constructor(private base: AirtableConnector) { }
    list = async (params?: iLevelListOption): Promise<Level[]> => this.base.list(this.listName, params)
        .then(res => res.map(el => new Level(el)))
}

type iGoodsFields = 'Название'
    | 'Баллы'
    | 'Стоимость'
    | 'Для подписчиков'
    | 'Опубликовано'
    | 'Description'
    | 'Обложка'
    | 'Кол-во тренировок'
    | 'Рубрики'
    | 'Покупки'
    | 'Срок годности'
    | 'RecID'
    | 'Уровни дизайнера'


export interface iGoodsListOption extends iAirtableListOptions {
    fields?: iGoodsFields[]
}


type iUsersFields = 'Имя'
    | 'VK Profile'
    | 'VK-ID'
    | 'Опыт'
    | 'Покупки'
    | 'Начисления: разминки'
    | 'recID'
    | 'Активные покупки'
    | 'Баланс'
    | 'Уровень'
    | 'visited_events'


export interface iUsersListOption extends iAirtableListOptions {
    fields?: iUsersFields[]
}

class Goods {
    private listName = 'Товары';
    constructor(private base: AirtableConnector) { }
    list = async (params?: iGoodsListOption): Promise<Good[]> => {
        if (params && !params.view) params.view = 'Line_App.Active'
        if (!params) params = { view: 'Line_App.Active' }
        return this.base.list(this.listName, params).then(res => res.map(el => new Good(el)))
    }

    getByID = async (id: string): Promise<Goods> => this.base.getByID(id, this.listName)

}


class User {
    'Имя': any
    'VK Profile': any
    'VK-ID': any
    'Опыт': any
    'Покупки': any
    'Начисления: разминки': any
    'recID': any
    'Активные покупки': any
    'Баланс': any
    'Уровень': any
    'visited_events': any

    constructor(data: any) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }
}


interface iInitUser {
    'vk_id': number
    'name'?: string
}

interface iUserCreateOptions {
    'vk_id': number
    'name'?: string
    'email'?: string
}

class Users {
    private listName = 'Участники';
    constructor(private base: AirtableConnector) { }

    initUser(data: iInitUser): Promise<User | undefined> {
        return this.getByID({ vk_id: data.vk_id }).then(res => {
            if (res) return res
            if (!res) return this.create(data).then(resp => new User(resp))
                .then(async user => {
                    await new Accruals(this.base).create({
                        amount: 1,
                        user_rec_id: user.recID,
                        comment: 'Первое начисление'
                    })
                    return user
                })
            return
        })
    }

    create(params: iUserCreateOptions): Promise<User | undefined> {
        return this.base.create([{
            fields: {
                'Имя': params.name || '',
                'VK-ID': params.vk_id,
                'Email': params.email || ''
            }
        }], this.listName).then(resp => new User(resp))
    }

    getByID(params: { vk_id?: number, rec_id?: string }): Promise<User | undefined> {
        if (!params.vk_id && !params.rec_id) throw new Error('vk_id or rec_id needed')
        let proms = params.rec_id ? this.base.getByID(params.rec_id, this.listName) : this.base.list(this.listName, {
            filter: { 'VK-ID': `=${params.vk_id}` }
        }).then(res=>res[0])
        return proms.then((res: any) => {
            if (res) return new User(res)
            return
        })
    }
    list = async (params?: iUsersListOption): Promise<User[]> => {
        return this.base.list(this.listName, params).then(res => res.map(el => new User(el)))
    }

}


class Accrual {
    'Имя': any
    'Датавремя': any
    'Опыт': any
    'Профиль': any
    'Баллы': any
    'VK-ID': any
    'Рубрика': any
    'Ачивка': any
    'Комментарий': any
    'Ссылка на пост': any
    'Опыт рубрики': any
    'Оценка': any
    'Макет': any
    'Покупки': any
    'Тренировка': any
    'День': any
    'Спринт': any
    'Сезон': any
    'RubricID': any
    'Коэффициент повышения опыта': any
    'ID тренировки': any
    'Тип тренировки': any
    'Оценки': any
    'Средняя': any
    'recID': any
    'event_type_id': any


    constructor(data: any) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }
}

type iAccrualsFields = 'Имя' |
    'Датавремя' |
    'Опыт' |
    'Профиль' |
    'Баллы' |
    'VK-ID' |
    'Рубрика' |
    'Ачивка' |
    'Комментарий' |
    'Ссылка на пост' |
    'Опыт рубрики' |
    'Оценка' |
    'Макет' |
    'Покупки' |
    'Тренировка' |
    'День' |
    'Спринт' |
    'Сезон' |
    'RubricID' |
    'Коэффициент повышения опыта' |
    'ID тренировки' |
    'Тип тренировки' |
    'Оценки' |
    'Средняя' |
    'event_type_id';


export interface iAccrualsListOptions {
    user_rec_id?: string
    vk_id?: number
    last_month?: boolean
    max_records?: number
}

interface iAccrualCreateOptions {
    user_rec_id: string
    comment?: string
    amount: number
    file_urls?: string[]
    event_rec_id?: string
    purchase_ids?: string[]
}

class Accruals {
    private listName = 'Начисления: разминки';
    constructor(private base: AirtableConnector) { }

    getByID = (rec_id: string): Promise<Accrual | undefined> => this.base.getByID(rec_id, this.listName).then(res => new Accrual(res))

    list = async (params?: iAccrualsListOptions): Promise<Accrual[]> => {
        let opt: iAirtableListOptions = { sort: [{ field: 'Датавремя', direction: 'desc' }] }
        if (params && params.max_records) opt.maxRecords = params.max_records
        if (params && params.vk_id) opt.filter = { 'VK-ID': `=${params.vk_id}` }
        if (params && params.last_month) opt.view = 'Последний месяц'
        if (params && params.user_rec_id) opt.filter = { 'user_rec_id': `=${params.user_rec_id}` }
        return this.base.list(this.listName, opt).then(res => res.map(el => new Accrual(el)))
    }

    create = async (params: iAccrualCreateOptions): Promise<Accrual[]> => {
        return this.base.create([{
            fields: {
                'Датавремя': new Date().toISOString(),
                'Баллы': params.amount,
                'Макет': params.file_urls ? params.file_urls : [],
                'Тренировка': params.event_rec_id ? [params.event_rec_id] : [],
                'Профиль': [params.user_rec_id],
                'Комментарий': params.comment ? params.comment : '',
                'Покупки': params.purchase_ids ? params.purchase_ids : []
            }
        }], this.listName)
    }

    delete = async (rec_ids: string[]) => this.base.delete(rec_ids, this.listName)

}


class Good {
    'Название': any
    'Баллы': any
    'Стоимость': any
    'Для подписчиков': any
    'Опубликовано': any
    'Description': any
    'Обложка': any
    'Кол-во тренировок': any
    'Рубрики': any
    'Покупки': any
    'Срок годности': any
    'RecID': any
    'Уровни дизайнера': any

    constructor(data: any) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }
}

export interface iLevel {
    'Number'?: any
    'Требует опыта'?: any
    'Товары'?: any
    'Тип тренировки'?: any
    'Навыки'?: any
    'recID'?: any
}

class Level implements iLevel {
    'Number': any
    'Требует опыта': any
    'Товары': any
    'Тип тренировки': any
    'Навыки': any
    'recID': any
    constructor(data: iLevel) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }
}



class EventType {
    'level_no': any
    'Уровень': any
    'Name': any
    'Тренировки': any
    'Описание': any
    'Рубрика': any
    'День': any
    'Опубликовано': any
    'RubricID': any
    'Опыт рубрики': any
    'Навыки': any
    'key': any
    'Статус': any
    'Skills': any
    'recID': any
    event_type_id?: string
    constructor(data: iEventType) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }
    isAvailableToUser = (user: any) => user.level >= this.level_no
}

class Event implements iEvent {
    constructor(data: iEventType) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }

    // isAvailableToUser = (user: any) => user.level >= this.level
}


interface iApiConfig {
    airtable_conf: { apikey: string, base: string },
    firebase_service_account?: any
}

export interface iApi {
    event_types: EventTypes
    events: Events
    levels: Levels
    goods: Goods
    users: Users
    accruals: Accruals
}

export default class Api {

    constructor(private params: iApiConfig) { }

    event_types = new EventTypes(new AirtableConnector(this.params.airtable_conf))
    events = new Events(new AirtableConnector(this.params.airtable_conf))
    levels = new Levels(new AirtableConnector(this.params.airtable_conf))
    goods = new Goods(new AirtableConnector(this.params.airtable_conf))
    users = new Users(new AirtableConnector(this.params.airtable_conf))
    accruals = new Accruals(new AirtableConnector(this.params.airtable_conf))
}


// export class FBConnector {

// 	protected db

// 	constructor(serviceAccount: any) {

//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount)
//         });

//         this.db = admin.firestore();
// 	}

// 	getByID(rec_id: string, listName: string): Promise<any> {
// 		return this.db.collection(listName).doc(rec_id).get()
// 			.then((doc) => {
// 				if (!doc.exists) {
// 					console.log('No such document!');
// 				} else {
// 					return doc.data()
// 				}
// 			})
// 			.catch((err) => {
// 				console.log('Error getting documents', err);
// 			});
// 	}

// 	get(listName: string, filter?: any) {
// 		let filt = filter ? this.generateFilterString(filter) : null
// 		let request = filt ? this.db.collection(listName).where(filt.key, filt.condition, filt.value) : this.db.collection(listName)

// 		return request.get().then(snapshot => {
// 			if (snapshot.empty) {
// 				console.log('No matching documents.');
// 				return [];
// 			}
// 			let data: any[] = []

// 			snapshot.forEach(doc => {
// 				let obj = doc.data();
// 				obj.id = doc.id
// 				data.push(obj)
// 			});
// 			return data
// 		})
// 	}

// 	create(dataArray: [{ id?: string, fields: any }], listName: string): Promise<any> {
// 		let proms = dataArray.map(data => data.id ? this.db.collection(listName).doc(data.id).set(data.fields) : this.db.collection(listName).add(data.fields))

// 		return Promise.all(proms)
// 	}

// 	async update(params: { id: string, fields: any }[], listName: string) {

// 		// var result = [];
// 		// var arrays = [],
// 			// size = 10

// 		// while (params.length > 0) arrays.push(params.splice(0, size))
// 		// for (const bunch of arrays) {
// 			let proms = params.map(field => this.db.collection(listName).doc(field.id).update(field.fields))
// 			// await 
// 			// await setTimeout(() => { }, 2000)
// 		// }
// 		return Promise.all(proms)
// 	}

// 	protected generateFilterString = (fileds: any): { key: string, value: any, condition: string } => {

// 		let keys = Object.keys(fileds)

// 		let arr: any[] = []
// 		keys.map(key => {
// 			let reg = /^([><=!]*)(.*)/gs
// 			let value = fileds[key].replace(reg, '$2');
// 			let condition = fileds[key].replace(reg, '$1')
// 			arr.push({
// 				key: key,
// 				value: value,
// 				condition: condition
// 			})
// 		})

// 		return arr[0]
// 	}
// }