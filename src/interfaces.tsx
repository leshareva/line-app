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
