import { Injectable } from '@angular/core';

export class FileItem {
    name: string;
    isDirectory: boolean;
    size?: number;
    items?: FileItem[];
}

const fileItems: FileItem[] = [{
    name: 'Documents',
    isDirectory: true,
    items: [{
        name: 'Projets',
        isDirectory: true,
        items: [{
            name: 'A propos.rtf',
            isDirectory: false,
            size: 1024
        }, {
            name: 'Mots de passe.rtf',
            isDirectory: false,
            size: 2048
        }]
    }, {
        name: 'A propos.xml',
        isDirectory: false,
        size: 1024
    }, {
        name: 'Managers.rtf',
        isDirectory: false,
        size: 2048
    }, {
        name: 'A faire.txt',
        isDirectory: false,
        size: 3072
    }],
}, {
    name: 'Images',
    isDirectory: true,
    items: [{
        name: 'logo.png',
        isDirectory: false,
        size: 20480
    }, {
        name: 'banniere.gif',
        isDirectory: false,
        size: 10240
    }]
}, {
    name: 'Système',
    isDirectory: true,
    items: [{
        name: 'Employés.txt',
        isDirectory: false,
        size: 3072
    }, {
        name: 'Liste mots de passe.txt',
        isDirectory: false,
        size: 5120
    }]
}, {
    name: 'Description.rtf',
    isDirectory: false,
    size: 1024
}, {
    name: 'Description.txt',
    isDirectory: false,
    size: 2048
}];


@Injectable()
export class FileManagerService {
    getFileItems(): FileItem[] {
        return fileItems;
    }
}
