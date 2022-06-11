import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Guid } from "guid-typescript";
import { TransferTextModel } from '../transfer-text.model'
import { TextService } from '../text.service'

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  public updateForm!: FormGroup;

  constructor(private _textService: TextService,
    private _router: Router,
    private _activeRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      txt: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required])
    });
    //this.getFileContent();
    this.executeDownload();
  }

  public submitForm = (addFormValue: any) => {
    this.executeUpload(addFormValue);
  }

  private async executeUpload(addFormValue: any) {
    const text: string = addFormValue.txt as string;
    const nameWithExt: string = addFormValue.name as string;
    const name: string = nameWithExt.substring(0, nameWithExt.lastIndexOf('.')) || nameWithExt; 
    // const model: TransferTextModel = {
    //   name: name,
    //   text: text
    // };
    const guid: string = Guid.create().toString();
    const tempFileName: string = `${name}_${guid}`;
    const size: number = new Blob([text]).size;
    const chunkSize: number = 500 * 1024;
    let start: number = 0;
    let end: number = chunkSize;

    while (start < size) {
      const chunkText: string = text.substring(start, end);
      const chunkModel: TransferTextModel = {
        name: tempFileName,
        text: chunkText,
        isLastChunk: end >= size
      }
      // upload chunk
      const uploader$ = this._textService.upload(chunkModel);
      const res = await lastValueFrom(uploader$);
      start = ++end;
      end = start + chunkSize;
      console.info(res);
    }
    alert('Upload completed');
  };

  public goToFiles = () => {
    const url: string = 'list';
    this._router.navigateByUrl(url);
  };

  public hasError = (controlName: string, errorName: string) => {
    return this.updateForm.controls[controlName].hasError(errorName);
  };

  // private getFileContent = () => {
  //   const name: string = this._activeRoute.snapshot.params['name'];
  //   this._textService.getFileContent(name)
  //     .subscribe({
  //       next: (res: any) => {
  //         this.file = res as TransferTextModel;
  //         this.updateForm.patchValue(
  //           {
  //             name: this.file.name,
  //             txt: this.file.text
  //           }
  //         );
  //       },
  //       error: (err: any) => {
  //         // Handle an error
  //         console.error(err);
  //       }
  //     });
  // }

  private async executeDownload() {
    const name: string = this._activeRoute.snapshot.params['name'];
    const size: number = this._activeRoute.snapshot.params['size'] as number;
    const chunkSize: number = 500 * 1024;
    let start: number = 0;
    let end: number = chunkSize;
    let content: string = '';
    while (start < size) {
      // download chunk
      const downloader$ = this._textService.download(name, start, chunkSize);
      const chunk = await lastValueFrom(downloader$);
      content += chunk.text;
      start = ++end;
      end = start + chunkSize;
      console.info('Chunk douhloaded');
    }
    this.updateForm.patchValue(
      {
        name: name,
        txt: content
      }
    );
    alert('Download completed');
  };
}