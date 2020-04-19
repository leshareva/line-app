import { UserInfo } from "@vkontakte/vk-connect";

export interface iUser extends UserInfo {
	id: number
	recID: string
}

export interface iModalData {
	title: string
	desc: string
	onButtonClickHandler: () => void
	buttonLabel: string
	body?: any
}


export interface iAchieve {
    recID: string
    'Кол-во работ': number
    'RubricID': string[]
    'Name': string
    'Описание': string
    'Оценка': number
	'Таблица': string
	achievedItems?: any[]
	done?: boolean
}