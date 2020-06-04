
import * as  Air from 'airtable';
import { iBaseConnector } from "./BaseConnector";




export interface iSort { field: string, direction: "desc" | "asc" }

// export interface any {
//     title?: string
//     level?: number
//     name?: string
// }

export interface iAirtableListOptions {
    filter?: any
    filterByFormula?: string
    fields?: Array<string>,
    sort?: iSort[],
    view?: string,
    maxRecords?: number | string
}


export interface iAirConfig {
    apikey: string
    base: string
}

export interface iAirtableCreateOptions {
    fields: any
}

export interface iAirtableUpdateOptions {
    id: string
    fields: any
}

export interface iAttachment {
    url: string
}


export class AirtableConnector implements iBaseConnector {
    private air: Airtable

    constructor(config: any) {
        this.air = new Airtable(config);
    }
    list = async (listname: string, options?: iAirtableListOptions): Promise<any[]> => {
        if (options && options.filter) {
            options.filterByFormula = this.generateFilterstring(options.filter)

            delete options.filter
        }
        return this.air.list(listname, options)
    }
    getByID = async (id: string, listname: string): Promise<any> => this.air.find(id, listname)
    create = async (data: iAirtableCreateOptions[], listname: string, params?: { typecast: boolean }): Promise<any[]> => this.air.create(data, listname, params)
    update = async (data: iAirtableUpdateOptions[], listname: string, params?: { typecast: boolean }): Promise<any[]> =>this.air.update(data, listname, params)
    delete = async (rec_ids: string[], listName: string): Promise<any> => this.air.delete(rec_ids, listName)

    protected generateFilterstring = (fileds: any): string => {

        let keys = Object.keys(fileds)

        let arr: string[] = []
        keys.map(key => {
            let reg = /^([><=!]*)(.*)/gs
            let value = fileds[key].replace(reg, '$2');
            let condition = fileds[key].replace(reg, '$1')

            if (value === 'null') value = 'BLANK()'
            else if (isNaN(value)) value = "'" + value + "'"

            arr.push((condition === '!=') ? 'NOT({' + key + '}=' + value + ')' : '{' + key + '}' + condition + value)
            return key
        })

        return (arr.length === 1) ? arr[0] : 'AND(' + arr.join(', ') + ')'
    }
}


export default class Airtable extends Air {

    private base: any


    constructor(config: iAirConfig) {
        super({ endpointUrl: 'https://api.airtable.com', apiKey: config.apikey })
        this.base = super.base(config.base)
    }




    list = async (listName: string, options?: iAirtableListOptions) =>
        new Promise<Array<any>>((resolve, reject) => {
            let cells: any[] = []



            this.base(listName).select(options ? options : {})
                .eachPage(function page(records: any[], fetchNextPage: () => void) {
                    records
                        .forEach(el => {
                            el.fields.rec_id = el.id
                            cells.push(el.fields)
                        })

                    // This function (`page`) will get called for each page of records.
                    fetchNextPage()

                }, function done(err: any) {
                    if (err) { console.error(err); reject(err); return; }
                    resolve(cells)
                })

        })





    find = async (rec_id: string, listName: string) =>
        new Promise<any>((resolve, reject) => {
            this.base(listName).find(rec_id, function (err: any, record: any) {
                if (err) { reject(err); return; }
                if (!record) { reject('no record: ' + rec_id) }
                record.fields.rec_id = record.id
                resolve(record.fields)
            })
        });

    create = async (fields: iAirtableCreateOptions[], listName: string, params?: { typecast: boolean }) =>
        new Promise<any[]>(async (resolve, reject) => {

            let arrays: any[] = [],
                size = 10

            while (fields.length > 0) arrays.push(fields.splice(0, size))
            for (const bunch of arrays) {

                await this.base(listName).create(bunch, params, function (err: any, records: any[]) {
                    if (err) { console.error(err); return; }
                    resolve(records.map(record => {
                        record.fields.rec_id = record.id
                        return record.fields
                    }))
                })

                await setTimeout(() => { }, 2000)
            }

        })


    replace = (rec_id: string, field: any, listName: string) =>
        new Promise(resolve => {

            this.base(listName)
                .replace(rec_id, field, (err: any, record: any) => {
                    if (err) { console.error(err); return; }
                    record.fields.rec_id = record.id
                    resolve(record.fields)
                })
        })

    update = (params: iAirtableUpdateOptions[], listName: string, options?: { typecast: boolean }) =>
        new Promise<any[]>(async (resolve, reject) => {

            var arrays: any[] = [],
                size = 10

            while (params.length > 0) arrays.push(params.splice(0, size))
            for (const bunch of arrays) {

                await this.base(listName).update(bunch, options, (err: any, records: any[]) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    }
                    resolve(records.map(record => {
                        record.fields.rec_id = record.id
                        return record.fields
                    }))
                })

                await setTimeout(() => { }, 2000)
            }



        })


    delete = (rec_ids: string[], listName: string) =>
        new Promise((resolve, reject) => {
            this.base(listName).destroy(rec_ids, (err: any, record: any) => {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                resolve(rec_ids)
            })
        })

}
