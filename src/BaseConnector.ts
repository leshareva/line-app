export type iBaseConnector = {
    list: (filter?: any) => Promise<any[]>
    getByID: (id: string, listname: string) => Promise<any>
    create: (data: any[], listname: string, params?: { typecast: boolean }) => Promise<any[]>
    update: (data: any[], listname: string, params?: { typecast: boolean }) => Promise<any[]>
    delete: (rec_id: string[], listname: string) => Promise<any>
}
