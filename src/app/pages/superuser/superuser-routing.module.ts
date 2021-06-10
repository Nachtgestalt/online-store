import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SuperuserComponent} from "./superuser.component";
import {UsersComponent} from "./users/users.component";
import {PrivilegesComponent} from "./privileges/privileges.component";
import {AssignToCompanyComponent} from "./users/assign-to-company/assign-to-company.component";
import {AdminCompaniesComponent} from "./admin-companies/admin-companies.component";
import {CompaniesComponent} from "./admin-companies/companies/companies.component";
import {PayTypesComponent} from "./admin-companies/companies/pay-types/pay-types.component";


const routes: Routes = [
    {
        path: '',
        component: SuperuserComponent,
        children: [
            {
                path: 'companies', component: AdminCompaniesComponent,
                children: [
                    {path: '', component: CompaniesComponent},
                    {path: 'pay-types/:id', component: PayTypesComponent}
                ]
            },
            {
                path: 'users', component: UsersComponent,
                children: [
                    {path: '', redirectTo: 'assign-to-company', pathMatch: 'full'},
                    {path: 'assign-to-company', component: AssignToCompanyComponent}
                ]
            },
            {path: 'privileges', component: PrivilegesComponent},
            {path: '', redirectTo: 'companies', pathMatch: 'full'}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SuperuserRoutingModule {
}
