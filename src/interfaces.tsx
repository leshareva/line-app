//поля помеченные = null берутся из airtable. Остальные появлятся в коде.

export class iUser {
	id: number
	first_name: string
	last_name: string
	levelExperience?: number
	'Имя': string = null
	'VK-ID': number  = null
	'Баланс': number  = null
	'Опыт': number  = null
	'Уровень': number  = null
	'Email'?: string  = null
	recID: string
}

export interface iModalData {
	title: string
	desc: string
	onButtonClickHandler?: () => void
	buttonLabel?: string
	body?: any
}


export class iAchieve {
	recID: string
	'Кол-во работ': number = null
	'RubricID': string = null
	'Name': string  = null
	'Описание': string = null
	'Оценка': number = null
	'Таблица': string = null
	'Короткое описание': string = null
	'Опубликовано': boolean = null
	achievedItems?: any[]
	done?: boolean
}

export class iRubric {
	recID: string;
	desc: string;
	'Название': string = null;
	'Опыт': number = null;
	'Таблица': string = null;
	'Обложка': any[] = null;
	'Описание': string = null;
	'ТэгЗадания': string = null;
	'Итог опыт': number = null;
	'Тренировки': string[] = null;
}


export class iHistoryItem {
	recID: string
	'VK-ID': number = null
	'Датавремя': string = null
	'Профиль'?: string[] = null
	'Рубрика': string[] = null
	'Комментарий': string = null
	'Баллы': number = null
	'Средняя': number = null
	'Макет': any[] = null
	'Опыт': number = null
}