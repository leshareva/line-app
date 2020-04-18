
import * as air from 'airtable';
import { AIR_CONFIG } from './config';



interface iSort { field: string, direction: "desc" | "asc" }
interface iAirtableListOptions {
    filterByFormula?: string, //  `{key} = "value"` //TO-DO: обработу numbers и strings в значении value
    fields?: Array<string>,
    sort?: iSort[],
    view?: string,
    maxRecords?: number
}

class Airtable extends air {

    private base
    private _config: any

    constructor(config: any) {
        super({ endpointUrl: 'https://api.airtable.com', apiKey: config.apikey })
        this.base = super.base(config.base)
        this._config = config
    }


    list(listName: string, options?: iAirtableListOptions) {

        return new Promise<Array<any>>((resolve, reject) => {
            let cells = []
        
            this.base(listName).select(options ? options : {})
                .eachPage(function page(records, fetchNextPage) {
                    records
                        .forEach(el => {
                            el.fields.recID = el.id
                            cells.push(el.fields)
                        })

                    // This function (`page`) will get called for each page of records.
                    fetchNextPage()

                }, function done(err) {
                    if (err) { console.error(err); reject(err); return; }
                    resolve(cells)
                })

        }).catch(console.error)

    }



    find = async (recId: string, listName: string) =>
        new Promise<any>((resolve, reject) => {
            this.base(listName).find(recId, function (err, record) {
                if (err) { console.error(err); return; }
                record.fields.recID = record.id
                resolve(record.fields)
            })
        });

    create = async (fields: any, listName: string) =>
        new Promise<any>((resolve, reject) => {
            this.base(listName).create(fields, function (err, record) {
                if (err) { console.error(err); return; }
                record.fields.recID = record.id
                resolve(record.fields)
            })
        })

    replace = (recID: string, field: any, listName: string) =>
        new Promise(resolve => {

            this.base(listName)
                .replace(recID, field, (err, record) => {
                    if (err) { console.error(err); return; }
                    record.fields.recID = record.id
                    resolve(record.fields)
                })
        })

    update = (params: Array<{ id: string, fields: any }>, listName: string) =>
        new Promise((resolve, reject) => {
            this.base(listName).update(params, (err, records) => {
                if (err) {
                    console.log(records)
                    console.log(JSON.parse(err))
                    reject(err)
                }
                resolve()
            })
        }).catch(console.log)


    delete = (recIDs: string[], listName: string) =>
        new Promise((resolve, reject) => {
            this.base(listName).destroy(recIDs, (err, record) => {
                if (err) {
                    console.log(JSON.parse(err))
                    reject(err)
                }
                resolve(recIDs)
            })
        })

}


export const base = new Airtable(AIR_CONFIG);


