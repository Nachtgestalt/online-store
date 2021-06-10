import {Routes} from '@angular/router';
import {PublicComponent} from "./pages/public/public.component";
import {StoreGuard} from "./helpers/store.guard";
import {AuthGuard} from "./helpers/auth.guard";
import {SuperuserGuard} from "./helpers/superuser.guard";

export const APP_ROUTES: Routes = [
    {
        path: '',
        component: PublicComponent,
    },
    {
        path: 'globaladmin',
        canActivate: [AuthGuard, SuperuserGuard],
        loadChildren: () => import('./pages/superuser/superuser.module').then(m => m.SuperuserModule)
    },
    {
        path: ':name',
        canLoad: [StoreGuard],
        loadChildren: () => import('./pages/online-store/online-store.module').then(m => m.OnlineStoreModule)
    }
];
