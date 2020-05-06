import React from 'react'
import axios from 'axios';
import { FormLayout, File, Button } from '@vkontakte/vkui';

export default class FileUploader extends React.Component<any, any> {

    onChangeHandler = event => {
        var files = event.target.files
        if (this.maxSelectFile(event) && this.checkMimeType(event) && this.checkFileSize(event)) {
            // if return true allow to setState
            this.setState({
                selectedFile: files,
                loaded: 0
            })
        }
    }

    onClickHandler = () => {
        const data = new FormData()
        for (var x = 0; x < this.state.selectedFile.length; x++) {
            data.append('file', this.state.selectedFile[x])
        }
        axios.post("http://localhost:8000/upload", data, {
            onUploadProgress: ProgressEvent => {
                this.setState({
                    loaded: (ProgressEvent.loaded / ProgressEvent.total * 100),
                })
            },
        })
            .then(async (res) => { // then print response status
                console.log(res)
                let images = res.data.map(file => {
                    return {
                        url: `http://9604288e.ngrok.io/${file.path}`
                    }
                })

                let purchase = this.props.purchases.find(el => el['Рубрика'].find(rubricID => rubricID === this.state.rubric.recID))

                let opt = {
                    "Датавремя": new Date().toISOString(),
                    "Профиль": [this.props.user.recID],
                    "Макет": images,
                    "Рубрика": this.state.rubric.recID,
                    "Комментарий": "Запись на тренировку",
                    "Покупки": purchase ? [purchase.recID] : null,
                    "Тренировка": [this.props.lessonID]
                }

                // await base.create(opt, this.state.rubric['Таблица'])

                console.log('upload success')
            })
            .catch(err => { // then print response status
                console.error('upload fail')
            })
    }

    checkMimeType = (event) => {
        //getting file object
        let files = event.target.files
        //define message container
        let err = []
        // list allow mime type
        const types = ['image/png', 'image/jpeg', 'image/gif']
        // loop access array
        for (var x = 0; x < files.length; x++) {
            // compare file type find doesn't matach
            if (types.every(type => files[x].type !== type)) {
                // create error message and assign to container   
                err[x] = files[x].type + ' is not a supported format\n';
            }
        };
        for (var z = 0; z < err.length; z++) {// if message not same old that mean has error 
            // discard selected file
            console.error(err[z])
            event.target.value = null
        }
        return true;
    }
    maxSelectFile = (event) => {
        let files = event.target.files
        if (files.length > 3) {
            const msg = 'Only 3 images can be uploaded at a time'
            event.target.value = null
            console.error(msg)
            return false;
        }
        return true;
    }
    checkFileSize = (event) => {
        let files = event.target.files
        let size = 2000000
        let err = [];
        for (var x = 0; x < files.length; x++) {
            if (files[x].size > size) {
                err[x] = files[x].type + 'is too large, please pick a smaller file\n';
            }
        };
        for (var z = 0; z < err.length; z++) {// if message not same old that mean has error 
            // discard selected file
            console.error(err[z])
            event.target.value = null
        }
        return true;
    }

    render() {
        return <>
            <FormLayout>
                <File controlSize="l" onChange={this.onChangeHandler}>Открыть галерею</File>
            </FormLayout>
            <Button onClick={this.onClickHandler}>отправить</Button>
        </>

    }

}