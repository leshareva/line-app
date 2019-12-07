
import * as air from 'airtable';
import { AIR_CONFIG } from './config';

class Airtable extends air {

    private base
    private _config: any

    constructor(config: any) {
        super({ endpointUrl: 'https://api.airtable.com', apiKey: config.apikey })
        this.base = super.base(config.base)
        this._config = config
    }

    list(listName: string, options?: { filterByFormula?: string, fields?: Array<string>, sort?: Array<{ field: string, direction: "desc" | "asc" }>, maxRecords?: number }): Promise<any[]> {
        //sort: [{field: "Имя", direction: "desc" || "asc" }]
        return new Promise<any[]>((resolve, reject) => {
            let cells = []
            // let opt = { filterByFormula: `{${key}} = "${value}"` } //TO-DO: обработу numbers и strings в значении value

            this.base(listName).select(options ? options : {})
                .eachPage(function page(records, fetchNextPage) {
                    records
                        // .filter(record => record.get(key) === value)
                        .map(el => {
                            el.fields.recID = el.id
                            cells.push(el.fields)
                            return el
                        })

                    // This function (`page`) will get called for each page of records.
                    fetchNextPage()

                }, function done(err) {
                    if (err) { console.error(err); reject(err); return; }
                    resolve(cells)
                })

        })

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

}


export const base = new Airtable(AIR_CONFIG);


