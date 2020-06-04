


export interface iAirtableFileds {
    title?: string
    level?: Number
    name?: string
}


export interface iEvent extends iAirtableFileds {
    level?: number,
    isAvailableToUser?: (user: any) => boolean
}


export interface iEventCreate extends iAirtableFileds {
    title?: string
}

export interface iEventUpdate extends iAirtableFileds {
    title?: string
}

export class iUser {
    name?: string
}

export interface iUserCreate extends iAirtableFileds {
    name?: string
}

export interface iUserUpdate extends iAirtableFileds {
    name?: string
}

type iBaseConnector = {
    list: (filter?: any) => Promise<any[]>
    getByID: (id: string) => Promise<any>
    create: (data: any[]) => Promise<any[]>
    update: (data: any[]) => Promise<any[]>
}

export interface iAirtableUpdateOptions { id: string, fields: iAirtableFileds }
export interface iAirtableCreateOptions { fields: iAirtableFileds }

class AirtableConnector implements iBaseConnector {
    list = async (filter?: iAirtableFileds): Promise<iAirtableFileds[]> => Promise.resolve([{ level: 1 }, { level: 4 }])
    getByID = async (id: string): Promise<iAirtableFileds> => Promise.resolve({ title: 'name' })
    create = async (data: iAirtableCreateOptions[]): Promise<iAirtableFileds[]> => Promise.resolve([{ title: 'name' }])
    update = async (data: iAirtableUpdateOptions[]): Promise<iAirtableFileds[]> => Promise.resolve([{ title: 'name' }])
}


class EventsList {
    constructor(private base: iBaseConnector) { }
    list = async (filter?: iEvent): Promise<Event[]> => this.base.list(filter).then(res => res.map(el => new Event(el)))
    getByID = async (id: string): Promise<Event> => this.base.getByID(id)
    create = async (data: iEventCreate[]) => this.base.create(data).then(res => res.map(el => new Event(el)))
    update = async (data: iEventUpdate[]) => this.base.update(data).then(res => res.map(el => new Event(el)))
};




class Event implements iEvent {
    level = 0
    constructor(data: iEvent) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }
    isAvailableToUser = (user: any) => user.level >= this.level
}


class User implements iUser {
    name: string

    constructor(data: iUser) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }
}



class UsersList {
    constructor(private base: iBaseConnector) { }
    list = async (filter: iUser): Promise<User[]> => this.base.list(filter).then(res => res.map(el => new User(el)))
    getByID = async (id: string): Promise<User> => this.base.getByID(id).then(data => new User({name: 'Вася пупкин'}))
    create = async (data: iUserCreate[]) => this.base.create(data).then(res => res.map(el => new User(el)))
    update = async (data: iUserUpdate[]) => this.base.update(data).then(res => res.map(el => new User(el)))
}

export interface iLevel extends iAirtableFileds {
    number?: number
}



export interface iLevelUpdate {
    id: string
    fields: iLevel 
}

export interface iLevelCreate {
    fields: iLevel 
}

class Level {
    constructor(data?: iLevel) {
        if (data) Object.keys(data).map(key => this[key] = data[key])
    }
}

class LevelList {
    constructor(private base: AirtableConnector) { }
    list = async (filter: iLevel): Promise<Level[]> => this.base.list(filter).then(res => res.map(el => new User(el)))
    getByID = async (id: string): Promise<Level> => this.base.getByID(id).then(data => new User(data))

    create = async (data: iLevelCreate[]) => this.base.create(data.map(el => {
        return {
            fields: el as any
        }
    })).then(res => res.map(el => new Level(el)))

    update = async (data: iLevelUpdate[]) => this.base.update(data).then(res => res.map(el => new User(el)))
}


class Api {
    private airtableConnector = new AirtableConnector()
    events = new EventsList(this.airtableConnector)
    users = new UsersList(this.airtableConnector)
}

(async () => {


    let api = new Api()

    let events = await api.events.list()

    events.map(event => {
        console.log(event.isAvailableToUser({ level: 2 }))
    })

    let event = await api.events.getByID('1232')
    console.log(event)
    
    let user = await api.users.getByID('1231')
     console.log(user.name)
    
})()


