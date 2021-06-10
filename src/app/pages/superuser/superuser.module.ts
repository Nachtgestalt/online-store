import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from "../../material.module";
import {SuperuserRoutingModule} from './superuser-routing.module';

import {SuperuserComponent} from './superuser.component';
import {CompaniesComponent} from "./admin-companies/companies/companies.component";
import {ComponentsModule} from "../../components/components.module";
import {UsersComponent} from './users/users.component';
import {PrivilegesComponent} from './privileges/privileges.component';
import {AgGridModule} from "ag-grid-angular";
import {AddCompanieComponent} from './admin-companies/companies/add-companie/add-companie.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AddPrivilegeComponent} from "./privileges/add-privilege/add-privilege.component";
import {AssignToCompanyComponent} from './users/assign-to-company/assign-to-company.component';
import {AssignPrivilegesComponent} from './users/assign-privileges/assign-privileges.component';
import {AdminSetupUsersComponent} from './users/admin-setup-users/admin-setup-users.component';
import {AdminCompaniesComponent} from './admin-companies/admin-companies.component';
import {PayTypesComponent} from './admin-companies/companies/pay-types/pay-types.component';
import {PriceTypesComponent} from './admin-companies/companies/price-types/price-types.component';


@NgModule({
    declarations: [
        SuperuserComponent,
        CompaniesComponent,
        UsersComponent,
        PrivilegesComponent,
        AddCompanieComponent,
        AddPrivilegeComponent,
        AssignToCompanyComponent,
        AssignPrivilegesComponent,
        AdminSetupUsersComponent,
        AdminCompaniesComponent,
        PayTypesComponent,
        PriceTypesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        ComponentsModule,
        AgGridModule,
        SuperuserRoutingModule
    ],
    entryComponents: [
        AddCompanieComponent,
        AddPrivilegeComponent,
        AssignPrivilegesComponent,
        PriceTypesComponent
    ]
})
export class SuperuserModule {
}
