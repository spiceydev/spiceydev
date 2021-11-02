import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService, Category } from '@spiceydev/products';
import { MessageService } from 'primeng/api';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'admin-categories-form',
    templateUrl: './categories-form.component.html',
    styles: []
})
export class CategoriesFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isSubmitted = false;
    editMode = false;
    currentCategoryId: string;
    endSubs$: Subject<any> = new Subject();

    constructor(
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private categoriesService: CategoriesService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            icon: ['', Validators.required],
            color: ['#fffFFF']
        });

        this._checkEditMode();
    }

    ngOnDestroy() {
        this.endSubs$.next();
        this.endSubs$.complete();
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        const category: Category = {
            id: this.currentCategoryId,
            name: this.categoryForm.name.value,
            icon: this.categoryForm.icon.value,
            color: this.categoryForm.color.value
        };
        if (this.editMode) {
            this._updateCategory(category);
        } else {
            this._addCategory(category);
        }
    }

    onCancel() {
        this.location.back();
    }

    private _addCategory(category: Category) {
        this.categoriesService
            .createCategory(category)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                (category: Category) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Category ${category.name} is created!`
                    });
                    timer(2000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Category is not created!'
                    });
                }
            );
    }

    private _updateCategory(category: Category) {
        this.categoriesService
            .updateCategory(category)
            .pipe(takeUntil(this.endSubs$))
            .subscribe(
                () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Category is updated!'
                    });
                    timer(2000)
                        .toPromise()
                        .then(() => {
                            this.location.back();
                        });
                },
                () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Category is not updated!'
                    });
                }
            );
    }

    private _checkEditMode() {
        this.route.params.pipe(takeUntil(this.endSubs$)).subscribe((params) => {
            if (params.id) {
                this.editMode = true;
                this.currentCategoryId = params.id;
                this.categoriesService
                    .getCategory(params.id)
                    .pipe(takeUntil(this.endSubs$))
                    .subscribe((category) => {
                        this.categoryForm.name.setValue(category.name);
                        this.categoryForm.icon.setValue(category.icon);
                        this.categoryForm.color.setValue(category.color);
                    });
            }
        });
    }

    get categoryForm() {
        return this.form.controls;
    }
}
