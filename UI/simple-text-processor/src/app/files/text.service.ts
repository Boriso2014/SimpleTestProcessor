import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TransferTextModel } from './transfer-text.model';
import { FileModel } from './file.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TextService {

  constructor(private _http: HttpClient) { }

  public upload(txtModel: TransferTextModel): Observable<TransferTextModel> {
    const uploadUrl = `${environment.urlAddress}/api/texts/upload`;
    return this._http.post<TransferTextModel>(uploadUrl, txtModel);
  }

  public getFiles = (): Observable<FileModel> => {
    const getFilesUrl = `${environment.urlAddress}/api/texts/files`;
    return this._http.get<FileModel>(getFilesUrl);
  }

  public download(name: string, start: number, size: number): Observable<TransferTextModel> {
    const downloadUrl = `${environment.urlAddress}/api/texts/download/${name}/start/${start}/chunk-size/${size}`;
    return this._http.get<TransferTextModel>(downloadUrl);
  }

  public deleteFile = (name: string): Observable<string> => {
    const queryString = `name=${name}`;
    const deleteFileUrl = `${environment.urlAddress}/api/texts/file?${queryString}`;
    return this._http.delete<string>(deleteFileUrl);
  }
}