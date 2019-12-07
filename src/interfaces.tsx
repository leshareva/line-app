import { UserInfo } from "@vkontakte/vk-connect";

export interface iUser extends UserInfo {
	sprintData?: any
	history?: any[]
}