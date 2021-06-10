import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {FileItem} from "../../../models/file-item";
import {SetupInfoService} from "../../../services/setup-info.service";
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {IAppState, selectSetupState} from "../../../store/state/app.state";
import {SetSetup} from "../../../store/actions/setup.actions";
import {switchMap, take} from "rxjs/operators";
import {MatQuill} from "../../../components/mat-quill/mat-quill";


@Component({
    selector: 'app-admin-config',
    templateUrl: './admin-config.component.html',
    styleUrls: ['./admin-config.component.scss']
})
export class AdminConfigComponent implements OnInit {
    setup;

    // File input
    fileInput = new FormControl();
    fileErrorMessage = '';
    imgURL: any;
    imagePath;
    archivo: FileItem[] = [];

    configForm: FormGroup;
    @ViewChild('matEditor', {
        static: true
    }) matEditorContact: MatQuill

    @ViewChild('matEditor', {
        static: true
    }) matEditorAboutUs: MatQuill

    getSetupState: Observable<any>;

    constructor(private setupInfoService: SetupInfoService,
                private store: Store<IAppState>) {
        this.getSetupState = store.select(selectSetupState);
        this.getSetupState.subscribe(setupState => {
            this.setup = setupState
            this.imgURL = setupState.logoName
        });
    }

    ngOnInit(): void {
        this.configForm = new FormGroup({
            'contactInfo': new FormControl(),
            'aboutUs': new FormControl(),
            'setupId': new FormControl(this.setup.id)
        });

        this.getSetupState
            .pipe(
                switchMap(
                    ({id}) => this.setupInfoService.fetchSetupInfo(id)
                        .pipe(
                            take(1)
                        )
                )
            )
            .subscribe(res => {
                if (res) {
                    this.configForm.patchValue(res);
                }
            })
    }

    onSubmitConfig() {
        let setupInfo = this.configForm.value;
        this.setupInfoService.saveOrUpdate(setupInfo, setupInfo.setupId).subscribe(res => {
            console.log(res);
        })
    }

    onSumitLogo() {
        if (this.archivo.length > 0) {
            this.setupInfoService.saveLogo(this.archivo, this.setup.companyId).subscribe(setupCompany => {
                this.store.dispatch(SetSetup({setup: setupCompany}))
                console.log(setupCompany)
            });
        }
    }

    onFileChange(files) {
        this.archivo = [];
        if (files.length === 0) {
            return;
        }

        if (files[0].size > 3000000) {
            this.fileErrorMessage = 'El archivo es mayor a 3MB'
            return;
        }

        this.archivo.push(new FileItem(files[0]));
        let reader = new FileReader();
        this.imagePath = files;
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
            this.imgURL = reader.result;
        }
    }

}
