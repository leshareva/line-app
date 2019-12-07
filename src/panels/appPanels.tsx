
import { PROFILE } from './constants';
import Profile from '../components/Profile/Profile';


export interface iAppPanel {
    panel: string;
    title: string;
    component: any;
    onStart: boolean;
}

export const AppPanels: iAppPanel[] = [
    {
        panel: PROFILE,
        title: 'Профиль',
        component: Profile,
        onStart: true
    },
    {
        panel: 'about',
        title: 'История',
        component: Profile,
        onStart: false
    }
];